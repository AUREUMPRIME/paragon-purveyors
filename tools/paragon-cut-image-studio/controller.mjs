import http from "node:http";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const currentFile = fileURLToPath(import.meta.url);
const studioRoot = path.dirname(currentFile);
const projectRoot = path.resolve(studioRoot, "..", "..");
const indexPath = path.join(studioRoot, "index.html");
const contextTemplatePath = path.join(
  studioRoot,
  "context",
  "monthly-specials-v2.html",
);
const livePdfRoot = path.join(
  projectRoot,
  "src",
  "live-pdf",
);
const sharedCssPath = path.join(
  livePdfRoot,
  "monthly-specials.css",
);
const canonicalDocumentPath = path.join(
  projectRoot,
  "src",
  "data",
  "paragon-live-pdf-studio.json",
);
const publicAssetsRoot = path.join(
  projectRoot,
  "public",
  "assets",
);
const sharedModulePaths = new Map([
  [
    "/live-pdf/core/normalize-document.js",
    path.join(livePdfRoot, "core", "normalize-document.js"),
  ],
  [
    "/live-pdf/core/format-price.js",
    path.join(livePdfRoot, "core", "format-price.js"),
  ],
  [
    "/live-pdf/core/resolve-asset.js",
    path.join(livePdfRoot, "core", "resolve-asset.js"),
  ],
  [
    "/live-pdf/core/adapt-canonical-document.js",
    path.join(livePdfRoot, "core", "adapt-canonical-document.js"),
  ],
  [
    "/live-pdf/core/render-monthly-specials.js",
    path.join(livePdfRoot, "core", "render-monthly-specials.js"),
  ],
  [
    "/live-pdf/browser/resolve-browser-asset.js",
    path.join(livePdfRoot, "browser", "resolve-browser-asset.js"),
  ],
]);
const libraryRoot = path.join(studioRoot, "image-library");
const manifestPath = path.join(
  studioRoot,
  "manifests",
  "approved-selection.json",
);

const validateMode = process.argv.includes("--validate");
const safeLibraryPattern = /^[a-z0-9][a-z0-9-]*$/;
const allowedExtensions = new Set([
  ".webp",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
]);
const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".webp", "image/webp"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
]);

const readManifest = async () => {
  const parsed = JSON.parse(
    await fs.readFile(manifestPath, "utf8"),
  );

  if (parsed.version !== 3) {
    throw new Error(
      `Expected Studio manifest version 3. Found: ${parsed.version}`,
    );
  }

  if (
    !parsed.containerProfiles ||
    typeof parsed.containerProfiles !== "object"
  ) {
    throw new Error("Manifest containerProfiles are missing.");
  }

  if (!Array.isArray(parsed.sections) || parsed.sections.length !== 5) {
    throw new Error("Manifest must define exactly five sections.");
  }

  if (!Array.isArray(parsed.slots) || parsed.slots.length !== 8) {
    throw new Error("Manifest must define exactly eight typed asset slots.");
  }

  const assetIds = new Set();
  let productSlots = 0;
  let footerSlots = 0;

  for (const slot of parsed.slots) {
    if (!slot.assetId || assetIds.has(slot.assetId)) {
      throw new Error(`Invalid or duplicate assetId: ${slot.assetId}`);
    }

    assetIds.add(slot.assetId);

    if (!safeLibraryPattern.test(slot.libraryId || "")) {
      throw new Error(`Invalid libraryId for ${slot.assetId}.`);
    }

    if (!parsed.containerProfiles[slot.containerProfile]) {
      throw new Error(
        `Unknown container profile for ${slot.assetId}: ${slot.containerProfile}`,
      );
    }

    if (!["contain", "cover"].includes(slot.fit)) {
      throw new Error(`Invalid fit for ${slot.assetId}: ${slot.fit}`);
    }

    if (!slot.selectedFileName) {
      throw new Error(`Missing selectedFileName for ${slot.assetId}.`);
    }

    if (
      !allowedExtensions.has(
        path.extname(slot.selectedFileName).toLowerCase(),
      )
    ) {
      throw new Error(`Unsupported image type for ${slot.assetId}.`);
    }

    if (slot.category === "product") productSlots += 1;
    if (slot.category === "footer") footerSlots += 1;
  }

  if (productSlots !== 7 || footerSlots !== 1) {
    throw new Error(
      `Expected seven product slots and one footer slot. Found product=${productSlots}, footer=${footerSlots}`,
    );
  }

  if (assetIds.has("product.tri-tip.secondary")) {
    throw new Error("Tri Tip secondary product slot must not exist.");
  }

  return parsed;
};

const approvedManifest = await readManifest();

const approvedSlotById = (assetId) => {
  const slot = approvedManifest.slots.find(
    (candidate) => candidate.assetId === assetId,
  );

  if (!slot) {
    throw new Error(
      `Approved manifest slot is missing: ${assetId}`,
    );
  }

  return slot;
};

const formatApprovedZoom = (value) =>
  Number(value).toFixed(2);

const formatApprovedFocus = (value) =>
  String(Number(value));

const approvedValidationValues = {
  tenderloinZoom: formatApprovedZoom(
    approvedSlotById("product.tenderloin.primary").zoom,
  ),
  triTipZoom: formatApprovedZoom(
    approvedSlotById("product.tri-tip.primary").zoom,
  ),
  footerZoom: formatApprovedZoom(
    approvedSlotById("footer.broll").zoom,
  ),
  footerFocusX: formatApprovedFocus(
    approvedSlotById("footer.broll").focusX,
  ),
  footerFocusY: formatApprovedFocus(
    approvedSlotById("footer.broll").focusY,
  ),
  footerPosition: `${formatApprovedFocus(
    approvedSlotById("footer.broll").focusX,
  )}% ${formatApprovedFocus(
    approvedSlotById("footer.broll").focusY,
  )}%`,
};

const allowedLibraries = new Set(
  approvedManifest.slots.map((slot) => slot.libraryId),
);

let server = null;
let context = null;
let browser = null;
let page = null;
let shuttingDown = false;
let shutdownReason = "";
let validationProfilePath = "";

let resolveFinished;
const finished = new Promise((resolve) => {
  resolveFinished = resolve;
});

const send = (
  response,
  status,
  body,
  contentType = "text/plain; charset=utf-8",
) => {
  response.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(body);
};

const sendJson = (response, status, value) => {
  send(
    response,
    status,
    JSON.stringify(value),
    "application/json; charset=utf-8",
  );
};

const readCanonicalDocument = async () =>
  JSON.parse(
    await fs.readFile(canonicalDocumentPath, "utf8"),
  );

const resolveSafeChild = (root, relativePath) => {
  if (
    !relativePath ||
    relativePath.includes("\0") ||
    relativePath.includes("\\")
  ) {
    return null;
  }

  const resolvedRoot = path.resolve(root);
  const candidate = path.resolve(resolvedRoot, relativePath);
  const rootPrefix = `${resolvedRoot}${path.sep}`.toLowerCase();
  const normalizedCandidate = candidate.toLowerCase();

  return normalizedCandidate.startsWith(rootPrefix)
    ? candidate
    : null;
};

const verifyTransportFoundation = async (baseUrl) => {
  const canonicalDocument = await readCanonicalDocument();
  const brandMarkReference = canonicalDocument.header.brandMark;
  const brandMarkAsset =
    canonicalDocument.assetLibrary[brandMarkReference.assetId];

  if (!brandMarkAsset?.path) {
    throw new Error(
      "Canonical brand-mark asset is unavailable for transport validation.",
    );
  }

  const checks = [
    {
      pathname: "/api/canonical-document",
      contentType: "application/json",
      includes: '"documentId":"monthly-specials"',
    },
    {
      pathname: "/live-pdf/core/adapt-canonical-document.js",
      contentType: "text/javascript",
      includes: "adaptCanonicalDocument",
    },
    {
      pathname: "/live-pdf/core/render-monthly-specials.js",
      contentType: "text/javascript",
      includes: "renderMonthlySpecialsHtml",
    },
    {
      pathname: "/live-pdf/browser/resolve-browser-asset.js",
      contentType: "text/javascript",
      includes: "createBrowserAssetUrlResolver",
    },
    {
      pathname: "/context/monthly-specials.css",
      contentType: "text/css",
      includes: ".monthly-specials-page",
    },
    {
      pathname: `/${brandMarkAsset.path}`,
      contentType: "image/svg+xml",
      minimumBytes: 1,
    },
  ];

  for (const check of checks) {
    const response = await fetch(
      new URL(check.pathname, baseUrl),
      { cache: "no-store" },
    );

    if (!response.ok) {
      throw new Error(
        `Transport route failed: ${check.pathname} (${response.status})`,
      );
    }

    const contentType =
      response.headers.get("content-type") || "";

    if (!contentType.includes(check.contentType)) {
      throw new Error(
        `Transport content type mismatch for ${check.pathname}: ${contentType}`,
      );
    }

    if (check.includes) {
      const text = await response.text();

      if (!text.includes(check.includes)) {
        throw new Error(
          `Transport payload mismatch for ${check.pathname}.`,
        );
      }
    } else {
      const bytes = await response.arrayBuffer();

      if (bytes.byteLength < check.minimumBytes) {
        throw new Error(
          `Transport asset is empty: ${check.pathname}.`,
        );
      }
    }
  }

  for (const pathname of [
    "/live-pdf/core/not-allowlisted.js",
    "/assets/%2e%2e/package.json",
  ]) {
    const response = await fetch(
      new URL(pathname, baseUrl),
      { cache: "no-store" },
    );

    if (![403, 404].includes(response.status)) {
      throw new Error(
        `Unsafe transport route was not rejected: ${pathname}`,
      );
    }
  }
};


const readLibrary = async () => {
  const libraries = {};

  for (const libraryId of [...allowedLibraries].sort()) {
    const folder = path.join(libraryRoot, libraryId);
    const entries = await fs.readdir(folder, {
      withFileTypes: true,
    });

    libraries[libraryId] = entries
      .filter(
        (entry) =>
          entry.isFile() &&
          allowedExtensions.has(
            path.extname(entry.name).toLowerCase(),
          ),
      )
      .map((entry) => ({
        name: entry.name,
        url:
          `/library/${encodeURIComponent(libraryId)}/` +
          encodeURIComponent(entry.name),
      }))
      .sort((left, right) =>
        left.name.localeCompare(right.name, "en", {
          sensitivity: "base",
        }),
      );
  }

  return libraries;
};

const stopServer = async () => {
  if (!server?.listening) return;
  await new Promise((resolve) => server.close(resolve));
};

const closeBrowser = async () => {
  if (context) {
    await context.close().catch(() => {});
    return;
  }

  if (browser?.isConnected()) {
    await browser.close().catch(() => {});
  }
};

const shutdown = async (reason) => {
  if (shuttingDown) return;
  shuttingDown = true;
  shutdownReason = reason;
  console.log(`[CLOSE] ${reason}`);
  await closeBrowser();
  await stopServer();
  resolveFinished();
};

const openLibraryFolder = () => {
  const child = spawn("explorer.exe", [libraryRoot], {
    detached: true,
    stdio: "ignore",
    windowsHide: false,
  });
  child.unref();
};

server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(
      request.url || "/",
      `http://${request.headers.host || "127.0.0.1"}`,
    );

    if (request.method === "GET" && requestUrl.pathname === "/") {
      send(
        response,
        200,
        await fs.readFile(indexPath, "utf8"),
        "text/html; charset=utf-8",
      );
      return;
    }

    if (
      request.method === "GET" &&
      requestUrl.pathname === "/context/monthly-specials-v2.html"
    ) {
      send(
        response,
        200,
        await fs.readFile(contextTemplatePath, "utf8"),
        "text/html; charset=utf-8",
      );
      return;
    }

    if (
      request.method === "GET" &&
      requestUrl.pathname === "/context/monthly-specials.css"
    ) {
      send(
        response,
        200,
        await fs.readFile(sharedCssPath, "utf8"),
        "text/css; charset=utf-8",
      );
      return;
    }

    if (
      request.method === "GET" &&
      requestUrl.pathname === "/api/canonical-document"
    ) {
      sendJson(
        response,
        200,
        await readCanonicalDocument(),
      );
      return;
    }

    if (
      request.method === "GET" &&
      sharedModulePaths.has(requestUrl.pathname)
    ) {
      send(
        response,
        200,
        await fs.readFile(
          sharedModulePaths.get(requestUrl.pathname),
          "utf8",
        ),
        "text/javascript; charset=utf-8",
      );
      return;
    }

    if (
      request.method === "GET" &&
      requestUrl.pathname.startsWith("/assets/")
    ) {
      let relativeAssetPath = "";

      try {
        relativeAssetPath = decodeURIComponent(
          requestUrl.pathname.slice("/assets/".length),
        );
      } catch {
        send(response, 400, "Invalid asset path.");
        return;
      }

      const assetPath = resolveSafeChild(
        publicAssetsRoot,
        relativeAssetPath,
      );
      const extension = assetPath
        ? path.extname(assetPath).toLowerCase()
        : "";

      if (
        !assetPath ||
        !allowedExtensions.has(extension)
      ) {
        send(response, 403, "Invalid public asset path.");
        return;
      }

      send(
        response,
        200,
        await fs.readFile(assetPath),
        contentTypes.get(extension) ||
          "application/octet-stream",
      );
      return;
    }

    if (
      request.method === "GET" &&
      requestUrl.pathname === "/api/health"
    ) {
      sendJson(response, 200, {
        app: "paragon-visual-asset-studio",
        version: 4,
        schema: "typed-asset-slots-with-legal-context",
      });
      return;
    }

    if (
      request.method === "GET" &&
      requestUrl.pathname === "/api/library"
    ) {
      sendJson(response, 200, {
        libraries: await readLibrary(),
      });
      return;
    }

    if (
      request.method === "GET" &&
      requestUrl.pathname === "/api/manifest"
    ) {
      sendJson(response, 200, approvedManifest);
      return;
    }

    if (
      request.method === "POST" &&
      requestUrl.pathname === "/api/open-library"
    ) {
      openLibraryFolder();
      sendJson(response, 200, { opened: true });
      return;
    }

    if (
      request.method === "POST" &&
      requestUrl.pathname === "/api/close"
    ) {
      sendJson(response, 200, { closing: true });
      setTimeout(() => {
        shutdown("Close Studio button pressed").catch((error) => {
          console.error(error);
          process.exitCode = 1;
          resolveFinished();
        });
      }, 75);
      return;
    }

    if (
      request.method === "GET" &&
      requestUrl.pathname.startsWith("/library/")
    ) {
      const parts = requestUrl.pathname
        .split("/")
        .filter(Boolean);

      if (parts.length !== 3) {
        send(response, 404, "Not found.");
        return;
      }

      const libraryId = decodeURIComponent(parts[1]);
      const filename = decodeURIComponent(parts[2]);

      if (!allowedLibraries.has(libraryId)) {
        send(response, 403, "Invalid library folder.");
        return;
      }

      if (
        path.basename(filename) !== filename ||
        !allowedExtensions.has(
          path.extname(filename).toLowerCase(),
        )
      ) {
        send(response, 403, "Invalid image filename.");
        return;
      }

      const imagePath = path.join(
        libraryRoot,
        libraryId,
        filename,
      );
      const bytes = await fs.readFile(imagePath);

      send(
        response,
        200,
        bytes,
        contentTypes.get(
          path.extname(filename).toLowerCase(),
        ) || "application/octet-stream",
      );
      return;
    }

    send(response, 404, "Not found.");
  } catch (error) {
    console.error(error);
    sendJson(response, 500, {
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});

await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});

const address = server.address();
if (!address || typeof address === "string") {
  throw new Error("Could not resolve the Studio port.");
}

const studioUrl = `http://127.0.0.1:${address.port}/`;

if (validateMode) {
  await verifyTransportFoundation(studioUrl);
  console.log(
    "[OK] Browser transport foundation routes verified.",
  );
}
const persistentRoot = path.join(
  process.env.LOCALAPPDATA || os.tmpdir(),
  "Paragon Purveyors",
  "Cut Image Studio",
);

if (validateMode) {
  validationProfilePath = await fs.mkdtemp(
    path.join(os.tmpdir(), "paragon-cut-studio-v3-validate-"),
  );
} else {
  validationProfilePath = path.join(
    persistentRoot,
    "Chromium Profile",
  );
  await fs.mkdir(validationProfilePath, {
    recursive: true,
  });
}

const downloadsPath = path.join(os.homedir(), "Downloads");
await fs.mkdir(downloadsPath, { recursive: true });

context = await chromium.launchPersistentContext(
  validationProfilePath,
  {
    headless: validateMode,
    viewport: { width: 1500, height: 1000 },
    acceptDownloads: true,
    downloadsPath,
    args: [
      "--disable-background-mode",
      "--disable-extensions",
      "--no-first-run",
    ],
  },
);

browser = context.browser();
browser?.on("disconnected", () => {
  shutdown("Chromium window closed").catch((error) => {
    console.error(error);
    process.exitCode = 1;
    resolveFinished();
  });
});

const existingPages = context.pages();
page = existingPages[0] || (await context.newPage());
page.on("close", () => {
  shutdown("Studio page closed").catch((error) => {
    console.error(error);
    process.exitCode = 1;
    resolveFinished();
  });
});

await page.goto(studioUrl, { waitUntil: "networkidle" });

if (validateMode) {
  await page.waitForFunction(() =>
    Boolean(window.__PARAGON_STUDIO_READY__),
  );

  await page.waitForFunction(() =>
    Boolean(window.__PARAGON_CONTEXT_READY__),
  );

  await page.waitForFunction(() => {
    const images = Array.from(
      document.querySelectorAll("[data-preview-image]"),
    );
    return (
      images.length === 8 &&
      images.every(
        (image) =>
          image.getAttribute("src") &&
          image.complete &&
          image.naturalWidth > 0,
      )
    );
  });

  const initial = await page.evaluate(() => {
    const ratio = (selector) => {
      const rect = document
        .querySelector(selector)
        .getBoundingClientRect();
      return Number((rect.width / rect.height).toFixed(3));
    };

    const footerImage = document.querySelector(
      '[data-preview-image="footer.broll"]',
    );

    return {
      sections: document.querySelectorAll("[data-section]").length,
      controls: document.querySelectorAll("[data-control]").length,
      selectors: document.querySelectorAll("[data-image-select]").length,
      images: Array.from(
        document.querySelectorAll("[data-preview-image]"),
      ).filter(
        (image) =>
          image.getAttribute("src") &&
          image.complete &&
          image.naturalWidth > 0,
      ).length,
      productControls: document.querySelectorAll(
        '[data-control][data-category="product"]',
      ).length,
      footerControls: document.querySelectorAll(
        '[data-control][data-category="footer"]',
      ).length,
      triTipPreviews: document.querySelectorAll(
        '[data-preview^="product.tri-tip."]',
      ).length,
      staleTriTipSecondary: document.querySelectorAll(
        '[data-preview="product.tri-tip.secondary"]',
      ).length,
      libraryCount: Number(
        document.querySelector("[data-library-count]").textContent,
      ),
      tenderloinZoom: document.querySelector(
        '[data-zoom-number="product.tenderloin.primary"]',
      ).value,
      triTipZoom: document.querySelector(
        '[data-zoom-number="product.tri-tip.primary"]',
      ).value,
      footerFocusY: document.querySelector(
        '[data-y-number="footer.broll"]',
      ).value,
      dualSlotRatio: ratio(
        '[data-preview="product.tenderloin.primary"]',
      ),
      triTipRatio: ratio(
        '[data-preview="product.tri-tip.primary"]',
      ),
      footerRatio: ratio('[data-preview="footer.broll"]'),
      footerFit: getComputedStyle(footerImage).objectFit,
      footerFilter: getComputedStyle(footerImage).filter,
      footerOverlay: getComputedStyle(
        document.querySelector('[data-preview="footer.broll"]'),
        "::after",
      ).backgroundImage,
      context: (() => {
        const frame = document.querySelector("[data-context-frame]");
        const documentContext = frame.contentDocument;
        const contextImages = [
          ...documentContext.querySelectorAll("[data-paragon-context-image]"),
        ];
        const triTipCard = documentContext.querySelector(
          '[data-cut-id="tri-tip"]',
        );
        return {
          frameWidth: frame.getAttribute("width") || frame.clientWidth,
          frameHeight: frame.getAttribute("height") || frame.clientHeight,
          pageWidth: documentContext.querySelector(".monthly-specials-page")
            .getBoundingClientRect().width,
          pageHeight: documentContext.querySelector(".monthly-specials-page")
            .getBoundingClientRect().height,
          productImages: documentContext.querySelectorAll(
            ".special-card__image",
          ).length,
          triTipImages: triTipCard.querySelectorAll(
            ".special-card__image",
          ).length,
          footerImages: documentContext.querySelectorAll(
            ".footer-broll",
          ).length,
          synchronizedImages: contextImages.length,
          synchronizedTargets: documentContext.querySelectorAll(
            "[data-paragon-context-target]",
          ).length,
          triTipSource: documentContext.querySelector(
            '[data-paragon-context-image="product.tri-tip.primary"]',
          ).src,
          footerSource: documentContext.querySelector(
            '[data-paragon-context-image="footer.broll"]',
          ).src,
          footerPosition: documentContext.querySelector(
            '[data-paragon-context-image="footer.broll"]',
          ).style.objectPosition,
        };
      })(),
      closeButtons: document.querySelectorAll(
        '[data-action="close"]',
      ).length,
    };
  });

  const near = (actual, expected, tolerance = 0.025) =>
    Math.abs(actual - expected) <= tolerance;

  if (
    initial.sections !== 5 ||
    initial.controls !== 8 ||
    initial.selectors !== 8 ||
    initial.images !== 8 ||
    initial.productControls !== 7 ||
    initial.footerControls !== 1 ||
    initial.triTipPreviews !== 1 ||
    initial.staleTriTipSecondary !== 0 ||
    initial.libraryCount !== 8 ||
    initial.context.productImages !== 7 ||
    initial.context.triTipImages !== 1 ||
    initial.context.footerImages !== 1 ||
    initial.context.synchronizedImages !== 8 ||
    initial.context.synchronizedTargets !== 8 ||
    !initial.context.triTipSource.includes("/library/tri-tip/") ||
    !initial.context.footerSource.includes("/library/footer/") ||
    initial.context.footerPosition !==
      approvedValidationValues.footerPosition ||
    initial.closeButtons !== 1
  ) {
    throw new Error(
      `Typed Studio validation failed: ${JSON.stringify(initial)}`,
    );
  }

  if (
    initial.tenderloinZoom !==
      approvedValidationValues.tenderloinZoom ||
    initial.triTipZoom !==
      approvedValidationValues.triTipZoom ||
    initial.footerFocusY !==
      approvedValidationValues.footerFocusY
  ) {
    throw new Error(
      `Approved values were not preserved: ${JSON.stringify(initial)}`,
    );
  }

  if (
    !near(initial.dualSlotRatio, 1.586) ||
    !near(initial.triTipRatio, 0.793) ||
    !near(initial.footerRatio, 2.312)
  ) {
    throw new Error(
      `Production geometry mismatch: ${JSON.stringify(initial)}`,
    );
  }

  if (
    !near(initial.context.pageWidth, 816, 1) ||
    !near(initial.context.pageHeight, 1344, 1)
  ) {
    throw new Error(
      `Legal context geometry mismatch: ${JSON.stringify(initial.context)}`,
    );
  }

  if (
    initial.footerFit !== "cover" ||
    !initial.footerFilter.includes("saturate(0.82)") ||
    !initial.footerFilter.includes("contrast(1.02)") ||
    !initial.footerFilter.includes("brightness(0.88)") ||
    !initial.footerOverlay.includes("linear-gradient")
  ) {
    throw new Error(
      `Footer treatment mismatch: ${JSON.stringify(initial)}`,
    );
  }

  await page.locator(
    '[data-y-number="footer.broll"]',
  ).fill("76");
  await page.locator(
    '[data-y-number="footer.broll"]',
  ).dispatchEvent("input");

  const contextFooterPosition = await page.evaluate(() =>
    document.querySelector("[data-context-frame]")
      .contentDocument.querySelector(
        '[data-paragon-context-image="footer.broll"]',
      ).style.objectPosition,
  );

  if (contextFooterPosition !== "50% 76%") {
    throw new Error(
      `Context synchronization failed: ${contextFooterPosition}`,
    );
  }

  await page.locator(
    '[data-reset-crop="footer.broll"]',
  ).click();

  const footerPreview = page.locator(
    '[data-preview="footer.broll"]',
  );
  await footerPreview.hover();
  await page.mouse.wheel(0, -120);

  const zoomAfterWheel = await page.locator(
    '[data-zoom-number="footer.broll"]',
  ).inputValue();

  if (zoomAfterWheel !== "1.05") {
    throw new Error(
      `Mouse-wheel zoom failed: ${zoomAfterWheel}`,
    );
  }

  const box = await footerPreview.boundingBox();
  if (!box) throw new Error("Footer preview has no bounding box.");

  await page.mouse.move(
    box.x + box.width / 2,
    box.y + box.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 30,
    box.y + box.height / 2 - 18,
  );
  await page.mouse.up();

  const focusAfterDrag = await page.locator(
    '[data-x-number="footer.broll"]',
  ).inputValue();

  if (focusAfterDrag === "50") {
    throw new Error("Direct drag positioning did not update Focus X.");
  }

  await page.locator(
    '[data-reset-crop="footer.broll"]',
  ).click();

  const restored = await page.evaluate(() => ({
    zoom: document.querySelector(
      '[data-zoom-number="footer.broll"]',
    ).value,
    focusX: document.querySelector(
      '[data-x-number="footer.broll"]',
    ).value,
    focusY: document.querySelector(
      '[data-y-number="footer.broll"]',
    ).value,
  }));

  if (
    restored.zoom !== approvedValidationValues.footerZoom ||
    restored.focusX !== approvedValidationValues.footerFocusX ||
    restored.focusY !== approvedValidationValues.footerFocusY
  ) {
    throw new Error(
      `Footer crop reset failed: ${JSON.stringify(restored)}`,
    );
  }

  await page.locator('[data-action="save"]').click();
  const savedCount = await page.evaluate(() =>
    Object.keys(
      JSON.parse(
        localStorage.getItem("paragon-cut-image-studio-v3") || "{}",
      ),
    ).length,
  );

  if (savedCount !== 8) {
    throw new Error(`Saved slot count mismatch: ${savedCount}`);
  }

  const downloadPromise = page.waitForEvent("download");
  await page.locator('[data-action="export"]').click();
  const download = await downloadPromise;

  if (
    download.suggestedFilename() !==
    "PARAGON_VISUAL_ASSET_STUDIO_MANIFEST.json"
  ) {
    throw new Error(
      `Unexpected export filename: ${download.suggestedFilename()}`,
    );
  }
  await download.delete().catch(() => {});

  console.log("[OK] Five typed asset sections rendered.");
  console.log("[OK] Seven product slots and one footer slot rendered.");
  console.log("[OK] Tri Tip uses one full-height production panel.");
  console.log("[OK] Footer uses exact production ratio and treatment.");
  console.log("[OK] Drag, wheel zoom, reset, save, and export work.");
  console.log("[OK] Complete US Legal production context rendered.");
  console.log("[OK] Seven product images and one footer image synchronize live.");
  console.log("[OK] Context drag and crop controls share one state model.");
  console.log("[OK] Complete close lifecycle remains active.");

  await shutdown("Validation completed");
} else {
  console.log(`[READY] ${studioUrl}`);
  console.log(
    "[INFO] Close Studio or the Chromium window to stop everything.",
  );
}

await finished;
if (context) await context.close().catch(() => {});
await stopServer();

if (
  validateMode &&
  validationProfilePath.startsWith(os.tmpdir())
) {
  await fs.rm(validationProfilePath, {
    recursive: true,
    force: true,
  }).catch(() => {});
}

console.log(
  `[PASS] ${shutdownReason || "Studio lifecycle completed"}`,
);
