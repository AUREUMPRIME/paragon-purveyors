import { assetPath } from "./assetPath.js";
const selectedCuts = {
  Ribeye: {
    eyebrow: "Selected Cut",
    title: "Ribeye",
    category: "Beef / Wagyu",
    image: assetPath("assets/cuts/ribeye.jpg"),
    description:
      "A richly marbled center-plate cut selected for depth, tenderness, and a refined eating profile.",
    service:
      "Best for high-heat searing, grilling, and premium steak service.",
    rows: [
      ["14107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
      ["24107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
      ["34107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
      ["37907", "Ribeye", "4/9# AVG. ~ 38# CS"],
      ["22402W", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
      ["22409T", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
      ["2240XA", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],
      ["2240XB", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],
    ],
  },
  Tenderloin: {
    eyebrow: "Selected Cut",
    title: "Tenderloin",
    category: "Beef / Wagyu / Pork",
    image: assetPath("assets/cuts/tenderloin.jpg"),
    description:
      "A refined, tender cut selected for clean presentation, delicate texture, and elegant service.",
    service:
      "Best for fine-dining portions, pan searing, roasting, and composed plates.",
    rows: [
      ["14135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
      ["24135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
      ["34135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
      ["37905", "Tenderloin", "4/7# AVG. ~ 30# CS"],
      ["FP18", "Tenderloin", "24/0.8# AVG. ~ 19.2# CS"],
      ["21602W", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
      ["21609T", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
      ["2160XA", "Tenderloin SS Off 4LB+", "6/4# AVG. ~ 24# CS"],
      ["2160XB", "Tenderloin SS Off 4LB+", "6/4# AVG. ~ 24# CS"],
    ],
  },
  Striploin: {
    eyebrow: "Selected Cut",
    title: "Striploin",
    category: "Beef / Wagyu",
    image: assetPath("assets/cuts/striploin.jpg"),
    description:
      "A classic premium steak cut selected for balance, marbling, and a confident center-plate profile.",
    service:
      "Best for steaks, portioning, grilling, and refined steakhouse service.",
    rows: [
      ["14104", "Striploin", "3/13# AVG. ~ 40# CS"],
      ["24104", "Striploin", "3/13# AVG. ~ 40# CS"],
      ["34104", "Striploin", "3/13# AVG. ~ 40# CS"],
      ["37904", "Striploin", "2/19# AVG. ~ 37# CS"],
      ["37974", "Bone-In Striploin", "1/40# AVG. ~ 40# CS"],
      ["21402W", "Striploin", "2/15# AVG. ~ 30# CS"],
      ["21409T", "Striploin", "2/15# AVG. ~ 30# CS"],
      ["2140XA", "Striploin 11LB+", "3/12# AVG. ~ 36# CS"],
      ["1562XA", "B/In Striploin Vac", "3/12# AVG. ~ 36# CS"],
      ["2140XB", "Striploin 11LB+", "3/12# AVG. ~ 36# CS"],
      ["1562XB", "Striploin B/I", "2/16# AVG. ~ 32# CS"],
    ],
  },
  Tomahawk: {
    eyebrow: "Selected Cut",
    title: "Tomahawk",
    category: "Beef / Wagyu",
    image: assetPath("assets/cuts/tomahawk.jpg"),
    description:
      "A dramatic bone-in cut selected for visual impact, rich flavor, and celebratory presentation.",
    service:
      "Best for sharing portions, grilling, roasting, and high-impact menu features.",
    rows: [
      ["14101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
      ["24101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
      ["34101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
      ["27972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
      ["37972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
      ["1602TW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
      ["1602RW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
    ],
  },
  Presa: {
    eyebrow: "Selected Cut",
    title: "Presa",
    category: "Ibérico Pork",
    image: assetPath("assets/cuts/presa.jpg"),
    description:
      "A highly regarded Ibérico cut selected for deep flavor, tenderness, and generous marbling.",
    service:
      "Best for grilling, searing, slicing, and Spanish-inspired center-plate service.",
    rows: [["FP02", "Presa", "12/1.54# AVG. ~ 18.5# CS"]],
  },
  Secreto: {
    eyebrow: "Selected Cut",
    title: "Secreto",
    category: "Ibérico Pork",
    image: assetPath("assets/cuts/secreto.jpg"),
    description:
      "A richly marbled Ibérico cut selected for expressive flavor, quick cooking, and delicate texture.",
    service:
      "Best for hot searing, charcoal grilling, slicing, and small-plate service.",
    rows: [
      ["FP01", "Secreto", "16/1.1# AVG. ~ 17.5# CS"],
      ["FP15", "Jowl Secreto", "16/0.5# AVG. ~ 8# CS"],
      ["FP16", "Belly Secreto", "14/1.3# AVG. ~ 18# CS"],
    ],
  },
  "Rump Cap": {
    eyebrow: "Selected Cut",
    title: "Rump Cap",
    category: "Beef / Wagyu",
    image: assetPath("assets/cuts/rump-cap.jpg"),
    description:
      "A flavorful cap cut selected for its fat cover, rich character, and versatile presentation.",
    service:
      "Best for roasting, grilling, slicing, and picanha-style service.",
    rows: [
      ["24124", "Rump Cap", "8/3.5# AVG. ~ 28# CS"],
      ["34124", "Rump Cap", "8/3.5# AVG. ~ 28# CS"],
      ["37924", "Rump Cap (Culotte)", "8/4# AVG. ~ 34# CS"],
      ["2091XA", "Rump Cap", "6/5# AVG. ~ 30# CS"],
      ["2091XB", "Rump Cap", "6/5# AVG. ~ 30# CS"],
    ],
  },
  "Short Rib": {
    eyebrow: "Selected Cut",
    title: "Short Rib",
    category: "Beef",
    image: assetPath("assets/cuts/short-rib.jpg"),
    description:
      "A richly flavored cut selected for depth, structure, and satisfying slow-cooked or grilled preparations.",
    service:
      "Best for braising, smoking, grilling, and Korean-style short rib service.",
    rows: [
      ["1688XA", "Short Rib 3-Rib", "12/4# AVG. ~ 48# CS"],
      ["1688XB", "Short Rib 3-Rib", "8/3# AVG. ~ 48# CS"],
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

const createRows = (rows) =>
  rows
    .map(
      ([code, product, specification]) => `
        <tr>
          <td>${escapeHtml(code)}</td>
          <td>${escapeHtml(product)}</td>
          <td>${escapeHtml(specification)}</td>
        </tr>
      `,
    )
    .join("");

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

          <div class="selected-cut-modal__table-wrap">
            <table class="selected-cut-modal__table">
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Cut / Product</th>
                  <th scope="col">Specification</th>
                </tr>
              </thead>
              <tbody data-selected-cut-rows></tbody>
            </table>
          </div>
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
  const rowsNode = modal.querySelector("[data-selected-cut-rows]");
  const imageNode = modal.querySelector("[data-selected-cut-image]");
  const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");

  const openSelectedCut = (cutName, trigger) => {
    const cut = selectedCuts[cutName];

    if (!cut) {
      return;
    }

    lastTrigger = trigger || null;

    eyebrowNode.textContent = cut.eyebrow;
    titleNode.textContent = cut.title;
    categoryNode.textContent = cut.category;
    descriptionNode.textContent = cut.description;
    serviceNode.textContent = cut.service;
    rowsNode.innerHTML = createRows(cut.rows);
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

  const closeSelectedCut = () => {
    document.body.classList.remove("selected-cut-modal-open");

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
    const title = card.querySelector("h3")?.textContent?.trim();

    if (!title || !selectedCuts[title]) {
      return;
    }

    card.dataset.selectedCutTrigger = title;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Open ${title} details`);

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
