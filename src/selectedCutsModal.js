import { assetPath } from "./assetPath.js";
import { producerCutLinks, producers } from "./catalogData.js";
const selectedCuts = {
  Ribeye: {
    eyebrow: "Selected Cut",
    title: "Ribeye",
    category: "Beef / Wagyu",
    image: assetPath("assets/cuts/ribeye.webp"),
    description:
      "A richly marbled center-plate cut selected for depth, tenderness, and a refined eating profile.",
    service:
      "Best for high-heat searing, grilling, and premium steak service.",
    rows: [
      ["Black Opal", "14107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
      ["Black Opal", "24107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
      ["Black Opal", "34107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
      ["Mayura Station", "37907", "Ribeye", "4/9# AVG. ~ 38# CS"],
      ["Robbins Island", "22402W", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
      ["Robbins Island", "22409T", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
      ["Wanderer", "2240XA", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],
      ["Wanderer", "2240XB", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],
    ],
  },
  Tenderloin: {
    eyebrow: "Selected Cut",
    title: "Tenderloin",
    category: "Beef / Wagyu",
    image: assetPath("assets/cuts/tenderloin.webp"),
    description:
      "A refined, tender cut selected for clean presentation, delicate texture, and elegant service.",
    service:
      "Best for fine-dining portions, pan searing, roasting, and composed plates.",
    rows: [
      ["Black Opal", "14135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
      ["Black Opal", "24135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
      ["Black Opal", "34135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
      ["Mayura Station", "37905", "Tenderloin", "4/7# AVG. ~ 30# CS"],
      ["Campo Grande", "FP18", "Tenderloin", "24/0.8# AVG. ~ 19.2# CS"],
      ["Robbins Island", "21602W", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
      ["Robbins Island", "21609T", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
      ["Wanderer", "2160XA", "Tenderloin SS Off 4LB+", "6/4# AVG. ~ 24# CS"],
      ["Wanderer", "2160XB", "Tenderloin SS Off 4LB+", "6/4# AVG. ~ 24# CS"],
    ],
  },
  Striploin: {
    eyebrow: "Selected Cut",
    title: "Striploin",
    category: "Beef / Wagyu",
    image: assetPath("assets/cuts/striploin.webp"),
    description:
      "A classic premium steak cut selected for balance, marbling, and a confident center-plate profile.",
    service:
      "Best for steaks, portioning, grilling, and refined steakhouse service.",
    rows: [
      ["Black Opal", "14104", "Striploin", "3/13# AVG. ~ 40# CS"],
      ["Black Opal", "24104", "Striploin", "3/13# AVG. ~ 40# CS"],
      ["Black Opal", "34104", "Striploin", "3/13# AVG. ~ 40# CS"],
      ["Mayura Station", "37904", "Striploin", "2/19# AVG. ~ 37# CS"],
      ["Mayura Station", "37974", "Bone-In Striploin", "1/40# AVG. ~ 40# CS"],
      ["Robbins Island", "21402W", "Striploin", "2/15# AVG. ~ 30# CS"],
      ["Robbins Island", "21409T", "Striploin", "2/15# AVG. ~ 30# CS"],
      ["Wanderer", "2140XA", "Striploin 11LB+", "3/12# AVG. ~ 36# CS"],
      ["Wanderer", "1562XA", "B/In Striploin Vac", "3/12# AVG. ~ 36# CS"],
      ["Wanderer", "2140XB", "Striploin 11LB+", "3/12# AVG. ~ 36# CS"],
      ["Wanderer", "1562XB", "Striploin B/I", "2/16# AVG. ~ 32# CS"],
    ],
  },
  Tomahawk: {
    eyebrow: "Selected Cut",
    title: "Tomahawk",
    category: "Beef / Wagyu",
    image: assetPath("assets/cuts/tomahawk.webp"),
    description:
      "A dramatic bone-in cut selected for visual impact, rich flavor, and celebratory presentation.",
    service:
      "Best for sharing portions, grilling, roasting, and high-impact menu features.",
    rows: [
      ["Black Opal", "14101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
      ["Black Opal", "24101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
      ["Black Opal", "34101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
      ["Mayura Station", "27972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
      ["Mayura Station", "37972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
      ["Robbins Island", "1602TW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
      ["Robbins Island", "1602RW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
    ],
  },
  Presa: {
    eyebrow: "Selected Cut",
    title: "Presa",
    category: "Ibérico Pork",
    image: assetPath("assets/cuts/presa.webp"),
    description:
      "A highly regarded Ibérico cut selected for deep flavor, tenderness, and generous marbling.",
    service:
      "Best for grilling, searing, slicing, and Spanish-inspired center-plate service.",
    rows: [["Campo Grande", "FP02", "Presa", "12/1.54# AVG. ~ 18.5# CS"]],
  },
  Secreto: {
    eyebrow: "Selected Cut",
    title: "Secreto",
    category: "Ibérico Pork",
    image: assetPath("assets/cuts/secreto.webp"),
    description:
      "A richly marbled Ibérico cut selected for expressive flavor, quick cooking, and delicate texture.",
    service:
      "Best for hot searing, charcoal grilling, slicing, and small-plate service.",
    rows: [
      ["Campo Grande", "FP01", "Secreto", "16/1.1# AVG. ~ 17.5# CS"],
      ["Campo Grande", "FP15", "Jowl Secreto", "16/0.5# AVG. ~ 8# CS"],
      ["Campo Grande", "FP16", "Belly Secreto", "14/1.3# AVG. ~ 18# CS"],
    ],
  },
  "Rump Cap": {
    eyebrow: "Selected Cut",
    title: "Picanha",
    category: "Beef / Wagyu",
    image: assetPath("assets/cuts/rump-cap.webp"),
    description:
      "A flavorful cap cut selected for its fat cover, rich character, and versatile presentation.",
    service:
      "Best for roasting, grilling, slicing, and picanha-style service.",
    rows: [
      ["Black Opal", "24124", "Rump Cap", "8/3.5# AVG. ~ 28# CS"],
      ["Black Opal", "34124", "Rump Cap", "8/3.5# AVG. ~ 28# CS"],
      ["Mayura Station", "37924", "Rump Cap (Culotte)", "8/4# AVG. ~ 34# CS"],
      ["Wanderer", "2091XA", "Rump Cap", "6/5# AVG. ~ 30# CS"],
      ["Wanderer", "2091XB", "Rump Cap", "6/5# AVG. ~ 30# CS"],
    ],
  },
  "Short Rib": {
    eyebrow: "Selected Cut",
    title: "Short Rib",
    category: "Beef",
    image: assetPath("assets/cuts/short-rib.webp"),
    description:
      "A richly flavored cut selected for depth, structure, and satisfying slow-cooked or grilled preparations.",
    service:
      "Best for braising, smoking, grilling, and Korean-style short rib service.",
    rows: [
      ["Wanderer", "1688XA", "Short Rib 3-Rib", "12/4# AVG. ~ 48# CS"],
      ["Wanderer", "1688XB", "Short Rib 3-Rib", "8/3# AVG. ~ 48# CS"],
    ],
  },
  "Chuck Roll": {
    eyebrow: "Selected Cut",
    title: "Chuck Roll",
    category: "Wagyu",
    image: assetPath("assets/cuts/chuck-roll.webp"),
    description:
      "A versatile forequarter cut selected for depth, structure, and a generous flavor profile.",
    service:
      "Best for roasting, braising, slicing, and refined slow-cooked preparations.",
    rows: [
      ["Black Opal", "34129", "Chuck Roll", "2/20# AVG. ~ 40# CS"],
    ],
  },
  "Shortloin": {
    eyebrow: "Selected Cut",
    title: "Shortloin",
    category: "Wagyu",
    image: assetPath("assets/cuts/shortloin.webp"),
    description:
      "A premium loin section selected for steakhouse utility, balance, and elegant portioning.",
    service:
      "Best for portioning into high-value steaks, roasting, and composed center-plate service.",
    rows: [
      ["Black Opal", "24105", "Shortloin", "1/28# AVG. ~ 28# CS"],
      ["Mayura Station", "37975", "Shortloin", "1/22# AVG. ~ 22# CS"],
    ],
  },
  "Flap Meat": {
    eyebrow: "Selected Cut",
    title: "Flap Meat",
    category: "Beef / Wagyu",
    image: assetPath("assets/cuts/flap-meat.webp"),
    description:
      "A flavorful, loose-grained cut selected for marbling, quick cooking, and strong menu versatility.",
    service:
      "Best for grilling, searing, slicing across the grain, and bold steak preparations.",
    rows: [
      ["Black Opal", "14117", "Flap Meat", "8/4.5# AVG. ~ 36# CS"],
      ["Black Opal", "24117", "Flap Meat", "8/4.5# AVG. ~ 36# CS"],
      ["Black Opal", "34117", "Flap Meat", "8/4.5# AVG. ~ 36# CS"],
      ["Mayura Station", "37917", "Flap Meat", "8/4# AVG. ~ 35# CS"],
      ["Robbins Island", "22061W", "Flap Meat", "6/5# AVG. ~ 30# CS"],
      ["Wanderer", "2206XA", "Flap Meat", "6/2.5# AVG. ~ 30# CS"],
    ],
  },
  "Flank Steak": {
    eyebrow: "Selected Cut",
    title: "Flank Steak",
    category: "Beef / Ibérico Pork",
    image: assetPath("assets/cuts/flank-steak.webp"),
    description:
      "A lean, expressive cut selected for clean slicing, defined texture, and focused flavor.",
    service:
      "Best for high-heat grilling, marinades, slicing, and shareable plates.",
    rows: [
      ["Campo Grande", "FP10", "Flank Steak", "18/1.2# AVG. ~ 21# CS"],
      ["Wanderer", "2210XA", "Flank Steak", "12/1.5# AVG. ~ 36# CS"],
    ],
  },
  "Tri Tip": {
    eyebrow: "Selected Cut",
    title: "Tri Tip",
    category: "Beef / Wagyu",
    image: assetPath("assets/cuts/tri-tip.webp"),
    description:
      "A compact sirloin cut selected for roastability, flavor concentration, and broad service flexibility.",
    service:
      "Best for roasting, grilling, carving, and premium sliced presentations.",
    rows: [
      ["Black Opal", "14116", "Tri Tip", "16/2.25# AVG. ~ 36# CS"],
      ["Black Opal", "24116", "Tri Tip", "16/2.25# AVG. ~ 36# CS"],
      ["Black Opal", "34116", "Tri Tip", "16/2.25# AVG. ~ 36# CS"],
      ["Mayura Station", "37916", "Tri Tip", "12/3# AVG. ~ 33# CS"],
      ["Robbins Island", "21311W", "Tri Tip", "12/3# AVG. ~ 36# CS"],
      ["Wanderer", "2131XA", "Tri Tip", "4/2# AVG. ~ 32# CS"],
    ],
  },
  "Top Sirloin": {
    eyebrow: "Selected Cut",
    title: "Top Sirloin",
    category: "Beef / Wagyu",
    image: assetPath("assets/cuts/top-sirloin.webp"),
    description:
      "A reliable premium cut selected for lean structure, clean flavor, and adaptable service.",
    service:
      "Best for steaks, grilling, roasting, and consistent portion control.",
    rows: [
      ["Black Opal", "24123", "Top Sirloin", "4/8# AVG. ~ 32# CS"],
      ["Black Opal", "34123", "Top Sirloin", "4/8# AVG. ~ 32# CS"],
      ["Robbins Island", "21102W", "Top Sirloin", "3/16# AVG. ~ 48# CS"],
      ["Wanderer", "2110XA", "Top Sirloin", "6/6# AVG. ~ 36# CS"],
      ["Wanderer", "2110XB", "Top Sirloin", "6/6# AVG. ~ 36# CS"],
    ],
  },
  "Oyster Blade": {
    eyebrow: "Selected Cut",
    title: "Oyster Blade",
    category: "Wagyu",
    image: assetPath("assets/cuts/oyster-blade.webp"),
    description:
      "A shoulder cut selected for tenderness potential, rich flavor, and refined preparation range.",
    service:
      "Best for slow cooking, roasting, slicing, and carefully trimmed steak applications.",
    rows: [
      ["Mayura Station", "37932", "Oyster Blade", "8/6# AVG. ~ 49# CS"],
    ],
  },
  "Chuck Tail Flap": {
    eyebrow: "Selected Cut",
    title: "Chuck Tail Flap",
    category: "Beef / Wagyu",
    image: assetPath("assets/cuts/chuck-tail-flap.webp"),
    description:
      "A deeply flavored cut selected for marbling, texture, and strong culinary flexibility.",
    service:
      "Best for grilling, searing, slicing, and rich center-plate features.",
    rows: [
      ["Black Opal", "14142", "Chuck Tail Flap", "3/13# AVG. ~ 40# CS"],
      ["Black Opal", "24142", "Chuck Tail Flap", "12/2.5# AVG. ~ 30# CS"],
      ["Black Opal", "34142", "Chuck Tail Flap", "12/2.5# AVG. ~ 30# CS"],
      ["Mayura Station", "37942", "Chuck Tail Flap", "12/3# AVG. ~ 35# CS"],
      ["Robbins Island", "2266GS", "Chuck Tail Flap", "5/7# AVG. ~ 35# CS"],
    ],
  },
  "Iberico Abanico": {
    eyebrow: "Selected Cut",
    title: "Iberico Abanico",
    category: "Ibérico Pork",
    image: assetPath("assets/cuts/iberico-abanico.webp"),
    description:
      "A prized Ibérico cut selected for expressive marbling, rich flavor, and refined Spanish character.",
    service:
      "Best for high-heat searing, charcoal grilling, slicing, and premium shared plates.",
    rows: [
      ["Campo Grande", "FP03", "Albanico", "18/1.1# AVG. ~ 19.8# CS"],
    ],
  },
  "Iberico Pluma": {
    eyebrow: "Selected Cut",
    title: "Iberico Pluma",
    category: "Ibérico Pork",
    image: assetPath("assets/cuts/iberico-pluma.webp"),
    description:
      "A delicate Ibérico cut selected for tenderness, elegant fat distribution, and a clean finishing profile.",
    service:
      "Best for grilling, searing, slicing thinly, and refined small-plate service.",
    rows: [
      ["Campo Grande", "FP04", "Pluma", "12/1.5# AVG. ~ 18.5# CS"],
    ],
  },
  "Iberico Coppa": {
    eyebrow: "Selected Cut",
    title: "Iberico Coppa",
    category: "Ibérico Pork",
    image: assetPath("assets/cuts/iberico-coppa.webp"),
    description:
      "A deeply flavored shoulder cut selected for marbling, structure, and generous culinary versatility.",
    service:
      "Best for roasting, slow cooking, slicing, and rich center-plate preparations.",
    rows: [
      ["Campo Grande", "FP08", "Coppa", "8/2.3# AVG. ~ 18# CS"],
    ],
  },
  "Iberico Loin Roast": {
    eyebrow: "Selected Cut",
    title: "Iberico Loin Roast",
    category: "Ibérico Pork",
    image: assetPath("assets/cuts/iberico-loin-roast.webp"),
    description:
      "A refined Ibérico roast selected for balanced texture, clean presentation, and understated richness.",
    service:
      "Best for roasting, carving, composed plates, and elegant banquet-style service.",
    rows: [
      ["Campo Grande", "FP07", "Loin Roast", "12/1.25# AVG. ~ 15# CS"],
    ],
  },
  "Iberico 4 Rib-Rack": {
    eyebrow: "Selected Cut",
    title: "Iberico 4-Rib",
    category: "Ibérico Pork",
    image: assetPath("assets/cuts/iberico-4-rib-rack.webp"),
    description:
      "A presentation-focused Ibérico rack selected for visual impact, marbling, and heritage pork flavor.",
    service:
      "Best for roasting, grilling, carving tableside, and premium menu features.",
    rows: [
      ["Campo Grande", "FP05", "4-Rib", "6/2.1# AVG. ~ 13# CS"],
    ],
  },
  "Iberico St. Louis Ribs": {
    eyebrow: "Selected Cut",
    title: "Iberico St. Louis Ribs",
    category: "Ibérico Pork",
    image: assetPath("assets/cuts/iberico-st-louis-ribs.webp"),
    description:
      "A flavorful rib cut selected for richness, structure, and a distinctive Ibérico eating profile.",
    service:
      "Best for smoking, roasting, glazing, grilling, and elevated rib service.",
    rows: [
      ["Campo Grande", "FP09", "St. Louis Rib", "6/1.8# AVG. ~ 11# CS"],
    ],
  },
  "Iberico Pork Belly": {
    eyebrow: "Selected Cut",
    title: "Iberico Pork Belly",
    category: "Ibérico Pork",
    image: assetPath("assets/cuts/iberico-pork-belly.webp"),
    description:
      "A richly marbled belly cut selected for depth, texture, and luxurious rendered flavor.",
    service:
      "Best for roasting, slow cooking, crisping, slicing, and composed pork plates.",
    rows: [
      ["Campo Grande", "FP06", "Belly", "12/1.25# AVG. ~ 15# CS"],
    ],
  },
  "Iberico Shoulder Picnic": {
    eyebrow: "Selected Cut",
    title: "Iberico Shoulder Picnic",
    category: "Ibérico Pork",
    image: assetPath("assets/cuts/iberico-shoulder-picnic.webp"),
    description:
      "A hearty Ibérico shoulder cut selected for depth, slow-cooked tenderness, and bold savory character.",
    service:
      "Best for braising, roasting, smoking, pulling, and generous shared preparations.",
    rows: [
      ["Campo Grande", "FP21", "Picnic Shoulder", "2/16# AVG. ~ 32# CS"],
    ],
  },
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getSelectedCutMarblingLabel = (brand, code) => {
  const normalizedBrand = String(brand || "").toLowerCase();
  const normalizedCode = String(code || "").toUpperCase();

  if (normalizedBrand === "black opal") {
    if (normalizedCode.startsWith("141")) return "Marbling Score 4-5";
    if (normalizedCode.startsWith("241")) return "Marbling Score 6-7";
    if (normalizedCode.startsWith("341")) return "Marbling Score 8-9";
  }

  if (normalizedBrand === "mayura station") {
    if (normalizedCode.startsWith("279")) return "Marbling Score 8-9";
    if (normalizedCode.startsWith("379")) return "Marbling Score 9+";
  }

  if (normalizedBrand === "robbins island") {
    const scoreNinePlusCodes = new Set([
      "1602RW",
      "16025W",
      "20009T",
      "20409T",
      "20919T",
      "21109T",
      "21409T",
      "21609T",
      "22409T",
      "23029T",
      "23509T",
    ]);

    if (scoreNinePlusCodes.has(normalizedCode)) return "Marbling Score 9+";
    return "Marbling Score 7-8+";
  }

  if (normalizedBrand === "wanderer") {
    if (normalizedCode.endsWith("XB")) return "Marbling Score MB3-4+";
    if (normalizedCode.endsWith("XA")) return "Marbling Score MB2-3";
  }

  return "";
};

const createRows = (rows) =>
  rows
    .map(([brand, code, product, specification]) => {
      const marblingLabel = getSelectedCutMarblingLabel(brand, code);

      return `
        <tr>
          <td>${escapeHtml(brand)}</td>
          <td>${escapeHtml(code)}</td>
          <td>
            <span class="selected-cut-modal__product-name">${escapeHtml(product)}</span>
            ${
              marblingLabel
                ? `<span class="selected-cut-modal__product-marbling">${escapeHtml(marblingLabel)}</span>`
                : ""
            }
          </td>
          <td>${escapeHtml(specification)}</td>
        </tr>
      `;
    })
    .join("");

// CONNECTED_CATALOG_CUT_TO_PRODUCER_HELPERS_START
const selectedCutTitleToId = {
  Ribeye: "ribeye",
  Tenderloin: "tenderloin",
  Striploin: "striploin",
  Tomahawk: "tomahawk",
  Presa: "presa",
  Secreto: "secreto",
  "Rump Cap": "rump-cap",
  Picanha: "rump-cap",
  "Short Rib": "short-rib",
  "Chuck Roll": "chuck-roll",
  "Shortloin": "shortloin",
  "Flap Meat": "flap-meat",
  "Flank Steak": "flank-steak",
  "Tri Tip": "tri-tip",
  "Top Sirloin": "top-sirloin",
  "Oyster Blade": "oyster-blade",
  "Chuck Tail Flap": "chuck-tail-flap",
  "Iberico Abanico": "iberico-abanico",
  "Iberico Pluma": "iberico-pluma",
  "Iberico Coppa": "iberico-coppa",
  "Iberico Loin Roast": "iberico-loin-roast",
  "Iberico 4 Rib-Rack": "iberico-4-rib-rack",
  "Iberico St. Louis Ribs": "iberico-st-louis-ribs",
  "Iberico Pork Belly": "iberico-pork-belly",
  "Iberico Shoulder Picnic": "iberico-shoulder-picnic",
};

const getConnectedProducersForCut = (cutName) => {
  const cut = selectedCuts[cutName];
  const cutId = selectedCutTitleToId[cutName] || selectedCutTitleToId[cut?.title];

  if (!cutId) {
    return [];
  }

  return producers.filter((producer) => (producerCutLinks[producer.id] || []).includes(cutId));
};

const createProducerProgramLinks = (cutName) => {
  const relatedProducers = getConnectedProducersForCut(cutName);

  if (relatedProducers.length === 0) {
    return "";
  }

  const buttons = relatedProducers
    .map(
      (producer) => `
        <button
          class="selected-cut-modal__producer-button"
          type="button"
          data-connected-producer-trigger="${escapeHtml(producer.productListTitle)}"
        >
          <span>${escapeHtml(producer.productListTitle || producer.publicLabel)}</span>
          <small>View Producer</small>
        </button>
      `,
    )
    .join("");

  return `
    <section class="selected-cut-modal__producer-links" aria-label="Available producer programs">
      <div class="selected-cut-modal__producer-links-head">
        <span>Producer programs for this cut</span>
      </div>
      <div class="selected-cut-modal__producer-links-list">
        ${buttons}
      </div>
    </section>
  `;
};
// CONNECTED_CATALOG_CUT_TO_PRODUCER_HELPERS_END
export function initSelectedCutsModal() {
  const modalContent = `
    <div class="selected-cut-modal__panel">
      <button class="selected-cut-modal__close" type="button" aria-label="Close selected cut details" data-selected-cut-close>
        <span aria-hidden="true">×</span>
      </button>

      <div class="selected-cut-modal__body">
        <figure class="selected-cut-modal__media">
          <img data-selected-cut-image src="" alt="" loading="lazy" />
          <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
        </figure>

        <section class="selected-cut-modal__content">
          <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
          <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
          <p class="selected-cut-modal__category" data-selected-cut-category></p>
          <p class="selected-cut-modal__description" data-selected-cut-description></p>

          <div class="selected-cut-modal__note">
            <span>Service Note</span>
            <p data-selected-cut-service></p>
          </div>

          <div class="selected-cut-modal__producer-links-slot" data-selected-cut-producers></div>

          <div class="selected-cut-modal__table-wrap">
            <table class="selected-cut-modal__table">
              <thead>
                <tr>
                  <th scope="col">Brand</th>
                  <th scope="col">Code</th>
                  <th scope="col">Cut / Product</th>
                  <th scope="col">Specification</th>
                </tr>
              </thead>
              <tbody data-selected-cut-rows></tbody>
            </table>
          </div>

          <div class="selected-cut-modal__cta-wrap">
            <button
              class="selected-cut-modal__cta"
              type="button"
              data-selected-cut-inquiry
              aria-label="Request pricing and availability for this selected cut"
            >
              <span class="selected-cut-modal__cta-label">Request Pricing and Availability</span>
            </button>
          </div>

          <!-- ROUND4_SELECTED_CUT_INQUIRY_SHEET_MARKUP_START -->
          <aside
            class="selected-cut-modal__inquiry-sheet"
            data-selected-cut-inquiry-sheet
            aria-label="Selected cut inquiry context"
            hidden
          >
            <div class="selected-cut-modal__inquiry-copy">
              <p class="selected-cut-modal__inquiry-kicker">Inquiry for</p>
              <h3 class="selected-cut-modal__inquiry-title" data-selected-cut-inquiry-title>Selected Cut</h3>
              <p class="selected-cut-modal__inquiry-context" data-selected-cut-inquiry-context></p>
            </div>

            <div class="selected-cut-modal__inquiry-actions">
              <button class="selected-cut-modal__inquiry-action selected-cut-modal__inquiry-action--copy" type="button" data-selected-cut-inquiry-copy>
                Confirm Selected Items
              </button>
              <button class="selected-cut-modal__inquiry-action selected-cut-modal__inquiry-action--primary" type="button" data-selected-cut-inquiry-contact>
                Create Inquiry Message
              </button>
              <button class="selected-cut-modal__inquiry-action selected-cut-modal__inquiry-action--quiet" type="button" data-selected-cut-inquiry-dismiss>
                Keep Browsing
              </button>
            </div>

            <p class="selected-cut-modal__inquiry-feedback" data-selected-cut-inquiry-feedback hidden></p>
          </aside>
          <!-- ROUND4_SELECTED_CUT_INQUIRY_SHEET_MARKUP_END -->
        </section>
      </div>
    </div>
  `;

  let lastTrigger = null;
  let modal = document.getElementById("selected-cut-modal");

  if (!modal) {
    modal = document.createElement("dialog");
    modal.id = "selected-cut-modal";
    document.body.appendChild(modal);
  }

  modal.className = "selected-cut-modal";
  modal.setAttribute("aria-labelledby", "selected-cut-modal-title");
  modal.innerHTML = modalContent;

  const panel = modal.querySelector(".selected-cut-modal__panel");
  const closeButton = modal.querySelector("[data-selected-cut-close]");
  const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
  const titleNode = modal.querySelector("[data-selected-cut-title]");
  const categoryNode = modal.querySelector("[data-selected-cut-category]");
  const descriptionNode = modal.querySelector("[data-selected-cut-description]");
  const serviceNode = modal.querySelector("[data-selected-cut-service]");
  const producersNode = modal.querySelector("[data-selected-cut-producers]");
  const rowsNode = modal.querySelector("[data-selected-cut-rows]");
  const imageNode = modal.querySelector("[data-selected-cut-image]");
  const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
  // ROUND4_SELECTED_CUT_TOP_INQUIRY_CTA_START
  const selectedCutTopInquiryAnchor = modal.querySelector("[data-selected-cut-category]");

  if (selectedCutTopInquiryAnchor && !modal.querySelector("[data-selected-cut-inquiry-top]")) {
    selectedCutTopInquiryAnchor.insertAdjacentHTML(
      "afterend",
      `
        <div class="selected-cut-modal__top-inquiry" data-selected-cut-inquiry-top>
          <button
            class="selected-cut-modal__inquiry selected-cut-modal__inquiry--top"
            type="button"
            data-selected-cut-inquiry
            aria-label="Request pricing and availability for this selected cut"
          >
            <span class="selected-cut-modal__inquiry-label">Request Pricing and Availability</span>
          </button>
        </div>
      `,
    );
  }
  // ROUND4_SELECTED_CUT_TOP_INQUIRY_CTA_END
  const inquiryButton = modal.querySelector("[data-selected-cut-inquiry]");
  const inquirySheet = modal.querySelector("[data-selected-cut-inquiry-sheet]");
  const inquiryTitleNode = modal.querySelector("[data-selected-cut-inquiry-title]");
  const inquiryContextNode = modal.querySelector("[data-selected-cut-inquiry-context]");
  const inquiryCopyButton = modal.querySelector("[data-selected-cut-inquiry-copy]");
  const inquiryContactButton = modal.querySelector("[data-selected-cut-inquiry-contact]");
  const inquiryDismissButton = modal.querySelector("[data-selected-cut-inquiry-dismiss]");
  const inquiryFeedbackNode = modal.querySelector("[data-selected-cut-inquiry-feedback]");
  // ROUND4_SELECTED_CUT_INQUIRY_SHEET_HELPERS_START
  let activeCut = null;
  let activeInquiryText = "";
  let selectedCutInquiryConfirmed = false;

  const getInquiryRows = (cut) => (Array.isArray(cut?.rows) ? cut.rows : []);

  const getSelectableInquiryRows = () =>
    Array.from(rowsNode.querySelectorAll("[data-selected-cut-inquiry-row]"));

  const getSelectedInquiryRows = () =>
    getSelectableInquiryRows().filter((row) => row.dataset.inquirySelected === "true");

  const hasSelectedInquiryRows = () => getSelectedInquiryRows().length > 0;

  const isProductSelectionMode = () => modal.classList.contains("selected-cut-modal--selecting-products");

  const formatInquiryRow = (row) =>
    Array.from(row.cells)
      .map((cell) => cell.innerText.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .join(" · ");

  const selectedCutInquiryCategoryByProducer = [
    ["BLACK OPAL", "Wagyu"],
    ["MAYURA STATION", "Wagyu"],
    ["ROBBINS ISLAND", "Wagyu"],
    ["WANDERER", "Beef"],
    ["CAMPO GRANDE", "Ibérico Pork"],
  ];

  const getSelectedCutInquiryRowProducer = (row) =>
    row?.cells?.[0]?.innerText?.replace(/\s+/g, " ").trim().toUpperCase() || "";

  const getSelectedCutInquiryRowCategory = (row) => {
    const producer = getSelectedCutInquiryRowProducer(row);
    const match = selectedCutInquiryCategoryByProducer.find(([producerName]) => producer.includes(producerName));

    return match?.[1] || "";
  };

  const createSelectedCutInquiryCategoryLines = (selectedRows, cut) => {
    const categories = [];

    selectedRows.forEach((row) => {
      const category = getSelectedCutInquiryRowCategory(row);

      if (category && !categories.includes(category)) {
        categories.push(category);
      }
    });

    if (categories.length === 0 && cut?.category) {
      const fallbackCategory = String(cut.category).includes("Wagyu") ? "Wagyu" : String(cut.category).trim();

      if (fallbackCategory) {
        categories.push(fallbackCategory);
      }
    }

    if (categories.length === 0) {
      return [];
    }

    return [
      `${categories.length === 1 ? "Category" : "Categories"}: ${categories.join(" / ")}`,
    ];
  };
  const createSelectedCutInquiryContext = (cut) => {
    const selectedCount = getSelectedInquiryRows().length;
    const totalCount = getSelectableInquiryRows().length || getInquiryRows(cut).length;

    if (selectedCount > 0 && selectedCutInquiryConfirmed) {
      return `${selectedCount} selected ${selectedCount === 1 ? "item" : "items"} confirmed. Create the inquiry message when ready.`;
    }

    if (selectedCount > 0) {
      return `${selectedCount} selected ${selectedCount === 1 ? "item" : "items"}. Confirm selected items to continue.`;
    }

    return `Select the product rows you want included in your inquiry. ${totalCount} available ${totalCount === 1 ? "item" : "items"}.`;
  };

  const createSelectedCutInquiryText = (cut) => {
    const selectedRows = getSelectedInquiryRows();

    if (!selectedRows.length) {
      return "";
    }

    const tableRows = selectedRows.map(formatInquiryRow).filter(Boolean);

    const lines = [
      "Hello Paragon Purveyors,",
      "",
      "I would like pricing and availability for the following selected products:",
      "",
      `Selected cut: ${cut?.title || "Selected Cut"}`,
      ...createSelectedCutInquiryCategoryLines(selectedRows, cut),
      "",
      "Products:",
      tableRows.map((row) => `- ${row}`).join("\n"),
      "",
      "Thank you.",
    ];

    return lines.join("\n");
  };

  const setInquiryFeedback = (message) => {
    if (!inquiryFeedbackNode) {
      return;
    }

    inquiryFeedbackNode.textContent = message || "";
    inquiryFeedbackNode.hidden = !message;
  };

  const syncInquiryActionState = () => {
    const hasSelection = hasSelectedInquiryRows();

    if (inquiryCopyButton) {
      inquiryCopyButton.disabled = !hasSelection;
      inquiryCopyButton.setAttribute("aria-disabled", String(!hasSelection));
    }

    if (inquiryContactButton) {
      inquiryContactButton.disabled = !hasSelection || !selectedCutInquiryConfirmed;
      inquiryContactButton.setAttribute("aria-disabled", String(!hasSelection || !selectedCutInquiryConfirmed));
    }
  };

  const updateInquirySheetContent = () => {
    if (!activeCut) {
      return;
    }

    activeInquiryText = createSelectedCutInquiryText(activeCut);

    if (inquiryTitleNode) {
      inquiryTitleNode.textContent = activeCut.title || "Selected Cut";
    }

    if (inquiryContextNode) {
      inquiryContextNode.textContent = createSelectedCutInquiryContext(activeCut);
    }

    syncInquiryActionState();
  };

  const enterProductSelectionMode = () => {
    modal.classList.add("selected-cut-modal--selecting-products");

    getSelectableInquiryRows().forEach((row) => {
      row.setAttribute("tabindex", "0");
      row.setAttribute("aria-selected", String(row.dataset.inquirySelected === "true"));
    });
  };

  const exitProductSelectionMode = () => {
    modal.classList.remove("selected-cut-modal--selecting-products");

    getSelectableInquiryRows().forEach((row) => {
      row.removeAttribute("tabindex");
    });
  };

  const toggleInquiryRowSelection = (row, forceState = null) => {
    if (!isProductSelectionMode() || !row || !row.matches("[data-selected-cut-inquiry-row]")) {
      return;
    }

    const currentState = row.dataset.inquirySelected === "true";
    const nextState = typeof forceState === "boolean" ? forceState : !currentState;

    row.dataset.inquirySelected = String(nextState);
    row.classList.toggle("is-inquiry-selected", nextState);
    row.setAttribute("aria-selected", String(nextState));
    selectedCutInquiryConfirmed = false;

    updateInquirySheetContent();
    setInquiryFeedback(nextState ? "Product option selected. Confirm selected items to continue." : "Product option removed.");
  };

  const prepareInquiryRowSelection = (cut) => {
    getSelectableInquiryRows().forEach((row) => {
      row.classList.remove("is-inquiry-selected", "selected-cut-modal__table-row--selectable");
      row.removeAttribute("data-selected-cut-inquiry-row");
      row.removeAttribute("data-inquiry-selected");
      row.removeAttribute("aria-selected");
      row.removeAttribute("aria-label");
      row.removeAttribute("tabindex");
      row.querySelector(".selected-cut-modal__row-select")?.remove();
    });

    Array.from(rowsNode.querySelectorAll("tr")).forEach((row, index) => {
      const cells = Array.from(row.cells);
      const lastCell = cells[cells.length - 1];

      if (!cells.length || !lastCell) {
        return;
      }

      const rowLabel = cells.map((cell) => cell.innerText.replace(/\s+/g, " ").trim()).filter(Boolean).join(" · ");

      row.dataset.selectedCutInquiryRow = String(index);
      row.dataset.inquirySelected = "false";
      row.classList.add("selected-cut-modal__table-row--selectable");
      row.setAttribute("aria-label", `Select product option: ${rowLabel}`);

      const marker = document.createElement("span");
      marker.className = "selected-cut-modal__row-select";
      marker.setAttribute("aria-hidden", "true");
      lastCell.append(marker);
    });

    activeInquiryText = "";
    selectedCutInquiryConfirmed = false;
    exitProductSelectionMode();
    updateInquirySheetContent();
    setInquiryFeedback("");
  };

  // ROUND4_SELECTED_CUT_INQUIRY_AUTOSCROLL_START
  const scrollSelectedCutInquirySheetIntoView = () => {
    if (!inquirySheet) {
      return;
    }

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const behavior = reduceMotion ? "auto" : "smooth";
    const scrollNodes = [
      modal.querySelector(".selected-cut-modal__body"),
      modal.querySelector(".selected-cut-modal__content"),
      modal,
    ].filter(Boolean);

    const scrollNode =
      scrollNodes.find((node) => node.scrollHeight > node.clientHeight + 4) || scrollNodes[0];

    window.requestAnimationFrame(() => {
      if (scrollNode && typeof scrollNode.scrollTo === "function") {
        scrollNode.scrollTo({
          top: scrollNode.scrollHeight,
          left: 0,
          behavior,
        });
      }

      inquirySheet.scrollIntoView({
        block: "end",
        inline: "nearest",
        behavior,
      });
    });
  };
  // ROUND4_SELECTED_CUT_INQUIRY_AUTOSCROLL_END
  const openSelectedCutInquirySheet = () => {
    if (!inquirySheet || !activeCut) {
      return;
    }

    enterProductSelectionMode();
    updateInquirySheetContent();
    inquirySheet.hidden = false;

    window.requestAnimationFrame(() => {
      inquirySheet.classList.add("is-visible");
      scrollSelectedCutInquirySheetIntoView();
      const focusTarget = getSelectedInquiryRows()[0] || getSelectableInquiryRows()[0] || inquiryDismissButton;
      focusTarget?.focus({ preventScroll: true });
    });
  };

  const closeSelectedCutInquirySheet = () => {
    if (!inquirySheet) {
      return;
    }

    inquirySheet.classList.remove("is-visible");
    inquirySheet.hidden = true;
    exitProductSelectionMode();
    selectedCutInquiryConfirmed = false;
    setInquiryFeedback("");
  };

  const getPreparedInquiryText = () => {
    updateInquirySheetContent();

    if (!activeInquiryText) {
      setInquiryFeedback("Select one or more product options first.");
      return "";
    }

    return activeInquiryText;
  };

  const confirmSelectedCutInquiryDetails = () => {
    const inquiryText = getPreparedInquiryText();

    if (!inquiryText) {
      return;
    }

    selectedCutInquiryConfirmed = true;
    updateInquirySheetContent();
    setInquiryFeedback("Selected items confirmed. Create the inquiry message when ready.");
    inquiryContactButton?.focus({ preventScroll: true });
  };

  const fillContactInquiryMessage = (message) => {
    const messageNode = document.querySelector("[data-inquiry-message]");

    if (!messageNode) {
      return false;
    }

    messageNode.value = message;
    messageNode.dispatchEvent(new Event("input", { bubbles: true }));
    messageNode.dispatchEvent(new Event("change", { bubbles: true }));
    messageNode.focus({ preventScroll: true });

    return true;
  };
  // ROUND4_SELECTED_CUT_INQUIRY_SHEET_HELPERS_END

  const openSelectedCut = (cutName, trigger) => {
    const cut = selectedCuts[cutName];

    if (!cut) {
      return;
    }

    lastTrigger = trigger || null;

    // ROUND4_SELECTED_CUT_INQUIRY_ACTIVE_CUT_START
    activeCut = cut;
    activeInquiryText = "";
    closeSelectedCutInquirySheet();
    // ROUND4_SELECTED_CUT_INQUIRY_ACTIVE_CUT_END

    eyebrowNode.textContent = cut.eyebrow;
    titleNode.textContent = cut.title;
    modal.classList.toggle("selected-cut-modal--long-title", cut.title === "Chuck Tail Flap");
    categoryNode.textContent = cut.category;
    descriptionNode.textContent = cut.description;
    serviceNode.textContent = cut.service;

    if (producersNode) {
      producersNode.innerHTML = createProducerProgramLinks(cutName);
    }
    rowsNode.innerHTML = createRows(cut.rows);

    // ROUND4_SELECTED_CUT_ROW_SELECTION_SETUP_START
    prepareInquiryRowSelection(cut);
    // ROUND4_SELECTED_CUT_ROW_SELECTION_SETUP_END
    fallbackNode.textContent = cut.title;

    imageNode.hidden = false;
    fallbackNode.hidden = true;
    imageNode.alt = "";
    imageNode.src = cut.image;

    imageNode.onerror = () => {
      imageNode.hidden = true;
      fallbackNode.hidden = false;
    };

    document.body.classList.add("selected-cut-modal-open");

    if (typeof modal.showModal === "function" && !modal.open) {
      modal.showModal();
      return;
    }

    modal.setAttribute("open", "");
  };

  window.PARAGON_SELECTED_CUTS = {
    open: (cutName) => openSelectedCut(cutName, null),
    has: (cutName) => Boolean(selectedCuts[cutName]),
  };

  window.addEventListener("paragon:open-selected-cut", (event) => {
    const cutName = event.detail?.cutName || event.detail?.title;

    if (cutName) {
      openSelectedCut(cutName, null);
    }
  });
  const closeSelectedCut = () => {
    document.body.classList.remove("selected-cut-modal-open");

    // ROUND4_SELECTED_CUT_INQUIRY_CLOSE_CLEANUP_START
    closeSelectedCutInquirySheet();
    activeCut = null;
    activeInquiryText = "";
    // ROUND4_SELECTED_CUT_INQUIRY_CLOSE_CLEANUP_END

    if (typeof modal.close === "function" && modal.open) {
      modal.close();
    } else {
      modal.removeAttribute("open");
    }

    rowsNode.innerHTML = "";
    imageNode.removeAttribute("src");

    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus({ preventScroll: true });
    }
  };

  document.querySelectorAll(".cut-card").forEach((card) => {
    const title = card.dataset.selectedCutTrigger || card.querySelector("h3")?.textContent?.trim();

    if (!title || !selectedCuts[title]) {
      return;
    }

    card.dataset.selectedCutTrigger = title;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    const cutLabel = selectedCuts[title].title || title;
    card.setAttribute("aria-label", `Open ${cutLabel} details`);

    card.addEventListener("click", () => {
      openSelectedCut(title, card);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openSelectedCut(title, card);
      }
    });
  });

  // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_START
  modal.addEventListener(
    "click",
    (event) => {
      const producerButton = event.target.closest("[data-connected-producer-trigger]");

      if (!producerButton) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const productListTitle = producerButton.dataset.connectedProducerTrigger;

      if (!productListTitle) {
        return;
      }

      closeSelectedCut();

      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("paragon:open-producer", {
            detail: { productListTitle },
          }),
        );
      }, 140);
    },
    true,
  );
  // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_END
  // ROUND4_SELECTED_CUT_INQUIRY_SHEET_NAV_START
  const continueToInquiryFromSelectedCut = () => {
    const inquiryText = getPreparedInquiryText();

    if (!inquiryText) {
      return;
    }

    if (!selectedCutInquiryConfirmed) {
      setInquiryFeedback("Confirm selected items first.");
      inquiryCopyButton?.focus({ preventScroll: true });
      return;
    }

    lastTrigger = null;
    closeSelectedCut();

    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("paragon:navigate-to-section", {
          detail: {
            sectionId: "inquiry",
            focusId: "inquiry-title",
            source: "selected-cut-modal",
            delay: 80,
          },
        }),
      );

      window.setTimeout(() => {
        fillContactInquiryMessage(inquiryText);
      }, 340);
    }, 180);
  };

  const goToInquiryFromSelectedCut = () => {
    openSelectedCutInquirySheet();
  };
  // ROUND4_SELECTED_CUT_INQUIRY_SHEET_NAV_END
  // ROUND4_SELECTED_CUT_INQUIRY_SHEET_EVENTS_START
  // ROUND4_SELECTED_CUT_INQUIRY_TRIGGER_BINDINGS_START
  modal.querySelectorAll("[data-selected-cut-inquiry]").forEach((button) => {
    button.addEventListener("click", goToInquiryFromSelectedCut);
  });
  // ROUND4_SELECTED_CUT_INQUIRY_TRIGGER_BINDINGS_END
  inquiryCopyButton?.addEventListener("click", confirmSelectedCutInquiryDetails);
  inquiryContactButton?.addEventListener("click", continueToInquiryFromSelectedCut);
  inquiryDismissButton?.addEventListener("click", closeSelectedCutInquirySheet);

  rowsNode.addEventListener("click", (event) => {
    if (!isProductSelectionMode()) {
      return;
    }

    const row = event.target.closest("[data-selected-cut-inquiry-row]");

    if (!row || !rowsNode.contains(row)) {
      return;
    }

    toggleInquiryRowSelection(row);
  });

  rowsNode.addEventListener("keydown", (event) => {
    if (!isProductSelectionMode() || (event.key !== "Enter" && event.key !== " ")) {
      return;
    }

    const row = event.target.closest("[data-selected-cut-inquiry-row]");

    if (!row || !rowsNode.contains(row)) {
      return;
    }

    event.preventDefault();
    toggleInquiryRowSelection(row);
  });
  // ROUND4_SELECTED_CUT_INQUIRY_SHEET_EVENTS_END

  closeButton?.addEventListener("click", closeSelectedCut);

  modal.addEventListener("click", (event) => {
    if (panel && !panel.contains(event.target)) {
      closeSelectedCut();
    }
  });

  modal.addEventListener("close", () => {
    document.body.classList.remove("selected-cut-modal-open");
    rowsNode.innerHTML = "";
    imageNode.removeAttribute("src");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.open) {
      closeSelectedCut();
    }
  });
}

