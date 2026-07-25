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

test("Studio main initializes from authenticated bootstrap while publishing stays disabled", async () => {
  const source = await readOptional("src/live-pdf-studio/main.js");

  assert.match(source, /from "\.\/api-client\.js"/);
  assert.match(source, /from "\.\/auth\.js"/);
  assert.match(source, /bootstrap\.document/);
  assert.match(source, /bootstrap\.currentMainSha/);
  assert.match(source, /productionPublishingEnabled:\s*false/);
  assert.doesNotMatch(source, /publish-controller\.js/);
});

test("Studio shell exposes an accessible login gate and keeps publish controls disabled", async () => {
  const source = await readOptional("src/live-pdf-studio/shell.js");

  assert.match(source, /data-studio-auth/);
  assert.match(source, /data-studio-password/);
  assert.match(source, /data-studio-login/);
  assert.match(source, /autocomplete=["']current-password["']/);
  assert.ok(
    (source.match(/Publish Live PDF/g) || []).length >= 2,
    "Both Studio publish controls must remain present.",
  );
  assert.match(
    source,
    /Publishing becomes available after secure Studio authentication is connected\./,
  );
});

test("hidden Studio regions are removed from layout even when component CSS sets display", async () => {
  const styles = await readOptional("src/live-pdf-studio/styles.css");

  assert.match(
    styles,
    /\[hidden\]\s*\{[^}]*display:\s*none\s*!important;[^}]*\}/s,
  );
});

test("Frontend authentication suite is permanent and publication remains deferred", async () => {
  const packageJson = JSON.parse(await readOptional("package.json"));

  assert.equal(
    packageJson.scripts["studio:frontend-auth:test"],
    "node --test tests/live-pdf-studio-frontend-auth.test.mjs",
  );
  assert.match(
    packageJson.scripts["test:specials:contracts"],
    /tests\/live-pdf-studio-frontend-auth\.test\.mjs/,
  );
  assert.equal(
    await exists("src/live-pdf-studio/publish-controller.js"),
    false,
  );
});
