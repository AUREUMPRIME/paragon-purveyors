import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PRODUCTION_METADATA_FILE } from "./prepare-production-publication.mjs";
import { validateGitSha, validatePublishId } from "./validate-dispatch-inputs.mjs";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const freeze = (value) => Object.freeze(value);
const countPdfPages = (text) => [...text.matchAll(/\/Type\s*\/Page\b/gu)].length;
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export class LiveVerificationError extends Error {
  constructor(message, code = "LIVE_VERIFICATION_FAILED") {
    super(message);
    this.name = "LiveVerificationError";
    this.code = code;
  }
}

const createVariants = (finalCommit, publishId) => freeze([
  freeze({ name: "canonical", query: "" }),
  freeze({ name: "commit-lock", query: `authorityLock=${finalCommit}` }),
  freeze({ name: "unique-no-cache", query: `reconcile=${publishId}-${randomUUID()}` }),
]);

const verifySemanticContent = ({ key, bytes, metadata }) => {
  if (key === "html") {
    if ([...bytes.toString("utf8").matchAll(/<article\s+class="special-card"(?:\s|>)/gu)].length !== 4) {
      throw new LiveVerificationError("Live HTML does not contain four product cards.", "LIVE_HTML_INVALID");
    }
  }
  if (key === "json") {
    const document = JSON.parse(bytes.toString("utf8"));
    if (
      document.generatedAt !== metadata.generatedAt
      || document.source?.documentId !== metadata.documentId
      || document.source?.revision !== metadata.revision
      || document.settings?.month !== metadata.semantic?.month
      || document.settings?.year !== metadata.semantic?.year
      || document.specials?.length !== 4
      || document.contacts?.length !== metadata.semantic?.contactCount
    ) throw new LiveVerificationError("Live JSON semantic identity is invalid.", "LIVE_JSON_INVALID");
  }
  if (key === "pdf") {
    const text = bytes.toString("latin1");
    if (countPdfPages(text) !== 1 || !/\/MediaBox\s*\[\s*0\s+0\s+612\s+1008\s*\]/u.test(text)) {
      throw new LiveVerificationError("Live PDF is not one US Legal page.", "LIVE_PDF_INVALID");
    }
  }
};

const fetchExpectedBytes = async ({ url, expectedHash, fetchImpl, attempts, retryDelayMs, sleepImpl }) => {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, { cache: "no-store", headers: { accept: "*/*" } });
      if (!response.ok) throw new LiveVerificationError(`Live request returned HTTP ${response.status}.`, "LIVE_HTTP_ERROR");
      const bytes = Buffer.from(await response.arrayBuffer());
      if (sha256(bytes) !== expectedHash) throw new LiveVerificationError("Live response hash has not converged.", "LIVE_HASH_MISMATCH");
      return freeze({ bytes, status: response.status, attempt });
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleepImpl(retryDelayMs * attempt);
    }
  }
  throw lastError;
};

export const verifyLivePublication = async ({
  outputDirectory,
  baseUrl,
  finalCommit,
  publishId,
  fetchImpl = globalThis.fetch,
  attempts = 6,
  retryDelayMs = 2000,
  sleepImpl = sleep,
} = {}) => {
  const commit = validateGitSha(finalCommit, "final_commit");
  const normalizedPublishId = validatePublishId(publishId);
  if (typeof fetchImpl !== "function") throw new TypeError("A fetch implementation is required.");
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 12) throw new TypeError("attempts must be between 1 and 12.");
  const root = new URL(baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  if (root.protocol !== "https:") throw new TypeError("baseUrl must use HTTPS.");

  const metadata = JSON.parse(await fs.readFile(path.join(outputDirectory, PRODUCTION_METADATA_FILE), "utf8"));
  if (metadata.publishId !== normalizedPublishId) throw new LiveVerificationError("Production metadata publishId is invalid.", "INVALID_PRODUCTION_METADATA");
  const results = [];
  for (const variant of createVariants(commit, normalizedPublishId)) {
    for (const key of ["html", "json", "pdf"]) {
      const record = metadata.files?.[key];
      if (!record) throw new LiveVerificationError(`Production metadata is missing ${key}.`, "INVALID_PRODUCTION_METADATA");
      const url = new URL(path.basename(record.path), root);
      if (variant.query) url.search = variant.query;
      const fetched = await fetchExpectedBytes({ url, expectedHash: record.sha256, fetchImpl, attempts, retryDelayMs, sleepImpl });
      verifySemanticContent({ key, bytes: fetched.bytes, metadata });
      results.push(freeze({ variant: variant.name, key, status: fetched.status, attempt: fetched.attempt, sha256: record.sha256 }));
    }
  }
  return freeze({ publishId: normalizedPublishId, finalCommit: commit, checks: freeze(results) });
};

const readArgument = (argv, name) => {
  const index = argv.indexOf(name);
  if (index < 0 || !argv[index + 1]) throw new Error(`Missing ${name}.`);
  return argv[index + 1];
};

const currentPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentPath) {
  try {
    const argv = process.argv.slice(2);
    const result = await verifyLivePublication({
      outputDirectory: path.resolve(readArgument(argv, "--output")),
      baseUrl: readArgument(argv, "--base-url"),
      finalCommit: readArgument(argv, "--final-commit"),
      publishId: readArgument(argv, "--publish-id"),
    });
    console.log(`[LIVE PUBLICATION PASS] ${result.checks.length} exact checks`);
  } catch (error) {
    console.error(`[${error?.code ?? "LIVE_VERIFICATION_FAILED"}] ${error?.message ?? "Live verification failed."}`);
    process.exitCode = 1;
  }
}
