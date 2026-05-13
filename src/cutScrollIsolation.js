const SCROLL_SELECTOR = ".cut-scroll";
const MAX_WHEEL_DELTA = 110;
const WHEEL_MULTIPLIER = 0.72;
const SMOOTHING = 0.28;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const normalizeWheelDelta = (event, container) => {
  const unit =
    event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? 16
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
        ? container.clientHeight
        : 1;

  return clamp(event.deltaY * unit, -MAX_WHEEL_DELTA, MAX_WHEEL_DELTA) * WHEEL_MULTIPLIER;
};

const getScrollableParent = (target) => {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest(SCROLL_SELECTOR);
};

const setActiveContainer = (container) => {
  window.__paragonCutScrollActive = Boolean(container);
  window.__paragonCutScrollContainer = container || null;
};

const stopScrollEvent = (event) => {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
};

const createSmoothScroller = () => {
  let frame = 0;
  let pendingDelta = 0;
  let container = null;

  const tick = () => {
    if (!container) {
      frame = 0;
      pendingDelta = 0;
      return;
    }

    const step = pendingDelta * SMOOTHING;

    container.scrollTop += step;
    pendingDelta -= step;

    if (Math.abs(pendingDelta) < 0.35) {
      frame = 0;
      pendingDelta = 0;
      return;
    }

    frame = window.requestAnimationFrame(tick);
  };

  return {
    add(nextContainer, delta) {
      container = nextContainer;
      pendingDelta += delta;

      if (!frame) {
        frame = window.requestAnimationFrame(tick);
      }
    },
  };
};

export function initCutScrollIsolation() {
  if (window.__paragonCutScrollIsolation === true) {
    return;
  }

  window.__paragonCutScrollIsolation = true;
  setActiveContainer(null);

  const smoothScroller = createSmoothScroller();

  document.addEventListener(
    "pointerover",
    (event) => {
      const container = getScrollableParent(event.target);

      if (container) {
        setActiveContainer(container);
      }
    },
    { capture: true },
  );

  document.addEventListener(
    "pointerout",
    (event) => {
      const activeContainer = window.__paragonCutScrollContainer;

      if (!activeContainer) {
        return;
      }

      if (event.relatedTarget instanceof Node && activeContainer.contains(event.relatedTarget)) {
        return;
      }

      setActiveContainer(null);
    },
    { capture: true },
  );

  window.addEventListener(
    "wheel",
    (event) => {
      const hoveredContainer = getScrollableParent(event.target);
      const activeContainer = window.__paragonCutScrollContainer;
      const container = hoveredContainer || activeContainer;

      if (!container) {
        return;
      }

      stopScrollEvent(event);

      const delta = normalizeWheelDelta(event, container);

      if (Math.abs(delta) < 0.1) {
        return;
      }

      smoothScroller.add(container, delta);
    },
    { capture: true, passive: false },
  );

  let touchStartY = 0;
  let activeTouchContainer = null;

  window.addEventListener(
    "touchstart",
    (event) => {
      activeTouchContainer = getScrollableParent(event.target);
      touchStartY = event.touches?.[0]?.clientY || 0;

      if (activeTouchContainer) {
        setActiveContainer(activeTouchContainer);
      }
    },
    { capture: true, passive: true },
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      if (!activeTouchContainer) {
        return;
      }

      const currentY = event.touches?.[0]?.clientY || 0;
      const deltaY = touchStartY - currentY;
      touchStartY = currentY;

      stopScrollEvent(event);

      activeTouchContainer.scrollTop += deltaY;
    },
    { capture: true, passive: false },
  );

  window.addEventListener(
    "touchend",
    () => {
      activeTouchContainer = null;
      setActiveContainer(null);
    },
    { capture: true, passive: true },
  );
}
