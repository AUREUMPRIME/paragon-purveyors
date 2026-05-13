# Mobile Responsive Audit

## Status

Read-only audit. No source code was modified.

## Files inspected

- src/main.js
- src/styles.css
- src/forwardDepth.js
- src/cutScrollIsolation.js
- src/inquiryForm.js

## Sections detected

- hero
- about
- producers
- cuts
- inquiry

## Likely Root Cause

The mobile version degraded because recent changes were optimized for desktop composition: fixed navigation, large panels, dense card systems, internal cut scrolling, and the new two-column inquiry form.

## Findings

- Desktop width formulas are still present and need mobile overrides.
- Overflow hidden rules can clip mobile content.
- Desktop grid columns need single-column mobile overrides.
- Section 5 has a recent desktop form layout that needs a dedicated mobile stack.
- Section 4 has custom internal scroll behavior that needs mobile touch verification.
- Modal systems need a separate mobile pass after section layout is stable.

## Recommended Mobile Fix Strategy

- Use mobile panel widths based on calc(100vw - 24px), not desktop sidebar spacing.
- Mobile panels should allow natural vertical flow or internal scroll only where intentional.
- Convert major mobile layouts to one column below 760px.
- Stack Section 5 contact info and form vertically on mobile.
- Make Section 4 mobile cut list either natural-flow or clearly isolated with touch-safe scrolling.
- Use near-full-screen mobile modals with internal scroll and sticky close controls.

## Best Implementation Order

1. Add one mobile baseline CSS block under 760px.
2. Fix global scene and panel sizing.
3. Convert the desktop left navigation into a mobile-safe layout.
4. Reduce mobile heading scales.
5. Fix Section 3 producer cards.
6. Fix Section 4 cut list behavior on touch screens.
7. Fix Section 5 inquiry form stack.
8. Audit modals after section layouts are stable.

## Mobile Design Rules Going Forward

- Do not reuse desktop panel width formulas on mobile.
- Do not rely on desktop fixed left spacing.
- Keep one primary content column.
- Use smaller headings and readable spacing.
- Keep touch targets near 44px where practical.
- Avoid hover-only interactions on mobile.
- Use near-full-screen mobile modals with internal scroll.

## Risk Lines From src/styles.css

- 58:   position: fixed;
- 74:   min-height: 100vh;
- 78:   overflow: hidden;
- 83:   width: min(74vw, 1100px);
- 116:   width: min(88vw, 1040px);
- 123:   width: min(88vw, 1120px);
- 129:   width: min(86vw, 1080px);
- 241:   grid-template-columns: 1.05fr 0.95fr;
- 291:   grid-template-columns: repeat(12, minmax(0, 1fr));
- 315:     grid-template-columns: 1fr;
- 323:     grid-template-columns: repeat(2, minmax(0, 1fr));
- 350:     width: min(90vw, 90vw);
- 383:     grid-template-columns: 1fr;
- 389:   width: min(86vw, 1080px);
- 440:   grid-template-columns: repeat(4, minmax(0, 1fr));
- 459:     grid-template-columns: repeat(2, minmax(0, 1fr));
- 465:     width: min(90vw, 90vw);
- 470:     grid-template-columns: 1fr;
- 481:   width: min(84vw, 920px);
- 556:     width: min(90vw, 90vw);
- 580:   position: fixed;
- 620: /* ABOUT_MODAL_START */
- 621: .about-modal {
- 622:   width: min(1080px, calc(100vw - 64px));
- 627:   overflow: hidden !important;
- 640: .about-modal::backdrop {
- 648: .about-modal__panel {
- 652:   overflow: hidden;
- 655: .about-modal__layout {
- 657:   grid-template-columns: minmax(0, 1fr) clamp(220px, 24vw, 310px);
- 663: .about-modal__copy {
- 667: .about-modal__content,
- 668: .about-modal__header,
- 669: .about-modal__eyebrow {
- 673: .about-modal__close {
- 693: .about-modal__close:hover,
- 694: .about-modal__close:focus-visible {
- 700: .about-modal__close:active {
- 704: .about-modal__close span {
- 711: .about-modal__content h2,
- 712: .about-modal__copy h2 {
- 723: .about-modal__content p,
- 724: .about-modal__copy p {
- 732: .about-modal__content p + p,
- 733: .about-modal__copy p + p {
- 737: .about-modal__brand {
- 746: .about-modal__logo {
- 748:   width: min(260px, 100%);
- 764: body.about-modal-open {
- 765:   overflow: hidden;
- 769:   .about-modal {
- 770:     width: calc(100vw - 28px);
- 774:   .about-modal__panel {
- 778:   .about-modal__layout {
- 779:     grid-template-columns: 1fr;
- 784:   .about-modal__brand {
- 788:   .about-modal__logo {
- 789:     width: min(180px, 54vw);
- 793:   .about-modal__copy h2 {
- 800:   .about-modal {
- 804:   .about-modal__panel {
- 808:   .about-modal__layout {
- 809:     grid-template-columns: minmax(0, 1fr) clamp(190px, 21vw, 260px);
- 813:   .about-modal__copy h2 {
- 818:   .about-modal__copy p {
- 823:   .about-modal__copy p + p {
- 827:   .about-modal__brand {
- 831:   .about-modal__logo {
- 832:     width: min(220px, 100%);
- 836: /* ABOUT_MODAL_END */
- 849: /* ABOUT_MODAL_MOBILE_CROP_FIX_START */
- 851:   .about-modal {
- 852:     width: calc(100vw - 28px);
- 853:     height: min(760px, calc(100dvh - 34px));
- 854:     max-height: calc(100dvh - 34px);
- 856:     overflow: hidden !important;
- 859:   .about-modal__panel {
- 861:     max-height: calc(100dvh - 34px);
- 864:     overflow: hidden;
- 868:   .about-modal__layout {
- 874:   .about-modal__brand {
- 878:   .about-modal__logo {
- 879:     width: min(168px, 48vw);
- 885:   .about-modal {
- 886:     width: calc(100vw - 24px);
- 887:     height: min(740px, calc(100dvh - 30px));
- 888:     max-height: calc(100dvh - 30px);
- 891:   .about-modal__panel {
- 892:     max-height: calc(100dvh - 30px);
- 897:   .about-modal__brand {
- 901:   .about-modal__logo {
- 902:     width: min(158px, 46vw);
- 906: /* ABOUT_MODAL_MOBILE_CROP_FIX_END */
- 920:   overflow: hidden;
- 926:   min-height: 100vh;
- 931:   min-height: 100vh;
- 936:   position: fixed !important;
- 939:   min-height: 100vh;
- 943:   overflow: hidden;
- 989:     overflow: hidden;
- 995:     min-height: 100dvh;
- 1001:     min-height: 100dvh;
- 1006:     position: fixed !important;
- 1009:     min-height: 100dvh;
- 1013:     overflow: hidden;
- 1032:   position: fixed;
- 1035:   overflow: hidden;
- 1084:   overflow: hidden;
- 1180: /* PROVIDER_MODAL_INTRO_START */
- 1181: .product-list-modal.product-list-modal--provider-intro {
- 1185: .product-list-modal__description:empty {
- 1190: .product-list-modal.product-list-modal--provider-intro .product-list-modal__header {
- 1196: .provider-modal-logo {
- 1209: .provider-modal-logo img {
- 1217: .provider-modal-brand-lip {
- 1219:   overflow: hidden;
- 1226: .provider-modal-brand-lip__image {
- 1239: .provider-modal-brand-lip::before {
- 1248: .provider-modal-brand-lip::after {
- 1259: .provider-modal-brand-lip span {
- 1276: .provider-modal-intro {
- 1285: .provider-modal-intro p {
- 1293: .provider-modal-intro__tags {
- 1302: .provider-modal-intro__tags li {
- 1313: .provider-modal-intro + .product-list-section {
- 1321: .provider-modal-linkout {
- 1332: .provider-modal-linkout p {
- 1340: .provider-modal-linkout a {
- 1360: .provider-modal-linkout a:hover,
- 1361: .provider-modal-linkout a:focus-visible {
- 1369:   .product-list-modal.product-list-modal--provider-intro .product-list-modal__header {
- 1374:   .provider-modal-logo {
- 1377:     width: min(210px, 58vw);
- 1382:   .provider-modal-logo img {
- 1386:   .provider-modal-brand-lip {
- 1391:   .provider-modal-brand-lip span {
- 1399:   .provider-modal-intro {
- 1404:   .provider-modal-intro p {
- 1409:   .provider-modal-intro__tags {
- 1413:   .provider-modal-intro__tags li {
- 1418:   .provider-modal-linkout {
- 1423:   .provider-modal-linkout a {
- 1428: /* PROVIDER_MODAL_INTRO_END */
- 1429: /* PRODUCT_LIST_MODAL_START */
- 1430: .product-list-modal {
- 1431:   width: min(860px, calc(100vw - 48px));
- 1436:   overflow: hidden !important;
- 1449: .product-list-modal::backdrop {
- 1457: .product-list-modal__panel {
- 1464:   overflow: hidden;
- 1467: .product-list-modal__close {
- 1487: .product-list-modal__close:hover,
- 1488: .product-list-modal__close:focus-visible {
- 1494: .product-list-modal__close:active {
- 1498: .product-list-modal__close span {
- 1505: .product-list-modal__header {
- 1510: .product-list-modal__eyebrow {
- 1520: .product-list-modal__header h2 {
- 1530: .product-list-modal__header p:last-child {
- 1538: .product-list-modal__body {
- 1546: .product-list-modal__body::-webkit-scrollbar {
- 1550: .product-list-modal__body::-webkit-scrollbar-track {
- 1555: .product-list-modal__body::-webkit-scrollbar-thumb {
- 1579:   overflow: hidden;
- 1641: .product-list-modal__external {
- 1655: .product-list-modal__external:hover,
- 1656: .product-list-modal__external:focus-visible {
- 1671: body.product-list-modal-open {
- 1672:   overflow: hidden;
- 1676:   .product-list-modal {
- 1677:     width: calc(100vw - 28px);
- 1678:     height: min(840px, calc(100dvh - 28px));
- 1679:     max-height: calc(100dvh - 28px);
- 1682:   .product-list-modal__panel {
- 1687:   .product-list-modal__header {
- 1691:   .product-list-modal__header h2 {
- 1695:   .product-list-modal__header p:last-child {
- 1710:   .product-list-modal__panel {
- 1714:   .product-list-modal__header {
- 1718:   .product-list-modal__header p:last-child {
- 1722:   .product-list-modal__body {
- 1739:   .product-list-modal__external {
- 1743: /* PRODUCT_LIST_MODAL_END */
- 1746: /* MODAL_SCROLL_GUARD_START */
- 1747: .about-modal[open],
- 1748: .product-list-modal[open],
- 1749: .about-modal__panel,
- 1750: .product-list-modal__panel,
- 1751: .product-list-modal__body {
- 1755: .product-list-modal__body {
- 1760: body.about-modal-open,
- 1761: body.product-list-modal-open {
- 1762:   overflow: hidden !important;
- 1764: /* MODAL_SCROLL_GUARD_END */
- 1803: .product-list-modal.product-list-modal--page-gallery {
- 1807: .product-list-modal__header--with-tabs {
- 1886: .product-list-modal.product-list-modal--page-gallery {
- 1887:   width: min(1040px, calc(100vw - 48px));
- 1899:   overflow: hidden;
- 1934:   .product-list-modal.product-list-modal--page-gallery {
- 1935:     width: calc(100vw - 28px);
- 1936:     height: min(840px, calc(100dvh - 28px));
- 1937:     max-height: calc(100dvh - 28px);
- 1963: /* SELECTED_CUTS_MODAL_START */
- 1973: .selected-cut-modal {
- 1974:   width: min(700px, calc(100vw - 52px));
- 1979:   overflow: hidden !important;
- 1992: .selected-cut-modal::backdrop {
- 2000: .selected-cut-modal__panel {
- 2003:   overflow: hidden;
- 2007: .selected-cut-modal__close {
- 2027: .selected-cut-modal__close:hover,
- 2028: .selected-cut-modal__close:focus-visible {
- 2034: .selected-cut-modal__close:active {
- 2038: .selected-cut-modal__close span {
- 2045: .selected-cut-modal__body {
- 2055: .selected-cut-modal__body::-webkit-scrollbar {
- 2059: .selected-cut-modal__body::-webkit-scrollbar-track {
- 2064: .selected-cut-modal__body::-webkit-scrollbar-thumb {
- 2069: .selected-cut-modal__media {
