import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");

const readOptional = async (relativePath) => {
  try {
    return await fs.readFile(path.join(projectRoot, relativePath), "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return "";
    throw error;
  }
};

const exists = async (relativePath) => {
  try {
    await fs.access(path.join(projectRoot, relativePath));
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
};

test("API client declares the locked Worker routes and request factory", async () => {
  const source = await readOptional("src/live-pdf-studio/api-client.js");

  assert.match(source, /export class StudioApiError/);
  assert.match(source, /export const createStudioApiClient/);
  assert.match(source, /["']\/v1\/auth\/login["']/);
  assert.match(source, /["']\/v1\/auth\/session["']/);
  assert.match(source, /["']\/v1\/studio\/bootstrap["']/);
  assert.match(source, /["']\/v1\/studio\/validate["']/);
  assert.match(source, /["']\/v1\/studio\/publish["']/);
  assert.match(source, /publicationStatus/);
});

test("API client sends no-store JSON login without persisting credentials", async () => {
  const source = await readOptional("src/live-pdf-studio/api-client.js");

  assert.match(source, /method:\s*["']POST["']/);
  assert.match(source, /JSON\.stringify\(\{\s*password\s*\}\)/);
  assert.match(source, /cache:\s*["']no-store["']/);
  assert.doesNotMatch(source, /localStorage|indexedDB|document\.cookie/u);
});

test("API client attaches Bearer sessions and normalizes HTTP failures", async () => {
  const source = await readOptional("src/live-pdf-studio/api-client.js");

  assert.match(source, /Authorization/i);
  assert.match(source, /Bearer/);
  assert.match(source, /status/);
  assert.match(source, /code/);
  assert.match(source, /retryAfterSeconds/);
  assert.match(source, /onUnauthorized/);
});

test("Auth controller stores only access token and expiry in sessionStorage", async () => {
  const source = await readOptional("src/live-pdf-studio/auth.js");

  assert.match(source, /export const STUDIO_SESSION_STORAGE_KEY/);
  assert.match(source, /export const createStudioAuthController/);
  assert.match(source, /sessionStorage/);
  assert.match(source, /accessToken/);
  assert.match(source, /expiresAt/);
  assert.doesNotMatch(source, /localStorage|indexedDB|document\.cookie/u);
  assert.doesNotMatch(source, /setItem\([^)]*password/iu);
});

test("Auth startup validates a stored session before loading bootstrap", async () => {
  const source = await readOptional("src/live-pdf-studio/auth.js");
  const sessionIndex = source.indexOf("client.session");
  const bootstrapIndex = source.indexOf("client.bootstrap");

  assert.notEqual(sessionIndex, -1);
  assert.notEqual(bootstrapIndex, -1);
  assert.ok(
    sessionIndex < bootstrapIndex,
    "Stored sessions must be validated before authenticated bootstrap.",
  );
});

test("Login logout and unauthorized handling preserve IndexedDB drafts", async () => {
  const source = await readOptional("src/live-pdf-studio/auth.js");

  assert.match(source, /client\.login/);
  assert.match(source, /clearSession/);
  assert.match(source, /onUnauthorized/);
  assert.doesNotMatch(
    source,
    /deleteDatabase|clearDraft|documents|metadata|uploads|indexedDB/iu,
  );
});

test("Studio main consumes authenticated bootstrap publication authority through the isolated bridge", async () => {
  const source = await readOptional("src/live-pdf-studio/main.js");

  assert.match(source, /from "\.\/api-client\.js"/);
  assert.match(source, /from "\.\/auth\.js"/);
  assert.match(source, /from "\.\/publish-controller\.js"/);
  assert.match(source, /bootstrap\.document/);
  assert.match(source, /bootstrap\.currentMainSha/);
  assert.match(source, /bootstrap\.productionPublishingEnabled/);
  assert.match(source, /createPublishController/);
  assert.doesNotMatch(source, /productionPublishingEnabled:\s*false/);
});

test("Studio shell exposes accessible authentication and two runtime-controlled Publish actions", async () => {
  const source = await readOptional("src/live-pdf-studio/shell.js");

  assert.match(source, /data-studio-auth/);
  assert.match(source, /data-studio-password/);
  assert.match(source, /data-studio-login/);
  assert.match(source, /autocomplete=["']current-password["']/);
  assert.ok(
    (source.match(/Publish Live PDF/g) || []).length >= 2,
    "Both Studio publish controls must remain present.",
  );
  assert.match(source, /action:\s*"publish"/);
  assert.match(source, /data-studio-action="\$\{action\.action\}"/);
  assert.match(source, /data-studio-action="publish"/);
  assert.match(source, /setPublishingState/);
  assert.match(source, /data-publishing-status/);
});

test("hidden Studio regions are removed from layout even when component CSS sets display", async () => {
  const styles = await readOptional("src/live-pdf-studio/styles.css");

  assert.match(
    styles,
    /\[hidden\]\s*\{[^}]*display:\s*none\s*!important;[^}]*\}/s,
  );
});

test("Frontend authentication and Publish Bridge suites are permanent", async () => {
  const packageJson = JSON.parse(await readOptional("package.json"));

  assert.equal(
    packageJson.scripts["studio:frontend-auth:test"],
    "node --test tests/live-pdf-studio-frontend-auth.test.mjs",
  );
  assert.equal(
    packageJson.scripts["studio:publish-bridge:test"],
    "node --test tests/live-pdf-studio-publish-bridge.test.mjs",
  );
  assert.match(
    packageJson.scripts["test:specials:contracts"],
    /tests\/live-pdf-studio-frontend-auth\.test\.mjs/,
  );
  assert.match(
    packageJson.scripts["test:specials:contracts"],
    /tests\/live-pdf-studio-publish-bridge\.test\.mjs/,
  );
  assert.equal(
    await exists("src/live-pdf-studio/publish-controller.js"),
    true,
  );
  assert.equal(
    await exists("src/live-pdf-studio/publish-payload.js"),
    true,
  );
});

test("Worker configuration enables workers.dev without enabling publication", async () => {
  const config = JSON.parse(
    await readOptional("tools/paragon-live-pdf-worker/wrangler.jsonc"),
  );

  assert.equal(config.workers_dev, true);
  assert.equal(config.preview_urls, false);
  assert.equal(config.vars.PRODUCTION_PUBLISHING_ENABLED, "false");
  assert.ok(config.secrets.required.includes("PASSWORD_SALT_B64"));
  assert.ok(config.secrets.required.includes("PASSWORD_HASH_B64"));
  assert.ok(config.secrets.required.includes("SESSION_SECRET_B64"));
});

test("Studio production API base is injected by Vite while localhost remains isolated", async () => {
  const source = await readOptional("src/live-pdf-studio/main.js");

  assert.match(
    source,
    /import\.meta\.env\.VITE_PARAGON_STUDIO_API_BASE/,
  );
  assert.match(source, /http:\/\/127\.0\.0\.1:8787/);
  assert.match(source, /getConfiguredStudioApiBaseUrl/);
  assert.doesNotMatch(
    source,
    /https:\/\/[^"'`\s]+\.workers\.dev/iu,
  );
});

test("Pages build receives only the public Worker endpoint repository variable", async () => {
  const workflow = await readOptional(".github/workflows/deploy.yml");

  assert.match(
    workflow,
    /VITE_PARAGON_STUDIO_API_BASE:\s*\$\{\{\s*vars\.VITE_PARAGON_STUDIO_API_BASE\s*\|\|\s*''\s*\}\}/,
  );
  assert.doesNotMatch(
    workflow,
    /PASSWORD_(?:SALT|HASH)|SESSION_SECRET|GITHUB_APP_PRIVATE_KEY/iu,
  );
});
