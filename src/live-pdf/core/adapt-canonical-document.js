import {
  normalizeText,
} from "./normalize-document.js";

const visibilityValue = (value) => (value === true ? "yes" : "no");

const slugifyKey = (value) =>
  normalizeText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const assertCanonicalDocument = (document) => {
  if (!document || typeof document !== "object") {
    throw new TypeError("Canonical document must be an object.");
  }

  if (document.schemaVersion !== 1) {
    throw new Error(
      `Unsupported canonical schemaVersion: ${document.schemaVersion}`,
    );
  }

  if (document.documentId !== "monthly-specials") {
    throw new Error(
      `Unsupported canonical documentId: ${document.documentId}`,
    );
  }

  if (!document.assetLibrary || typeof document.assetLibrary !== "object") {
    throw new Error("Canonical assetLibrary is missing.");
  }
};

export const resolveCanonicalAsset = (
  document,
  reference,
  label = "asset reference",
) => {
  assertCanonicalDocument(document);

  const assetId = normalizeText(reference?.assetId);

  if (!assetId) {
    throw new Error(`${label} is missing assetId.`);
  }

  const asset = document.assetLibrary[assetId];

  if (!asset) {
    throw new Error(`${label} references missing asset: ${assetId}`);
  }

  if (asset.archived === true) {
    throw new Error(`${label} references archived asset: ${assetId}`);
  }

  const assetPath = normalizeText(asset.path);

  if (!assetPath) {
    throw new Error(`${label} asset path is empty: ${assetId}`);
  }

  return {
    ...asset,
    path: assetPath,
  };
};

export const formatCanonicalPrice = (
  value,
  publication = {},
) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    throw new Error(`Canonical price must be a non-negative number. Found: ${value}`);
  }

  const locale = normalizeText(publication.locale) || "en-US";
  const currency = normalizeText(publication.currency) || "USD";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

const imageFields = (
  document,
  reference,
  prefix,
  label,
) => {
  const asset = resolveCanonicalAsset(document, reference, label);
  const focusX = Number(reference.focusX);
  const focusY = Number(reference.focusY);

  return {
    [`${prefix}ImagePath`]: asset.path,
    [`${prefix}ImageAlt`]: normalizeText(reference.alt),
    [`${prefix}ImageFit`]: normalizeText(reference.fit),
    [`${prefix}ImagePosition`]: `${focusX}% ${focusY}%`,
    [`${prefix}ImageZoom`]: Number(reference.zoom),
    [`${prefix}ImageFocusX`]: focusX,
    [`${prefix}ImageFocusY`]: focusY,
  };
};

export const adaptCanonicalDocument = (document) => {
  assertCanonicalDocument(document);

  const publication = document.publication || {};
  const header = document.header || {};
  const contacts = document.contacts || {};
  const footer = document.footer || {};

  const brandMark = resolveCanonicalAsset(
    document,
    header.brandMark,
    "header.brandMark",
  );
  const wordmark = resolveCanonicalAsset(
    document,
    header.wordmark,
    "header.wordmark",
  );
  const campaignMark = resolveCanonicalAsset(
    document,
    header.campaignMark,
    "header.campaignMark",
  );
  const footerBroll = resolveCanonicalAsset(
    document,
    footer.broll,
    "footer.broll",
  );

  const specials = [...(document.specials || [])]
    .filter((special) => special.active === true)
    .sort((left, right) => Number(left.sort) - Number(right.sort))
    .map((special) => {
      const brandLogo = resolveCanonicalAsset(
        document,
        special.brandLogo,
        `${special.id}.brandLogo`,
      );

      const adapted = {
        sort: Number(special.sort),
        active: true,
        cutId: normalizeText(special.id),
        offerMode: normalizeText(special.offerMode),
        displayName: normalizeText(special.displayName),
        brand: normalizeText(special.brand),
        brandLogoKey: slugifyKey(special.brand),
        brandLogoPath: brandLogo.path,
        brandLogoAlt: normalizeText(special.brandLogo.alt),
        productLine: normalizeText(special.productLine),
        marblingScore: normalizeText(special.marblingScore),
        quantityAvailable: normalizeText(special.quantityAvailable),
        primaryPriceLabel: normalizeText(special.primaryOffer?.label),
        primaryPrice: formatCanonicalPrice(
          special.primaryOffer?.price,
          publication,
        ),
        ...imageFields(
          document,
          special.primaryOffer?.image,
          "primary",
          `${special.id}.primaryOffer.image`,
        ),
        savingsMessage: normalizeText(special.savingsMessage),
        description: normalizeText(special.description),
      };

      if (special.offerMode === "dual-offer") {
        Object.assign(adapted, {
          secondaryPriceLabel: normalizeText(special.secondaryOffer?.label),
          secondaryPrice: formatCanonicalPrice(
            special.secondaryOffer?.price,
            publication,
          ),
          ...imageFields(
            document,
            special.secondaryOffer?.image,
            "secondary",
            `${special.id}.secondaryOffer.image`,
          ),
        });
      } else {
        Object.assign(adapted, {
          secondaryPriceLabel: "",
          secondaryPrice: "",
          secondaryImagePath: "",
          secondaryImageAlt: "",
          secondaryImageFit: "",
          secondaryImagePosition: "",
          secondaryImageZoom: "",
          secondaryImageFocusX: "",
          secondaryImageFocusY: "",
        });
      }

      return adapted;
    });

  return {
    source: {
      type: "canonical",
      file: "src/data/paragon-live-pdf-studio.json",
      schemaVersion: document.schemaVersion,
      documentId: document.documentId,
      revision: document.revision,
    },
    visualSource: {
      type: "canonical-document",
      schemaVersion: document.schemaVersion,
      documentId: document.documentId,
      revision: document.revision,
      updatedAt: document.updatedAt,
      updatedBy: document.updatedBy,
      assetCount: Object.keys(document.assetLibrary).length,
    },
    settings: {
      month: normalizeText(header.month?.value),
      monthVisible: visibilityValue(header.month?.visible),
      year: normalizeText(header.year?.value),
      yearVisible: visibilityValue(header.year?.visible),
      headerBrandMarkPath: brandMark.path,
      headerBrandMarkAlt: normalizeText(header.brandMark?.alt),
      headerBrandMarkVisible: visibilityValue(header.brandMark?.visible),
      headerWordmarkPath: wordmark.path,
      headerWordmarkAlt: normalizeText(header.wordmark?.alt),
      headerWordmarkVisible: visibilityValue(header.wordmark?.visible),
      deliveryMessage: normalizeText(header.deliveryMessage?.value),
      deliveryMessageVisible: visibilityValue(
        header.deliveryMessage?.visible,
      ),
      campaignMarkPath:
        header.campaignMark?.visible === true
          ? campaignMark.path
          : "no",
      campaignMarkAlt:
        header.campaignMark?.visible === true
          ? normalizeText(header.campaignMark?.alt)
          : "no",
      campaignMarkVisible: visibilityValue(
        header.campaignMark?.visible,
      ),
      campaignTitleLine1: normalizeText(
        header.campaignTitle?.line1,
      ),
      campaignTitleLine2: normalizeText(
        header.campaignTitle?.line2,
      ),
      campaignTitleVisible: visibilityValue(
        header.campaignTitle?.visible,
      ),
      headerSupportingLine: normalizeText(
        header.supportingLine?.value,
      ),
      headerSupportingLineVisible: visibilityValue(
        header.supportingLine?.visible,
      ),
      contactInstruction: normalizeText(contacts.instruction),
      footerMessage: normalizeText(footer.message),
      disclaimer: normalizeText(footer.disclaimer),
      footerButtonLabel: normalizeText(footer.buttonLabel),
      footerUrl: normalizeText(footer.url),
      footerBrollPath: footerBroll.path,
      footerBrollAlt: normalizeText(footer.broll?.alt),
      footerBrollVisible: visibilityValue(footer.broll?.visible),
      footerBrollFit: normalizeText(footer.broll?.fit),
      footerBrollPosition: `${Number(footer.broll?.focusX)}% ${Number(
        footer.broll?.focusY,
      )}%`,
      footerBrollZoom: Number(footer.broll?.zoom),
      footerBrollFocusX: Number(footer.broll?.focusX),
      footerBrollFocusY: Number(footer.broll?.focusY),
      footerBrollOpacity: Number(footer.broll?.opacity),
      footerBrollSaturation: Number(footer.broll?.saturation),
      footerBrollContrast: Number(footer.broll?.contrast),
      footerBrollBrightness: Number(footer.broll?.brightness),
    },
    contacts: [...(contacts.items || [])]
      .filter((contact) => contact.active === true)
      .sort((left, right) => Number(left.sort) - Number(right.sort))
      .map((contact) => ({
        sort: Number(contact.sort),
        active: true,
        name: normalizeText(contact.name),
        location: normalizeText(contact.location),
        phone: normalizeText(contact.phone),
        email: normalizeText(contact.email),
      })),
    specials,
  };
};
