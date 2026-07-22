import assert from "node:assert/strict";
import test from "node:test";

import { createPriceRows } from "../src/live-pdf/core/format-price.js";
import {
  isActive,
  isSettingVisible,
  normalizeAssetPath,
  normalizeKey,
  normalizeText,
} from "../src/live-pdf/core/normalize-document.js";

test("normalizeText preserves the current trimmed-string contract", () => {
  assert.equal(normalizeText(null), "");
  assert.equal(normalizeText(undefined), "");
  assert.equal(normalizeText("  Paragon Purveyors  "), "Paragon Purveyors");
  assert.equal(normalizeText(2026), "2026");
});

test("normalizeKey preserves the current lowercase alphanumeric contract", () => {
  assert.equal(normalizeKey(" Black Opal — Wagyu "), "blackopalwagyu");
  assert.equal(normalizeKey("A5/BMS 8-9"), "a5bms89");
});

test("isActive preserves the accepted active values", () => {
  for (const value of ["yes", " YES ", "true", "1", "active", "Active"]) {
    assert.equal(isActive(value), true, `Expected ${JSON.stringify(value)} to be active.`);
  }

  for (const value of ["", "no", "false", "0", "inactive", null]) {
    assert.equal(isActive(value), false, `Expected ${JSON.stringify(value)} to be inactive.`);
  }
});

test("isSettingVisible preserves explicit values and fallback behavior", () => {
  assert.equal(isSettingVisible({}, "campaignMarkVisible"), true);
  assert.equal(isSettingVisible({}, "campaignMarkVisible", false), false);
  assert.equal(
    isSettingVisible({ campaignMarkVisible: "yes" }, "campaignMarkVisible", false),
    true,
  );
  assert.equal(
    isSettingVisible({ campaignMarkVisible: "no" }, "campaignMarkVisible", true),
    false,
  );
});

test("normalizeAssetPath preserves slash normalization and public-prefix removal", () => {
  assert.equal(
    normalizeAssetPath(" public\\assets\\specials\\image.webp "),
    "assets/specials/image.webp",
  );
  assert.equal(
    normalizeAssetPath("assets/specials/image.webp"),
    "assets/specials/image.webp",
  );
});

test("createPriceRows preserves the primary-only price-row shape", () => {
  assert.deepEqual(
    createPriceRows({
      primaryPriceLabel: "Whole Loin",
      primaryPrice: "$39.95/lb",
      secondaryPriceLabel: "",
      secondaryPrice: "",
    }),
    [["EA", "Whole Loin", "$39.95/lb"]],
  );
});

test("createPriceRows includes the secondary row when its label is present", () => {
  assert.deepEqual(
    createPriceRows({
      primaryPriceLabel: "Whole Loin",
      primaryPrice: "$39.95/lb",
      secondaryPriceLabel: "Cut Steaks",
      secondaryPrice: "$44.95/lb",
    }),
    [
      ["EA", "Whole Loin", "$39.95/lb"],
      ["CUT", "Cut Steaks", "$44.95/lb"],
    ],
  );
});

test("createPriceRows includes the secondary row when only its value is present", () => {
  assert.deepEqual(
    createPriceRows({
      primaryPriceLabel: "Whole Loin",
      primaryPrice: "$39.95/lb",
      secondaryPriceLabel: "",
      secondaryPrice: "$44.95/lb",
    }),
    [
      ["EA", "Whole Loin", "$39.95/lb"],
      ["CUT", "", "$44.95/lb"],
    ],
  );
});
