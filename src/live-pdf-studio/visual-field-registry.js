const freezeFields = (fields) => Object.freeze(fields.map((field) => Object.freeze(field)));

const keyFor = (path) => path.map((segment, index) => typeof segment === "number" ? `[${segment}]` : `${index === 0 ? "" : "."}${segment}`).join("");

const visualField = ({ section, path, label, control = "text", ...options }) => ({
  section,
  path: Object.freeze([...path]),
  key: keyFor(path),
  label,
  control,
  visual: true,
  ...options,
});

const baseFields = (section, prefix, label) => [
  visualField({ section, path: [...prefix, "visible"], label: `Show ${label}`, control: "checkbox" }),
  visualField({ section, path: [...prefix, "alt"], label: `${label} alt text` }),
  visualField({ section, path: [...prefix, "fit"], label: `${label} fit`, control: "select", options: ["contain", "cover"] }),
  visualField({ section, path: [...prefix, "zoom"], label: `${label} zoom`, control: "range", min: 1, max: 2.5, step: 0.01 }),
  visualField({ section, path: [...prefix, "focusX"], label: `${label} Focus X`, control: "range", min: 0, max: 100, step: 1 }),
  visualField({ section, path: [...prefix, "focusY"], label: `${label} Focus Y`, control: "range", min: 0, max: 100, step: 1 }),
];

export const createVisualFieldRegistry = (draft) => {
  const fields = [
    visualField({ section: "logos", path: ["theme", "accentColor"], label: "Accent color", control: "color" }),
    ...baseFields("logos", ["header", "brandMark"], "brand mark"),
    ...baseFields("logos", ["header", "wordmark"], "wordmark"),
    ...baseFields("logos", ["header", "campaignMark"], "campaign mark"),
  ];

  draft.specials.forEach((special, index) => {
    fields.push(...baseFields("logos", ["specials", index, "brandLogo"], `${special.displayName || special.id} brand logo`));
    fields.push(...baseFields("cuts", ["specials", index, "primaryOffer", "image"], `${special.displayName || special.id} primary image`));
    if (special.offerMode === "dual-offer" && special.secondaryOffer?.image) {
      fields.push(...baseFields("cuts", ["specials", index, "secondaryOffer", "image"], `${special.displayName || special.id} secondary image`));
    }
  });

  fields.push(
    ...baseFields("footer", ["footer", "broll"], "footer B-roll"),
    visualField({ section: "footer", path: ["footer", "broll", "opacity"], label: "Footer opacity", control: "range", min: 0, max: 1, step: 0.01 }),
    visualField({ section: "footer", path: ["footer", "broll", "saturation"], label: "Footer saturation", control: "range", min: 0, max: 2, step: 0.01 }),
    visualField({ section: "footer", path: ["footer", "broll", "contrast"], label: "Footer contrast", control: "range", min: 0, max: 2, step: 0.01 }),
    visualField({ section: "footer", path: ["footer", "broll", "brightness"], label: "Footer brightness", control: "range", min: 0, max: 2, step: 0.01 }),
  );

  const frozen = freezeFields(fields);
  const bySection = Object.freeze({
    logos: Object.freeze(frozen.filter((field) => field.section === "logos")),
    cuts: Object.freeze(frozen.filter((field) => field.section === "cuts")),
    footer: Object.freeze(frozen.filter((field) => field.section === "footer")),
  });
  return Object.freeze({ fields: frozen, bySection, byKey: new Map(frozen.map((field) => [field.key, field])) });
};
