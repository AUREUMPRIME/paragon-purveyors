import { assetPath } from "./assetPath.js";
import { initFloatingBackground } from "./floatingBackground.js";
import { initForwardDepth } from "./forwardDepth.js";
import "./styles.css";
import { initSelectedCutsModal } from "./selectedCutsModal.js";
import { initGlobalContactCta } from "./globalContactCta.js";
import { cuts, producerCutLinks, producers } from "./catalogData.js";
import { initCutScrollIsolation } from "./cutScrollIsolation.js";

const app = document.getElementById("app");

if (!app) {
  throw new Error("App root not found.");
}

app.innerHTML = `
  <main class="page-shell">
    <div class="frame"></div>

    <nav class="section-index" aria-label="Section navigation">
      <button class="section-index__brand" type="button" data-section-target="hero" aria-label="Go to home section">
        <img
          src="${assetPath("assets/brand/paragon-footer-logo.svg")}"
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
      </button>

      <span class="section-index__rule" aria-hidden="true"></span>

      <div class="section-index__items">
        <button class="section-index__item is-active" type="button" data-section-target="hero" aria-current="true">
          <span class="section-index__number">1</span>
          <span class="section-index__label">Home</span>
        </button>
        <button class="section-index__item" type="button" data-section-target="about">
          <span class="section-index__number">2</span>
          <span class="section-index__label">About</span>
        </button>
        <button class="section-index__item" type="button" data-section-target="producers">
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
                    <article class="brand-card brand-card--black-opal brand-card--logo-led" data-producer-id="black-opal" data-product-list-trigger="Black Opal" aria-label="Open Black Opal producer details">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/black-opal_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">F1 Australian Wagyu</span>
            <h3 class="brand-card__sr-name">Black Opal</h3>
            <p>Australian Wagyu chosen for rich marbling and a refined eating profile.</p>
          </article>

                    <article class="brand-card brand-card--mayura-station brand-card--logo-led" data-producer-id="mayura-station" data-product-list-trigger="Mayura Station" aria-label="Open Mayura Station producer details">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/mayura-station_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">Full-Blood Australian Wagyu</span>
            <h3 class="brand-card__sr-name">Mayura Station</h3>
            <p>Distinctive Wagyu selected for depth, consistency, and character.</p>
          </article>

                    <article class="brand-card brand-card--campo-grande brand-card--logo-led" data-producer-id="campo-grande" data-product-list-trigger="Campo Grande" aria-label="Open Campo Grande producer details">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/campo-grande_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">Spanish Ibérico Pork</span>
            <h3 class="brand-card__sr-name">Campo Grande</h3>
            <p>Premium Ibérico pork known for depth of flavor and remarkable texture.</p>
          </article>

                    <article class="brand-card brand-card--robbins-island brand-card--logo-led" data-producer-id="robbins-island" data-product-list-trigger="Robbins Island" aria-label="Open Robbins Island producer details">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/robbins-island_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">Pure Blood Tasmanian Wagyu</span>
            <h3 class="brand-card__sr-name">Robbins Island</h3>
            <p>Tasmanian Wagyu selected for provenance, marbling, and balance.</p>
          </article>

                    <article class="brand-card brand-card--wanderer brand-card--logo-led" data-producer-id="wanderer" data-product-list-trigger="Wanderer" aria-label="Open Wanderer producer details">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/wanderer_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">Free-Range Barley-Fed Beef</span>
            <h3 class="brand-card__sr-name">Wanderer</h3>
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

          <!-- SECTION_4_CUT_SCROLL_START -->

                    <div class="cut-scroll" aria-label="Selected cuts catalog">

          <article class="cut-card cut-card--all-cuts" data-cut-id="all-cuts" data-product-list-trigger="All Cuts">
            <span class="cut-card-shade" aria-hidden="true"></span>
            <h3>All Cuts</h3>
            <p class="cut-card-description">View the complete visual cut reference.</p>
          </article>

          <article class="cut-card cut-card--ribeye" data-cut-id="ribeye" data-selected-cut-trigger="Ribeye">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/ribeye.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Beef / Wagyu</p>
            <h3>Ribeye</h3>
          </article>

          <article class="cut-card cut-card--tenderloin" data-cut-id="tenderloin" data-selected-cut-trigger="Tenderloin">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/tenderloin.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Beef / Wagyu / Pork</p>
            <h3>Tenderloin</h3>
          </article>

          <article class="cut-card cut-card--striploin" data-cut-id="striploin" data-selected-cut-trigger="Striploin">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/striploin.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Beef / Wagyu</p>
            <h3>Striploin</h3>
          </article>

          <article class="cut-card cut-card--tomahawk" data-cut-id="tomahawk" data-selected-cut-trigger="Tomahawk">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/tomahawk.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Beef / Wagyu</p>
            <h3>Tomahawk</h3>
          </article>

          <article class="cut-card cut-card--presa" data-cut-id="presa" data-selected-cut-trigger="Presa">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/presa.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Pork</p>
            <h3>Presa</h3>
          </article>

          <article class="cut-card cut-card--secreto" data-cut-id="secreto" data-selected-cut-trigger="Secreto">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/secreto.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Pork</p>
            <h3>Secreto</h3>
          </article>

          <article class="cut-card cut-card--rump-cap" data-cut-id="rump-cap" data-selected-cut-trigger="Rump Cap">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/rump-cap.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Beef / Wagyu</p>
            <h3>Picanha</h3>
          </article>

          <article class="cut-card cut-card--short-rib" data-cut-id="short-rib" data-selected-cut-trigger="Short Rib">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/short-rib.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Beef / Wagyu</p>
            <h3>Short Rib</h3>
          </article>

          <!-- SELECTED_CUTS_BATCH_1_START -->

          <article class="cut-card cut-card--placeholder cut-card--chuck-roll" data-cut-id="chuck-roll" data-selected-cut-trigger="Chuck Roll">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/placeholder-cut.svg")}"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Wagyu</p>
            <h3>Chuck Roll</h3>
          </article>

          <article class="cut-card cut-card--placeholder cut-card--shortloin" data-cut-id="shortloin" data-selected-cut-trigger="Shortloin">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/placeholder-cut.svg")}"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Wagyu</p>
            <h3>Shortloin</h3>
          </article>

          <article class="cut-card cut-card--placeholder cut-card--flap-meat" data-cut-id="flap-meat" data-selected-cut-trigger="Flap Meat">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/placeholder-cut.svg")}"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Beef / Wagyu</p>
            <h3>Flap Meat</h3>
          </article>

          <article class="cut-card cut-card--placeholder cut-card--flank-steak" data-cut-id="flank-steak" data-selected-cut-trigger="Flank Steak">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/placeholder-cut.svg")}"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Beef / Pork</p>
            <h3>Flank Steak</h3>
          </article>

          <article class="cut-card cut-card--placeholder cut-card--tri-tip" data-cut-id="tri-tip" data-selected-cut-trigger="Tri Tip">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/placeholder-cut.svg")}"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Beef / Wagyu</p>
            <h3>Tri Tip</h3>
          </article>

          <article class="cut-card cut-card--placeholder cut-card--top-sirloin" data-cut-id="top-sirloin" data-selected-cut-trigger="Top Sirloin">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/placeholder-cut.svg")}"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Beef / Wagyu</p>
            <h3>Top Sirloin</h3>
          </article>

          <article class="cut-card cut-card--placeholder cut-card--oyster-blade" data-cut-id="oyster-blade" data-selected-cut-trigger="Oyster Blade">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/placeholder-cut.svg")}"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Wagyu</p>
            <h3>Oyster Blade</h3>
          </article>

          <article class="cut-card cut-card--placeholder cut-card--chuck-tail-flap cut-card--long-title" data-cut-id="chuck-tail-flap" data-selected-cut-trigger="Chuck Tail Flap">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/placeholder-cut.svg")}"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Beef / Wagyu</p>
            <h3>Chuck Tail Flap</h3>
          </article>

          <!-- SELECTED_CUTS_BATCH_1_END -->

          <!-- SELECTED_CUTS_BATCH_2_START -->

          <article class="cut-card cut-card--placeholder cut-card--iberico-abanico" data-cut-id="iberico-abanico" data-selected-cut-trigger="Iberico Abanico">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/placeholder-cut.svg")}"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Pork</p>
            <h3>Abanico</h3>
          </article>

          <article class="cut-card cut-card--placeholder cut-card--iberico-pluma" data-cut-id="iberico-pluma" data-selected-cut-trigger="Iberico Pluma">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/placeholder-cut.svg")}"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Pork</p>
            <h3>Pluma</h3>
          </article>

          <article class="cut-card cut-card--placeholder cut-card--iberico-coppa" data-cut-id="iberico-coppa" data-selected-cut-trigger="Iberico Coppa">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/placeholder-cut.svg")}"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Pork</p>
            <h3>Coppa</h3>
          </article>

          <article class="cut-card cut-card--placeholder cut-card--iberico-loin-roast" data-cut-id="iberico-loin-roast" data-selected-cut-trigger="Iberico Loin Roast">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/placeholder-cut.svg")}"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Pork</p>
            <h3>Loin Roast</h3>
          </article>

          <article class="cut-card cut-card--placeholder cut-card--iberico-4-rib-rack" data-cut-id="iberico-4-rib-rack" data-selected-cut-trigger="Iberico 4 Rib-Rack">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/placeholder-cut.svg")}"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Pork</p>
            <h3>4 Rib-Rack</h3>
          </article>

          <article class="cut-card cut-card--placeholder cut-card--iberico-st-louis-ribs cut-card--long-title" data-cut-id="iberico-st-louis-ribs" data-selected-cut-trigger="Iberico St. Louis Ribs">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/placeholder-cut.svg")}"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Pork</p>
            <h3>St. Louis Ribs</h3>
          </article>

          <article class="cut-card cut-card--placeholder cut-card--iberico-pork-belly" data-cut-id="iberico-pork-belly" data-selected-cut-trigger="Iberico Pork Belly">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/placeholder-cut.svg")}"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Pork</p>
            <h3>Pork Belly</h3>
          </article>

          <article class="cut-card cut-card--placeholder cut-card--iberico-shoulder-picnic cut-card--long-title" data-cut-id="iberico-shoulder-picnic" data-selected-cut-trigger="Iberico Shoulder Picnic">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/placeholder-cut.svg")}"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div class="cut-card-shade"></div>
            <p class="cut-card-description">Pork</p>
            <h3>Shoulder Picnic</h3>
          </article>

          <!-- SELECTED_CUTS_BATCH_2_END -->

                    </div>

                    <!-- SECTION_4_CUT_SCROLL_END -->

<!-- SELECTED_CUTS_BATCH_2_END -->

</div>
      </div>
    </section>
          <section id="inquiry" class="scene scene-inquiry" aria-labelledby="inquiry-title" data-section-name="Inquiry">
      <div class="scene-glow scene-glow-soft"></div>

      <div class="panel panel-inquiry">
        <div class="inquiry-head">
          <p class="eyebrow">Inquiry</p>
          <h2 id="inquiry-title" class="inquiry-title">
            <span class="inquiry-title-line">Contact</span>
            <span class="inquiry-title-line">Paragon Purveyors.</span>
          </h2>
          <p class="body-copy inquiry-intro">
            For additional information regarding producers, selected cuts, and availability, please get in touch directly.
          </p>

          <div class="inquiry-details" aria-label="Contact details mockup">
            <div class="inquiry-detail-card">
              <span class="inquiry-detail-label">Email</span>
              <strong class="inquiry-detail-value">Email address to be added</strong>
            </div>

            <div class="inquiry-detail-card">
              <span class="inquiry-detail-label">Direct Line</span>
              <strong class="inquiry-detail-value">Clayton U. — +1 (949) 514-3127</strong>
            </div>

            <div class="inquiry-detail-card">
              <span class="inquiry-detail-label">Second Contact</span>
              <strong class="inquiry-detail-value">Name and phone number to be added</strong>
            </div>
          </div>
        </div>
      </div>
    </section>

                              <footer class="site-footer" role="contentinfo" aria-label="Paragon Purveyors footer">
        <img
          class="site-footer-logo"
          src="${assetPath("assets/brand/paragon-footer-logo.svg")}"
          alt="Paragon Purveyors"
        />
      </footer>
    </main>
`;


function initHeroButtonFeedback() {
  document.querySelectorAll(".hero-actions .button").forEach((button) => {
    if (button.dataset.feedbackReady === "true") {
      return;
    }

    button.dataset.feedbackReady = "true";

    const clearPressed = () => {
      button.classList.remove("is-pressed");
    };

    button.addEventListener("pointerdown", () => {
      button.classList.add("is-pressed");
    });

    button.addEventListener("pointerup", clearPressed);
    button.addEventListener("pointercancel", clearPressed);
    button.addEventListener("pointerleave", clearPressed);
    button.addEventListener("blur", clearPressed);
  });
}

// ABOUT_MODAL_START
(() => {
  const modalContent = `
    <div class="about-modal__panel">
      <button class="about-modal__close" type="button" aria-label="Close About panel" data-about-close>
        <span aria-hidden="true">×</span>
      </button>

      <div class="about-modal__layout">
        <section class="about-modal__copy">
          <h2 id="about-modal-title">About Paragon Purveyors</h2>

          <p>Paragon Purveyors connects discerning buyers with exceptional meats from carefully selected producers.</p>

          <p>Built on trusted industry relationships, Paragon focuses on access, quality, and guidance rather than volume or noise. The company works with premium producers whose products are chosen for provenance, consistency, eating quality, and the ability to elevate a menu, a table, or a special offering.</p>

          <p>The approach is personal and practical. Clients are introduced to a focused selection of Wagyu, beef, pork, and fine provisions with clear recommendations, thoughtful sourcing, and attention to value. The goal is simple: make exceptional products easier to understand, easier to source, and easier to choose with confidence.</p>

          <p>Paragon Purveyors exists for chefs, restaurants, buyers, and private clients who want premium quality without unnecessary complexity. Every introduction is handled with care, and every product is selected with purpose.</p>
        </section>

        <aside class="about-modal__brand" aria-label="Paragon Purveyors logo">
          <img
            class="about-modal__logo"
            src="${assetPath("assets/brand/paragon-footer-logo.svg")}"
            alt="Paragon Purveyors"
          />
        </aside>
      </div>
    </div>
  `;

  let modal = document.getElementById("about-modal");

  if (!modal) {
    modal = document.createElement("dialog");
    modal.id = "about-modal";
    document.body.appendChild(modal);
  }

  modal.className = "about-modal";
  modal.setAttribute("aria-labelledby", "about-modal-title");
  modal.innerHTML = modalContent;

  const closeButton = modal.querySelector("[data-about-close]");
  const panel = modal.querySelector(".about-modal__panel");

  const openModal = () => {
    document.body.classList.add("about-modal-open");

    if (typeof modal.showModal === "function" && !modal.open) {
      modal.showModal();
      return;
    }

    modal.setAttribute("open", "");
  };

  const closeModal = () => {
    document.body.classList.remove("about-modal-open");

    if (typeof modal.close === "function" && modal.open) {
      modal.close();
      return;
    }

    modal.removeAttribute("open");
  };

  const triggerSet = new Set([
    ...document.querySelectorAll("[data-about-trigger]"),
    ...document.querySelectorAll('footer a[href="#about"]'),
    ...document.querySelectorAll(".site-footer"),
    ...document.querySelectorAll(".site-footer-logo"),
    ...document.querySelectorAll("footer img"),
  ]);

  triggerSet.forEach((trigger) => {
    trigger.setAttribute("data-about-trigger", "true");
    trigger.setAttribute("aria-label", "Open About Paragon Purveyors");
    trigger.style.pointerEvents = "auto";
    trigger.style.cursor = "pointer";

    if (!["A", "BUTTON"].includes(trigger.tagName)) {
      trigger.setAttribute("role", "button");
      trigger.setAttribute("tabindex", "0");
    }

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal();
      }
    });
  });

  closeButton?.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (panel && !panel.contains(event.target)) {
      closeModal();
    }
  });

  modal.addEventListener("close", () => {
    document.body.classList.remove("about-modal-open");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.open) {
      closeModal();
    }
  });
})();
// ABOUT_MODAL_END
// OWNERS_MODAL_START
(() => {
  const modalContent = `
    <div class="about-modal__panel owners-modal__panel">
      <button class="about-modal__close" type="button" aria-label="Close owners panel" data-owners-close>
        <span aria-hidden="true">×</span>
      </button>

      <div class="about-modal__layout owners-modal__layout">
        <section class="about-modal__copy owners-modal__copy">
          <p class="about-modal__eyebrow">About Paragon Purveyors</p>
          <h2 id="owners-modal-title">Meet the Owners</h2>

          <p class="owners-modal__established">Established in 2026</p>

          <p>This panel is reserved for the approved Paragon Purveyors owner story.</p>

          <p>Final owner names, portraits, and company history will be added after the client provides approved copy and imagery.</p>

          <p>The final version should remain personal, refined, and concise while preserving the premium tone of the page.</p>
        </section>

        <aside class="about-modal__brand owners-modal__brand" aria-label="Paragon Purveyors logo">
          <img
            class="about-modal__logo"
            src="${assetPath("assets/brand/paragon-footer-logo.svg")}"
            alt="Paragon Purveyors"
          />
        </aside>
      </div>
    </div>
  `;

  let modal = document.getElementById("owners-modal");

  if (!modal) {
    modal = document.createElement("dialog");
    modal.id = "owners-modal";
    document.body.appendChild(modal);
  }

  modal.className = "about-modal owners-modal";
  modal.setAttribute("aria-labelledby", "owners-modal-title");
  modal.innerHTML = modalContent;

  const closeButton = modal.querySelector("[data-owners-close]");
  const panel = modal.querySelector(".about-modal__panel");

  const openModal = () => {
    document.body.classList.add("about-modal-open");

    if (typeof modal.showModal === "function" && !modal.open) {
      modal.showModal();
      return;
    }

    modal.setAttribute("open", "");
  };

  const closeModal = () => {
    document.body.classList.remove("about-modal-open");

    if (typeof modal.close === "function" && modal.open) {
      modal.close();
      return;
    }

    modal.removeAttribute("open");
  };

  document.querySelectorAll("[data-owners-trigger]").forEach((trigger) => {
    trigger.style.pointerEvents = "auto";
    trigger.style.cursor = "pointer";

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal();
      }
    });
  });

  closeButton?.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (panel && !panel.contains(event.target)) {
      closeModal();
    }
  });

  modal.addEventListener("close", () => {
    document.body.classList.remove("about-modal-open");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.open) {
      closeModal();
    }
  });
})();
// OWNERS_MODAL_END

initSelectedCutsModal();
initHeroButtonFeedback();
initGlobalContactCta();
requestAnimationFrame(() => {
  initCutScrollIsolation();
initForwardDepth();
});
requestAnimationFrame(() => {
  initFloatingBackground();
});


// PRODUCT_LIST_MODAL_START
(() => {
  const productLists = {
    "Black Opal": {
      eyebrow: "Australian Wagyu",
      title: "Black Opal",
      // PROVIDER_INTRO_BLACK_OPAL_START
      providerIntro: {
        logo: assetPath("assets/provider-logos/modal/black-opal_modal_logo.png"),
        logoAlt: "Black Opal logo",
        bannerImage: assetPath("assets/provider-banners/black-opal-banner.png"),
        bannerLabel: "Consistency · Quality · Supply",
        copy: "Black Opal is selected for consistency: refined Australian Wagyu with generous marbling, a balanced eating profile, and dependable year-round supply. Raised through a disciplined long-term program in Victoria and Tasmania, it gives Paragon a reliable foundation for premium Wagyu across a range of marble scores.",
        tags: ["Australian Wagyu", "380+ Days Grain Fed", "Consistent Supply"],
        websiteCopy: "For additional information on Black Opal Wagyu, visit the producer's official brand page.",
        websiteLabel: "Visit Black Opal",
        websiteUrl: "https://www.haafco.com/black-opal-wagyu",
      },
      // PROVIDER_INTRO_BLACK_OPAL_END
      description: "",
      pdf: assetPath("assets/product-lists/PP_australian_wagyu.pdf"),
      sections: [
        {
          title: "Marbling Score 4-9+",
          rows: [
            ["4166", "Outside Skirt", "10/2# AVG. ~ 21# CS"],
            ["4167", "Hanging Tender", "10/2.6# AVG. ~ 26# CS"],
            ["4168", "Tail", "8/2.75# AVG. ~ 22# CS"],
          ],
        },
        {
          title: "Marbling Score 4-5",
          rows: [
            ["14101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
            ["14125", "Brisket", "2/15# AVG. ~ 30# CS"],
            ["14117", "Flap Meat", "8/4.5# AVG. ~ 36# CS"],
            ["14135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
            ["14142", "Chuck Tail Flap", "3/13# AVG. ~ 40# CS"],
            ["14116", "Tri Tip", "16/2.25# AVG. ~ 36# CS"],
            ["14104", "Striploin", "3/13# AVG. ~ 40# CS"],
            ["14107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
          ],
        },
        {
          title: "Marbling Score 6-7",
          rows: [
            ["24101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
            ["24102", "Export Rib", "2/9# AVG. ~ 18# CS"],
            ["24104", "Striploin", "3/13# AVG. ~ 40# CS"],
            ["24105", "Shortloin", "1/28# AVG. ~ 28# CS"],
            ["24107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
            ["24116", "Tri Tip", "16/2.25# AVG. ~ 36# CS"],
            ["24117", "Flap Meat", "8/4.5# AVG. ~ 36# CS"],
            ["24124", "Rump Cap", "8/3.5# AVG. ~ 28# CS"],
            ["24129", "Chuck Eye Roll", "2/20# AVG. ~ 40# CS"],
            ["24131", "Bolar Blade", "2/11# AVG. ~ 22# CS"],
            ["24135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
            ["24142", "Chuck Tail Flap", "12/2.5# AVG. ~ 30# CS"],
            ["24125", "Brisket", "2/15# AVG. ~ 30# CS"],
            ["24120", "Top Round", "2/15# AVG. ~ 30# CS"],
            ["24123", "Top Sirloin", "4/8# AVG. ~ 32# CS"],
            ["24130", "Inside Skirt", "8/3.5# AVG. ~ 28# CS"],
            ["24160", "Eye Round", "6/5# AVG. ~ 30# CS"],
            ["24115", "Flank", "16/2.25# AVG. ~ 36# CS"],
          ],
        },
        {
          title: "Marbling Score 8-9",
          rows: [
            ["34142", "Chuck Tail Flap", "12/2.5# AVG. ~ 30# CS"],
            ["34101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
            ["34104", "Striploin", "3/13# AVG. ~ 40# CS"],
            ["34107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
            ["34116", "Tri Tip", "16/2.25# AVG. ~ 36# CS"],
            ["34117", "Flap Meat", "8/4.5# AVG. ~ 36# CS"],
            ["34123", "Top Sirloin", "4/8# AVG. ~ 32# CS"],
            ["34124", "Rump Cap", "8/3.5# AVG. ~ 28# CS"],
            ["34125", "Brisket", "2/15# AVG. ~ 30# CS"],
            ["34129", "Chuck Roll", "2/20# AVG. ~ 40# CS"],
            ["34135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
            ["34160", "Eye Round", "6/5# AVG. ~ 30# CS"],
            ["34150", "Ribeye Cap (Lifter)", "32/0.9# AVG. ~ 30# CS"],
          ],
        },
      ],
    },
    "Mayura Station": {
      eyebrow: "Full-Blood Wagyu",
      title: "Mayura Station",
      // PROVIDER_INTRO_MAYURA_STATION_START
      providerIntro: {
        logo: assetPath("assets/provider-logos/modal/mayura-station_modal_logo.png"),
        logoAlt: "Mayura Station logo",
        bannerImage: assetPath("assets/provider-banners/mayura-station-banner.png"),
        bannerLabel: "Depth · Control · Character",
        copy: "Mayura Station is selected for depth, control, and unmistakable full-blood Wagyu character. Raised on a family-owned station in South Australia's Limestone Coast, its cattle are managed through a highly controlled program designed for richness, consistency, and a distinctive luxury eating profile.",
        tags: ["Full-Blood Wagyu", "Limestone Coast", "Signature Feeding Program"],
        websiteCopy: "For additional information on Mayura Station Wagyu, visit the producer's official brand page.",
        websiteLabel: "Visit Mayura Station",
        websiteUrl: "https://www.mayurastation.com",
      },
      // PROVIDER_INTRO_MAYURA_STATION_END
      description: "",
      pdf: assetPath("assets/product-lists/PP_full_blood_wagyu.pdf"),
      sections: [
        {
          title: "Marbling Score 8-9",
          rows: [
            ["27925", "Brisket Pedo", "3/13# AVG. ~ 39# CS"],
            ["27972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
          ],
        },
        {
          title: "Marbling Score 9+",
          rows: [
            ["37904", "Striploin", "2/19# AVG. ~ 37# CS"],
            ["37905", "Tenderloin", "4/7# AVG. ~ 30# CS"],
            ["37907", "Ribeye", "4/9# AVG. ~ 38# CS"],
            ["37972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
            ["37974", "Bone-In Striploin", "1/40# AVG. ~ 40# CS"],
            ["37925", "Brisket Pedo", "3/13# AVG. ~ 39# CS"],
            ["37932", "Oyster Blade", "8/6# AVG. ~ 49# CS"],
            ["37942", "Chuck Tail Flap", "12/3# AVG. ~ 35# CS"],
            ["37924", "Rump Cap (Culotte)", "8/4# AVG. ~ 34# CS"],
            ["37916", "Tri Tip", "12/3# AVG. ~ 33# CS"],
            ["37917", "Flap Meat", "8/4# AVG. ~ 35# CS"],
            ["37973", "3 Rib Export", "2/13# AVG. ~ 26# CS"],
            ["37975", "Shortloin", "1/22# AVG. ~ 22# CS"],
          ],
        },
      ],
    },
    "Campo Grande": {
      eyebrow: "Ibérico Pork",
      title: "Campo Grande",
      // PROVIDER_INTRO_CAMPO_GRANDE_START
      providerIntro: {
        logo: assetPath("assets/provider-logos/modal/campo-grande_modal_logo.png"),
        logoAlt: "Campo Grande logo",
        bannerImage: assetPath("assets/provider-banners/campo-grande-banner.png"),
        bannerLabel: "Heritage · Marbling · Flavor",
        copy: "Campo Grande is selected for its expressive Spanish Ibérico character: heirloom pigs, deep marbling, and a rich, savory eating profile that gives chefs a pork program with the presence of a luxury steak. Raised through family-owned farms in southern and western Spain, it brings heritage, flavor, and distinction to the Paragon portfolio.",
        tags: ["Spanish Ibérico", "Family-Owned Farms", "Heirloom Breed"],
        websiteCopy: "For additional information on Campo Grande Ibérico pork, visit the producer's official brand page.",
        websiteLabel: "Visit Campo Grande",
        websiteUrl: "https://eatcampogrande.com/",
      },
      // PROVIDER_INTRO_CAMPO_GRANDE_END
      description: "",
      pdf: assetPath("assets/product-lists/PP_iberico_pork.pdf"),
      sections: [
        {
          title: "Fresh Ibérico Pork Cuts",
          rows: [
            ["FP01", "Secreto", "16/1.1# AVG. ~ 17.5# CS"],
            ["FP02", "Presa", "12/1.54# AVG. ~ 18.5# CS"],
            ["FP03", "Albanico", "18/1.1# AVG. ~ 19.8# CS"],
            ["FP04", "Pluma", "12/1.5# AVG. ~ 18.5# CS"],
            ["FP05", "4-Rib Rack", "6/2.1# AVG. ~ 13# CS"],
            ["FP06", "Belly", "12/1.25# AVG. ~ 15# CS"],
            ["FP07", "Loin Roast", "12/1.25# AVG. ~ 15# CS"],
            ["FP08", "Coppa", "8/2.3# AVG. ~ 18# CS"],
            ["FP09", "St. Louis Rib", "6/1.8# AVG. ~ 11# CS"],
            ["FP10", "Flank Steak", "18/1.2# AVG. ~ 21# CS"],
            ["FP14", "Skirt Steak", "18/1.1# AVG. ~ 20# CS"],
            ["FP15", "Jowl Secreto", "16/0.5# AVG. ~ 8# CS"],
            ["FP16", "Belly Secreto", "14/1.3# AVG. ~ 18# CS"],
            ["FP18", "Tenderloin", "24/0.8# AVG. ~ 19.2# CS"],
            ["FP21", "Picnic Shoulder", "2/16# AVG. ~ 32# CS"],
            ["FP12", "Trim 70-80VL", "3/6# AVG. ~ 21# CS"],
          ],
        },
        {
          title: "Cured Retail List",
          rows: [
            ["CPL01", "Paleta Shoulder Ham 2PC (Chilled) B/I Whole", "2/12# AVG. ~ 24# CS"],
            ["CPS01", "Salchichon Sliced 2OZ", "12/2 OZ AVG. ~ 1.5# CS"],
            ["CPS02", "Chorizo Sliced 2OZ", "12/2 OZ AVG. ~ 1.5# CS"],
            ["CPS03", "Coppa Sliced 2OZ", "12/2 OZ AVG. ~ 1.5# CS"],
            ["CPSO5", "Paleta Sliced 2OZ", "12/2 OZ AVG. ~ 1.4# CS"],
            ["CPS06", "Bacon Sliced 12OZ", "12/12 OZ AVG. ~ 9# CS"],
            ["GPB01", "Ibérico & Wagyu Ground 4OZ", "24/14 OZ AVG. ~ 121# CS"],
            ["CPB05", "Paleta Sliced 1# Tray", "8/1# AVG. ~ 8# CS"],
          ],
        },
      ],
    },
    "Robbins Island": {
      eyebrow: "Tasmanian Wagyu",
      title: "Robbins Island",
      // PROVIDER_INTRO_ROBBINS_ISLAND_START
      providerIntro: {
        logo: assetPath("assets/provider-logos/modal/robbins-island_modal_logo.png"),
        logoAlt: "Robbins Island logo",
        bannerImage: assetPath("assets/provider-banners/robbins-island-banner.png"),
        bannerLabel: "Island · Terroir · Rarity",
        copy: "Robbins Island is selected for rarity, terroir, and unmistakable Tasmanian Wagyu character. Set off Tasmania's northwest coast, its cattle graze through saltwater channels in a pristine island environment before a long grain finish, creating a distinctive balance of clean origin, elite genetics, and high-marbling depth.",
        tags: ["Tasmanian Fullblood Wagyu", "18 Months on Pasture", "450+ Day Grain Finish"],
        websiteCopy: "For additional information on Robbins Island Wagyu, visit the producer's official brand page.",
        websiteLabel: "Visit Robbins Island",
        websiteUrl: "https://www.robbinsislandwagyu.com.au/",
      },
      // PROVIDER_INTRO_ROBBINS_ISLAND_END
      description: "",
      pdf: assetPath("assets/product-lists/PP_tasmanian_wagyu.pdf"),
      sections: [
        {
          title: "Marble Score 7-8+",
          rows: [
            ["22061W", "Flap Meat", "6/5# AVG. ~ 30# CS"],
            ["16022W", "OP Ribs", "2/12# AVG. ~ 24# CS"],
            ["1602TW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
            ["21102W", "Top Sirloin", "3/16# AVG. ~ 48# CS"],
            ["21602W", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
            ["22101W", "Flank", "9/3# AVG. ~ 36# CS"],
            ["22402W", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
            ["2266GS", "Chuck Tail Flap", "5/7# AVG. ~ 35# CS"],
            ["23032W", "Top Blade", "6/5# AVG. ~ 30# CS"],
            ["21311W", "Tri Tip", "12/3# AVG. ~ 36# CS"],
            ["21402W", "Striploin", "2/15# AVG. ~ 30# CS"],
            ["23501W", "Pedo Brisket", "3/16# AVG. ~ 48# CS"],
          ],
        },
        {
          title: "Marble Score 9+",
          rows: [
            ["16025W", "OP Ribs", "2/12# AVG. ~ 24# CS"],
            ["1602RW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
            ["20009T", "Topside", "4/12# AVG. ~ 36# CS"],
            ["20409T", "Eye Round", "6.8/5# AVG. ~ 38# CS"],
            ["20919T", "Top Sirloin Rump Cap On", "6/3# AVG. ~ 18# CS"],
            ["21409T", "Striploin", "2/15# AVG. ~ 30# CS"],
            ["22409T", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
            ["23029T", "Clod Heart", "5/7# AVG. ~ 35# CS"],
            ["23509T", "Pedo Brisket", "3/16# AVG. ~ 48# CS"],
            ["20709T", "Knuckle", "3/14# AVG. ~ 44# CS"],
            ["21109T", "Rost Biff CC Sirloin", "5/7# AVG. ~ 35# CS"],
            ["21609T", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
          ],
        },
      ],
    },
    // ALL_CUTS_PRODUCT_LIST_START
    "All Cuts": {
      eyebrow: "",
      title: "All Cuts",
      description: "A refined visual guide of cuts, with clear references, specifications, and preparation notes for each selection.",
      layout: "page-gallery",
      defaultGuideKey: "wagyu",
      guides: [
        {
          key: "wagyu",
          label: "Wagyu",
          pdf: assetPath("assets/product-lists/PP_all_cuts_guide.pdf"),
          layout: "page-gallery",
          pages: [
            { title: "Bolar Blade", src: assetPath("assets/all-cuts/pages/all-cuts-01.webp") },
            { title: "Chuck Eye Roll", src: assetPath("assets/all-cuts/pages/all-cuts-02.webp") },
            { title: "Chuck Tail Flap", src: assetPath("assets/all-cuts/pages/all-cuts-03.webp") },
            { title: "D-Rump", src: assetPath("assets/all-cuts/pages/all-cuts-04.webp") },
            { title: "Eye Round", src: assetPath("assets/all-cuts/pages/all-cuts-05.webp") },
            { title: "Flank Steak", src: assetPath("assets/all-cuts/pages/all-cuts-06.webp") },
            { title: "Flap Meat", src: assetPath("assets/all-cuts/pages/all-cuts-07.webp") },
            { title: "Inside Skirt", src: assetPath("assets/all-cuts/pages/all-cuts-08.webp") },
            { title: "Intercostals Long", src: assetPath("assets/all-cuts/pages/all-cuts-09.webp") },
            { title: "Navel End Brisket", src: assetPath("assets/all-cuts/pages/all-cuts-10.webp") },
            { title: "OP Ribs", src: assetPath("assets/all-cuts/pages/all-cuts-11.webp") },
            { title: "Oyster Blade", src: assetPath("assets/all-cuts/pages/all-cuts-12.webp") },
            { title: "Rib Eye Cap", src: assetPath("assets/all-cuts/pages/all-cuts-13.webp") },
            { title: "Rostbiff", src: assetPath("assets/all-cuts/pages/all-cuts-14.webp") },
            { title: "Rump Cap", src: assetPath("assets/all-cuts/pages/all-cuts-15.webp") },
            { title: "Short Loin", src: assetPath("assets/all-cuts/pages/all-cuts-16.webp") },
            { title: "Striploin", src: assetPath("assets/all-cuts/pages/all-cuts-17.webp") },
            { title: "Tenderloin Side Strap Off", src: assetPath("assets/all-cuts/pages/all-cuts-18.webp") },
            { title: "Tomahawk", src: assetPath("assets/all-cuts/pages/all-cuts-19.webp") },
            { title: "Topside Cap Off", src: assetPath("assets/all-cuts/pages/all-cuts-20.webp") },
            { title: "Tri Tip", src: assetPath("assets/all-cuts/pages/all-cuts-21.webp") },
            { title: "Thick Skirt", src: assetPath("assets/all-cuts/pages/all-cuts-22.webp") },
            { title: "Thin Skirt", src: assetPath("assets/all-cuts/pages/all-cuts-23.webp") },
            { title: "Cheek", src: assetPath("assets/all-cuts/pages/all-cuts-24.webp") },
            { title: "Tail", src: assetPath("assets/all-cuts/pages/all-cuts-25.webp") },
            { title: "Tongue", src: assetPath("assets/all-cuts/pages/all-cuts-26.webp") },
          ],
        },
        {
          key: "pork",
          label: "Pork",
          pdf: assetPath("assets/product-lists/PP_pork_cuts_guide.pdf"),
          layout: "page-gallery",
          pages: [
            { title: "Iberico Secreto", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-01.webp") },
            { title: "Iberico Presa", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-02.webp") },
            { title: "Iberico Abanico", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-03.webp") },
            { title: "Iberico Pluma", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-04.webp") },
            { title: "Iberico 4 Rib-Rack", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-05.webp") },
            { title: "Iberico Loin Roast", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-06.webp") },
            { title: "Iberico Coppa", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-07.webp") },
            { title: "Iberico St. Louis Ribs", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-08.webp") },
            { title: "Iberico Flank Steak", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-09.webp") },
            { title: "Iberico Skirt Steak", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-10.webp") },
            { title: "Iberico Jowl Secreto", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-11.webp") },
            { title: "Iberico Pork Belly Secreto", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-12.webp") },
            { title: "Iberico Pork Belly", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-13.webp") },
            { title: "Iberico Solomillo Tenderloin", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-14.webp") },
            { title: "Iberico Shoulder Picnic", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-15.webp") },
          ],
        },
      ],
    },
    // ALL_CUTS_PRODUCT_LIST_END
    Wanderer: {
      eyebrow: "Free Range Barley Fed Beef",
      title: "Wanderer",
      // PROVIDER_INTRO_WANDERER_START
      providerIntro: {
        logo: assetPath("assets/provider-logos/modal/wanderer_modal_logo.png"),
        logoAlt: "Wanderer logo",
        bannerImage: assetPath("assets/provider-banners/wanderer-banner.png"),
        bannerLabel: "Free-Range · Barley-Fed · Dependable",
        copy: "Wanderer is selected for a distinctive balance of free-range husbandry and barley-fed consistency. Its cattle roam open paddocks while accessing barley through an innovative mobile feeding system, giving chefs the richness, tenderness, and dependable quality of barley-fed beef without the use of intensive feedlots.",
        tags: ["Free-Range Beef", "Barley-Fed Quality", "No Intensive Feedlots"],
        websiteCopy: "For additional information on Wanderer Beef, visit the producer's official brand page.",
        websiteLabel: "Visit Wanderer",
        websiteUrl: "https://www.wandererbeef.com.au/",
      },
      // PROVIDER_INTRO_WANDERER_END
      description: "",
      pdf: assetPath("assets/product-lists/PP_free_range_barley_beef.pdf"),
      sections: [
        {
          title: "Free Range Barley Fed Beef",
          rows: [
            ["2091XA", "Rump Cap", "6/5# AVG. ~ 30# CS"],
            ["2110XA", "Top Sirloin", "6/6# AVG. ~ 36# CS"],
            ["1688XA", "Short Rib 3-Rib", "12/4# AVG. ~ 48# CS"],
            ["2140XA", "Striploin 11LB+", "3/12# AVG. ~ 36# CS"],
            ["1562XA", "B/In Striploin Vac", "3/12# AVG. ~ 36# CS"],
            ["2210XA", "Flank Steak", "12/1.5# AVG. ~ 36# CS"],
            ["2180XA", "Hanging Tender", "14/1# AVG. ~ 28# CS"],
            ["2303XA", "Flat Iron", "4/9# AVG. ~ 36# CS"],
            ["2302XA", "Bolar Blade", "4/11# AVG. ~ # CS"],
            ["2001XA", "Top Round", "3/13# AVG. ~ 39# CS"],
            ["2050XA", "Outside Flat", "3/11# AVG. ~ 33# CS"],
            ["2040XA", "Eye Round", "5/4.5# AVG. ~ 45# CS"],
            ["2350XA", "Brisket Pedo", "4/9# AVG. ~ 36# CS"],
            ["2340XA", "Navel Brisket", "4/9# AVG. ~ 36# CS"],
            ["1551XA", "Shortloin MB2-3", "1/16# AVG. ~ 16# CS"],
            ["2240XA", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],
            ["1602XA", "Export 7 Rib", "2/18# AVG. ~ 36# CS"],
            ["2160XA", "Tenderloin SS Off 4LB+", "6/4# AVG. ~ 24# CS"],
            ["2131XA", "Tri Tip", "4/2# AVG. ~ 32# CS"],
            ["2206XA", "Flap Meat", "6/2.5# AVG. ~ 30# CS"],
            ["2190XA", "Outside Skirt", "14/1# AVG. ~ 28# CS"],
            ["2275XA", "Chuck Eye Roll", "3/15# AVG. ~ 45# CS"],
          ],
        },
        {
          title: "Reserve MB3-4+",
          rows: [
            ["2091XB", "Rump Cap", "6/5# AVG. ~ 30# CS"],
            ["2110XB", "Top Sirloin", "6/6# AVG. ~ 36# CS"],
            ["1688XB", "Short Rib 3-Rib", "8/3# AVG. ~ 48# CS"],
            ["2160XB", "Tenderloin SS Off 4LB+", "6/4# AVG. ~ 24# CS"],
            ["2001XB", "Top Round Cap Off", "3/13# AVG. ~ 39# CS"],
            ["2140XB", "Striploin 11LB+", "3/12# AVG. ~ 36# CS"],
            ["1551XB", "Shortloin MB4+", "1/16# AVG. ~ 16# CS"],
            ["1562XB", "Striploin B/I", "2/16# AVG. ~ 32# CS"],
            ["2240XB", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],
            ["1602XB", "Export 7 Rib", "2/18# AVG. ~ 36# CS"],
          ],
        },
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

  // PROVIDER_MODAL_INTRO_HELPERS_START
  const createProviderBrandLip = (providerIntro) => {
    if (!providerIntro?.bannerLabel && !providerIntro?.bannerImage) {
      return "";
    }

    return `
      <div class="provider-modal-brand-lip provider-modal-brand-lip--black-opal" aria-hidden="true">
        ${
          providerIntro.bannerImage
            ? `<img class="provider-modal-brand-lip__image" src="${escapeHtml(providerIntro.bannerImage)}" alt="" loading="eager" decoding="async" />`
            : ""
        }
        <span>${escapeHtml(providerIntro.bannerLabel || "")}</span>
      </div>
    `;
  };

  const createProviderOfficialLink = (providerIntro) => {
    if (!providerIntro?.websiteUrl) {
      return "";
    }

    return `
      <aside class="provider-modal-official" aria-label="Provider official website">
        <p>${escapeHtml(providerIntro.websiteCopy || "For additional information, visit the producer's official brand page.")}</p>
        <a href="${escapeHtml(providerIntro.websiteUrl)}" target="_blank" rel="noopener noreferrer">
          Open Brand Page
        </a>
      </aside>
    `;
  };

  const getProducerForProductListTitle = (productListTitle) =>
    producers.find((producer) => producer.productListTitle === productListTitle) || null;

  const getCutForId = (cutId) => cuts.find((cut) => cut.id === cutId) || null;

  const createProviderAvailableCuts = (productListTitle) => {
    const producer = getProducerForProductListTitle(productListTitle);

    if (!producer) {
      return "";
    }

    const relatedCuts = (producerCutLinks[producer.id] || [])
      .map((cutId) => getCutForId(cutId))
      .filter(Boolean);

    if (relatedCuts.length === 0) {
      return "";
    }

    const cutButtons = relatedCuts
      .map(
        (cut) => `
          <button
            class="provider-modal-related-cuts__button"
            type="button"
            data-connected-cut-trigger="${escapeHtml(cut.selectedCutTitle)}"
          >
            ${escapeHtml(cut.publicLabel)}
          </button>
        `,
      )
      .join("");

    return `
      <section class="provider-modal-related-cuts" aria-label="Available selected cuts">
        <div class="provider-modal-related-cuts__head">
          <span>Available Cuts</span>
          <p>Cuts represented in this program.</p>
        </div>
        <div class="provider-modal-related-cuts__list">
          ${cutButtons}
        </div>
      </section>
    `;
  };

  const createProviderIntro = (providerIntro, productListTitle = "") => {
    if (!providerIntro) {
      return "";
    }

    const tags = Array.isArray(providerIntro.tags) ? providerIntro.tags : [];

    return `
      ${createProviderOfficialLink(providerIntro)}
      ${createProviderBrandLip(providerIntro)}
      <section class="provider-modal-intro" aria-label="Provider introduction">
        <p>${escapeHtml(providerIntro.copy)}</p>
        ${
          tags.length
            ? `
              <ul class="provider-modal-intro__tags" aria-label="Provider distinctions">
                ${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}
              </ul>
            `
            : ""
        }
      </section>
      ${createProviderAvailableCuts(productListTitle)}
    `;
  };

  const createProviderFooter = () => "";

  const renderProviderModalLogo = (productList) => {
    const headerNode = modal.querySelector(".product-list-modal__header") || titleNode?.parentElement || modal;
    const providerIntro = productList.providerIntro;
    const hasLogo = Boolean(providerIntro?.logo);

    modal.classList.toggle("product-list-modal--provider-intro", hasLogo);

    let logoNode = modal.querySelector("[data-provider-modal-logo]");

    if (!hasLogo) {
      logoNode?.remove();
      return;
    }

    if (!logoNode) {
      logoNode = document.createElement("div");
      logoNode.className = "provider-modal-logo";
      logoNode.setAttribute("data-provider-modal-logo", "");
      headerNode.appendChild(logoNode);
    }

    logoNode.innerHTML = `
      <img
        src="${escapeHtml(providerIntro.logo)}"
        alt="${escapeHtml(providerIntro.logoAlt || `${productList.title} logo`)}"
        loading="eager"
        decoding="async"
      />
    `;
  };
  // PROVIDER_MODAL_INTRO_HELPERS_END
  // ALL_CUTS_GUIDE_TABS_HELPERS_START
  const getActiveProductListGuide = (productList, guideKey = null) => {
    if (!Array.isArray(productList.guides) || productList.guides.length === 0) {
      return productList;
    }

    const fallbackKey = productList.defaultGuideKey || productList.guides[0].key;
    const activeKey = guideKey || productList.activeGuideKey || fallbackKey;
    return productList.guides.find((guide) => guide.key === activeKey) || productList.guides[0];
  };

  const createProductListGuideTabs = (productList, activeGuideKey) => {
    if (!Array.isArray(productList.guides) || productList.guides.length < 2) {
      return "";
    }

    return productList.guides
      .map((guide) => {
        const isActive = guide.key === activeGuideKey;

        return `
          <button
            class="product-list-guide-tab${isActive ? " is-active" : ""}"
            type="button"
            data-product-list-guide-key="${escapeHtml(guide.key)}"
            aria-pressed="${isActive ? "true" : "false"}"
          >
            ${escapeHtml(guide.label)}
          </button>
        `;
      })
      .join("");
  };

  const renderProductListGuideTabs = (productList, activeGuideKey) => {
    const headerNode = modal.querySelector(".product-list-modal__header") || titleNode?.parentElement || modal;
    headerNode.classList.add("product-list-modal__header--with-tabs");

    let tabsNode = modal.querySelector("[data-product-list-guide-tabs]");
    if (!tabsNode) {
      tabsNode = document.createElement("div");
      tabsNode.className = "product-list-guide-tabs";
      tabsNode.setAttribute("data-product-list-guide-tabs", "");
      tabsNode.setAttribute("role", "group");
      tabsNode.setAttribute("aria-label", "Cut guide type");
      headerNode.appendChild(tabsNode);
    }

    const tabs = createProductListGuideTabs(productList, activeGuideKey);
    tabsNode.innerHTML = tabs;
    tabsNode.hidden = tabs.length === 0;
  };

  const renderActiveProductListGuide = (productList, guideKey = null) => {
    const activeGuide = getActiveProductListGuide(productList, guideKey);

    if (Array.isArray(productList.guides) && productList.guides.length > 0) {
      productList.activeGuideKey = activeGuide.key;
    }

    modal.classList.toggle("product-list-modal--page-gallery", activeGuide.layout === "page-gallery");
    renderProductListGuideTabs(productList, activeGuide.key);

    if (bodyNode) {
      bodyNode.innerHTML = createSections(activeGuide);
      bodyNode.scrollTop = 0;
      bodyNode.parentElement?.scrollTo?.({ top: 0, behavior: "auto" });
    }

    if (externalNode) {
      externalNode.href = activeGuide.pdf || productList.pdf || "#";
    }
  };
  // ALL_CUTS_GUIDE_TABS_HELPERS_END
  // ALL_CUTS_PAGE_GALLERY_HELPERS_START
  const createPageGallery = (pages) => `
    <div class="product-list-page-gallery">
      ${pages
        .map(
          (page, index) => `
            <figure class="product-list-page-card">
              <img
                src="${escapeHtml(page.src)}"
                alt="${escapeHtml(page.title)} cut guide page"
                loading="${index < 2 ? "eager" : "lazy"}"
                decoding="async"
              />
              <figcaption>${String(index + 1).padStart(2, "0")} / ${String(pages.length).padStart(2, "0")} — ${escapeHtml(page.title)}</figcaption>
            </figure>
          `,
        )
        .join("")}
    </div>
  `;
  // ALL_CUTS_PAGE_GALLERY_HELPERS_END
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

  const createSections = (productList) => {
    if (Array.isArray(productList.pages) && productList.pages.length > 0) {
      return createPageGallery(productList.pages);
    }

    const intro = createProviderIntro(productList.providerIntro, productList.title);
    const sections = (productList.sections || [])
      .map(
        (section) => `
          <section class="product-list-section">
            <h3>${escapeHtml(section.title)}</h3>
            <div class="product-list-table-wrap">
              <table class="product-list-table">
                <thead>
                  <tr>
                    <th scope="col">Code</th>
                    <th scope="col">Cut / Product</th>
                    <th scope="col">Specification</th>
                  </tr>
                </thead>
                <tbody>
                  ${createRows(section.rows)}
                </tbody>
              </table>
            </div>
          </section>
        `,
      )
      .join("");
    const footer = createProviderFooter(productList.providerIntro);

    return `${intro}${sections}${footer}`;
  };

  const modalContent = `
    <div class="product-list-modal__panel">
      <button class="product-list-modal__close" type="button" aria-label="Close product list" data-product-list-close>
        <span aria-hidden="true">×</span>
      </button>

      <header class="product-list-modal__header">
        <p class="product-list-modal__eyebrow" data-product-list-eyebrow>Product List</p>
        <h2 id="product-list-modal-title" data-product-list-title>Product List</h2>
        <p data-product-list-description></p>
      </header>

      <div class="product-list-modal__body" data-product-list-body></div>

      <a class="product-list-modal__external" href="#" target="_blank" rel="noopener noreferrer" data-product-list-external>
        Open in new tab
      </a>
    </div>
  `;

  let lastTrigger = null;
  let modal = document.getElementById("product-list-modal");

  if (!modal) {
    modal = document.createElement("dialog");
    modal.id = "product-list-modal";
    document.body.appendChild(modal);
  }

  modal.className = "product-list-modal";
  modal.setAttribute("aria-labelledby", "product-list-modal-title");
  modal.innerHTML = modalContent;

  const panel = modal.querySelector(".product-list-modal__panel");
  const closeButton = modal.querySelector("[data-product-list-close]");
  const eyebrowNode = modal.querySelector("[data-product-list-eyebrow]");
  const titleNode = modal.querySelector("[data-product-list-title]");
  const descriptionNode = modal.querySelector("[data-product-list-description]");
  const bodyNode = modal.querySelector("[data-product-list-body]");
  const externalNode = modal.querySelector("[data-product-list-external]");

  const openProductList = (providerName, trigger) => {
    const productList = productLists[providerName];

    if (!productList) {
      return;
    }

    lastTrigger = trigger || null;
    modal.dataset.activeProductListTitle = productList.title;

    if (eyebrowNode) {
      eyebrowNode.textContent = productList.eyebrow;
    }

    if (titleNode) {
      titleNode.textContent = productList.title;
    }

    if (descriptionNode) {
      descriptionNode.textContent = productList.description;
    }

    if (bodyNode) {
      renderProviderModalLogo(productList);
    renderActiveProductListGuide(productList, productList.activeGuideKey);
      bodyNode.scrollTop = 0;
    }

    if (externalNode) {
      externalNode.href = getActiveProductListGuide(productList, productList.activeGuideKey).pdf || productList.pdf;
      externalNode.textContent = "Open in new tab";
      externalNode.setAttribute("aria-label", `Open ${productList.title} product list in a new tab`);
    }

    document.body.classList.add("product-list-modal-open");

    if (typeof modal.showModal === "function" && !modal.open) {
      modal.showModal();
      return;
    }

    modal.setAttribute("open", "");
  };

  const closeProductList = () => {
    document.body.classList.remove("product-list-modal-open");
    modal.classList.remove("product-list-modal--page-gallery");
    modal.classList.remove("product-list-modal--provider-intro");
    modal.querySelector("[data-provider-modal-logo]")?.remove();
    modal.removeAttribute("data-active-product-list-title");

    if (typeof modal.close === "function" && modal.open) {
      modal.close();
    } else {
      modal.removeAttribute("open");
    }

    if (bodyNode) {
      bodyNode.innerHTML = "";
    }

    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus({ preventScroll: true });
    }
  };

  // CONNECTED_CATALOG_PRODUCER_TO_CUT_EVENTS_START
  modal.addEventListener(
    "click",
    (event) => {
      const cutButton = event.target.closest("[data-connected-cut-trigger]");

      if (!cutButton) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const cutName = cutButton.dataset.connectedCutTrigger;

      if (!cutName) {
        return;
      }

      closeProductList();

      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("paragon:open-selected-cut", {
            detail: { cutName },
          }),
        );
      }, 140);
    },
    true,
  );
  // CONNECTED_CATALOG_PRODUCER_TO_CUT_EVENTS_END
  // ALL_CUTS_GUIDE_TABS_EVENTS_START
  modal.addEventListener(
    "click",
    (event) => {
      const guideButton = event.target.closest("[data-product-list-guide-key]");
      if (!guideButton) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const activeProductListTitle = modal.dataset.activeProductListTitle;
      const productList = productLists[activeProductListTitle];
      if (!productList) {
        return;
      }

      renderActiveProductListGuide(productList, guideButton.dataset.productListGuideKey);
    },
    true,
  );
  // ALL_CUTS_GUIDE_TABS_EVENTS_END
  // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_START
  window.PARAGON_PRODUCT_LISTS = {
    open: (productListTitle) => openProductList(productListTitle, null),
    has: (productListTitle) => Boolean(productLists[productListTitle]),
  };

  window.addEventListener("paragon:open-producer", (event) => {
    const productListTitle = event.detail?.productListTitle || event.detail?.title;

    if (!productListTitle || !productLists[productListTitle]) {
      return;
    }

    openProductList(productListTitle, null);
  });
  // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_END
  document.querySelectorAll(".brand-card, [data-product-list-trigger]").forEach((card) => {
    const title = card.dataset.productListTrigger || card.querySelector("h3")?.textContent?.trim();

    if (!title || !productLists[title]) {
      return;
    }

    card.dataset.productListTrigger = title;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Open ${title} product list`);

    card.addEventListener("click", () => {
      openProductList(title, card);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProductList(title, card);
      }
    });
  });

  closeButton?.addEventListener("click", closeProductList);

  modal.addEventListener("click", (event) => {
    if (panel && !panel.contains(event.target)) {
      closeProductList();
    }
  });

  modal.addEventListener("close", () => {
    document.body.classList.remove("product-list-modal-open");
    modal.classList.remove("product-list-modal--page-gallery");
    modal.classList.remove("product-list-modal--provider-intro");
    modal.querySelector("[data-provider-modal-logo]")?.remove();
    modal.removeAttribute("data-active-product-list-title");

    if (bodyNode) {
      bodyNode.innerHTML = "";
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.open) {
      closeProductList();
    }
  });
})();
// PRODUCT_LIST_MODAL_END
