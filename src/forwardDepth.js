import gsap from "gsap";

const DESKTOP_QUERY = "(min-width: 0px)";
const REDUCE_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const TRANSITION_DURATION = 1.08;
const WHEEL_THRESHOLD = 12;
const TOUCH_THRESHOLD = 44;

/* FORWARD_DEPTH_INPUT_SAFETY_START */
const INTERACTIVE_TARGET_SELECTOR = [
  "input",
  "textarea",
  "select",
  "option",
  "button",
  "a[href]",
  "label",
  "form",
  "[contenteditable]:not([contenteditable='false'])",
  "[role='textbox']",
  "[role='searchbox']",
  "[role='button']",
  "[role='link']",
  "[data-cuts-search]",
  "[data-inquiry-form]",
  ".cut-scroll",
].join(", ");

function getTargetElement(target) {
  if (target instanceof Element) {
    return target;
  }

  if (target instanceof Node) {
    return target.parentElement;
  }

  return null;
}

function isInteractiveTarget(target) {
  const element = getTargetElement(target);

  return Boolean(element?.closest(INTERACTIVE_TARGET_SELECTOR));
}

function getForwardDepthViewportWidth() {
  return Math.round(
    window.visualViewport?.width ||
      window.innerWidth ||
      document.documentElement.clientWidth ||
      0,
  );
}

function getPreviousActiveSceneIndex() {
  const previousState = window.__paragonForwardDepth?.getState?.();
  const previousIndex = Number(previousState?.activeIndex);

  return Number.isInteger(previousIndex) && previousIndex >= 0
    ? previousIndex
    : 0;
}
/* FORWARD_DEPTH_INPUT_SAFETY_END */

const PARAGON_DEPTH_TRANSITION_START = "paragon:depth-transition-start";
const PARAGON_DEPTH_TRANSITION_COMPLETE = "paragon:depth-transition-complete";

function dispatchDepthEvent(eventName, detail) {
  document.dispatchEvent(
    new CustomEvent(eventName, {
      detail,
    }),
  );
}

function getSceneCandidates() {
  const main = document.querySelector("main");

  if (!main) {
    return [];
  }

  return Array.from(main.children).filter((element) => {
    return element instanceof HTMLElement && element.classList.contains("scene");
  });
}

function getForegroundElements(scene) {
  return Array.from(
    scene.querySelectorAll(
      [
        ".panel",
        ".hero-actions",
        ".brand-card",
        ".cut-card",
        ".inquiry-detail-card",
        "button",
        "a",
      ].join(", "),
    ),
  );
}

function getTargetSceneIndex(scenes, target) {
  const normalizedTarget = String(target || "").trim().toLowerCase();

  const targetSelectors = {
    hero: "#hero, .scene-hero",
    home: "#hero, .scene-hero",
    about: "#about, .scene-story",
    story: "#about, .scene-story",
    producers: "#producers, .scene-portfolio",
    portfolio: "#producers, .scene-portfolio",
    cuts: "#cuts, .scene-cuts",
    selectedcuts: "#cuts, .scene-cuts",
    inquiry: "#inquiry, .scene-inquiry",
    contact: "#inquiry, .scene-inquiry",
  };

  const selector = targetSelectors[normalizedTarget.replace(/[^a-z]/g, "")];

  if (!selector) {
    return -1;
  }

  return scenes.findIndex((scene) => scene.matches(selector));
}

function updateSectionNavigation(scenes, activeIndex) {
  document.querySelectorAll(".section-index [data-section-target], .global-contact-cta[data-section-target]").forEach((control) => {
    const targetIndex = getTargetSceneIndex(scenes, control.dataset.sectionTarget);
    const isActive = targetIndex === activeIndex;

    control.classList.toggle("is-active", isActive);

    if (isActive) {
      control.setAttribute("aria-current", "true");
    } else {
      control.removeAttribute("aria-current");
    }
  });
}

function setSceneInteractivity(scenes, activeIndex, isAnimating) {
  scenes.forEach((scene, index) => {
    const isActive = index === activeIndex && !isAnimating;
    const isVisibleTransitionLayer = index === activeIndex && isAnimating;

    scene.classList.toggle("is-depth-sweet-spot", isActive);
    scene.classList.toggle("is-depth-transitioning", isVisibleTransitionLayer);
    scene.classList.toggle("is-depth-inactive", !isActive && !isVisibleTransitionLayer);

    scene.style.pointerEvents = isActive ? "auto" : "none";

    if (isActive || isVisibleTransitionLayer) {
      scene.removeAttribute("aria-hidden");
    } else {
      scene.setAttribute("aria-hidden", "true");
    }
  });
}

function clearForwardDepthState() {
  if (window.__paragonForwardDepthCleanup) {
    window.__paragonForwardDepthCleanup();
    window.__paragonForwardDepthCleanup = null;
  }

  if (window.__paragonForwardDepthTween) {
    window.__paragonForwardDepthTween.kill();
    window.__paragonForwardDepthTween = null;
  }

  if (window.__paragonForwardDepthTimeline) {
    window.__paragonForwardDepthTimeline.kill();
    window.__paragonForwardDepthTimeline = null;
  }

  document.documentElement.classList.remove("v32-forward-depth-enabled", "v32-step-commit-enabled");
  document.body.classList.remove("v32-forward-depth-enabled", "v32-step-commit-enabled", "is-depth-animating");

  document.querySelectorAll(".depth-scroll-spacer").forEach((element) => {
    element.remove();
  });

  document.querySelectorAll(".depth-scene").forEach((scene) => {
    const foreground = getForegroundElements(scene);

    scene.classList.remove(
      "depth-scene",
      "is-depth-sweet-spot",
      "is-depth-transitioning",
      "is-depth-inactive",
    );

    scene.removeAttribute("data-depth-scene");
    scene.removeAttribute("aria-hidden");
    scene.style.pointerEvents = "";

    gsap.set(foreground, { clearProps: "all" });
    gsap.set(scene, { clearProps: "all" });
  });
}

function prepareSceneBase(scenes, activeIndex = 0) {
  const initialScene =
    scenes[Math.max(0, Math.min(scenes.length - 1, activeIndex))];

  gsap.set(scenes, {
    autoAlpha: 0,
    scale: 0.86,
    yPercent: 7,
    zIndex: 10,
    pointerEvents: "none",
    transformOrigin: "50% 50%",
  });

  scenes.forEach((scene) => {
    const foreground = getForegroundElements(scene);

    if (foreground.length > 0) {
      gsap.set(foreground, {
        y: 28,
        scale: 0.985,
        transformOrigin: "50% 50%",
      });
    }
  });

  gsap.set(initialScene, {
    autoAlpha: 1,
    scale: 1,
    yPercent: 0,
    zIndex: 40,
  });

  const initialForeground = getForegroundElements(initialScene);

  if (initialForeground.length > 0) {
    gsap.set(initialForeground, {
      y: 0,
      scale: 1,
    });
  }
}

function wireHeroButtons(scenes, goToSpot, cleanupCallbacks) {
  const heroTargets = {
    about: "about",
    producers: "producers",
    portfolio: "producers",
    cuts: "cuts",
    inquiry: "inquiry",
    contact: "inquiry",
    "About Us": "about",
    Producers: "producers",
    "View Portfolio": "producers",
    "Selected Cuts": "cuts",
    Contact: "inquiry",
    "Request Information": "inquiry",
  };

  document.querySelectorAll(".hero-actions .button").forEach((button) => {
    const explicitTarget = button.dataset.heroTarget;
    const labelTarget = button.textContent?.trim();
    const sectionTarget = heroTargets[explicitTarget] || heroTargets[labelTarget];
    const targetIndex = getTargetSceneIndex(scenes, sectionTarget);

    if (targetIndex < 0) {
      return;
    }

    button.style.pointerEvents = "auto";
    button.style.cursor = "pointer";

    const handler = (event) => {
      event.preventDefault();

      button.classList.add("is-pressed");
      window.setTimeout(() => {
        button.classList.remove("is-pressed");
      }, 180);

      goToSpot(targetIndex, "hero-cta");
    };

    button.addEventListener("click", handler);
    cleanupCallbacks.push(() => button.removeEventListener("click", handler));
  });
}

function wireSectionNavigation(
  scenes,
  goToSpot,
  cleanupCallbacks,
  activeIndex = 0,
) {
  document.querySelectorAll(".section-index [data-section-target], .global-contact-cta[data-section-target]").forEach((control) => {
    const targetIndex = getTargetSceneIndex(scenes, control.dataset.sectionTarget);

    if (targetIndex < 0) {
      return;
    }

    control.style.pointerEvents = "auto";
    control.style.cursor = "pointer";

    const handler = (event) => {
      event.preventDefault();
      goToSpot(targetIndex, "section-index");
    };

    control.addEventListener("click", handler);
    cleanupCallbacks.push(() => control.removeEventListener("click", handler));
  });

  updateSectionNavigation(scenes, activeIndex);
}

export function initForwardDepth() {
  const previousActiveIndex = getPreviousActiveSceneIndex();
  const reduceMotion = window.matchMedia(REDUCE_MOTION_QUERY).matches;
  const desktop = window.matchMedia(DESKTOP_QUERY).matches;

  clearForwardDepthState();

  if (reduceMotion || !desktop) {
    console.info("[Paragon V3.2] Direct step model inactive: reduced motion.");
    return;
  }

  const scenes = getSceneCandidates();

  if (scenes.length < 2) {
    console.warn("[Paragon V3.2] Direct step model skipped: fewer than 2 direct .scene sections found.");
    return;
  }

  document.documentElement.classList.add("v32-forward-depth-enabled", "v32-step-commit-enabled");
  document.body.classList.add("v32-forward-depth-enabled", "v32-step-commit-enabled");

  scenes.forEach((scene, index) => {
    scene.classList.add("depth-scene");
    scene.setAttribute("data-depth-scene", String(index));
  });

  const initialActiveIndex = Math.max(
    0,
    Math.min(scenes.length - 1, previousActiveIndex),
  );

  prepareSceneBase(scenes, initialActiveIndex);

  const cleanupCallbacks = [];
  let activeIndex = initialActiveIndex;
  let isAnimating = false;
  let touchStartY = 0;
  // MOBILE_ROUND1_SECTION4_FORWARD_DEPTH_TOUCH_GUARD_STATE_START
  let isInternalScrollGesture = false;
  // MOBILE_ROUND1_SECTION4_FORWARD_DEPTH_TOUCH_GUARD_STATE_END

  function isModalInteractionOpen() {
    return Boolean(
      document.body.classList.contains("about-modal-open") ||
        document.body.classList.contains("product-list-modal-open") ||
        document.querySelector("dialog[open]"),
    );
  }

  // MOBILE_ROUND1_SECTION4_FORWARD_DEPTH_TOUCH_GUARD_HELPER_START
  function isInternalScrollTarget(target) {
    return isInteractiveTarget(target);
  }
  // MOBILE_ROUND1_SECTION4_FORWARD_DEPTH_TOUCH_GUARD_HELPER_END

  function goToSpot(targetIndex, source = "input") {
    const nextIndex = Math.max(0, Math.min(scenes.length - 1, targetIndex));

    if (isAnimating || nextIndex === activeIndex) {
      return;
    }

    const previousIndex = activeIndex;
    const direction = nextIndex > previousIndex ? 1 : -1;
    const currentScene = scenes[previousIndex];
    const nextScene = scenes[nextIndex];
    const currentForeground = getForegroundElements(currentScene);
    const nextForeground = getForegroundElements(nextScene);

    isAnimating = true;
    document.body.classList.add("is-depth-animating");
    updateSectionNavigation(scenes, nextIndex);

    dispatchDepthEvent(PARAGON_DEPTH_TRANSITION_START, {
      fromIndex: previousIndex,
      toIndex: nextIndex,
      direction,
      source,
      sceneCount: scenes.length,
    });

    scenes.forEach((scene, index) => {
      const shouldShow = index === previousIndex || index === nextIndex;

      scene.classList.toggle("is-depth-transitioning", shouldShow);
      scene.classList.toggle("is-depth-inactive", !shouldShow);
      scene.classList.remove("is-depth-sweet-spot");
      scene.style.pointerEvents = "none";

      if (shouldShow) {
        scene.removeAttribute("aria-hidden");
      } else {
        scene.setAttribute("aria-hidden", "true");
      }
    });

    if (window.__paragonForwardDepthTween) {
      window.__paragonForwardDepthTween.kill();
    }

    const currentExit = direction > 0
      ? { autoAlpha: 0, scale: 1.14, yPercent: -5, zIndex: 15 }
      : { autoAlpha: 0, scale: 0.86, yPercent: 7, zIndex: 15 };

    const nextStart = direction > 0
      ? { autoAlpha: 0, scale: 0.86, yPercent: 7, zIndex: 60 }
      : { autoAlpha: 0, scale: 1.14, yPercent: -5, zIndex: 60 };

    const currentForegroundExit = direction > 0
      ? { y: -20, scale: 1.012 }
      : { y: 24, scale: 0.985 };

    const timeline = gsap.timeline({
      defaults: {
        ease: "power2.inOut",
      },
      onComplete: () => {
        activeIndex = nextIndex;
        isAnimating = false;
        document.body.classList.remove("is-depth-animating");

        gsap.set(scenes, {
          pointerEvents: "none",
        });

        gsap.set(nextScene, {
          autoAlpha: 1,
          scale: 1,
          yPercent: 0,
          zIndex: 40,
        });

        gsap.set(nextForeground, {
          y: 0,
          scale: 1,
        });

        setSceneInteractivity(scenes, activeIndex, false);
        updateSectionNavigation(scenes, activeIndex);

        dispatchDepthEvent(PARAGON_DEPTH_TRANSITION_COMPLETE, {
          fromIndex: previousIndex,
          toIndex: nextIndex,
          direction,
          source,
          sceneCount: scenes.length,
        });

        window.__paragonForwardDepthTween = null;

        console.info(`[Paragon V3.2] Locked sweet spot ${activeIndex} via ${source}.`);
      },
    });

    timeline
      .set(nextScene, nextStart, 0)
      .to(
        currentForeground,
        {
          ...currentForegroundExit,
          duration: TRANSITION_DURATION * 0.58,
          stagger: 0.018,
          ease: "power2.in",
        },
        0,
      )
      .to(
        currentScene,
        {
          ...currentExit,
          duration: TRANSITION_DURATION,
          ease: "power2.inOut",
        },
        0,
      )
      .to(
        nextScene,
        {
          autoAlpha: 1,
          scale: 1,
          yPercent: 0,
          duration: TRANSITION_DURATION,
          ease: "power2.inOut",
        },
        0,
      )
      .fromTo(
        nextForeground,
        {
          y: direction > 0 ? 30 : -20,
          scale: 0.985,
        },
        {
          y: 0,
          scale: 1,
          duration: TRANSITION_DURATION * 0.76,
          stagger: 0.022,
          ease: "power2.out",
        },
        0.12,
      );

    window.__paragonForwardDepthTween = timeline;
  }

  function goNext() {
    const nextIndex = activeIndex >= scenes.length - 1 ? 0 : activeIndex + 1;
    goToSpot(nextIndex, "wheel");
  }

  function goPrevious() {
    const previousIndex = activeIndex <= 0 ? scenes.length - 1 : activeIndex - 1;
    goToSpot(previousIndex, "wheel");
  }

  function handleWheel(event) {
    if (
      event.defaultPrevented ||
      isInteractiveTarget(event.target) ||
      window.__paragonCutScrollActive === true
    ) {
      return;
    }

    if (isModalInteractionOpen()) {
      return;
    }

    event.preventDefault();

    if (Math.abs(event.deltaY) < WHEEL_THRESHOLD) {
      return;
    }

    if (event.deltaY > 0) {
      goNext();
    } else {
      goPrevious();
    }
  }

  // MOBILE_ROUND1_SECTION4_FORWARD_DEPTH_TOUCH_GUARD_START
  function handleTouchStart(event) {
    if (isModalInteractionOpen()) {
      isInternalScrollGesture = false;
      return;
    }

    isInternalScrollGesture =
      isInternalScrollTarget(event.target) || window.__paragonCutScrollActive === true;

    if (isInternalScrollGesture) {
      touchStartY = 0;
      return;
    }

    touchStartY = event.touches[0]?.clientY || 0;
  }

  function handleTouchMove(event) {
    if (isModalInteractionOpen() || isInternalScrollGesture) {
      return;
    }

    event.preventDefault();
  }

  function handleTouchEnd(event) {
    if (isModalInteractionOpen() || isInternalScrollGesture) {
      touchStartY = 0;
      isInternalScrollGesture = false;
      return;
    }

    const touchEndY = event.changedTouches[0]?.clientY || 0;
    const deltaY = touchStartY - touchEndY;
    touchStartY = 0;

    if (Math.abs(deltaY) < TOUCH_THRESHOLD) {
      return;
    }

    if (deltaY > 0) {
      goNext();
    } else {
      goPrevious();
    }
  }
  // MOBILE_ROUND1_SECTION4_FORWARD_DEPTH_TOUCH_GUARD_END

  function handleKeyDown(event) {
    if (
      event.defaultPrevented ||
      event.isComposing ||
      isModalInteractionOpen() ||
      isInteractiveTarget(event.target) ||
      isInteractiveTarget(document.activeElement)
    ) {
      return;
    }

    const nextKeys = new Set(["ArrowDown", "PageDown", " ", "Enter"]);
    const previousKeys = new Set(["ArrowUp", "PageUp", "Backspace"]);

    if (nextKeys.has(event.key)) {
      event.preventDefault();
      goNext();
    }

    if (previousKeys.has(event.key)) {
      event.preventDefault();
      goPrevious();
    }

    if (event.key === "Home") {
      event.preventDefault();
      goToSpot(0, "keyboard");
    }

    if (event.key === "End") {
      event.preventDefault();
      goToSpot(scenes.length - 1, "keyboard");
    }
  }

  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchmove", handleTouchMove, { passive: false });
  window.addEventListener("touchend", handleTouchEnd, { passive: true });
  window.addEventListener("keydown", handleKeyDown);

  cleanupCallbacks.push(() => window.removeEventListener("wheel", handleWheel));
  cleanupCallbacks.push(() => window.removeEventListener("touchstart", handleTouchStart));
  cleanupCallbacks.push(() => window.removeEventListener("touchmove", handleTouchMove));
  cleanupCallbacks.push(() => window.removeEventListener("touchend", handleTouchEnd));
  cleanupCallbacks.push(() => window.removeEventListener("keydown", handleKeyDown));

  wireHeroButtons(scenes, goToSpot, cleanupCallbacks);
  wireSectionNavigation(
    scenes,
    goToSpot,
    cleanupCallbacks,
    activeIndex,
  );

  setSceneInteractivity(scenes, activeIndex, false);
  updateSectionNavigation(scenes, activeIndex);

  window.__paragonForwardDepthTimeline = null;
  window.__paragonForwardDepthCleanup = () => {
    cleanupCallbacks.forEach((cleanup) => cleanup());
  };

  window.__paragonForwardDepth = {
    next: goNext,
    previous: goPrevious,
    goTo: (index) => goToSpot(index, "console"),
    getState: () => ({
      activeIndex,
      isAnimating,
      scenes: scenes.length,
      mode: "direct-step-commit",
    }),
  };

  console.info(`[Paragon V3.2] Direct step model active: ${scenes.length} scenes, spot 0-${scenes.length - 1}.`);
}

/* FORWARD_DEPTH_KEYBOARD_SAFE_RESIZE_START */
let lastForwardDepthViewportWidth = getForwardDepthViewportWidth();

window.addEventListener(
  "resize",
  () => {
    const nextViewportWidth = getForwardDepthViewportWidth();
    const widthChanged =
      Math.abs(nextViewportWidth - lastForwardDepthViewportWidth) >= 2;

    /*
      Mobile software keyboards primarily change viewport height.
      A height-only resize must not destroy the active scene controller,
      remove focus, close the keyboard, or return the site to Section 1.
    */
    if (!widthChanged) {
      return;
    }

    /*
      During a real width/orientation change, wait until the user is no
      longer editing before rebuilding the scene measurements.
    */
    if (isInteractiveTarget(document.activeElement)) {
      return;
    }

    lastForwardDepthViewportWidth = nextViewportWidth;

    window.clearTimeout(window.__paragonForwardDepthResizeTimer);
    window.__paragonForwardDepthResizeTimer = window.setTimeout(() => {
      initForwardDepth();
    }, 220);
  },
  { passive: true },
);
/* FORWARD_DEPTH_KEYBOARD_SAFE_RESIZE_END */



