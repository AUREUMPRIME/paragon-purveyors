import { createVisualFieldRegistry } from "./visual-field-registry.js";
const freezeFields = (fields) =>
  Object.freeze(fields.map((field) => Object.freeze(field)));

export const EDITOR_SECTION_IDS = Object.freeze([
  "header",
  "cuts",
  "contacts",
  "footer",
]);

export const pathToFieldKey = (path) =>
  path
    .map((segment, index) =>
      typeof segment === "number"
        ? `[${segment}]`
        : `${index === 0 ? "" : "."}${segment}`,
    )
    .join("");

const field = ({
  section,
  path,
  label,
  control = "text",
  help = "",
  ...options
}) => ({
  section,
  path: Object.freeze([...path]),
  key: pathToFieldKey(path),
  label,
  control,
  help,
  ...options,
});

export const createHeaderFieldDefinitions = () =>
  freezeFields([
    field({
      section: "header",
      path: ["header", "deliveryMessage", "value"],
      label: "Delivery message",
      help: "Short ordering or delivery statement shown above the campaign.",
    }),
    field({
      section: "header",
      path: ["header", "deliveryMessage", "visible"],
      label: "Show delivery message",
      control: "checkbox",
    }),
    field({
      section: "header",
      path: ["header", "campaignTitle", "line1"],
      label: "Campaign title — line 1",
    }),
    field({
      section: "header",
      path: ["header", "campaignTitle", "line2"],
      label: "Campaign title — line 2",
    }),
    field({
      section: "header",
      path: ["header", "campaignTitle", "visible"],
      label: "Show campaign title",
      control: "checkbox",
    }),
    field({
      section: "header",
      path: ["header", "month", "value"],
      label: "Month",
    }),
    field({
      section: "header",
      path: ["header", "month", "visible"],
      label: "Show month",
      control: "checkbox",
    }),
    field({
      section: "header",
      path: ["header", "year", "value"],
      label: "Year",
      inputMode: "numeric",
      maxLength: 4,
    }),
    field({
      section: "header",
      path: ["header", "year", "visible"],
      label: "Show year",
      control: "checkbox",
    }),
    field({
      section: "header",
      path: ["header", "supportingLine", "value"],
      label: "Supporting line",
      help: "Optional supporting statement below the month and year.",
    }),
    field({
      section: "header",
      path: ["header", "supportingLine", "visible"],
      label: "Show supporting line",
      control: "checkbox",
    }),
  ]);

const createCutFields = (special, index) => {
  const prefix = ["specials", index];
  const definitions = [
    field({
      section: "cuts",
      path: [...prefix, "active"],
      label: "Active",
      control: "checkbox",
    }),
    field({
      section: "cuts",
      path: [...prefix, "sort"],
      label: "Display order",
      control: "integer",
      min: 1,
      step: 1,
    }),
    field({
      section: "cuts",
      path: [...prefix, "displayName"],
      label: "Display name",
    }),
    field({
      section: "cuts",
      path: [...prefix, "brand"],
      label: "Brand",
    }),
    field({
      section: "cuts",
      path: [...prefix, "productLine"],
      label: "Product line",
    }),
    field({
      section: "cuts",
      path: [...prefix, "marblingScore"],
      label: "Marbling score",
    }),
    field({
      section: "cuts",
      path: [...prefix, "quantityAvailable"],
      label: "Availability",
    }),
    field({
      section: "cuts",
      path: [...prefix, "primaryOffer", "label"],
      label: "Primary offer label",
    }),
    field({
      section: "cuts",
      path: [...prefix, "primaryOffer", "price"],
      label: "Primary price",
      control: "number",
      min: 0,
      step: 0.01,
      prefix: "$",
    }),
    field({
      section: "cuts",
      path: [...prefix, "savingsMessage"],
      label: "Savings message",
    }),
    field({
      section: "cuts",
      path: [...prefix, "description"],
      label: "Description",
      control: "textarea",
      maxLength: 320,
    }),
  ];

  if (special.offerMode === "dual-offer") {
    definitions.push(
      field({
        section: "cuts",
        path: [...prefix, "secondaryOffer", "label"],
        label: "Secondary offer label",
      }),
      field({
        section: "cuts",
        path: [...prefix, "secondaryOffer", "price"],
        label: "Secondary price",
        control: "number",
        min: 0,
        step: 0.01,
        prefix: "$",
      }),
    );
  }

  return definitions;
};

export const createCutFieldDefinitions = (draft) =>
  freezeFields(
    draft.specials.flatMap((special, index) =>
      createCutFields(special, index),
    ),
  );

export const createContactFieldDefinitions = (draft) =>
  freezeFields([
    field({
      section: "contacts",
      path: ["contacts", "instruction"],
      label: "Ordering instruction",
      control: "textarea",
      maxLength: 260,
    }),
    ...draft.contacts.items.flatMap((contact, index) => {
      const prefix = ["contacts", "items", index];

      return [
        field({
          section: "contacts",
          path: [...prefix, "active"],
          label: "Active",
          control: "checkbox",
        }),
        field({
          section: "contacts",
          path: [...prefix, "sort"],
          label: "Display order",
          control: "integer",
          min: 1,
          step: 1,
        }),
        field({
          section: "contacts",
          path: [...prefix, "name"],
          label: "Name",
        }),
        field({
          section: "contacts",
          path: [...prefix, "location"],
          label: "Service area",
        }),
        field({
          section: "contacts",
          path: [...prefix, "phone"],
          label: "Phone",
          inputMode: "tel",
        }),
        field({
          section: "contacts",
          path: [...prefix, "email"],
          label: "Email",
          control: "email",
          inputMode: "email",
        }),
      ];
    }),
  ]);

export const createFooterFieldDefinitions = () =>
  freezeFields([
    field({
      section: "footer",
      path: ["footer", "message"],
      label: "Footer message",
      control: "textarea",
      maxLength: 280,
    }),
    field({
      section: "footer",
      path: ["footer", "disclaimer"],
      label: "Disclaimer",
      control: "textarea",
      maxLength: 220,
    }),
    field({
      section: "footer",
      path: ["footer", "buttonLabel"],
      label: "Button label",
    }),
    field({
      section: "footer",
      path: ["footer", "url"],
      label: "Destination URL",
      control: "url",
      inputMode: "url",
      help: "Use a complete HTTPS address.",
    }),
  ]);

export const createEditorFieldRegistry = (draft) => {
  if (!draft || !Array.isArray(draft.specials)) {
    throw new TypeError("A canonical Studio draft is required.");
  }

  const fields = freezeFields([
    ...createHeaderFieldDefinitions(),
    ...createCutFieldDefinitions(draft),
    ...createContactFieldDefinitions(draft),
    ...createFooterFieldDefinitions(),
  ]);

  const byKey = new Map(fields.map((definition) => [
    definition.key,
    definition,
  ]));

  return Object.freeze({
    fields,
    byKey,
    bySection: Object.freeze(
      Object.fromEntries(
        EDITOR_SECTION_IDS.map((sectionId) => [
          sectionId,
          Object.freeze(
            fields.filter((definition) =>
              definition.section === sectionId,
            ),
          ),
        ]),
      ),
    ),
  });
};

export const EDITOR_READ_ONLY_PATHS = Object.freeze([
  "schemaVersion",
  "documentId",
  "revision",
  "updatedAt",
  "updatedBy",
  "page",
  "publication",
  "assetLibrary",
  "specials[].id",
  "specials[].offerMode",
  "contacts.items[].id",
]);

export const EDITOR_DEFERRED_VISUAL_PATHS = Object.freeze([
  "theme",
  "header.brandMark",
  "header.wordmark",
  "header.campaignMark",
  "specials[].brandLogo",
  "specials[].primaryOffer.image",
  "specials[].secondaryOffer.image",
  "footer.broll",
]);


export const COMPLETE_EDITOR_SECTION_IDS = Object.freeze([
  ...EDITOR_SECTION_IDS,
  "logos",
]);

export const createCompleteEditorRegistry = (draft) => {
  const content = createEditorFieldRegistry(draft);
  const visual = createVisualFieldRegistry(draft);
  const fields = Object.freeze([...content.fields, ...visual.fields]);
  return Object.freeze({
    fields,
    content,
    visual,
    byKey: new Map(fields.map((definition) => [definition.key, definition])),
    bySection: Object.freeze({
      header: content.bySection.header,
      cuts: Object.freeze([...content.bySection.cuts, ...visual.bySection.cuts]),
      logos: visual.bySection.logos,
      contacts: content.bySection.contacts,
      footer: Object.freeze([...content.bySection.footer, ...visual.bySection.footer]),
    }),
  });
};
