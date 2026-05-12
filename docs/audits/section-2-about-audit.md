# Section 2 About Audit

## Status

This is a read-only audit for the next roadmap phase.

## Files inspected

- src/main.js
- src/styles.css

## Section 2 extracted from src/main.js

```html
<section id="about" class="scene scene-story" aria-labelledby="story-title" data-section-name="About">
      <div class="scene-glow scene-glow-soft"></div>

      <div class="panel panel-story">
        <div class="story-grid story-grid--about-card">
          <div class="story-left">
            <p class="eyebrow">About</p>
            <h2 id="story-title" class="story-title story-title--split">
              <span class="story-title-group">Exceptional<br />producers.</span>
              <span class="story-title-gap" aria-hidden="true"></span>
              <span class="story-title-group">Selected with<br />purpose.</span>
            </h2>
          </div>

          <div class="story-right story-right--about-card">
            <button
              class="section-about-logo-card"
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
          </div>
        </div>
      </div>
    </section>
```

## Relevant src/main.js lines

```text
96:     <section id="about" class="scene scene-story" aria-labelledby="story-title" data-section-name="About">
100:         <div class="story-grid story-grid--about-card">
101:           <div class="story-left">
103:             <h2 id="story-title" class="story-title story-title--split">
104:               <span class="story-title-group">Exceptional<br />producers.</span>
105:               <span class="story-title-gap" aria-hidden="true"></span>
106:               <span class="story-title-group">Selected with<br />purpose.</span>
110:           <div class="story-right story-right--about-card">
115:               aria-label="Open About Paragon Purveyors"
125:               <span class="section-about-logo-card__label">About Paragon Purveyors</span>
126:               <span class="section-about-logo-card__copy">View the brand introduction.</span>
414:     <div class="about-modal__panel">
415:       <button class="about-modal__close" type="button" aria-label="Close About panel" data-about-close>
419:       <div class="about-modal__layout">
420:         <section class="about-modal__copy">
421:           <h2 id="about-modal-title">About Paragon Purveyors</h2>
432:         <aside class="about-modal__brand" aria-label="Paragon Purveyors logo">
434:             class="about-modal__logo"
443:   let modal = document.getElementById("about-modal");
447:     modal.id = "about-modal";
451:   modal.className = "about-modal";
452:   modal.setAttribute("aria-labelledby", "about-modal-title");
456:   const panel = modal.querySelector(".about-modal__panel");
459:     document.body.classList.add("about-modal-open");
470:     document.body.classList.remove("about-modal-open");
490:     trigger.setAttribute("aria-label", "Open About Paragon Purveyors");
521:     document.body.classList.remove("about-modal-open");
```

## Relevant src/styles.css lines

```text
239: .story-grid {
246: .story-right {
314: .story-grid {
318:   .story-right {
621: .about-modal {
640: .about-modal::backdrop {
648: .about-modal__panel {
655: .about-modal__layout {
663: .about-modal__copy {
667: .about-modal__content,
668: .about-modal__header,
669: .about-modal__eyebrow {
673: .about-modal__close {
693: .about-modal__close:hover,
694: .about-modal__close:focus-visible {
700: .about-modal__close:active {
704: .about-modal__close span {
711: .about-modal__content h2,
712: .about-modal__copy h2 {
723: .about-modal__content p,
724: .about-modal__copy p {
732: .about-modal__content p + p,
733: .about-modal__copy p + p {
737: .about-modal__brand {
746: .about-modal__logo {
764: body.about-modal-open {
769:   .about-modal {
774:   .about-modal__panel {
778:   .about-modal__layout {
784:   .about-modal__brand {
788:   .about-modal__logo {
793:   .about-modal__copy h2 {
800:   .about-modal {
804:   .about-modal__panel {
808:   .about-modal__layout {
813:   .about-modal__copy h2 {
818:   .about-modal__copy p {
823:   .about-modal__copy p + p {
827:   .about-modal__brand {
831:   .about-modal__logo {
851:   .about-modal {
859:   .about-modal__panel {
868:   .about-modal__layout {
874:   .about-modal__brand {
878:   .about-modal__logo {
885:   .about-modal {
891:   .about-modal__panel {
897:   .about-modal__brand {
901:   .about-modal__logo {
1747: .about-modal[open],
1749: .about-modal__panel,
1760: body.about-modal-open,
2717: .story-grid--about-card {
2723: .story-title--split {
2730: .story-title-group {
2734: .story-title-gap {
2739: .story-right--about-card {
2842:   .story-grid--about-card {
2849:   .story-title--split {
2855:   .story-title-gap {
2887:   .story-grid--about-card {
2891:   .story-title--split {
2950:   .about-modal,
2951:   .about-modal-overlay,
2952:   .about-modal-backdrop {
2959:   .about-modal-card,
2960:   .about-modal-panel,
2961:   .about-modal-content,
2963:   .about-modal [role="dialog"] {
2970:   .about-modal img,
2971:   .about-modal-logo,
2972:   .about-modal-mark,
2973:   .about-modal__logo,
2974:   .about-modal__mark {
2980:   .about-modal .modal-close,
2981:   .about-modal-close,
3022:   .about-modal-card,
3023:   .about-modal-panel,
3024:   .about-modal-content,
3026:   .about-modal [role="dialog"] {
3031:   .about-modal img,
3032:   .about-modal-logo,
3033:   .about-modal-mark,
3034:   .about-modal__logo,
3035:   .about-modal__mark {
3054:   .about-modal {
3061:   .about-modal__panel {
3069:   .about-modal__layout {
3075:   .about-modal__eyebrow,
3076:   .about-modal .eyebrow {
3082:   .about-modal__title,
3083:   .about-modal h2 {
3091:   .about-modal__copy {
3097:   .about-modal__copy p {
3101:   .about-modal__copy p:last-child {
3105:   .about-modal__brand {
3114:   .about-modal__logo,
3115:   .about-modal__brand img {
3123:   .about-modal__close {
3134:   .about-modal {
3138:   .about-modal__panel {
3145:   .about-modal__layout {
3149:   .about-modal__eyebrow,
3150:   .about-modal .eyebrow {
3155:   .about-modal__title,
3156:   .about-modal h2 {
3163:   .about-modal__copy {
3168:   .about-modal__copy p {
3172:   .about-modal__brand {
3177:   .about-modal__logo,
3178:   .about-modal__brand img {
3183:   .about-modal__close {
3192:   .about-modal__panel {
3196:   .about-modal__title,
3197:   .about-modal h2 {
3201:   .about-modal__copy {
3206:   .about-modal__copy p {
3210:   .about-modal__logo,
3211:   .about-modal__brand img {
3220:   .about-modal h2 {
3234:   .about-modal h2 {
3623: body.about-modal-open .section-index,
3933: body.about-modal-open .global-contact-cta,
```

## Recommended next implementation target

- Keep Section 2 as About only.
- Convert the existing layout into two equal cards.
- Left card: About Paragon Purveyors.
- Right card: Meet the Owners.
- Add a placeholder owners modal.
- Fix spacing so the cards do not touch or feel cramped.
- Do not add producer/cut catalog logic to Section 2.
