export const ASSET_LIBRARY_DEFINITIONS = Object.freeze({
  "brand-marks": Object.freeze({
    label: "Brand Marks",
    category: "brand-mark",
    kind: "logo",
  }),
  wordmarks: Object.freeze({
    label: "Wordmarks",
    category: "wordmark",
    kind: "logo",
  }),
  "campaign-marks": Object.freeze({
    label: "Campaign Marks",
    category: "campaign-mark",
    kind: "logo",
  }),
  "product-brand-logos": Object.freeze({
    label: "Product Brand Logos",
    category: "product-brand-logo",
    kind: "logo",
  }),
  tenderloin: Object.freeze({
    label: "Tenderloin Images",
    category: "product-photo",
    kind: "photo",
  }),
  ribeye: Object.freeze({
    label: "Ribeye Images",
    category: "product-photo",
    kind: "photo",
  }),
  striploin: Object.freeze({
    label: "Striploin Images",
    category: "product-photo",
    kind: "photo",
  }),
  "tri-tip": Object.freeze({
    label: "Tri Tip Images",
    category: "product-photo",
    kind: "photo",
  }),
  footer: Object.freeze({
    label: "Footer B-roll",
    category: "footer-broll",
    kind: "photo",
  }),
});

const clone = (value) =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

export const parseAssetSlotPath = (slotPath) => {
  if (typeof slotPath !== "string" || slotPath.trim() === "") {
    throw new TypeError("Asset slot path is required.");
  }

  const segments = [];
  const expression = /([^[.\]]+)|\[(\d+)\]/g;
  let match;

  while ((match = expression.exec(slotPath)) !== null) {
    segments.push(
      match[2] === undefined ? match[1] : Number(match[2]),
    );
  }

  if (segments.length === 0) {
    throw new TypeError("Asset slot path is invalid.");
  }

  return segments;
};

export const getValueAtPath = (source, path) =>
  path.reduce((value, segment) => value?.[segment], source);

export const createAssetSlotRecords = (document) => {
  const slots = [
    {
      key: "header.brandMark",
      path: ["header", "brandMark"],
      label: "Header brand mark",
      library: "brand-marks",
    },
    {
      key: "header.wordmark",
      path: ["header", "wordmark"],
      label: "Header wordmark",
      library: "wordmarks",
    },
    {
      key: "header.campaignMark",
      path: ["header", "campaignMark"],
      label: "Header campaign mark",
      library: "campaign-marks",
    },
  ];

  document.specials.forEach((special, index) => {
    const prefix = `specials[${index}]`;
    slots.push({
      key: `${prefix}.brandLogo`,
      path: ["specials", index, "brandLogo"],
      label: `${special.displayName || special.id} brand logo`,
      library: "product-brand-logos",
    });
    slots.push({
      key: `${prefix}.primaryOffer.image`,
      path: ["specials", index, "primaryOffer", "image"],
      label: `${special.displayName || special.id} primary image`,
      library: special.id,
    });

    if (
      special.offerMode === "dual-offer" &&
      special.secondaryOffer?.image
    ) {
      slots.push({
        key: `${prefix}.secondaryOffer.image`,
        path: ["specials", index, "secondaryOffer", "image"],
        label: `${special.displayName || special.id} secondary image`,
        library: special.id,
      });
    }
  });

  slots.push({
    key: "footer.broll",
    path: ["footer", "broll"],
    label: "Footer B-roll",
    library: "footer",
  });

  return Object.freeze(
    slots.map((slot) =>
      Object.freeze({
        ...slot,
        path: Object.freeze([...slot.path]),
      }),
    ),
  );
};

export const createAssetUsageMap = (document) => {
  const usage = new Map();

  for (const assetId of Object.keys(document.assetLibrary || {})) {
    usage.set(assetId, []);
  }

  for (const slot of createAssetSlotRecords(document)) {
    const reference = getValueAtPath(document, slot.path);
    const assetId = reference?.assetId;

    if (!assetId) continue;
    if (!usage.has(assetId)) usage.set(assetId, []);

    usage.get(assetId).push(
      Object.freeze({
        key: slot.key,
        label: slot.label,
        library: slot.library,
      }),
    );
  }

  return usage;
};

export const getCompatibleAssets = ({
  document,
  library,
  query = "",
  includeArchived = false,
  pendingAssetIds = new Set(),
} = {}) => {
  if (!document?.assetLibrary) {
    throw new TypeError("A Studio document asset library is required.");
  }

  if (library && !ASSET_LIBRARY_DEFINITIONS[library]) {
    throw new TypeError(`Unsupported asset library: ${library}`);
  }

  const normalizedQuery = String(query).trim().toLowerCase();
  const usage = createAssetUsageMap(document);

  return Object.values(document.assetLibrary)
    .filter((asset) => !library || asset.library === library)
    .filter((asset) => includeArchived || !asset.archived)
    .map((asset) => {
      const usages = usage.get(asset.id) || [];
      return Object.freeze({
        ...clone(asset),
        pending: pendingAssetIds.has(asset.id),
        usageCount: usages.length,
        usages: Object.freeze([...usages]),
      });
    })
    .filter((asset) => {
      if (!normalizedQuery) return true;

      const searchText = [
        asset.id,
        asset.label,
        asset.category,
        asset.library,
        asset.path,
        ...asset.usages.map((item) => item.label),
      ]
        .join(" ")
        .toLowerCase();

      return searchText.includes(normalizedQuery);
    })
    .sort((left, right) => {
      if (left.archived !== right.archived) {
        return Number(left.archived) - Number(right.archived);
      }

      return left.label.localeCompare(right.label);
    });
};

export const canAssignAsset = ({
  document,
  slotPath,
  assetId,
} = {}) => {
  const slot = createAssetSlotRecords(document).find(
    (record) => record.key === slotPath,
  );
  const asset = document?.assetLibrary?.[assetId];

  if (!slot || !asset || asset.archived) return false;
  return slot.library === asset.library;
};

export const assignAssetToSlot = ({
  document,
  slotPath,
  assetId,
} = {}) => {
  if (!canAssignAsset({ document, slotPath, assetId })) {
    throw new TypeError(
      "Asset is unavailable or incompatible with the selected slot.",
    );
  }

  const path = parseAssetSlotPath(slotPath);
  return {
    path: [...path, "assetId"],
    value: assetId,
  };
};

export const canArchiveAsset = ({
  document,
  assetId,
} = {}) => {
  const asset = document?.assetLibrary?.[assetId];
  if (!asset || asset.archived) return false;

  return (createAssetUsageMap(document).get(assetId) || []).length === 0;
};

export const archiveAssetRecord = ({
  document,
  assetId,
} = {}) => {
  if (!canArchiveAsset({ document, assetId })) {
    throw new TypeError(
      "Only unreferenced active assets may be archived.",
    );
  }

  return {
    path: ["assetLibrary", assetId, "archived"],
    value: true,
  };
};

export const restoreAssetRecord = ({
  document,
  assetId,
} = {}) => {
  const asset = document?.assetLibrary?.[assetId];

  if (!asset?.archived) {
    throw new TypeError("Only archived assets may be restored.");
  }

  return {
    path: ["assetLibrary", assetId, "archived"],
    value: false,
  };
};

export const removePendingAssetRecord = ({
  document,
  assetId,
  pendingAssetIds = new Set(),
} = {}) => {
  const asset = document?.assetLibrary?.[assetId];
  const usageCount =
    (createAssetUsageMap(document).get(assetId) || []).length;

  if (!asset || !pendingAssetIds.has(assetId) || usageCount !== 0) {
    throw new TypeError(
      "Only unreferenced pending uploads may be removed.",
    );
  }

  const nextLibrary = clone(document.assetLibrary);
  delete nextLibrary[assetId];

  return {
    path: ["assetLibrary"],
    value: nextLibrary,
  };
};

export const validateAssetCatalog = (document) => {
  const issues = [];
  const records = Object.entries(document?.assetLibrary || {});
  const slots = createAssetSlotRecords(document);

  for (const [assetId, asset] of records) {
    if (asset.id !== assetId) {
      issues.push({
        section: "assets",
        kind: "error",
        message: `Asset key and ID differ for ${assetId}.`,
      });
    }

    if (!ASSET_LIBRARY_DEFINITIONS[asset.library]) {
      issues.push({
        section: "assets",
        kind: "error",
        message: `Asset ${assetId} uses an unsupported library.`,
      });
    }

    if (
      typeof asset.sha256 !== "string" ||
      !/^[a-f0-9]{64}$/.test(asset.sha256)
    ) {
      issues.push({
        section: "assets",
        kind: "error",
        message: `Asset ${assetId} has an invalid SHA-256.`,
      });
    }

    if (
      typeof asset.path !== "string" ||
      !asset.path.includes(asset.sha256?.slice(0, 12) || "__missing__")
    ) {
      issues.push({
        section: "assets",
        kind: "error",
        message: `Asset ${assetId} path is not content-addressed.`,
      });
    }
  }

  for (const slot of slots) {
    const reference = getValueAtPath(document, slot.path);
    const asset = document.assetLibrary?.[reference?.assetId];

    if (!asset) {
      issues.push({
        section: "assets",
        kind: "missing",
        message: `${slot.label} references a missing asset.`,
      });
      continue;
    }

    if (asset.archived) {
      issues.push({
        section: "assets",
        kind: "error",
        message: `${slot.label} references an archived asset.`,
      });
    }

    if (asset.library !== slot.library) {
      issues.push({
        section: "assets",
        kind: "error",
        message: `${slot.label} references an incompatible library.`,
      });
    }
  }

  return Object.freeze(issues.map((issue) => Object.freeze(issue)));
};
