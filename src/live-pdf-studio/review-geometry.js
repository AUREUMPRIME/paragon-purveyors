export const REVIEW_PAGE_WIDTH = 816;
export const REVIEW_PAGE_HEIGHT = 1344;
export const REVIEW_GEOMETRY_TOLERANCE = 0.5;

const guardrail = ({
  key,
  label,
  selector,
  containerSelector = "",
  minCount = 1,
  maxCount = minCount,
  checkScroll = false,
  expectedWidth = null,
  expectedHeight = null,
}) =>
  Object.freeze({
    key,
    label,
    selector,
    containerSelector,
    minCount,
    maxCount,
    checkScroll,
    expectedWidth,
    expectedHeight,
  });

export const REVIEW_GEOMETRY_GUARDRAILS = Object.freeze([
  guardrail({
    key: "page",
    label: "Monthly Specials page",
    selector: ".monthly-specials-page",
    expectedWidth: REVIEW_PAGE_WIDTH,
    expectedHeight: REVIEW_PAGE_HEIGHT,
    checkScroll: true,
  }),
  guardrail({
    key: "header",
    label: "Header",
    selector: ".specials-header",
    containerSelector: ".monthly-specials-page",
  }),
  guardrail({
    key: "campaignTitle",
    label: "Campaign title",
    selector: ".month-title",
    containerSelector: ".specials-header",
    checkScroll: true,
  }),
  guardrail({
    key: "specialsGrid",
    label: "Specials grid",
    selector: ".specials-grid",
    containerSelector: ".monthly-specials-page",
  }),
  guardrail({
    key: "productCards",
    label: "Product card",
    selector: ".special-card",
    containerSelector: ".specials-grid",
    minCount: 4,
    maxCount: 4,
  }),
  guardrail({
    key: "productContent",
    label: "Product content",
    selector: ".special-card__content",
    containerSelector: ".special-card",
    minCount: 4,
    maxCount: 4,
    checkScroll: true,
  }),
  guardrail({
    key: "productNames",
    label: "Product name",
    selector: ".special-card__name",
    containerSelector: ".special-card__content",
    minCount: 4,
    maxCount: 4,
    checkScroll: true,
  }),
  guardrail({
    key: "productText",
    label: "Product description",
    selector: ".special-description",
    containerSelector: ".special-card__content",
    minCount: 4,
    maxCount: 4,
    checkScroll: true,
  }),
  guardrail({
    key: "priceGroups",
    label: "Price group",
    selector: ".price-list",
    containerSelector: ".special-card__content",
    minCount: 4,
    maxCount: 4,
    checkScroll: true,
  }),
  guardrail({
    key: "priceRows",
    label: "Price row",
    selector: ".price-row",
    containerSelector: ".price-list",
    minCount: 4,
    maxCount: 8,
    checkScroll: true,
  }),
  guardrail({
    key: "imagePanels",
    label: "Product image panel",
    selector: ".special-card__image-wrap",
    containerSelector: ".special-card",
    minCount: 4,
    maxCount: 4,
  }),
  guardrail({
    key: "closing",
    label: "Closing section",
    selector: ".specials-closing",
    containerSelector: ".monthly-specials-page",
  }),
  guardrail({
    key: "contacts",
    label: "Contact card",
    selector: ".contact-card",
    containerSelector: ".specials-closing__content",
    minCount: 2,
    maxCount: 2,
    checkScroll: true,
  }),
  guardrail({
    key: "contactInstructions",
    label: "Contact instructions",
    selector: ".specials-closing__instructions",
    containerSelector: ".specials-closing__content",
    checkScroll: true,
  }),
  guardrail({
    key: "footerMessage",
    label: "Footer message",
    selector: ".footer-message",
    containerSelector: ".specials-closing__instructions",
    checkScroll: true,
  }),
  guardrail({
    key: "disclaimer",
    label: "Disclaimer",
    selector: ".disclaimer",
    containerSelector: ".specials-closing__instructions",
    checkScroll: true,
  }),
  guardrail({
    key: "footerMedia",
    label: "Footer media",
    selector: ".specials-closing__media",
    containerSelector: ".specials-closing",
  }),
]);

const finiteNumber = (value) =>
  Number.isFinite(Number(value)) ? Number(value) : 0;

const snapshotRect = (rect = {}) =>
  Object.freeze({
    left: finiteNumber(rect.left),
    top: finiteNumber(rect.top),
    right: finiteNumber(rect.right),
    bottom: finiteNumber(rect.bottom),
    width: finiteNumber(rect.width),
    height: finiteNumber(rect.height),
  });

const createIssue = ({ key, index, message }) =>
  Object.freeze({
    section: "review",
    fieldKey: `review.geometry.${key}.${index}`,
    kind: "error",
    message,
  });

const isContained = (child, container, tolerance) =>
  child.left >= container.left - tolerance &&
  child.top >= container.top - tolerance &&
  child.right <= container.right + tolerance &&
  child.bottom <= container.bottom + tolerance;

const sizeMatches = (actual, expected, tolerance) =>
  expected === null || Math.abs(actual - expected) <= tolerance;

export const inspectGeometryDocument = (
  reviewDocument,
  {
    guardrails = REVIEW_GEOMETRY_GUARDRAILS,
    tolerance = REVIEW_GEOMETRY_TOLERANCE,
  } = {},
) => {
  if (!reviewDocument || typeof reviewDocument.querySelectorAll !== "function") {
    const issues = Object.freeze([
      createIssue({
        key: "document",
        index: 0,
        message: "Review geometry could not access the rendered document.",
      }),
    ]);

    return Object.freeze({
      issues,
      errorCount: issues.length,
      checkedCount: 0,
      guardrailCount: guardrails.length,
      isValid: false,
      pageWidth: 0,
      pageHeight: 0,
    });
  }

  const issues = [];
  let checkedCount = 0;
  let pageWidth = 0;
  let pageHeight = 0;

  guardrails.forEach((rule) => {
    const elements = [...reviewDocument.querySelectorAll(rule.selector)];

    if (elements.length < rule.minCount || elements.length > rule.maxCount) {
      issues.push(
        createIssue({
          key: rule.key,
          index: 0,
          message: `${rule.label} count must be between ${rule.minCount} and ${rule.maxCount}; found ${elements.length}.`,
        }),
      );
    }

    elements.forEach((element, index) => {
      checkedCount += 1;
      const rect = snapshotRect(element.getBoundingClientRect?.());

      if (rule.key === "page" && index === 0) {
        pageWidth = rect.width;
        pageHeight = rect.height;
      }

      if (rect.width <= 0 || rect.height <= 0) {
        issues.push(
          createIssue({
            key: rule.key,
            index,
            message: `${rule.label} ${index + 1} has no visible geometry.`,
          }),
        );
      }

      if (
        !sizeMatches(rect.width, rule.expectedWidth, tolerance) ||
        !sizeMatches(rect.height, rule.expectedHeight, tolerance)
      ) {
        issues.push(
          createIssue({
            key: rule.key,
            index,
            message: `${rule.label} must be ${rule.expectedWidth} × ${rule.expectedHeight} CSS pixels; found ${rect.width} × ${rect.height}.`,
          }),
        );
      }

      if (rule.containerSelector) {
        const container = element.closest?.(rule.containerSelector);

        if (!container) {
          issues.push(
            createIssue({
              key: rule.key,
              index,
              message: `${rule.label} ${index + 1} is missing its ${rule.containerSelector} guardrail.`,
            }),
          );
        } else {
          const containerRect = snapshotRect(
            container.getBoundingClientRect?.(),
          );

          if (!isContained(rect, containerRect, tolerance)) {
            issues.push(
              createIssue({
                key: rule.key,
                index,
                message: `${rule.label} ${index + 1} exceeds its ${rule.containerSelector} guardrail.`,
              }),
            );
          }
        }
      }

      if (rule.checkScroll) {
        const computedStyle =
          element.ownerDocument?.defaultView?.getComputedStyle?.(element) ||
          null;
        const clipsVertically =
          !computedStyle ||
          ["auto", "clip", "hidden", "scroll"].includes(
            computedStyle.overflowY,
          );
        const horizontalOverflow =
          finiteNumber(element.scrollWidth) -
            finiteNumber(element.clientWidth) >
          tolerance;
        const verticalOverflow =
          clipsVertically &&
          finiteNumber(element.scrollHeight) -
            finiteNumber(element.clientHeight) >
            tolerance;

        if (horizontalOverflow || verticalOverflow) {
          issues.push(
            createIssue({
              key: rule.key,
              index,
              message: `${rule.label} ${index + 1} contains clipped or overflowing content.`,
            }),
          );
        }
      }
    });
  });

  const frozenIssues = Object.freeze(issues);

  return Object.freeze({
    issues: frozenIssues,
    errorCount: frozenIssues.length,
    checkedCount,
    guardrailCount: guardrails.length,
    isValid: frozenIssues.length === 0,
    pageWidth,
    pageHeight,
  });
};

export const inspectReviewFrameGeometry = ({
  frame,
  guardrails = REVIEW_GEOMETRY_GUARDRAILS,
  tolerance = REVIEW_GEOMETRY_TOLERANCE,
} = {}) =>
  inspectGeometryDocument(frame?.contentDocument, {
    guardrails,
    tolerance,
  });
