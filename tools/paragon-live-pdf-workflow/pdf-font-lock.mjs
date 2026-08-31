import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const freeze = (value) => Object.freeze(value);
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

export const PDF_FONT_ASSETS = freeze([
  freeze({
    id: "cormorant-garamond-variable",
    family: "Cormorant Garamond",
    relativePath: "public/assets/fonts/cormorant-garamond/CormorantGaramond[wght].ttf",
    sha256: "b20b7d9626dd956b2c5e558692ad328b1f19e3275e2782db4fa07670d83f35e0",
    weightRange: "300 700",
    format: "truetype-variations",
  }),
  freeze({
    id: "inter-variable",
    family: "Inter",
    relativePath: "public/assets/fonts/inter/Inter[opsz,wght].ttf",
    sha256: "29160a80ff49ddcab2c97711247e08b1fab27a484a329ce8b813d820dc559031",
    weightRange: "100 900",
    format: "truetype-variations",
  }),
]);

export const PDF_FONT_REQUIREMENTS = freeze([
  freeze({ family: "Cormorant Garamond", weight: 500 }),
  freeze({ family: "Cormorant Garamond", weight: 600 }),
  freeze({ family: "Cormorant Garamond", weight: 700 }),
  freeze({ family: "Inter", weight: 400 }),
  freeze({ family: "Inter", weight: 500 }),
  freeze({ family: "Inter", weight: 600 }),
]);

export const PDF_FONT_SELECTOR_ASSERTIONS = freeze([
  freeze({ selector: "body", family: "Inter" }),
  freeze({ selector: ".month-title", family: "Cormorant Garamond" }),
  freeze({ selector: ".special-card__name", family: "Cormorant Garamond" }),
  freeze({ selector: ".price-value", family: "Cormorant Garamond" }),
  freeze({ selector: ".contact-name", family: "Cormorant Garamond" }),
  freeze({ selector: ".marbling-score__value", family: "Cormorant Garamond" }),
  freeze({ selector: ".product-brand__fallback", family: "Cormorant Garamond", optional: true }),
  freeze({ selector: ".marbling-score__label", family: "Inter", optional: true }),
  freeze({ selector: ".marbling-score__line", family: "Inter", optional: true }),
  freeze({ selector: ".savings-message", family: "Inter", optional: true }),
  freeze({ selector: ".delivery-badge", family: "Inter", optional: true }),
]);

const encodeFontFace = ({ asset, bytes }) => [
  "@font-face {",
  `  font-family: "${asset.family}";`,
  `  src: url("data:font/ttf;base64,${bytes.toString("base64")}") format("${asset.format}");`,
  "  font-style: normal;",
  `  font-weight: ${asset.weightRange};`,
  "  font-stretch: normal;",
  "  font-display: block;",
  "}",
].join("\n");

const createOverrideCss = () => String.raw`
html,
body {
  font-family: "Inter", sans-serif;
  font-weight: 400;
  font-optical-sizing: none;
  font-synthesis: none;
}

.month-title {
  font-family: "Cormorant Garamond", serif;
  font-weight: 600;
}

.special-card__name {
  font-family: "Cormorant Garamond", serif;
  font-weight: 600;
}

.price-value {
  font-family: "Cormorant Garamond", serif;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.contact-name {
  font-family: "Cormorant Garamond", serif;
  font-weight: 600;
}

.marbling-score__value {
  font-family: "Cormorant Garamond", serif;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.product-brand__fallback {
  font-family: "Cormorant Garamond", serif;
  font-weight: 600;
}

.marbling-score__label,
.marbling-score__line,
.savings-message,
.delivery-badge {
  font-family: "Inter", sans-serif;
}

.price-icon {
  font-weight: 600;
}
`.trim();

export const loadPdfFontCss = async (projectRoot) => {
  if (!projectRoot) {
    throw new TypeError("projectRoot is required.");
  }

  const loaded = [];

  for (const asset of PDF_FONT_ASSETS) {
    const absolutePath = path.join(projectRoot, asset.relativePath);
    const bytes = await fs.readFile(absolutePath);
    const actualSha256 = sha256(bytes);

    if (actualSha256 !== asset.sha256) {
      throw new Error(
        `PDF font bytes changed for ${asset.id}: expected ${asset.sha256}, found ${actualSha256}`,
      );
    }

    loaded.push(freeze({
      ...asset,
      absolutePath,
      bytes,
      actualSha256,
    }));
  }

  const css = [
    ...loaded.map(({ bytes, ...asset }) => encodeFontFace({ asset, bytes })),
    createOverrideCss(),
  ].join("\n\n");

  return freeze({
    css,
    assets: freeze(
      loaded.map(({ bytes, ...asset }) => freeze({
        ...asset,
        bytes: bytes.length,
      })),
    ),
    requirements: PDF_FONT_REQUIREMENTS,
    selectors: PDF_FONT_SELECTOR_ASSERTIONS,
  });
};

const normalizeComputedFamily = (value) =>
  String(value ?? "")
    .split(",")[0]
    .trim()
    .replace(/^["']|["']$/gu, "");

export const waitForPdfFonts = async (
  page,
  {
    timeoutMs = 10000,
  } = {},
) => {
  if (!page || typeof page.evaluate !== "function") {
    throw new TypeError("A Playwright page is required.");
  }

  const report = await page.evaluate(
    async ({ requirements, selectors, timeoutMs: timeout }) => {
      if (!document.fonts) {
        return {
          ready: false,
          timeout: false,
          requirements: [],
          selectors: [],
          error: "document.fonts is unavailable",
        };
      }

      const timeoutResult = new Promise((resolve) => {
        window.setTimeout(
          () => resolve({ timeout: true }),
          timeout,
        );
      });
      const readyResult = document.fonts.ready.then(() => ({ timeout: false }));
      const race = await Promise.race([readyResult, timeoutResult]);

      if (race.timeout) {
        return {
          ready: false,
          timeout: true,
          requirements: [],
          selectors: [],
          error: `document.fonts.ready timed out after ${timeout}ms`,
        };
      }

      const requirementResults = requirements.map(({ family, weight }) => ({
        family,
        weight,
        ready: document.fonts.check(
          `${weight} 16px "${family}"`,
          "Paragon Purveyors 2026",
        ),
      }));
      const selectorResults = selectors.map(({ selector, family, optional = false }) => {
        const element = document.querySelector(selector);

        if (!element) {
          return {
            selector,
            family,
            optional,
            present: false,
            computedFamily: "",
            ready: Boolean(optional),
          };
        }

        const computedFamily = getComputedStyle(element).fontFamily;
        const primaryFamily = computedFamily
          .split(",")[0]
          .trim()
          .replace(/^["']|["']$/gu, "");

        return {
          selector,
          family,
          optional,
          present: true,
          computedFamily,
          primaryFamily,
          ready: primaryFamily === family,
        };
      });

      return {
        ready:
          requirementResults.every((item) => item.ready) &&
          selectorResults.every((item) => item.ready),
        timeout: false,
        requirements: requirementResults,
        selectors: selectorResults,
        status: document.fonts.status,
        error: null,
      };
    },
    {
      requirements: PDF_FONT_REQUIREMENTS,
      selectors: PDF_FONT_SELECTOR_ASSERTIONS,
      timeoutMs,
    },
  );

  if (!report.ready) {
    const requirements = report.requirements
      ?.filter((item) => !item.ready)
      .map((item) => `${item.family} ${item.weight}`)
      .join(", ");
    const selectors = report.selectors
      ?.filter((item) => !item.ready)
      .map((item) => `${item.selector} => ${item.computedFamily || "missing"}`)
      .join(", ");

    throw new Error(
      [
        "PDF font lock did not resolve.",
        report.error ? `error=${report.error}` : "",
        requirements ? `requirements=${requirements}` : "",
        selectors ? `selectors=${selectors}` : "",
      ]
        .filter(Boolean)
        .join(" "),
    );
  }

  return freeze({
    ...report,
    selectors: freeze(
      report.selectors.map((item) => freeze({
        ...item,
        normalizedPrimaryFamily: normalizeComputedFamily(item.computedFamily),
      })),
    ),
  });
};
