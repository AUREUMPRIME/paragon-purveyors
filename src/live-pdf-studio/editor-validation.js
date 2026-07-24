import { validateAssetCatalog } from "./asset-library-model.js";
import { createVisualFieldRegistry } from "./visual-field-registry.js";
import { validateVisualDraft } from "./visual-validation.js";
import { fingerprintDocument } from "./state.js";
import {
  createInitialSectionStatuses,
  getAssetLibraryStatus,
  getReviewStatus,
  STUDIO_SECTION_STATUS,
} from "./status-model.js";
import { pathToFieldKey } from "./editor-field-registry.js";

const trim = (value) => String(value ?? "").trim();

const createIssueCollector = () => {
  const issues = [];
  const fieldIssues = {};

  const add = ({
    section,
    path = null,
    kind,
    message,
  }) => {
    const fieldKey = path ? pathToFieldKey(path) : `${section}.__section__`;
    const issue = Object.freeze({
      section,
      fieldKey,
      kind,
      message,
    });

    const existing = fieldIssues[fieldKey];
    const priority = { missing: 1, error: 2 };

    if (!existing || priority[kind] > priority[existing.kind]) {
      fieldIssues[fieldKey] = issue;
    }

    issues.push(issue);
  };

  return { issues, fieldIssues, add };
};

const requireText = ({
  collector,
  section,
  path,
  value,
  label,
  enabled = true,
}) => {
  if (enabled && trim(value).length === 0) {
    collector.add({
      section,
      path,
      kind: "missing",
      message: `${label} is required.`,
    });
  }
};

const requirePrice = ({
  collector,
  section,
  path,
  value,
  label,
}) => {
  if (value === null || value === undefined || value === "") {
    collector.add({
      section,
      path,
      kind: "missing",
      message: `${label} is required.`,
    });
    return;
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    collector.add({
      section,
      path,
      kind: "error",
      message: `${label} must be a non-negative number.`,
    });
  }
};

const validatePositiveUniqueSort = ({
  collector,
  section,
  records,
  basePath,
  label,
}) => {
  const seen = new Map();

  records.forEach(({ record, index }) => {
    const path = [...basePath, index, "sort"];
    const value = record.sort;

    if (value === null || value === undefined || value === "") {
      collector.add({
        section,
        path,
        kind: "missing",
        message: `${label} display order is required.`,
      });
      return;
    }

    if (!Number.isInteger(value) || value < 1) {
      collector.add({
        section,
        path,
        kind: "error",
        message: `${label} display order must be a positive integer.`,
      });
      return;
    }

    if (seen.has(value)) {
      collector.add({
        section,
        path,
        kind: "error",
        message: `${label} display order must be unique.`,
      });
      collector.add({
        section,
        path: [...basePath, seen.get(value), "sort"],
        kind: "error",
        message: `${label} display order must be unique.`,
      });
      return;
    }

    seen.set(value, index);
  });
};

const validateHeader = (draft, collector) => {
  const header = draft.header;

  requireText({
    collector,
    section: "header",
    path: ["header", "deliveryMessage", "value"],
    value: header.deliveryMessage.value,
    label: "Delivery message",
    enabled: header.deliveryMessage.visible,
  });

  for (const [line, label] of [
    ["line1", "Campaign title line 1"],
    ["line2", "Campaign title line 2"],
  ]) {
    requireText({
      collector,
      section: "header",
      path: ["header", "campaignTitle", line],
      value: header.campaignTitle[line],
      label,
      enabled: header.campaignTitle.visible,
    });
  }

  requireText({
    collector,
    section: "header",
    path: ["header", "month", "value"],
    value: header.month.value,
    label: "Month",
    enabled: header.month.visible,
  });

  if (header.year.visible) {
    requireText({
      collector,
      section: "header",
      path: ["header", "year", "value"],
      value: header.year.value,
      label: "Year",
    });

    if (
      trim(header.year.value).length > 0 &&
      !/^\d{4}$/.test(trim(header.year.value))
    ) {
      collector.add({
        section: "header",
        path: ["header", "year", "value"],
        kind: "error",
        message: "Year must contain exactly four digits.",
      });
    }
  }

  requireText({
    collector,
    section: "header",
    path: ["header", "supportingLine", "value"],
    value: header.supportingLine.value,
    label: "Supporting line",
    enabled: header.supportingLine.visible,
  });
};

const validateCuts = (draft, collector) => {
  const active = draft.specials
    .map((record, index) => ({ record, index }))
    .filter(({ record }) => record.active);

  if (active.length !== draft.page.maxActiveSpecials) {
    collector.add({
      section: "cuts",
      kind: "error",
      message:
        `Exactly ${draft.page.maxActiveSpecials} featured cuts must be active.`,
    });
  }

  validatePositiveUniqueSort({
    collector,
    section: "cuts",
    records: active,
    basePath: ["specials"],
    label: "Featured cut",
  });

  active.forEach(({ record: special, index }) => {
    const prefix = ["specials", index];

    for (const [property, label] of [
      ["displayName", "Display name"],
      ["brand", "Brand"],
      ["productLine", "Product line"],
      ["quantityAvailable", "Availability"],
    ]) {
      requireText({
        collector,
        section: "cuts",
        path: [...prefix, property],
        value: special[property],
        label,
      });
    }

    requireText({
      collector,
      section: "cuts",
      path: [...prefix, "primaryOffer", "label"],
      value: special.primaryOffer?.label,
      label: "Primary offer label",
    });

    requirePrice({
      collector,
      section: "cuts",
      path: [...prefix, "primaryOffer", "price"],
      value: special.primaryOffer?.price,
      label: "Primary price",
    });

    if (special.offerMode === "dual-offer") {
      requireText({
        collector,
        section: "cuts",
        path: [...prefix, "secondaryOffer", "label"],
        value: special.secondaryOffer?.label,
        label: "Secondary offer label",
      });

      requirePrice({
        collector,
        section: "cuts",
        path: [...prefix, "secondaryOffer", "price"],
        value: special.secondaryOffer?.price,
        label: "Secondary price",
      });
    } else if (special.offerMode !== "single-offer") {
      collector.add({
        section: "cuts",
        kind: "error",
        message: `Unsupported offer mode for ${special.id}.`,
      });
    }
  });
};

const validateContacts = (draft, collector) => {
  requireText({
    collector,
    section: "contacts",
    path: ["contacts", "instruction"],
    value: draft.contacts.instruction,
    label: "Ordering instruction",
  });

  const active = draft.contacts.items
    .map((record, index) => ({ record, index }))
    .filter(({ record }) => record.active);

  if (active.length < 1 || active.length > 2) {
    collector.add({
      section: "contacts",
      kind: "error",
      message: "One or two ordering contacts must be active.",
    });
  }

  validatePositiveUniqueSort({
    collector,
    section: "contacts",
    records: active,
    basePath: ["contacts", "items"],
    label: "Contact",
  });

  active.forEach(({ record: contact, index }) => {
    const prefix = ["contacts", "items", index];

    for (const [property, label] of [
      ["name", "Name"],
      ["location", "Service area"],
      ["phone", "Phone"],
      ["email", "Email"],
    ]) {
      requireText({
        collector,
        section: "contacts",
        path: [...prefix, property],
        value: contact[property],
        label,
      });
    }

    if (
      trim(contact.email).length > 0 &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trim(contact.email))
    ) {
      collector.add({
        section: "contacts",
        path: [...prefix, "email"],
        kind: "error",
        message: "Enter a valid email address.",
      });
    }
  });
};

const validateFooter = (draft, collector) => {
  for (const [property, label] of [
    ["message", "Footer message"],
    ["disclaimer", "Disclaimer"],
    ["buttonLabel", "Button label"],
    ["url", "Destination URL"],
  ]) {
    requireText({
      collector,
      section: "footer",
      path: ["footer", property],
      value: draft.footer[property],
      label,
    });
  }

  if (trim(draft.footer.url).length > 0) {
    let valid = false;

    try {
      valid = new URL(draft.footer.url).protocol === "https:";
    } catch {
      valid = false;
    }

    if (!valid) {
      collector.add({
        section: "footer",
        path: ["footer", "url"],
        kind: "error",
        message: "Destination URL must be a complete HTTPS address.",
      });
    }
  }
};

const sectionFingerprint = (document, sectionId) => {
  if (sectionId === "cuts") return fingerprintDocument(document.specials);
  return fingerprintDocument(document[sectionId]);
};

const deriveContentStatus = ({
  sectionId,
  draft,
  liveDocument,
  issues,
}) => {
  const sectionIssues = issues.filter(
    (issue) => issue.section === sectionId,
  );

  if (sectionIssues.some((issue) => issue.kind === "error")) {
    return STUDIO_SECTION_STATUS.ERROR;
  }

  if (sectionIssues.some((issue) => issue.kind === "missing")) {
    return STUDIO_SECTION_STATUS.MISSING;
  }

  return sectionFingerprint(draft, sectionId) ===
    sectionFingerprint(liveDocument, sectionId)
    ? STUDIO_SECTION_STATUS.COMPLETE
    : STUDIO_SECTION_STATUS.MODIFIED;
};

const deriveOverviewStatus = (statuses) => {
  const contentStatuses = [
    statuses.header,
    statuses.cuts,
    statuses.contacts,
    statuses.footer,
  ];

  if (contentStatuses.includes(STUDIO_SECTION_STATUS.ERROR)) {
    return STUDIO_SECTION_STATUS.ERROR;
  }

  if (contentStatuses.includes(STUDIO_SECTION_STATUS.MISSING)) {
    return STUDIO_SECTION_STATUS.MISSING;
  }

  if (contentStatuses.includes(STUDIO_SECTION_STATUS.MODIFIED)) {
    return STUDIO_SECTION_STATUS.MODIFIED;
  }

  return STUDIO_SECTION_STATUS.COMPLETE;
};

export const validateStudioDraft = ({
  draft,
  liveDocument,
  transientErrors = {},
} = {}) => {
  if (!draft || !liveDocument) {
    throw new TypeError("Draft and live document are required.");
  }

  const collector = createIssueCollector();

  validateHeader(draft, collector);
  validateCuts(draft, collector);
  validateContacts(draft, collector);
  validateFooter(draft, collector);

  for (const [fieldKey, message] of Object.entries(transientErrors)) {
    const section =
      fieldKey.startsWith("header.")
        ? "header"
        : fieldKey.startsWith("specials[")
          ? "cuts"
          : fieldKey.startsWith("contacts.")
            ? "contacts"
            : "footer";

    collector.add({
      section,
      kind: "error",
      message,
    });

    const latest = collector.issues.at(-1);
    collector.fieldIssues[fieldKey] = Object.freeze({
      ...latest,
      fieldKey,
    });
  }

  const statuses = createInitialSectionStatuses();

  for (const sectionId of ["header", "cuts", "contacts", "footer"]) {
    statuses[sectionId] = deriveContentStatus({
      sectionId,
      draft,
      liveDocument,
      issues: collector.issues,
    });
  }

  statuses.overview = deriveOverviewStatus(statuses);

  return Object.freeze({
    issues: Object.freeze([...collector.issues]),
    fieldIssues: Object.freeze({ ...collector.fieldIssues }),
    statuses: Object.freeze({ ...statuses }),
    issueCounts: Object.freeze(
      Object.fromEntries(
        ["header", "cuts", "contacts", "footer"].map((sectionId) => [
          sectionId,
          collector.issues.filter(
            (issue) => issue.section === sectionId,
          ).length,
        ]),
      ),
    ),
  });
};


const mergeStatus = (contentStatus, visualStatus) => {
  const priority = {
    [STUDIO_SECTION_STATUS.COMPLETE]: 0,
    [STUDIO_SECTION_STATUS.MODIFIED]: 1,
    [STUDIO_SECTION_STATUS.MISSING]: 2,
    [STUDIO_SECTION_STATUS.ERROR]: 3,
  };
  return priority[visualStatus] > priority[contentStatus]
    ? visualStatus
    : contentStatus;
};

export const validateCompleteStudioDraft = (options = {}) => {
  const content = validateStudioDraft(options);
  const visualRegistry = createVisualFieldRegistry(options.draft);
  const visual = validateVisualDraft({
    ...options,
    registry: visualRegistry,
  });
  const assetIssues = validateAssetCatalog(options.draft);
  const reviewIssues = Object.freeze([
    ...(options.reviewValidation?.issues || []),
  ]);
  const assetErrorCount = assetIssues.filter(
    (issue) => issue.kind === "error",
  ).length;
  const assetMissingCount = assetIssues.filter(
    (issue) => issue.kind === "missing",
  ).length;
  const catalogModified =
    fingerprintDocument(options.draft.assetLibrary) !==
    fingerprintDocument(options.liveDocument.assetLibrary);
  const draftModified =
    fingerprintDocument(options.draft) !==
    fingerprintDocument(options.liveDocument);
  const blockingIssueCount = [
    ...content.issues,
    ...visual.issues,
    ...assetIssues,
    ...reviewIssues,
  ].filter((issue) =>
    ["error", "missing"].includes(issue.kind),
  ).length;

  const statuses = {
    ...content.statuses,
    logos: visual.statuses.logos,
    cuts: mergeStatus(content.statuses.cuts, visual.statuses.cuts),
    footer: mergeStatus(content.statuses.footer, visual.statuses.footer),
    assets: getAssetLibraryStatus({
      issueCount: assetErrorCount,
      missingCount: assetMissingCount,
      catalogModified,
    }),
    review: getReviewStatus({
      errorCount: blockingIssueCount,
      isModified: draftModified,
    }),
  };
  statuses.overview = [
    statuses.header,
    statuses.cuts,
    statuses.logos,
    statuses.contacts,
    statuses.footer,
    statuses.assets,
    statuses.review,
  ].reduce(mergeStatus, STUDIO_SECTION_STATUS.COMPLETE);

  return Object.freeze({
    issues: Object.freeze([
      ...content.issues,
      ...visual.issues,
      ...assetIssues,
      ...reviewIssues,
    ]),
    fieldIssues: Object.freeze({
      ...content.fieldIssues,
      ...visual.fieldIssues,
    }),
    statuses: Object.freeze(statuses),
    issueCounts: Object.freeze({
      ...content.issueCounts,
      logos: visual.issueCounts.logos,
      cuts: content.issueCounts.cuts + visual.issueCounts.cuts,
      footer: content.issueCounts.footer + visual.issueCounts.footer,
      assets: assetIssues.length,
      review: reviewIssues.length,
    }),
  });
};
