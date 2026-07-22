import { createPriceRows } from "./format-price.js";
import {
  isSettingVisible,
  normalizeText,
} from "./normalize-document.js";

export const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const brandLogoPaths = new Map([
    ["black-opal", "assets/provider-logos/modal/black-opal_modal_logo.png"],
    ["altair", "assets/provider-logos/modal/altair_modal_logo.png"],
  ]);

  const toBrandLogoKey = (value) => normalizeText(value).replace(/\s+/g, "-");

  const resolveBrandLogoPath = (item) =>
    brandLogoPaths.get(toBrandLogoKey(item.brandLogoKey)) ||
    brandLogoPaths.get(toBrandLogoKey(item.brand)) ||
    "";

const createSpecialCard = async (item, resolveAssetDataUrl) => {
    const primaryImageData = await resolveAssetDataUrl(item.primaryImagePath);
    const hasSecondaryImage = Boolean(normalizeText(item.secondaryImagePath));
    const secondaryImageData = hasSecondaryImage ? await resolveAssetDataUrl(item.secondaryImagePath) : "";
    const imagePanelClass = hasSecondaryImage
      ? "special-card__image-wrap special-card__image-wrap--dual"
      : "special-card__image-wrap";
    const resolveImageNumber = (value, fallback, minimum, maximum) => {
      const text = normalizeText(value);
      if (!text) return fallback;
      const parsed = Number(text);
      if (!Number.isFinite(parsed)) return fallback;
      return Math.min(maximum, Math.max(minimum, parsed));
    };
    const imageStyle = (fit, position, zoom, focusX, focusY) => {
      const focusXText = normalizeText(focusX);
      const focusYText = normalizeText(focusY);
      const resolvedZoom = resolveImageNumber(zoom, 1, 1, 2.5);
      const resolvedFocusX = resolveImageNumber(focusX, 50, 0, 100);
      const resolvedFocusY = resolveImageNumber(focusY, 50, 0, 100);
      const resolvedPosition = focusXText || focusYText
        ? `${resolvedFocusX}% ${resolvedFocusY}%`
        : normalizeText(position) || "center";
      return `object-fit: ${normalizeText(fit) === "cover" ? "cover" : "contain"}; object-position: ${escapeHtml(resolvedPosition)}; transform: scale(${resolvedZoom}); transform-origin: ${resolvedFocusX}% ${resolvedFocusY}%;`;
    };
    const primaryImageMarkup = `<img class="special-card__image" src="${primaryImageData}" alt="${escapeHtml(item.primaryImageAlt || item.displayName)}" style="${imageStyle(item.primaryImageFit, item.primaryImagePosition, item.primaryImageZoom, item.primaryImageFocusX, item.primaryImageFocusY)}">`;
    const secondaryImageMarkup = hasSecondaryImage
      ? `<img class="special-card__image" src="${secondaryImageData}" alt="${escapeHtml(item.secondaryImageAlt || item.displayName)}" style="${imageStyle(item.secondaryImageFit, item.secondaryImagePosition, item.secondaryImageZoom, item.secondaryImageFocusX, item.secondaryImageFocusY)}">`
      : "";
    const imageMarkup = hasSecondaryImage
      ? `<div class="special-card__image-slot">${primaryImageMarkup}</div>
          <div class="special-card__image-slot">${secondaryImageMarkup}</div>`
      : primaryImageMarkup;
    const brandLogoPath = resolveBrandLogoPath(item);
    const brandLogoData = brandLogoPath ? await resolveAssetDataUrl(brandLogoPath).catch(() => "") : "";
    const brandLabel = item.brand || item.brandLogoKey || "";
    const brandMark = brandLogoData
      ? `<img class="product-brand__logo" src="${brandLogoData}" alt="${escapeHtml(brandLabel)}">`
      : brandLabel
        ? `<span class="product-brand__fallback">${escapeHtml(brandLabel)}</span>`
        : "";
    const productBrand = brandMark ? `<div class="product-brand">${brandMark}</div>` : "";

    const priceRowItems = createPriceRows(item);
    const priceRows = priceRowItems
      .map(
        ([icon, label, value]) => `
          <div class="price-row">
            <span class="price-icon">${escapeHtml(icon)}</span>
            <div>
              <p class="price-label">${escapeHtml(label)}</p>
              <p class="price-value">${escapeHtml(value)}</p>
            </div>
          </div>`,
      )
      .join("");

    const priceListClass = priceRowItems.length === 1 ? "price-list price-list--single" : "price-list";

    const marblingBlock =
      normalizeText(item.marblingScore) || normalizeText(item.productLine)
        ? `<div class="marbling-score">
            <p class="marbling-score__label">Marbling Score</p>
            ${item.marblingScore ? `<p class="marbling-score__value">${escapeHtml(item.marblingScore)}</p>` : ""}
            ${item.productLine ? `<p class="marbling-score__line">${escapeHtml(item.productLine)}</p>` : ""}
          </div>`
        : "";

    const savingsMessage = normalizeText(item.savingsMessage)
      ? `<p class="savings-message">${escapeHtml(item.savingsMessage)}</p>`
      : "";

    return `
      <article class="special-card" data-cut-id="${escapeHtml(item.cutId)}" data-offer-mode="${escapeHtml(item.offerMode)}">
        <div class="special-card__content">
          <div class="special-card__topline">
            <div class="special-card__heading">
              <h2 class="special-card__name">${escapeHtml(item.displayName)}</h2>
              ${productBrand}
            </div>
            <p class="special-card__qty">${escapeHtml(item.quantityAvailable)}</p>
          </div>
          <div class="special-card__center">
            <div class="${priceListClass}">${priceRows}</div>
            ${marblingBlock}
          </div>
          <div class="special-card__bottom">
            ${savingsMessage}
            ${item.description ? `<p class="special-description">${escapeHtml(item.description)}</p>` : ""}
          </div>
        </div>
        <div class="${imagePanelClass}">
          ${imageMarkup}
        </div>
      </article>`;
  };

  const createContactCards = (contacts) =>
  contacts
    .filter(
      (contact) =>
        contact.active !== false &&
        (
          normalizeText(contact.name) ||
          normalizeText(contact.phone) ||
          normalizeText(contact.location) ||
          normalizeText(contact.email)
        ),
    )
    .map(
      (contact) => `
        <article class="contact-card">
          <div class="contact-card__row contact-card__row--primary">
            <p class="contact-kicker">${escapeHtml(contact.location || "Contact")}</p>
            <h2 class="contact-name">${escapeHtml(contact.name || "Paragon Purveyors")}</h2>
          </div>
          <div class="contact-card__row contact-card__row--secondary">
            <p class="contact-meta">${escapeHtml(contact.phone || "Phone pending")}</p>
            ${contact.email ? `<p class="contact-email">${escapeHtml(contact.email)}</p>` : ""}
          </div>
        </article>`,
    )
    .join("");

export const renderMonthlySpecialsHtml = async ({ data, activeSpecials, css, resolveAssetDataUrl }) => {
  const settings = data.settings || {};
  const activeContacts = (data.contacts || []).filter((contact) => contact.active !== false);
  const headerBrandMarkVisible = isSettingVisible(settings, "headerBrandMarkVisible");
  const headerWordmarkVisible = isSettingVisible(settings, "headerWordmarkVisible");
  const deliveryMessageVisible = isSettingVisible(settings, "deliveryMessageVisible");
  const campaignMarkVisible = isSettingVisible(settings, "campaignMarkVisible");
  const campaignTitleVisible = isSettingVisible(settings, "campaignTitleVisible");
  const monthVisible = isSettingVisible(settings, "monthVisible");
  const yearVisible = isSettingVisible(settings, "yearVisible");
  const headerSupportingLineVisible = isSettingVisible(settings, "headerSupportingLineVisible", false);

  const brandMarkPath =
    normalizeText(settings.headerBrandMarkPath) ||
    "assets/brand/paragon-cow-mark.svg";
  const brandWordmarkPath =
    normalizeText(settings.headerWordmarkPath) ||
    "assets/brand/Paragon_Purveyors_logo_text.svg";
  const brandMarkData = headerBrandMarkVisible
    ? await resolveAssetDataUrl(brandMarkPath)
    : "";
  const brandTextLogoData = headerWordmarkVisible
    ? await resolveAssetDataUrl(brandWordmarkPath)
    : "";
  const campaignMarkPath =
    normalizeText(settings.campaignMarkPath) ||
    "specials/tournaments_fifa-world-cup-2026--white_1500x1500.football-logos.cc.png";
  const campaignMarkData = campaignMarkVisible ? await resolveAssetDataUrl(campaignMarkPath) : "";
  const campaignMarkAlt = normalizeText(settings.campaignMarkAlt) || "World Cup Deals";
  const campaignTitleParts = [settings.campaignTitleLine1, settings.campaignTitleLine2]
    .map(normalizeText)
    .filter(Boolean);
  const resolvedCampaignTitleParts = campaignTitleParts.length > 0 ? campaignTitleParts : ["World Cup", "Deals"];
  const campaignTitle = resolvedCampaignTitleParts.join(" ");
  const campaignTitleHtml = resolvedCampaignTitleParts
    .map((part) => `<span>${escapeHtml(part)}</span>`)
    .join("");
  const deliveryBadge =
    normalizeText(settings.deliveryMessage) ||
    "No Minimum Required for Free Delivery";
  const headerSupportingLine = normalizeText(settings.headerSupportingLine);
  const documentTitle = "Monthly Featured Cuts | Paragon Purveyors";
  const contactCards = createContactCards(activeContacts);
  const cards = [];

  for (const item of activeSpecials) {
    cards.push(await createSpecialCard(item, resolveAssetDataUrl));
  }

  const brandMarkMarkup = headerBrandMarkVisible
    ? `<img class="brand-logo" src="${brandMarkData}" alt="Paragon Purveyors">`
    : "";
  const deliveryBadgeMarkup = deliveryMessageVisible && normalizeText(deliveryBadge)
    ? `<p class="delivery-badge">${escapeHtml(deliveryBadge)}</p>`
    : "";
  const brandWordmarkMarkup = headerWordmarkVisible
    ? `<img class="brand-text-logo" src="${brandTextLogoData}" alt="Paragon Purveyors">`
    : "";
  const campaignMarkMarkup = campaignMarkVisible
    ? `<img class="campaign-mark__image" src="${campaignMarkData}" alt="${escapeHtml(campaignMarkAlt)}">`
    : "";
  const monthMarkup = monthVisible && normalizeText(settings.month)
    ? `<p class="month-label">${escapeHtml(settings.month)}</p>`
    : "";
  const campaignTitleMarkup = campaignTitleVisible
    ? `<h1 class="month-title" aria-label="${escapeHtml(campaignTitle)}">${campaignTitleHtml}</h1>`
    : "";
  const yearMarkup = yearVisible && normalizeText(settings.year)
    ? `<p class="month-subline">${escapeHtml(settings.year)}</p>`
    : "";
  const headerSupportingLineMarkup = headerSupportingLineVisible && headerSupportingLine
    ? `<p class="month-subline header-supporting-line">${escapeHtml(headerSupportingLine)}</p>`
    : "";
  const specialsGridStyle = activeSpecials.length === 4
    ? ""
    : ` style="grid-template-rows: repeat(${activeSpecials.length}, minmax(0, 1fr));"`;
  const contactInstruction = normalizeText(settings.contactInstruction);
  const contactInstructionMarkup = contactInstruction
    ? `<p class="contact-instruction">${escapeHtml(contactInstruction)}</p>`
    : "";
  const footerMessage = normalizeText(settings.footerMessage);
  const disclaimer = normalizeText(settings.disclaimer);
  const footerBrollVisible = isSettingVisible(
    settings,
    "footerBrollVisible",
    false,
  );
  const footerBrollPath = normalizeText(settings.footerBrollPath);
  const footerBrollAlt =
    normalizeText(settings.footerBrollAlt) ||
    "Paragon Purveyors footer editorial image";
  const resolveFooterNumber = (value, fallback, minimum, maximum) => {
    const text = normalizeText(value);
    if (!text) return fallback;

    const parsed = Number(text);
    if (!Number.isFinite(parsed)) return fallback;

    return Math.min(maximum, Math.max(minimum, parsed));
  };
  const footerBrollFit =
    normalizeText(settings.footerBrollFit) === "contain"
      ? "contain"
      : "cover";
  const footerBrollZoom = resolveFooterNumber(
    settings.footerBrollZoom,
    1,
    1,
    2.5,
  );
  const footerBrollFocusX = resolveFooterNumber(
    settings.footerBrollFocusX,
    50,
    0,
    100,
  );
  const footerBrollFocusY = resolveFooterNumber(
    settings.footerBrollFocusY,
    50,
    0,
    100,
  );
  const footerHasFocusValues =
    normalizeText(settings.footerBrollFocusX) ||
    normalizeText(settings.footerBrollFocusY);
  const footerBrollPosition = footerHasFocusValues
    ? `${footerBrollFocusX}% ${footerBrollFocusY}%`
    : normalizeText(settings.footerBrollPosition) || "center";
  const footerBrollOpacity = resolveFooterNumber(
    settings.footerBrollOpacity,
    1,
    0,
    1,
  );
  const footerBrollSaturation = resolveFooterNumber(
    settings.footerBrollSaturation,
    0.82,
    0,
    2,
  );
  const footerBrollContrast = resolveFooterNumber(
    settings.footerBrollContrast,
    1.02,
    0,
    2,
  );
  const footerBrollBrightness = resolveFooterNumber(
    settings.footerBrollBrightness,
    0.88,
    0,
    2,
  );
  const footerBrollData =
    footerBrollVisible && footerBrollPath
      ? await resolveAssetDataUrl(footerBrollPath)
      : "";
  const footerMessageMarkup = footerMessage
    ? `<p class="footer-message">${escapeHtml(footerMessage)}</p>`
    : "";
  const disclaimerMarkup = disclaimer
    ? `<p class="disclaimer">${escapeHtml(disclaimer)}</p>`
    : "";
  const footerBrollStyle = [
    `object-fit: ${footerBrollFit}`,
    `object-position: ${footerBrollPosition}`,
    `transform: scale(${footerBrollZoom})`,
    `transform-origin: ${footerBrollFocusX}% ${footerBrollFocusY}%`,
    `opacity: ${footerBrollOpacity}`,
    `filter: saturate(${footerBrollSaturation}) contrast(${footerBrollContrast}) brightness(${footerBrollBrightness})`,
  ].join("; ");
  const footerBrollMarkup = footerBrollData
    ? `<img class="footer-broll" src="${footerBrollData}" alt="${escapeHtml(footerBrollAlt)}" style="${footerBrollStyle};">`
    : "";
  const closingClass = footerBrollData
    ? "specials-closing specials-closing--with-broll"
    : "specials-closing";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(documentTitle)}</title>
  <link rel="icon" type="image/png" sizes="16x16" href="/PP16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/PP32x32.png">
  <link rel="icon" type="image/png" sizes="48x48" href="/PP48x48.png">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${css}</style>
</head>
<body>
  <main class="monthly-specials-page" aria-label="${escapeHtml(campaignTitle)}">
    <header class="specials-header specials-header--campaign">
      <section class="brand-block" aria-label="Paragon Purveyors mark">
        ${brandMarkMarkup}
      </section>
      <section class="brand-text-block" aria-label="Paragon Purveyors">
        ${deliveryBadgeMarkup}
        ${brandWordmarkMarkup}
      </section>
      <section class="campaign-mark-block" aria-label="${escapeHtml(campaignTitle)}">
        ${campaignMarkMarkup}
      </section>
      <section class="month-block" aria-label="${escapeHtml(campaignTitle)}">
        ${monthMarkup}
        ${campaignTitleMarkup}
        ${yearMarkup}
        ${headerSupportingLineMarkup}
      </section>
    </header>

    <section class="specials-grid" aria-label="Specials"${specialsGridStyle}>
      ${cards.join("\n")}
    </section>

    <footer class="${closingClass}" aria-label="Ordering contacts and footer">
      <div class="specials-closing__content">
        <div class="specials-closing__contacts">
          ${contactCards}
        </div>
        <div class="specials-closing__instructions">
          ${contactInstructionMarkup}
          ${footerMessageMarkup}
          ${disclaimerMarkup}
        </div>
      </div>
      <div class="specials-closing__media">
        ${footerBrollMarkup}
      </div>
    </footer>
  </main>
</body>
</html>`;
};
