import { normalizeText } from "./normalize-document.js";

export const createPriceRows = (item) =>
  [
    ["EA", item.primaryPriceLabel, item.primaryPrice],
    normalizeText(item.secondaryPriceLabel) || normalizeText(item.secondaryPrice)
      ? ["CUT", item.secondaryPriceLabel, item.secondaryPrice]
      : null,
  ].filter(Boolean);
