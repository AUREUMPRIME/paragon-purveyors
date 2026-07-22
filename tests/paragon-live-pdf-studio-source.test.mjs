import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  readFile,
  readdir,
  stat,
} from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import Ajv from "ajv";
import addFormats from "ajv-formats";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const sourcePath = path.join(
  projectRoot,
  "src",
  "data",
  "paragon-live-pdf-studio.json",
);

const schemaPath = path.join(
  projectRoot,
  "src",
  "live-pdf",
  "schema",
  "paragon-live-pdf-studio.schema.json",
);

const assetLibraryRoot = path.join(
  projectRoot,
  "public",
  "assets",
  "specials",
  "library",
);

const [sourceBytes, schemaBytes] = await Promise.all([
  readFile(sourcePath),
  readFile(schemaPath),
]);

const source = JSON.parse(sourceBytes.toString("utf8"));
const schema = JSON.parse(schemaBytes.toString("utf8"));

const sha256 = (bytes) =>
  createHash("sha256").update(bytes).digest("hex");

const assertUnique = (values, label) => {
  assert.equal(
    new Set(values).size,
    values.length,
    `${label} must be unique`,
  );
};

const assertNonEmptyString = (value, label) => {
  assert.equal(
    typeof value,
    "string",
    `${label} must be a string`,
  );

  assert.ok(
    value.trim().length > 0,
    `${label} must not be empty`,
  );
};

const assertFiniteRange = (
  value,
  minimum,
  maximum,
  label,
) => {
  assert.equal(
    Number.isFinite(value),
    true,
    `${label} must be finite`,
  );

  assert.ok(
    value >= minimum && value <= maximum,
    `${label} must be between ${minimum} and ${maximum}`,
  );
};

const collectFiles = async (directory) => {
  const entries = await readdir(directory, {
    withFileTypes: true,
  });

  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectFiles(entryPath));
      continue;
    }

    assert.equal(
      entry.isFile(),
      true,
      `Unsupported library entry: ${entryPath}`,
    );

    files.push(entryPath);
  }

  return files;
};

const toPublicRelativePath = (absolutePath) =>
  path
    .relative(path.join(projectRoot, "public"), absolutePath)
    .split(path.sep)
    .join("/");

const assetEntries = Object.entries(source.assetLibrary);
const assetById = new Map(assetEntries);

const imageReferences = [
  ["header.brandMark", source.header.brandMark],
  ["header.wordmark", source.header.wordmark],
  ["header.campaignMark", source.header.campaignMark],
  ...source.specials.flatMap((special) => [
    [`specials.${special.id}.brandLogo`, special.brandLogo],
    [
      `specials.${special.id}.primaryOffer.image`,
      special.primaryOffer.image,
    ],
    ...(special.secondaryOffer
      ? [[
          `specials.${special.id}.secondaryOffer.image`,
          special.secondaryOffer.image,
        ]]
      : []),
  ]),
  ["footer.broll", source.footer.broll],
];

test(
  "canonical Studio source passes the committed Draft 7 schema",
  () => {
    const ajv = new Ajv({
      strict: true,
      allErrors: true,
      validateFormats: true,
    });

    addFormats(ajv);

    assert.equal(
      ajv.validateSchema(schema),
      true,
      JSON.stringify(ajv.errors, null, 2),
    );

    const validate = ajv.compile(schema);

    assert.equal(
      validate(source),
      true,
      JSON.stringify(validate.errors, null, 2),
    );
  },
);

test(
  "canonical Studio source preserves mutable publication topology",
  () => {
    assert.equal(source.schemaVersion, 1);
    assert.equal(source.documentId, "monthly-specials");
    assert.equal(source.page.size, "legal");
    assert.equal(source.page.orientation, "portrait");
    assert.equal(source.page.widthPx, 816);
    assert.equal(source.page.heightPx, 1344);
    assert.equal(source.page.pdfWidthPt, 612);
    assert.equal(source.page.pdfHeightPt, 1008);
    assert.equal(source.page.maxActiveSpecials, 4);

    assertNonEmptyString(source.updatedAt, "updatedAt");
    assertNonEmptyString(source.updatedBy, "updatedBy");

    const updatedAt = new Date(source.updatedAt);

    assert.equal(
      Number.isNaN(updatedAt.getTime()),
      false,
      "updatedAt must be a valid timestamp",
    );

    assert.ok(Array.isArray(source.specials));
    assert.ok(
      source.specials.length >= 1 &&
        source.specials.length <= source.page.maxActiveSpecials,
      "Canonical source must contain one to four specials",
    );

    assertUnique(
      source.specials.map((special) => special.id),
      "special IDs",
    );

    assertUnique(
      source.specials.map((special) => special.sort),
      "special sort values",
    );

    assert.deepEqual(
      source.specials.map((special) => special.sort),
      [...source.specials]
        .map((special) => special.sort)
        .sort((left, right) => left - right),
      "Specials must remain ordered by sort",
    );

    for (const special of source.specials) {
      assert.equal(special.active, true);
      assertNonEmptyString(special.id, "special.id");
      assertNonEmptyString(
        special.displayName,
        `${special.id}.displayName`,
      );

      assert.ok(
        ["single-offer", "dual-offer"].includes(
          special.offerMode,
        ),
        `${special.id}.offerMode is invalid`,
      );

      assertNonEmptyString(
        special.primaryOffer.label,
        `${special.id}.primaryOffer.label`,
      );

      assertFiniteRange(
        special.primaryOffer.price,
        0,
        Number.MAX_SAFE_INTEGER,
        `${special.id}.primaryOffer.price`,
      );

      if (special.offerMode === "single-offer") {
        assert.equal(
          special.secondaryOffer,
          undefined,
          `${special.id} single-offer must not have secondaryOffer`,
        );
      }

      if (special.offerMode === "dual-offer") {
        assert.ok(
          special.secondaryOffer,
          `${special.id} dual-offer requires secondaryOffer`,
        );

        assertNonEmptyString(
          special.secondaryOffer.label,
          `${special.id}.secondaryOffer.label`,
        );

        assertFiniteRange(
          special.secondaryOffer.price,
          0,
          Number.MAX_SAFE_INTEGER,
          `${special.id}.secondaryOffer.price`,
        );
      }
    }

    assert.ok(Array.isArray(source.contacts.items));
    assert.ok(
      source.contacts.items.length >= 1 &&
        source.contacts.items.length <= 2,
      "Canonical source must contain one or two contacts",
    );

    assertUnique(
      source.contacts.items.map((contact) => contact.id),
      "contact IDs",
    );

    assertUnique(
      source.contacts.items.map((contact) => contact.sort),
      "contact sort values",
    );

    assert.deepEqual(
      source.contacts.items.map((contact) => contact.sort),
      [...source.contacts.items]
        .map((contact) => contact.sort)
        .sort((left, right) => left - right),
      "Contacts must remain ordered by sort",
    );

    for (const contact of source.contacts.items) {
      assert.equal(contact.active, true);
      assertNonEmptyString(contact.name, `${contact.id}.name`);
      assertNonEmptyString(
        contact.location,
        `${contact.id}.location`,
      );
      assertNonEmptyString(contact.phone, `${contact.id}.phone`);
      assertNonEmptyString(contact.email, `${contact.id}.email`);
      assert.match(contact.email, /@/);
    }

    assert.equal(source.publication.profile, "monthly-specials-v1");
    assert.equal(source.publication.currency, "USD");
    assert.equal(source.publication.locale, "en-US");

    assert.deepEqual(source.publication.outputs, {
      json: "public/specials/monthly-specials.json",
      html: "public/specials/monthly-specials.html",
      pdf: "public/specials/monthly-specials.pdf",
    });

    assert.equal(new URL(source.footer.url).protocol, "https:");
  },
);

test(
  "canonical Studio image references resolve to active assets",
  () => {
    assert.ok(assetEntries.length > 0);
    assertUnique(
      assetEntries.map(([assetId]) => assetId),
      "asset IDs",
    );

    const referencedAssetIds = new Set();

    for (const [label, reference] of imageReferences) {
      assert.ok(reference, `${label} is missing`);
      assertNonEmptyString(
        reference.assetId,
        `${label}.assetId`,
      );
      assert.equal(
        typeof reference.visible,
        "boolean",
        `${label}.visible must be boolean`,
      );
      assertNonEmptyString(reference.alt, `${label}.alt`);

      assert.ok(
        ["contain", "cover"].includes(reference.fit),
        `${label}.fit is invalid`,
      );

      assertFiniteRange(
        reference.zoom,
        1,
        2.5,
        `${label}.zoom`,
      );

      assertFiniteRange(
        reference.focusX,
        0,
        100,
        `${label}.focusX`,
      );

      assertFiniteRange(
        reference.focusY,
        0,
        100,
        `${label}.focusY`,
      );

      const asset = assetById.get(reference.assetId);

      assert.ok(
        asset,
        `${label} references missing asset ${reference.assetId}`,
      );

      assert.equal(
        asset.archived,
        false,
        `${label} references archived asset ${reference.assetId}`,
      );

      referencedAssetIds.add(reference.assetId);
    }

    for (const [assetId, asset] of assetEntries) {
      assert.equal(
        asset.id,
        assetId,
        `Asset key/id mismatch for ${assetId}`,
      );

      if (!asset.archived) {
        assert.equal(
          referencedAssetIds.has(assetId),
          true,
          `Active asset is unreferenced: ${assetId}`,
        );
      }
    }
  },
);

test(
  "canonical content-addressed asset library matches repository bytes",
  async () => {
    const registeredPaths = [];
    const dedupeKeys = [];

    for (const [assetId, asset] of assetEntries) {
      assertNonEmptyString(asset.label, `${assetId}.label`);
      assertNonEmptyString(asset.category, `${assetId}.category`);
      assertNonEmptyString(asset.library, `${assetId}.library`);
      assertNonEmptyString(asset.path, `${assetId}.path`);
      assertNonEmptyString(asset.mimeType, `${assetId}.mimeType`);

      assert.equal(
        path.posix.isAbsolute(asset.path),
        false,
        `${assetId}.path must be relative`,
      );

      assert.equal(
        asset.path.includes("\\"),
        false,
        `${assetId}.path must use POSIX separators`,
      );

      assert.equal(
        path.posix.normalize(asset.path),
        asset.path,
        `${assetId}.path must be normalized`,
      );

      assert.match(
        asset.path,
        /^assets\/specials\/library\//,
      );

      assert.match(asset.sha256, /^[a-f0-9]{64}$/);
      assert.ok(asset.bytes > 0, `${assetId}.bytes must be positive`);
      assert.ok(asset.width > 0, `${assetId}.width must be positive`);
      assert.ok(asset.height > 0, `${assetId}.height must be positive`);

      const fileName = path.posix.basename(asset.path);
      const hashPrefix = asset.sha256.slice(0, 12);

      assert.ok(
        fileName.includes(`-${hashPrefix}.`),
        `${assetId} filename must contain its SHA-256 prefix`,
      );

      const absolutePath = path.join(
        projectRoot,
        "public",
        ...asset.path.split("/"),
      );

      const [bytes, stats] = await Promise.all([
        readFile(absolutePath),
        stat(absolutePath),
      ]);

      assert.equal(stats.isFile(), true);
      assert.equal(stats.size, asset.bytes, `${assetId}.bytes`);
      assert.equal(sha256(bytes), asset.sha256, `${assetId}.sha256`);

      registeredPaths.push(asset.path);
      dedupeKeys.push(`${asset.library}:${asset.sha256}`);
    }

    assertUnique(registeredPaths, "asset paths");
    assertUnique(dedupeKeys, "library/hash pairs");

    const diskFiles = await collectFiles(assetLibraryRoot);
    const diskPaths = diskFiles
      .map(toPublicRelativePath)
      .sort();

    assert.deepEqual(
      diskPaths,
      [...registeredPaths].sort(),
      "Canonical library files must exactly match assetLibrary records",
    );
  },
);
