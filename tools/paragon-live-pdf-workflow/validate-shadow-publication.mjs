import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SHADOW_FILE_NAMES } from "./build-shadow-publication.mjs";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const freeze = (value) => Object.freeze(value);
const countPdfPages = (text) => [...text.matchAll(/\/Type\s*\/Page\b/gu)].length;

export const validateShadowPublication = async ({ outputDirectory } = {}) => {
  if (!outputDirectory) {
    throw new TypeError("outputDirectory is required.");
  }

  const metadataPath = path.join(outputDirectory, SHADOW_FILE_NAMES.metadata);
  const metadata = JSON.parse(await fs.readFile(metadataPath, "utf8"));

  if (metadata.schemaVersion !== 1 || metadata.type !== "paragon-studio-shadow") {
    throw new Error("Shadow metadata identity is invalid.");
  }

  const verifiedFiles = {};
  for (const key of ["html", "json", "pdf"]) {
    const expected = metadata.files?.[key];
    if (!expected || expected.file !== SHADOW_FILE_NAMES[key]) {
      throw new Error(`Shadow metadata is missing the canonical ${key} file.`);
    }

    const bytes = await fs.readFile(path.join(outputDirectory, expected.file));
    const actualHash = sha256(bytes);
    if (bytes.length !== expected.bytes || actualHash !== expected.sha256) {
      throw new Error(`Shadow ${key} hash or byte count does not match metadata.`);
    }
    verifiedFiles[key] = freeze({ bytes: bytes.length, sha256: actualHash });
  }

  const html = await fs.readFile(
    path.join(outputDirectory, SHADOW_FILE_NAMES.html),
    "utf8",
  );
  const document = JSON.parse(await fs.readFile(
    path.join(outputDirectory, SHADOW_FILE_NAMES.json),
    "utf8",
  ));
  const pdfText = (await fs.readFile(
    path.join(outputDirectory, SHADOW_FILE_NAMES.pdf),
  )).toString("latin1");

  if ([...html.matchAll(/<article\s+class="special-card"(?:\s|>)/gu)].length !== 4) {
    throw new Error("Shadow HTML does not contain exactly four product cards.");
  }

  if (document.schemaVersion !== 1 || document.documentId !== "monthly-specials") {
    throw new Error("Shadow JSON canonical identity is invalid.");
  }

  if (countPdfPages(pdfText) !== 1 || !/\/MediaBox\s*\[\s*0\s+0\s+612\s+1008\s*\]/u.test(pdfText)) {
    throw new Error("Shadow PDF is not exactly one US Legal portrait page.");
  }

  const acceptance = metadata.acceptance ?? {};
  const exactAcceptance = {
    activeSpecials: 4,
    imageCount: 14,
    guardrailCount: 17,
    checkedNodeCount: 42,
    pageWidth: 816,
    pageHeight: 1344,
    pdfPages: 1,
    pdfMediaBox: "0 0 612 1008",
  };

  for (const [key, expected] of Object.entries(exactAcceptance)) {
    if (acceptance[key] !== expected) {
      throw new Error(`Shadow acceptance ${key} is invalid.`);
    }
  }

  return freeze({
    outputDirectory,
    files: freeze(verifiedFiles),
    acceptance: freeze({ ...acceptance }),
  });
};

const parseOutputDirectory = (argv) => {
  const index = argv.indexOf("--output");
  if (index < 0 || !argv[index + 1]) {
    throw new Error("Usage: node validate-shadow-publication.mjs --output <directory>");
  }
  return path.resolve(argv[index + 1]);
};

const currentPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentPath) {
  const result = await validateShadowPublication({
    outputDirectory: parseOutputDirectory(process.argv.slice(2)),
  });
  console.log(`[SHADOW VALIDATION PASS] ${result.outputDirectory}`);
}
