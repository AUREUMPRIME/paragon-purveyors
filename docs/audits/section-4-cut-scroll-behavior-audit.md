# Section 4 Cut Scroll Behavior Audit

## Status

Read-only audit. No source code was modified by this audit script.

## Summary

- Section 4 cut cards detected: 25
- Cards inside .cut-scroll: 25
- cutScrollIsolation.js exists: Yes
- forwardDepth.js contains wheel logic: Yes
- .cut-scroll CSS block found: Yes

## Likely Root Cause

The internal scroll works, but it feels unreliable because two scroll systems now coexist:

1. .cut-scroll tries to capture wheel/touch events for the card list.
2. forwardDepth still controls section-to-section navigation.

When the event target is not perfectly inside .cut-scroll, or when trackpad gestures are diagonal/small, the event can leak to the section navigation. When it is captured, the current raw delta scroll can feel too fast because it directly adds event.deltaY to scrollTop.

## Findings

- Current isolation directly adds raw wheel delta to scrollTop. This can feel inconsistent across mouse wheels and trackpads.
- Current isolation stops propagation aggressively. This protects section navigation but may feel stiff if every wheel event is handled as a hard jump.
- Wheel listener is global on window with capture. It should work, but it may fight the section/depth wheel listener if the cursor target is not inside .cut-scroll.
- Horizontal-dominant gestures are ignored. Some trackpad diagonal gestures may leak to section navigation.
- forwardDepth.js also handles wheel/scroll navigation. This is the likely competing system when .cut-scroll does not capture an event.
- The scroll area height is limited. With many cards, small wheel deltas can feel compressed.
- Containment OK: all 25 Section 4 cards are inside .cut-scroll.

## Recommended Fix

- Replace raw delta assignment with requestAnimationFrame smoothing and a normalized delta multiplier.
- Keep capture isolation, but smooth the internal scroll with a small velocity queue.
- Use pointerenter/pointerleave state on .cut-scroll so only active hover inside the blue area captures wheel events.
- Allow small diagonal trackpad movement to still be treated as vertical scroll when the cursor is inside .cut-scroll.
- Add a shared guard such as window.__paragonCutScrollActive so forwardDepth ignores wheel while the cursor is inside .cut-scroll.

## Recommended Implementation Order

1. Remove scroll-snap from .cut-scroll.
2. Add pointerenter/pointerleave active-state detection for .cut-scroll.
3. Add a shared global guard: window.__paragonCutScrollActive.
4. Update forwardDepth.js to ignore wheel navigation while that guard is true.
5. Replace raw scrollTop += deltaY with requestAnimationFrame smoothing.
6. Normalize wheel speed with a conservative multiplier.
7. Keep normal section scrolling outside .cut-scroll.

## Relevant cutScrollIsolation.js lines

```text
1: const SCROLL_SELECTOR = ".cut-scroll";
8:   return target.closest(SCROLL_SELECTOR);
12:   const deltaY = event.deltaY;
13:   const deltaX = event.deltaX;
15:   if (Math.abs(deltaY) < Math.abs(deltaX)) {
19:   event.preventDefault();
20:   event.stopPropagation();
21:   event.stopImmediatePropagation();
23:   container.scrollTop += deltaY;
34:     "wheel",
47:   let touchStartY = 0;
51:     "touchstart",
54:       touchStartY = event.touches?.[0]?.clientY || 0;
60:     "touchmove",
66:       const currentY = event.touches?.[0]?.clientY || 0;
67:       const deltaY = touchStartY - currentY;
68:       touchStartY = currentY;
70:       event.preventDefault();
71:       event.stopPropagation();
72:       event.stopImmediatePropagation();
74:       activeTouchContainer.scrollTop += deltaY;
80:     "touchend",
```

## Relevant forwardDepth.js lines

```text
28:     return element instanceof HTMLElement && element.classList.contains("scene");
32: function getForegroundElements(scene) {
34:     scene.querySelectorAll(
48: function getTargetSceneIndex(scenes, target) {
52:     hero: "#hero, .scene-hero",
53:     home: "#hero, .scene-hero",
54:     about: "#about, .scene-story",
55:     story: "#about, .scene-story",
56:     producers: "#producers, .scene-portfolio",
57:     portfolio: "#producers, .scene-portfolio",
58:     cuts: "#cuts, .scene-cuts",
59:     selectedcuts: "#cuts, .scene-cuts",
60:     inquiry: "#inquiry, .scene-inquiry",
61:     contact: "#inquiry, .scene-inquiry",
70:   return scenes.findIndex((scene) => scene.matches(selector));
73: function updateSectionNavigation(scenes, activeIndex) {
75:     const targetIndex = getTargetSceneIndex(scenes, control.dataset.sectionTarget);
88: function setSceneInteractivity(scenes, activeIndex, isAnimating) {
89:   scenes.forEach((scene, index) => {
93:     scene.classList.toggle("is-depth-sweet-spot", isActive);
94:     scene.classList.toggle("is-depth-transitioning", isVisibleTransitionLayer);
95:     scene.classList.toggle("is-depth-inactive", !isActive && !isVisibleTransitionLayer);
97:     scene.style.pointerEvents = isActive ? "auto" : "none";
100:       scene.removeAttribute("aria-hidden");
102:       scene.setAttribute("aria-hidden", "true");
126:   document.querySelectorAll(".depth-scroll-spacer").forEach((element) => {
130:   document.querySelectorAll(".depth-scene").forEach((scene) => {
131:     const foreground = getForegroundElements(scene);
133:     scene.classList.remove(
134:       "depth-scene",
140:     scene.removeAttribute("data-depth-scene");
141:     scene.removeAttribute("aria-hidden");
142:     scene.style.pointerEvents = "";
145:     gsap.set(scene, { clearProps: "all" });
149: function prepareSceneBase(scenes) {
150:   gsap.set(scenes, {
159:   scenes.forEach((scene) => {
160:     const foreground = getForegroundElements(scene);
171:   gsap.set(scenes[0], {
178:   const firstForeground = getForegroundElements(scenes[0]);
188: function wireHeroButtons(scenes, goToSpot, cleanupCallbacks) {
208:     const targetIndex = getTargetSceneIndex(scenes, sectionTarget);
218:       event.preventDefault();
225:       goToSpot(targetIndex, "hero-cta");
233: function wireSectionNavigation(scenes, goToSpot, cleanupCallbacks) {
235:     const targetIndex = getTargetSceneIndex(scenes, control.dataset.sectionTarget);
245:       event.preventDefault();
246:       goToSpot(targetIndex, "section-index");
253:   updateSectionNavigation(scenes, 0);
267:   const scenes = getSceneCandidates();
269:   if (scenes.length < 2) {
270:     console.warn("[Paragon V3.2] Direct step model skipped: fewer than 2 direct .scene sections found.");
277:   scenes.forEach((scene, index) => {
278:     scene.classList.add("depth-scene");
279:     scene.setAttribute("data-depth-scene", String(index));
282:   prepareSceneBase(scenes);
297:   function goToSpot(targetIndex, source = "input") {
298:     const nextIndex = Math.max(0, Math.min(scenes.length - 1, targetIndex));
306:     const currentScene = scenes[previousIndex];
307:     const nextScene = scenes[nextIndex];
313:     updateSectionNavigation(scenes, nextIndex);
320:       sceneCount: scenes.length,
323:     scenes.forEach((scene, index) => {
326:       scene.classList.toggle("is-depth-transitioning", shouldShow);
327:       scene.classList.toggle("is-depth-inactive", !shouldShow);
328:       scene.classList.remove("is-depth-sweet-spot");
329:       scene.style.pointerEvents = "none";
332:         scene.removeAttribute("aria-hidden");
334:         scene.setAttribute("aria-hidden", "true");
363:         gsap.set(scenes, {
379:         setSceneInteractivity(scenes, activeIndex, false);
380:         updateSectionNavigation(scenes, activeIndex);
387:           sceneCount: scenes.length,
448:     const nextIndex = activeIndex >= scenes.length - 1 ? 0 : activeIndex + 1;
449:     goToSpot(nextIndex, "wheel");
453:     const previousIndex = activeIndex <= 0 ? scenes.length - 1 : activeIndex - 1;
454:     goToSpot(previousIndex, "wheel");
462:     event.preventDefault();
464:     if (Math.abs(event.deltaY) < WHEEL_THRESHOLD) {
468:     if (event.deltaY > 0) {
488:     event.preventDefault();
497:     const deltaY = touchStartY - touchEndY;
499:     if (Math.abs(deltaY) < TOUCH_THRESHOLD) {
503:     if (deltaY > 0) {
519:       event.preventDefault();
524:       event.preventDefault();
529:       event.preventDefault();
530:       goToSpot(0, "keyboard");
534:       event.preventDefault();
535:       goToSpot(scenes.length - 1, "keyboard");
539:   window.addEventListener("wheel", handleWheel, { passive: false });
545:   cleanupCallbacks.push(() => window.removeEventListener("wheel", handleWheel));
551:   wireHeroButtons(scenes, goToSpot, cleanupCallbacks);
552:   wireSectionNavigation(scenes, goToSpot, cleanupCallbacks);
554:   setSceneInteractivity(scenes, activeIndex, false);
555:   updateSectionNavigation(scenes, activeIndex);
565:     goTo: (index) => goToSpot(index, "console"),
569:       scenes: scenes.length,
574:   console.info(`[Paragon V3.2] Direct step model active: ${scenes.length} scenes, spot 0-${scenes.length - 1}.`);
```

## Relevant styles.css lines

```text
31:   overflow-y: auto;
625:   max-height: calc(100vh - 56px);
749:   max-height: 430px;
790:     max-height: 180px;
799: @media (max-height: 720px) and (min-width: 821px) {
833:     max-height: 340px;
854:     max-height: calc(100dvh - 34px);
861:     max-height: calc(100dvh - 34px);
880:     max-height: 162px;
888:     max-height: calc(100dvh - 30px);
892:     max-height: calc(100dvh - 30px);
903:     max-height: 152px;
921:   overscroll-behavior: none;
990:     overscroll-behavior: none;
996:     touch-action: none;
1100:   max-height: 52px;
1112:   max-height: 50px;
1117:   max-height: 54px;
1122:   max-height: 48px;
1127:   max-height: 44px;
1132:   max-height: 48px;
1155:     max-height: 46px;
1174:     max-height: 48px;
1201:   max-height: 96px;
1212:   max-height: 96px;
1378:     max-height: 84px;
1383:     max-height: 84px;
1434:   max-height: calc(100vh - 54px);
1679:     max-height: calc(100dvh - 28px);
1752:   overscroll-behavior: contain;
1757:   touch-action: pan-y;
1937:     max-height: calc(100dvh - 28px);
1977:   max-height: calc(100vh - 56px);
2004:   overscroll-behavior: contain;
2050:   overscroll-behavior: contain;
2088:   max-height: clamp(260px, 38vh, 370px);
2238:     max-height: calc(100dvh - 28px);
2247:     max-height: 260px;
2266:     max-height: 220px;
2411:     max-height: calc(100dvh - 44px);
2489:     max-height: 50px;
2541: @media (max-width: 420px), (max-height: 720px) {
2547:     max-height: calc(100dvh - 28px);
2588:     max-height: 38px;
2624:   touch-action: manipulation;
2682: @media (max-height: 720px) and (max-width: 899px) {
2837:     max-height: calc(100dvh - 44px);
2881: @media (max-width: 420px), (max-height: 720px) {
2883:     max-height: calc(100dvh - 28px);
2955:     overflow-y: auto;
2956:     overscroll-behavior: contain;
2964:     max-height: calc(100dvh - 30px);
2965:     overflow-y: auto;
2967:     overscroll-behavior: contain;
3001: @media (max-width: 420px), (max-width: 899px) and (max-height: 760px) {
3027:     max-height: calc(100dvh - 24px);
3063:     max-height: calc(100dvh - 22px);
3133: @media (max-width: 420px), (max-width: 899px) and (max-height: 760px) {
3140:     max-height: calc(100dvh - 16px);
3191: @media (max-width: 899px) and (max-height: 680px) {
3233: @media (max-width: 420px), (max-width: 899px) and (max-height: 760px) {
3295: @media (min-width: 901px) and (max-height: 760px) {
3433:   max-height: 56px;
3437:   max-height: 56px;
3450:     max-height: 50px;
3455:     max-height: 50px;
3464:   max-height: 26px;
3471:     max-height: 28px;
4214: @media (min-width: 900px) and (max-height: 780px) {
4256:     max-height: calc(100dvh - 44px);
4302: @media (max-width: 560px), (max-height: 700px) {
4341:   max-height: 54px;
4397:     max-height: 46px;
4496:   max-height: 34px;
4530: @media (min-width: 900px) and (max-height: 790px) {
4560:     max-height: 30px;
4591:     max-height: 28px;
4626:   max-height: 42px;
4655: @media (min-width: 900px) and (max-height: 790px) {
4680:     max-height: 38px;
4706:     max-height: 32px;
4748:   max-height: 46px;
4808: @media (min-width: 900px) and (max-height: 790px) {
4828:     max-height: 42px;
4854:     max-height: 34px;
5031:   max-height: clamp(42px, 6.2vw, 74px) !important;
5040:   max-height: clamp(44px, 5.8vw, 68px) !important;
5045:   max-height: clamp(42px, 5.8vw, 66px) !important;
5050:   max-height: clamp(52px, 6.8vw, 78px) !important;
5055:   max-height: clamp(28px, 4vw, 44px) !important;
5060:   max-height: clamp(34px, 4.8vw, 54px) !important;
5336:   max-height: min(74vh, 690px);
5340: .panel-cuts .cut-scroll {
5345:   max-height: clamp(248px, 33vh, 350px);
5348:   overflow-y: auto;
5349:   overscroll-behavior: contain;
5352:   touch-action: pan-y;
5355: .panel-cuts .cut-scroll::-webkit-scrollbar {
5359: .panel-cuts .cut-scroll::-webkit-scrollbar-track {
5364: .panel-cuts .cut-scroll::-webkit-scrollbar-thumb {
5369: .panel-cuts .cut-scroll .cut-card {
5373: .panel-cuts .cut-scroll .cut-card--all-cuts {
5403: @media (min-width: 900px) and (max-height: 790px) {
5405:     max-height: min(72vh, 640px);
5408:   .panel-cuts .cut-scroll {
5409:     max-height: clamp(220px, 31vh, 318px);
5412:   .panel-cuts .cut-scroll .cut-card {
5416:   .panel-cuts .cut-scroll .cut-card--all-cuts {
5422:   .panel-cuts .cut-scroll {
5424:     max-height: clamp(280px, 40vh, 420px);
5430:     max-height: none;
5434:   .panel-cuts .cut-scroll {
5436:     max-height: 46vh;
5457: .panel-cuts .cut-scroll {
5463: .panel-cuts .cut-scroll .cut-card--all-cuts {
5467: .panel-cuts .cut-scroll .cut-card {
5468:   scroll-snap-align: start;
5471: .panel-cuts .cut-scroll {
5472:   scroll-snap-type: y proximity;
```
