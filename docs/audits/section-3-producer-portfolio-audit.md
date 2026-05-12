# Section 3 Producer Portfolio Audit

## Status

This is a read-only audit for Phase 4 Producer Portfolio Refinement.

## Files inspected

- src/main.js
- src/styles.css

## Client-requested Phase 4 changes

- Remove visible written producer names from producer cards.
- Keep producer logos as the main identity element.
- Keep program/category labels for clarity.
- Move each producer official page link to the top of the producer modal.
- Keep cards accessible with aria labels.
- Do not change Section 4 cuts in this phase.

## Section 3 extracted from src/main.js

```html
<section id="producers" class="scene scene-portfolio" aria-labelledby="portfolio-title" data-section-name="Producers">
      <div class="scene-glow scene-glow-soft"></div>

      <div class="panel panel-portfolio">
        <div class="portfolio-head">
          <p class="eyebrow">Producer Portfolio</p>
          <h2 id="portfolio-title" class="portfolio-title">
            <span class="portfolio-title-line">Selected producers,</span>
            <span class="portfolio-title-line">in one portfolio.</span>
          </h2>
          <p class="body-copy portfolio-intro">
            A concise introduction to the producers behind the Paragon Purveyors offering.
          </p>
        </div>

        <div class="brand-grid">
                    <article class="brand-card brand-card--black-opal">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/black-opal_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">Australian Wagyu</span>
            <h3>Black Opal</h3>
            <p>Australian Wagyu chosen for rich marbling and a refined eating profile.</p>
          </article>

                    <article class="brand-card brand-card--mayura-station">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/mayura-station_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">Full-Blood Wagyu</span>
            <h3>Mayura Station</h3>
            <p>Distinctive Wagyu selected for depth, consistency, and character.</p>
          </article>

                    <article class="brand-card brand-card--campo-grande">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/campo-grande_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">Ibérico Pork</span>
            <h3>Campo Grande</h3>
            <p>Premium Ibérico pork known for depth of flavor and remarkable texture.</p>
          </article>

                    <article class="brand-card brand-card--robbins-island">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/robbins-island_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">Tasmanian Wagyu</span>
            <h3>Robbins Island</h3>
            <p>Tasmanian Wagyu selected for provenance, marbling, and balance.</p>
          </article>

                    <article class="brand-card brand-card--wanderer">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/wanderer_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">Barley-Fed Beef</span>
            <h3>Wanderer</h3>
            <p>Barley-fed beef chosen for versatility, consistency, and dependable quality.</p>
          </article>
        </div>
      </div>
    </section>
```

## Producer modal-related extraction

```js
producers">
          <span class="section-index__number">3</span>
          <span class="section-index__label">Producers</span>
        </button>
        <button class="section-index__item" type="button" data-section-target="cuts">
          <span class="section-index__number">4</span>
          <span class="section-index__label">Cuts</span>
        </button>
        <button class="section-index__item" type="button" data-section-target="inquiry">
          <span class="section-index__number">5</span>
          <span class="section-index__label">Inquiry</span>
        </button>
      </div>
    </nav>

    <button class="global-contact-cta" type="button" data-section-target="inquiry" aria-label="Request availability from Paragon Purveyors">
      <span class="global-contact-cta__inner">
        <span class="global-contact-cta__mark" aria-hidden="true">
          <img
            src="${assetPath("assets/brand/paragon-cow-mark.svg")}"
            alt=""
            loading="lazy"
          />
        </span>
        <span class="global-contact-cta__copy">
          <span class="global-contact-cta__eyebrow">Questions or orders</span>
          <span class="global-contact-cta__label">Request Availability</span>
          <span class="global-contact-cta__line" aria-hidden="true"></span>
        </span>
      </span>
    </button>

    <section id="hero" class="scene scene-hero" aria-labelledby="hero-title" data-section-name="Home">
      <div class="scene-glow"></div>
      <div class="scene-grain"></div>

      <div class="panel panel-hero">
        <p class="eyebrow">Paragon Purveyors</p>

        <h1 id="hero-title" class="hero-title">
          <span class="hero-title-line">Premium Provisions</span>
          <span class="hero-title-line">Carefully Selected.</span>
        </h1>

        <p class="lead">
          An introduction to Paragon Purveyors and its curated portfolio of distinguished meat producers and selected cuts.
        </p>

        <div class="hero-actions" aria-label="Main page index">
          <button class="button button-primary" type="button" data-hero-target="about">About Us</button>
          <button class="button button-secondary" type="button" data-hero-target="producers">Producers</button>
          <button class="button button-secondary button-selected-cuts" type="button" data-hero-target="cuts">Selected Cuts</button>
          <button class="button button-secondary" type="button" data-hero-target="inquiry">Contact</button>
        </div>
      </div>
    </section>

    <section id="about" class="scene scene-story" aria-labelledby="story-title" data-section-name="About">
      <div class="scene-glow scene-glow-soft"></div>

      <div class="panel panel-story panel-story--about-cards">
        <div class="about-card-pair">
          <div class="about-card-pair__intro">
            <p class="eyebrow">About</p>
            <h2 id="story-title" class="about-card-pair__title">Paragon Purveyors.</h2>
            <p class="body-copy about-card-pair__copy">A concise introduction to the people and purpose behind the house.</p>
          </div>

          <div class="about-card-pair__cards" aria-label="About Paragon Purveyors">
            <button
              class="section-about-logo-card section-about-logo-card--introduction"
              type="button"
              data-about-trigger
              aria-label="Open About Paragon Purveyors"
            >
              <span class="section-about-logo-card__mark">
                <img
                  src="${assetPath("assets/brand/paragon-footer-logo.svg")}"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                />
              </span>
              <span class="section-about-logo-card__label">About Paragon Purveyors</span>
              <span class="section-about-logo-card__copy">View the brand introduction.</span>
            </button>

            <button
              class="section-about-logo-card section-about-logo-card--owners"
              type="button"
              data-owners-trigger
              aria-label="Open Meet the Owners"
            >
              <span class="section-about-logo-card__mark">
                <img
                  src="${assetPath("assets/brand/paragon-footer-logo.svg")}"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                />
              </span>
              <span class="section-about-logo-card__label">Meet the Owners</span>
              <span class="section-about-logo-card__date">Established 2026</span>
              <span class="section-about-logo-card__copy">Read the story behind Paragon Purveyors.</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section id="producers" class="scene scene-portfolio" aria-labelledby="portfolio-title" data-section-name="Producers">
      <div class="scene-glow scene-glow-soft"></div>

      <div class="panel panel-portfolio">
        <div class="portfolio-head">
          <p class="eyebrow">Producer Portfolio</p>
          <h2 id="portfolio-title" class="portfolio-title">
            <span class="portfolio-title-line">Selected producers,</span>
            <span class="portfolio-title-line">in one portfolio.</span>
          </h2>
          <p class="body-copy portfolio-intro">
            A concise introduction to the producers behind the Paragon Purveyors offering.
          </p>
        </div>

        <div class="brand-grid">
                    <article class="brand-card brand-card--black-opal">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/black-opal_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">Australian Wagyu</span>
            <h3>Black Opal</h3>
            <p>Australian Wagyu chosen for rich marbling and a refined eating profile.</p>
          </article>

                    <article class="brand-card brand-card--mayura-station">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/mayura-station_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">Full-Blood Wagyu</span>
            <h3>Mayura Station</h3>
            <p>Distinctive Wagyu selected for depth, consistency, and character.</p>
          </article>

                    <article class="brand-card brand-card--campo-grande">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/campo-grande_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">Ibérico Pork</span>
            <h3>Campo Grande</h3>
            <p>Premium Ibérico pork known for depth of flavor and remarkable texture.</p>
          </article>

                    <article class="brand-card brand-card--robbins-island">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/robbins-island_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">Tasmanian Wagyu</span>
            <h3>Robbins Island</h3>
            <p>Tasmanian Wagyu selected for provenance, marbling, and balance.</p>
          </article>

                    <article class="brand-card brand-card--wanderer">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/wanderer_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">Barley-Fed Beef</span>
            <h3>Wanderer</h3>
            <p>Barley-fed beef chosen for versatility, consistency, and dependable quality.</p>
          </article>
        </div>
      </div>
    </section>
      <section id="cuts" class="scene scene-cuts" aria-labelledby="cuts-title" data-section-name="Selected Cuts">
      <div class="scene-glow scene-glow-soft"></div>

      <div class="panel panel-cuts">
        <div class="cuts-head">
          <p class="eyebrow">Selected Cuts</p>
          <h2 id="cuts-title" class="cuts-title">
            <span class="cuts-title-line">Exceptional cuts,</span>
            <span class="cuts-title-line">selected with purpose.</span>
          </h2>
          <p class="body-copy cuts-intro">
            A focused overview of selected cuts across beef, Wagyu, and Ibérico pork.
          </p>
        </div>

        <div class="cuts-grid">
          <article class="cut-card cut-card--ribeye">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/ribeye.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="cut-card-shade" aria-hidden="true"></span>
            <span class="cut-kicker">Beef</span>
            <h3>Ribeye</h3>
          </article>

          <article class="cut-card cut-card--tenderloin">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/tenderloin.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="cut-card-shade" aria-hidden="true"></span>
            <span class="cut-kicker">Beef</span>
            <h3>Tenderloin</h3>
          </article>

          <article class="cut-card cut-card--striploin">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/striploin.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="cut-card-shade" aria-hidden="true"></span>
            <span class="cut-kicker">Beef</span>
            <h3>Striploin</h3>
          </article>

          <article class="cut-card cut-card--tomahawk">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/tomahawk.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="cut-card-shade" aria-hidden="true"></span>
            <span class="cut-kicker">Beef</span>
            <h3>Tomahawk</h3>
          </article>

          <article class="cut-card cut-card--presa">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/presa.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="cut-card-shade" aria-hidden="true"></span>
            <span class="cut-kicker">Pork</span>
            <h3>Presa</h3>
          </article>

          <article class="cut-card cut-card--secreto">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/secreto.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="cut-card-shade" aria-hidden="true"></span>
            <span class="cut-kicker">Pork</span>
            <h3>Secreto</h3>
          </article>

          <article class="cut-card cut-card--rump-cap" data-selected-cut-trigger="Rump Cap">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/rump-cap.jpg")}"
              alt=""
              aria-hidden="true"
              loading="
```

## Relevant src/main.js lines

```text
39:         <button class="section-index__item" type="button" data-section-target="producers">
41:           <span class="section-index__label">Producers</span>
84:           An introduction to Paragon Purveyors and its curated portfolio of distinguished meat producers and selected cuts.
89:           <button class="button button-secondary" type="button" data-hero-target="producers">Producers</button>
149:     <section id="producers" class="scene scene-portfolio" aria-labelledby="portfolio-title" data-section-name="Producers">
152:       <div class="panel panel-portfolio">
153:         <div class="portfolio-head">
154:           <p class="eyebrow">Producer Portfolio</p>
155:           <h2 id="portfolio-title" class="portfolio-title">
156:             <span class="portfolio-title-line">Selected producers,</span>
157:             <span class="portfolio-title-line">in one portfolio.</span>
159:           <p class="body-copy portfolio-intro">
160:             A concise introduction to the producers behind the Paragon Purveyors offering.
174:             <h3>Black Opal</h3>
178:                     <article class="brand-card brand-card--mayura-station">
181:               src="${assetPath("assets/provider-icons/mayura-station_card_logo_512x192.png")}"
187:             <h3>Mayura Station</h3>
200:             <h3>Campo Grande</h3>
213:             <h3>Robbins Island</h3>
217:                     <article class="brand-card brand-card--wanderer">
220:               src="${assetPath("assets/provider-icons/wanderer_card_logo_512x192.png")}"
226:             <h3>Wanderer</h3>
351:           <article class="cut-card cut-card--all-cuts" data-product-list-trigger="All Cuts">
370:             For additional information regarding producers, selected cuts, and availability, please get in touch directly.
439:           <p>Paragon Purveyors connects discerning buyers with exceptional meats from carefully selected producers.</p>
441:           <p>Built on trusted industry relationships, Paragon focuses on access, quality, and guidance rather than volume or noise. The company works with premium producers whose products are chosen for provenance, consistency, eating quality, and the ability to elevate a menu, a table, or a special offering.</p>
668:     "Black Opal": {
670:       title: "Black Opal",
674:         logoAlt: "Black Opal logo",
677:         copy: "Black Opal is selected for consistency: refined Australian Wagyu with generous marbling, a balanced eating profile, and dependable year-round supply. Raised through a disciplined long-term program in Victoria and Tasmania, it gives Paragon a reliable foundation for premium Wagyu across a range of marble scores.",
679:         websiteCopy: "For additional information on Black Opal Wagyu, visit the producer's official brand page.",
680:         websiteLabel: "Visit Black Opal",
685:       pdf: assetPath("assets/product-lists/PP_australian_wagyu.pdf"),
751:     "Mayura Station": {
753:       title: "Mayura Station",
754:       // PROVIDER_INTRO_MAYURA_STATION_START
756:         logo: assetPath("assets/provider-logos/modal/mayura-station_modal_logo.png"),
757:         logoAlt: "Mayura Station logo",
758:         bannerImage: assetPath("assets/provider-banners/mayura-station-banner.png"),
760:         copy: "Mayura Station is selected for depth, control, and unmistakable full-blood Wagyu character. Raised on a family-owned station in South Australia's Limestone Coast, its cattle are managed through a highly controlled program designed for richness, consistency, and a distinctive luxury eating profile.",
762:         websiteCopy: "For additional information on Mayura Station Wagyu, visit the producer's official brand page.",
763:         websiteLabel: "Visit Mayura Station",
764:         websiteUrl: "https://www.mayurastation.com",
766:       // PROVIDER_INTRO_MAYURA_STATION_END
768:       pdf: assetPath("assets/product-lists/PP_full_blood_wagyu.pdf"),
797:     "Campo Grande": {
799:       title: "Campo Grande",
803:         logoAlt: "Campo Grande logo",
806:         copy: "Campo Grande is selected for its expressive Spanish Ibérico character: heirloom pigs, deep marbling, and a rich, savory eating profile that gives chefs a pork program with the presence of a luxury steak. Raised through family-owned farms in southern and western Spain, it brings heritage, flavor, and distinction to the Paragon portfolio.",
808:         websiteCopy: "For additional information on Campo Grande Ibérico pork, visit the producer's official brand page.",
809:         websiteLabel: "Visit Campo Grande",
814:       pdf: assetPath("assets/product-lists/PP_iberico_pork.pdf"),
852:     "Robbins Island": {
854:       title: "Robbins Island",
858:         logoAlt: "Robbins Island logo",
861:         copy: "Robbins Island is selected for rarity, terroir, and unmistakable Tasmanian Wagyu character. Set off Tasmania's northwest coast, its cattle graze through saltwater channels in a pristine island environment before a long grain finish, creating a distinctive balance of clean origin, elite genetics, and high-marbling depth.",
863:         websiteCopy: "For additional information on Robbins Island Wagyu, visit the producer's official brand page.",
864:         websiteLabel: "Visit Robbins Island",
869:       pdf: assetPath("assets/product-lists/PP_tasmanian_wagyu.pdf"),
918:           pdf: assetPath("assets/product-lists/PP_all_cuts_guide.pdf"),
952:           pdf: assetPath("assets/product-lists/PP_pork_cuts_guide.pdf"),
975:     Wanderer: {
977:       title: "Wanderer",
978:       // PROVIDER_INTRO_WANDERER_START
980:         logo: assetPath("assets/provider-logos/modal/wanderer_modal_logo.png"),
981:         logoAlt: "Wanderer logo",
982:         bannerImage: assetPath("assets/provider-banners/wanderer-banner.png"),
984:         copy: "Wanderer is selected for a distinctive balance of free-range husbandry and barley-fed consistency. Its cattle roam open paddocks while accessing barley through an innovative mobile feeding system, giving chefs the richness, tenderness, and dependable quality of barley-fed beef without the use of intensive feedlots.",
986:         websiteCopy: "For additional information on Wanderer Beef, visit the producer's official brand page.",
987:         websiteLabel: "Visit Wanderer",
988:         websiteUrl: "https://www.wandererbeef.com.au/",
990:       // PROVIDER_INTRO_WANDERER_END
992:       pdf: assetPath("assets/product-lists/PP_free_range_barley_beef.pdf"),
1097:         <p>${escapeHtml(providerIntro.websiteCopy || "For more information, visit the producer's official website.")}</p>
1106:     const headerNode = modal.querySelector(".product-list-modal__header") || titleNode?.parentElement || modal;
1110:     modal.classList.toggle("product-list-modal--provider-intro", hasLogo);
1158:             class="product-list-guide-tab${isActive ? " is-active" : ""}"
1160:             data-product-list-guide-key="${escapeHtml(guide.key)}"
1171:     const headerNode = modal.querySelector(".product-list-modal__header") || titleNode?.parentElement || modal;
1172:     headerNode.classList.add("product-list-modal__header--with-tabs");
1174:     let tabsNode = modal.querySelector("[data-product-list-guide-tabs]");
1177:       tabsNode.className = "product-list-guide-tabs";
1178:       tabsNode.setAttribute("data-product-list-guide-tabs", "");
1196:     modal.classList.toggle("product-list-modal--page-gallery", activeGuide.layout === "page-gallery");
1212:     <div class="product-list-page-gallery">
1216:             <figure class="product-list-page-card">
1253:           <section class="product-list-section">
1255:             <div class="product-list-table-wrap">
1256:               <table class="product-list-table">
1279:     <div class="product-list-modal__panel">
1280:       <button class="product-list-modal__close" type="button" aria-label="Close product list" data-product-list-close>
1284:       <header class="product-list-modal__header">
1285:         <p class="product-list-modal__eyebrow" data-product-list-eyebrow>Product List</p>
1286:         <h2 id="product-list-modal-title" data-product-list-title>Product List</h2>
1287:         <p data-product-list-description></p>
1290:       <div class="product-list-modal__body" data-product-list-body></div>
1292:       <a class="product-list-modal__external" href="#" target="_blank" rel="noopener noreferrer" data-product-list-external>
1293:         Open in new tab
1299:   let modal = document.getElementById("product-list-modal");
1303:     modal.id = "product-list-modal";
1307:   modal.className = "product-list-modal";
1308:   modal.setAttribute("aria-labelledby", "product-list-modal-title");
1311:   const panel = modal.querySelector(".product-list-modal__panel");
1312:   const closeButton = modal.querySelector("[data-product-list-close]");
1313:   const eyebrowNode = modal.querySelector("[data-product-list-eyebrow]");
1314:   const titleNode = modal.querySelector("[data-product-list-title]");
1315:   const descriptionNode = modal.querySelector("[data-product-list-description]");
1316:   const bodyNode = modal.querySelector("[data-product-list-body]");
1317:   const externalNode = modal.querySelector("[data-product-list-external]");
1349:       externalNode.textContent = "Open in new tab";
1353:     document.body.classList.add("product-list-modal-open");
1364:     document.body.classList.remove("product-list-modal-open");
1365:     modal.classList.remove("product-list-modal--page-gallery");
1366:     modal.classList.remove("product-list-modal--provider-intro");
1368:     modal.removeAttribute("data-active-product-list-title");
1389:       const guideButton = event.target.closest("[data-product-list-guide-key]");
1408:   document.querySelectorAll(".brand-card, [data-product-list-trigger]").forEach((card) => {
1441:     document.body.classList.remove("product-list-modal-open");
1442:     modal.classList.remove("product-list-modal--page-gallery");
1443:     modal.classList.remove("product-list-modal--provider-intro");
1445:     modal.removeAttribute("data-active-product-list-title");
```

## Relevant src/styles.css lines

```text
135: .brand-kicker {
194: .brand-card p {
250: .portfolio-head {
256: .portfolio-head h2 {
262: .portfolio-title {
272: .portfolio-title-line {
280: .portfolio-title-line + .portfolio-title-line {
283: .portfolio-intro {
289: .brand-grid {
295: .brand-card {
303: .brand-card:nth-child(4),
304: .brand-card:nth-child(5) {
308: .brand-card p {
322:   .brand-grid {
326:   .brand-card,
327:   .brand-card:nth-child(4),
328:   .brand-card:nth-child(5) {
332:   .portfolio-head {
363:   .portfolio-head h2 {
382:   .brand-grid {
1081: .brand-card {
1088: .brand-card > :not(.brand-card-icon) {
1093: .brand-card-icon {
1110: .brand-card--black-opal .brand-card-icon {
1115: .brand-card--mayura-station .brand-card-icon {
1120: .brand-card--campo-grande .brand-card-icon {
1125: .brand-card--robbins-island .brand-card-icon {
1130: .brand-card--wanderer .brand-card-icon {
1135: .brand-card--robbins-island,
1136: .brand-card--wanderer {
1141:   .brand-card {
1146:   .brand-card-icon,
1147:   .brand-card--black-opal .brand-card-icon,
1148:   .brand-card--mayura-station .brand-card-icon,
1149:   .brand-card--campo-grande .brand-card-icon,
1150:   .brand-card--robbins-island .brand-card-icon,
1151:   .brand-card--wanderer .brand-card-icon {
1160:   .brand-card {
1165:   .brand-card-icon,
1166:   .brand-card--black-opal .brand-card-icon,
1167:   .brand-card--mayura-station .brand-card-icon,
1168:   .brand-card--campo-grande .brand-card-icon,
1169:   .brand-card--robbins-island .brand-card-icon,
1170:   .brand-card--wanderer .brand-card-icon {
1181: .product-list-modal.product-list-modal--provider-intro {
1185: .product-list-modal__description:empty {
1190: .product-list-modal.product-list-modal--provider-intro .product-list-modal__header {
1313: .provider-modal-intro + .product-list-section {
1317: .product-list-section + .product-list-section {
1369:   .product-list-modal.product-list-modal--provider-intro .product-list-modal__header {
1430: .product-list-modal {
1449: .product-list-modal::backdrop {
1457: .product-list-modal__panel {
1467: .product-list-modal__close {
1487: .product-list-modal__close:hover,
1488: .product-list-modal__close:focus-visible {
1494: .product-list-modal__close:active {
1498: .product-list-modal__close span {
1505: .product-list-modal__header {
1510: .product-list-modal__eyebrow {
1520: .product-list-modal__header h2 {
1530: .product-list-modal__header p:last-child {
1538: .product-list-modal__body {
1546: .product-list-modal__body::-webkit-scrollbar {
1550: .product-list-modal__body::-webkit-scrollbar-track {
1555: .product-list-modal__body::-webkit-scrollbar-thumb {
1560: .product-list-section {
1564: .product-list-section:last-child {
1568: .product-list-section h3 {
1578: .product-list-table-wrap {
1585: .product-list-table {
1593: .product-list-table th,
1594: .product-list-table td {
1601: .product-list-table tr:last-child td {
1605: .product-list-table th:last-child,
1606: .product-list-table td:last-child {
1610: .product-list-table th {
1618: .product-list-table td:first-child,
1619: .product-list-table td:nth-child(2) {
1624: .product-list-table td:first-child {
1630: .product-list-table td:nth-child(2) {
1635: .product-list-table td:nth-child(3) {
1641: .product-list-modal__external {
1655: .product-list-modal__external:hover,
1656: .product-list-modal__external:focus-visible {
1671: body.product-list-modal-open {
1676:   .product-list-modal {
1682:   .product-list-modal__panel {
1687:   .product-list-modal__header {
1691:   .product-list-modal__header h2 {
1695:   .product-list-modal__header p:last-child {
1699:   .product-list-table {
1703:   .product-list-table th,
1704:   .product-list-table td {
1710:   .product-list-modal__panel {
1714:   .product-list-modal__header {
1718:   .product-list-modal__header p:last-child {
1722:   .product-list-modal__body {
1726:   .product-list-table {
1730:   .product-list-table th,
1731:   .product-list-table td {
1735:   .product-list-table th {
1739:   .product-list-modal__external {
1748: .product-list-modal[open],
1750: .product-list-modal__panel,
1751: .product-list-modal__body {
1755: .product-list-modal__body {
1761: body.product-list-modal-open {
1803: .product-list-modal.product-list-modal--page-gallery {
1807: .product-list-modal__header--with-tabs {
1811: .product-list-guide-tabs {
1822: .product-list-guide-tabs[hidden] {
1826: .product-list-guide-tab {
1846: .product-list-guide-tab:hover,
1847: .product-list-guide-tab:focus-visible {
1854: .product-list-guide-tab.is-active {
1861:   .product-list-guide-tabs {
1867:   .product-list-guide-tab {
1874:   .product-list-guide-tabs {
1878:   .product-list-guide-tab {
1886: .product-list-modal.product-list-modal--page-gallery {
1892: .product-list-page-gallery {
1897: .product-list-page-card {
1905: .product-list-page-card img {
1912: .product-list-page-card figcaption {
1934:   .product-list-modal.product-list-modal--page-gallery {
1952:   .product-list-page-gallery {
1956:   .product-list-page-card figcaption {
2416:   .portfolio-head,
2421:   .portfolio-head .eyebrow,
2428:   .portfolio-head h2,
2434:   .portfolio-title-line + .portfolio-title-line,
2439:   .portfolio-intro,
2447:   .brand-grid {
2452:   .brand-card,
2453:   .brand-card:nth-child(4),
2454:   .brand-card:nth-child(5) {
2462:   .brand-kicker {
2468:   .brand-card h3 {
2473:   .brand-card p {
2484:   .brand-card-icon {
2551:   .portfolio-head h2,
2556:   .portfolio-intro,
2563:   .brand-grid,
2568:   .brand-card {
2574:   .brand-card h3 {
2578:   .brand-card p {
2584:   .brand-card-icon {
2980:   .about-modal .modal-close,
2983:   .modal-close {
3250:   .panel-portfolio .portfolio-head {
3254:   .panel-portfolio .portfolio-head .eyebrow {
3258:   .panel-portfolio .portfolio-head h2 {
3263:   .panel-portfolio .portfolio-title-line + .portfolio-title-line {
3267:   .panel-portfolio .portfolio-intro {
3273:   .panel-portfolio .brand-grid {
3277:   .panel-portfolio .brand-card {
3283:   .panel-portfolio .brand-card h3 {
3288:   .panel-portfolio .brand-card p {
3301:   .panel-portfolio .portfolio-head {
3305:   .panel-portfolio .portfolio-head .eyebrow {
3309:   .panel-portfolio .portfolio-head h2 {
3313:   .panel-portfolio .portfolio-intro {
3319:   .panel-portfolio .brand-grid {
3323:   .panel-portfolio .brand-card {
3329:   .panel-portfolio .brand-card h3 {
3333:   .panel-portfolio .brand-card p {
3342: .product-list-modal__eyebrow:empty {
3425: .product-list-modal.product-list-modal--provider-intro .product-list-modal__header {
3444:   .product-list-modal.product-list-modal--provider-intro .product-list-modal__header {
3624: body.product-list-modal-open .section-index,
3934: body.product-list-modal-open .global-contact-cta,
```

## Recommended next implementation target

- Preserve Section 3 layout structure.
- Remove producer name text from the visible card body only.
- Keep each card category/program label.
- Center and enlarge logos within each card.
- Preserve short descriptive copy only if it still feels balanced.
- Move official producer link from modal bottom to a refined top information row.
- Verify modal z-index still hides persistent navigation and global CTA.
