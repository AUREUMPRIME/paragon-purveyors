# Section 5 Inquiry Form Audit

## Status

Read-only audit before building the real inquiry form.

## Files inspected

- src/main.js
- src/styles.css

## Current Section 5 Markup

```html
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
```

## Relevant Style Lines

```text
48: button {
139:   text-transform: uppercase;
193: .body-copy,
205: .body-copy {
209: .body-copy + .body-copy {
221: .button {
234: .button-primary {
378:   .button {
432:   text-transform: uppercase;
479: /* SECTION 5: INQUIRY */
480: .panel-inquiry {
486: .inquiry-head {
492: .inquiry-title {
502: .inquiry-title-line {
510: .inquiry-title-line + .inquiry-title-line {
514: .inquiry-intro {
520: .inquiry-details {
527: .inquiry-detail-card {
535: .inquiry-detail-label {
539:   text-transform: uppercase;
545: .inquiry-detail-value {
555:   .panel-inquiry {
560:   .inquiry-title-line + .inquiry-title-line {
564:   .inquiry-detail-card {
606:   transform: translateZ(0);
663: .about-modal__copy {
690:     transform 180ms ease;
701:   transform: scale(0.96);
712: .about-modal__copy h2 {
724: .about-modal__copy p {
733: .about-modal__copy p + p {
793:   .about-modal__copy h2 {
813:   .about-modal__copy h2 {
818:   .about-modal__copy p {
823:   .about-modal__copy p + p {
945:   will-change: transform, opacity;
978:     transform: none !important;
1015:     will-change: transform, opacity;
1040:   will-change: opacity, filter, transform;
1041:   transform: translate3d(0, 0, 0);
1106:   transform: translateZ(0);
1236:   transform: none;
1271:   text-transform: uppercase;
1309:   text-transform: uppercase;
1351:   text-transform: uppercase;
1357:     transform 180ms ease;
1365:   transform: translateY(-1px);
1484:     transform 180ms ease;
1495:   transform: scale(0.96);
1514:   text-transform: uppercase;
1572:   text-transform: uppercase;
1612:   text-transform: uppercase;
1621:   text-transform: uppercase;
1645:   text-transform: uppercase;
1837:   text-transform: uppercase;
1843:     transform 180ms ease;
1851:   transform: translateY(-1px);
1916:   text-transform: uppercase;
2024:     transform 180ms ease;
2035:   transform: scale(0.96);
2097:   text-transform: uppercase;
2111:   text-transform: uppercase;
2130:   text-transform: uppercase;
2155:   text-transform: uppercase;
2202:   text-transform: uppercase;
2211:   text-transform: uppercase;
2315:   transform: scale(1.04);
2316:   transform-origin: center;
2322:     transform 420ms ease;
2339:   transform: scale(1.08);
2394:     transform: scale(1.04);
2620: .button {
2626:     transform 180ms ease,
2633: .button::after {
2644: .button:hover,
2645: .button:focus-visible {
2652: .button:hover::after,
2653: .button:focus-visible::after {
2657: .button:active,
2658: .button.is-pressed {
2659:   transform: translateY(1px) scale(0.985);
2665: .button-selected-cuts {
2676:   .button {
2688:   .button {
2695:   .button {
2703:   .button:active,
2704:   .button.is-pressed {
2705:     transform: none;
2764:     transform 220ms ease,
2783:   transform: translateY(-2px);
2795:   transform: translateY(1px) scale(0.985);
2816:   text-transform: uppercase;
2822: .section-about-logo-card__copy {
2875:   .section-about-logo-card__copy {
2906:   .section-about-logo-card__copy {
2920:     transform: none;
2943:   .scene-hero .hero-copy,
2944:   .hero-copy {
3016:   .scene-hero .hero-copy,
3017:   .hero-copy {
3091:   .about-modal__copy {
3097:   .about-modal__copy p {
3101:   .about-modal__copy p:last-child {
3163:   .about-modal__copy {
3168:   .about-modal__copy p {
3201:   .about-modal__copy {
3206:   .about-modal__copy p {
3465:   transform: translate(clamp(76px, 8vw, 96px), 6px);
3472:     transform: none;
3495:   transform-origin: 50% 50%;
3496:   will-change: transform, opacity, filter;
3526:   transform: translateY(-50%);
3543:     transform 180ms ease;
3558:   transform: translateY(-1px);
3584:   text-transform: uppercase;
3593:     transform 180ms ease;
3616:   transform: translateX(2px);
3666:     transform: translateX(-50%);
3699:     transform: none;
3741:   transform: none;
3828:     transform: none;
3858:     transform: none;
3864: /* GLOBAL_CONTACT_CTA_START */
3865: .global-contact-cta {
3893:     transform 180ms ease,
3897: .global-contact-cta__eyebrow {
3903:   text-transform: uppercase;
3906: .global-contact-cta__label {
3912:   text-transform: uppercase;
3915: .global-contact-cta:hover,
3916: .global-contact-cta:focus-visible {
3926:   transform: translateY(-2px);
3929: .global-contact-cta:active {
3930:   transform: translateY(0);
3933: body.about-modal-open .global-contact-cta,
3934: body.product-list-modal-open .global-contact-cta,
3935: body.selected-cut-modal-open .global-contact-cta {
3941:   .global-contact-cta {
3948:     transform: translateX(50%);
3951:   .global-contact-cta:hover,
3952:   .global-contact-cta:focus-visible {
3953:     transform: translateX(50%) translateY(-2px);
3956:   .global-contact-cta:active {
3957:     transform: translateX(50%);
3962:   .global-contact-cta__eyebrow {
3966:   .global-contact-cta {
3972:   .global-contact-cta__label {
3976: /* GLOBAL_CONTACT_CTA_END */
3979: /* SIGNATURE_CONTACT_CTA_START */
3980: .global-contact-cta {
3996: .global-contact-cta:hover,
3997: .global-contact-cta:focus-visible {
4001:   transform: none;
4004: .global-contact-cta__inner {
4012: .global-contact-cta__mark {
4016:   transform-origin: 50% 50%;
4017:   will-change: transform, opacity;
4020: .global-contact-cta__mark img {
4032: .global-contact-cta__copy {
4040: .global-contact-cta__eyebrow {
4046:   text-transform: uppercase;
4049: .global-contact-cta__label {
4055:   text-transform: uppercase;
4059: .global-contact-cta__line {
4064:   transform-origin: left center;
4068:   .global-contact-cta {
4071:     transform: translateX(50%);
4074:   .global-contact-cta:hover,
4075:   .global-contact-cta:focus-visible {
4076:     transform: translateX(50%);
4079:   .global-contact-cta__inner {
4085:   .global-contact-cta__mark {
4092:   .global-contact-cta__eyebrow {
4096:   .global-contact-cta__label {
4100:   .global-contact-cta__inner {
4104:   .global-contact-cta__mark {
4109: /* SIGNATURE_CONTACT_CTA_END */
4113: .global-contact-cta__mark {
4118: .global-contact-cta__mark img {
4155: .about-card-pair__copy {
4195:   text-transform: uppercase;
4211:   text-transform: uppercase;
4223:   .about-card-pair__copy {
4279:   .about-card-pair__copy {
4303:   .about-card-pair__copy {
4345:   transform: none;
4478:   transform: none;
4733:   transform-origin: 50% 50%;
4735:     transform 220ms ease,
4752:     transform 220ms ease;
4790:   transform: translateY(-3px);
4799:   transform: scale(1.035);
4805:   transform: translateY(-1px) scale(0.992);
4893:   text-transform: uppercase;
4987:   text-transform: uppercase !important;
5020:   transform: none !important;
5034:   transform: none !important;
5123:   text-transform: uppercase;
5141: .provider-modal-related-cuts__button {
5151:   text-transform: uppercase;
5157:     transform 180ms ease;
5160: .provider-modal-related-cuts__button:hover,
5161: .provider-modal-related-cuts__button:focus-visible {
5166:   transform: translateY(-1px);
5169: .provider-modal-related-cuts__button:active {
5170:   transform: translateY(0) scale(0.99);
5206:   text-transform: uppercase;
5224: .selected-cut-modal__producer-button {
5241:     transform 180ms ease;
5244: .selected-cut-modal__producer-button span {
5249:   text-transform: uppercase;
5252: .selected-cut-modal__producer-button small {
5259:   text-transform: uppercase;
5262: .selected-cut-modal__producer-button:hover,
5263: .selected-cut-modal__producer-button:focus-visible {
5268:   transform: translateY(-1px);
5271: .selected-cut-modal__producer-button:hover small,
5272: .selected-cut-modal__producer-button:focus-visible small {
5276: .selected-cut-modal__producer-button:active {
5277:   transform: translateY(0) scale(0.99);
5296: /* CONNECTED_CATALOG_MODAL_COPY_POLISH_START */
5311: /* CONNECTED_CATALOG_MODAL_COPY_POLISH_END */
5324:   text-transform: uppercase;
5394:   text-transform: uppercase;
5519:   text-transform: uppercase !important;
```

## Client Requirements To Implement Later

- Show contact email and phone numbers.
- Add copy buttons for contact values.
- Include customer email field.
- Include message field.
- Keep the form visually aligned with Section 5 style.
- Future final step: send the inquiry as an email.
- Current known email: info@paragonpurveyors.com
- Known contact: Clayton U - +1 (949) 514-3127
- Placeholder contact: John D - number pending

## Recommended Implementation Order

1. Preserve current Section 5 visual mood.
2. Add contact rows with copy buttons.
3. Add a simple inquiry form shell with email and message.
4. Add local-only submit state first.
5. Do not wire real email sending until hosting/domain/email setup is clear.
6. Add validation and accessible labels.
7. Build and visually verify before checkpoint.

## Risks

- Real email sending requires hosting or a form backend.
- Do not expose private email-service keys in frontend code.
- Copy buttons need accessible feedback.
- John D phone number is still placeholder/pending.
