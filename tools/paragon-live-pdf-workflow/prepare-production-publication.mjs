import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { adaptCanonicalDocument } from "../../src/live-pdf/core/adapt-canonical-document.js";
import { validateGitSha, validatePublishId } from "./validate-dispatch-inputs.mjs";

export const PRODUCTION_METADATA_FILE = "production-metadata.json";
export const PRODUCTION_OUTPUT_PATHS = Object.freeze({
  html: "public/specials/monthly-specials.html",
  json: "public/specials/monthly-specials.json",
  pdf: "public/specials/monthly-specials.pdf",
});
const SHADOW_FILES = Object.freeze({
  html: "studio-preview.html",
  json: "studio-preview.json",
  pdf: "studio-preview.pdf",
  metadata: "publication-metadata.json",
});

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const freeze = (value) => Object.freeze(value);
const countPdfPages = (text) => [...text.matchAll(/\/Type\s*\/Page\b/gu)].length;

const assertSafeOutputDirectory = (projectRoot, outputDirectory) => {
  const project = path.resolve(projectRoot);
  const output = path.resolve(outputDirectory);
  if (output === path.parse(output).root) throw new Error("Production output cannot be a filesystem root.");
  for (const protectedRoot of [project, path.join(project, "public"), path.join(project, "src"), path.join(project, ".github")]) {
    const relative = path.relative(protectedRoot, output);
    if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
      throw new Error(`Production output cannot be inside ${protectedRoot}.`);
    }
  }
  return output;
};

const readShadowFile = async (shadowDirectory, key, metadata) => {
  const expected = metadata.files?.[key];
  if (!expected || expected.file !== SHADOW_FILES[key]) {
    throw new Error(`Shadow metadata is missing ${key}.`);
  }
  const bytes = await fs.readFile(path.join(shadowDirectory, expected.file));
  if (bytes.length !== expected.bytes || sha256(bytes) !== expected.sha256) {
    throw new Error(`Shadow ${key} bytes do not match metadata.`);
  }
  return bytes;
};

export const prepareProductionPublication = async ({
  projectRoot,
  shadowDirectory,
  outputDirectory,
  publishId,
  draftCommit,
  baseMainSha,
  generatedAt = new Date().toISOString(),
} = {}) => {
  if (!projectRoot || !shadowDirectory || !outputDirectory) {
    throw new TypeError("projectRoot, shadowDirectory, and outputDirectory are required.");
  }
  const normalizedPublishId = validatePublishId(publishId);
  const normalizedDraftCommit = validateGitSha(draftCommit, "draft_commit");
  const normalizedBaseMainSha = validateGitSha(baseMainSha, "base_main_sha");
  if (typeof generatedAt !== "string" || Number.isNaN(Date.parse(generatedAt))) {
    throw new TypeError("generatedAt must be an ISO timestamp.");
  }

  const safeOutput = assertSafeOutputDirectory(projectRoot, outputDirectory);
  const shadowMetadataBytes = await fs.readFile(path.join(shadowDirectory, SHADOW_FILES.metadata));
  const shadowMetadata = JSON.parse(shadowMetadataBytes.toString("utf8"));
  if (shadowMetadata.schemaVersion !== 1 || shadowMetadata.type !== "paragon-studio-shadow") {
    throw new Error("Shadow metadata identity is invalid.");
  }

  const [htmlBytes, canonicalJsonBytes, pdfBytes] = await Promise.all([
    readShadowFile(shadowDirectory, "html", shadowMetadata),
    readShadowFile(shadowDirectory, "json", shadowMetadata),
    readShadowFile(shadowDirectory, "pdf", shadowMetadata),
  ]);
  const canonical = JSON.parse(canonicalJsonBytes.toString("utf8"));
  const adapted = adaptCanonicalDocument(canonical);
  const publicDocument = { generatedAt, ...adapted };
  const publicJsonBytes = Buffer.from(`${JSON.stringify(publicDocument, null, 2)}\n`, "utf8");

  if ([...htmlBytes.toString("utf8").matchAll(/<article\s+class="special-card"(?:\s|>)/gu)].length !== 4) {
    throw new Error("Production HTML must contain exactly four product cards.");
  }
  if (!Array.isArray(publicDocument.specials) || publicDocument.specials.length !== 4) {
    throw new Error("Production JSON must contain exactly four specials.");
  }
  const pdfText = pdfBytes.toString("latin1");
  if (countPdfPages(pdfText) !== 1 || !/\/MediaBox\s*\[\s*0\s+0\s+612\s+1008\s*\]/u.test(pdfText)) {
    throw new Error("Production PDF must be one US Legal portrait page.");
  }

  await fs.rm(safeOutput, { recursive: true, force: true });
  const outputBytes = { html: htmlBytes, json: publicJsonBytes, pdf: pdfBytes };
  for (const [key, relativePath] of Object.entries(PRODUCTION_OUTPUT_PATHS)) {
    const absolutePath = path.join(safeOutput, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, outputBytes[key]);
  }

  const files = Object.fromEntries(Object.entries(PRODUCTION_OUTPUT_PATHS).map(([key, relativePath]) => [
    key,
    freeze({ path: relativePath, bytes: outputBytes[key].length, sha256: sha256(outputBytes[key]) }),
  ]));
  const metadata = {
    schemaVersion: 1,
    type: "paragon-studio-production",
    publishId: normalizedPublishId,
    draftCommit: normalizedDraftCommit,
    baseMainSha: normalizedBaseMainSha,
    generatedAt,
    documentId: canonical.documentId,
    revision: canonical.revision,
    files,
    semantic: {
      month: publicDocument.settings.month,
      year: publicDocument.settings.year,
      specialCount: publicDocument.specials.length,
      contactCount: publicDocument.contacts.length,
    },
    shadowMetadataSha256: sha256(shadowMetadataBytes),
  };
  const metadataBytes = Buffer.from(`${JSON.stringify(metadata, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(safeOutput, PRODUCTION_METADATA_FILE), metadataBytes);
  return freeze({ outputDirectory: safeOutput, metadata: freeze(metadata), metadataSha256: sha256(metadataBytes) });
};

const readArgument = (argv, name) => {
  const index = argv.indexOf(name);
  if (index < 0 || !argv[index + 1]) throw new Error(`Missing ${name}.`);
  return argv[index + 1];
};

const currentPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentPath) {
  const argv = process.argv.slice(2);
  const projectRoot = path.resolve(path.dirname(currentPath), "../..");
  const result = await prepareProductionPublication({
    projectRoot,
    shadowDirectory: path.resolve(readArgument(argv, "--shadow")),
    outputDirectory: path.resolve(readArgument(argv, "--output")),
    publishId: readArgument(argv, "--publish-id"),
    draftCommit: readArgument(argv, "--draft-commit"),
    baseMainSha: readArgument(argv, "--base-main-sha"),
  });
  console.log(`[PRODUCTION PACKAGE PASS] ${result.outputDirectory}`);
}
