const SCROLL_SELECTOR = ".cut-scroll";

const getScrollableParent = (target) => {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest(SCROLL_SELECTOR);
};

const applyWheelScroll = (container, event) => {
  const deltaY = event.deltaY;
  const deltaX = event.deltaX;

  if (Math.abs(deltaY) < Math.abs(deltaX)) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  container.scrollTop += deltaY;
};

export function initCutScrollIsolation() {
  if (window.__paragonCutScrollIsolation === true) {
    return;
  }

  window.__paragonCutScrollIsolation = true;

  window.addEventListener(
    "wheel",
    (event) => {
      const container = getScrollableParent(event.target);

      if (!container) {
        return;
      }

      applyWheelScroll(container, event);
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

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      activeTouchContainer.scrollTop += deltaY;
    },
    { capture: true, passive: false },
  );

  window.addEventListener(
    "touchend",
    () => {
      activeTouchContainer = null;
    },
    { capture: true, passive: true },
  );
}
