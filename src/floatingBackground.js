import { assetPath } from "./assetPath.js";

/*
 * 2D floating background prototype with smooth circular section-loop depth.
 * Uses PNG layers while preserving the old mixed-depth behavior.
 */

const ASSETS = [
  { src: "assets/floating-meat-2d/temp-01-ribeye.webp", seed: 0.11, size: 0.96 },
  { src: "assets/floating-meat-2d/temp-02-striploin.webp", seed: 0.22, size: 0.88 },
  { src: "assets/floating-meat-2d/temp-03-tenderloin.webp", seed: 0.33, size: 0.78 },
  { src: "assets/floating-meat-2d/temp-04-short-rib.webp", seed: 0.44, size: 1.04 },
  { src: "assets/floating-meat-2d/temp-05-tomahawk.webp", seed: 0.55, size: 1.14 },
  { src: "assets/floating-meat-2d/temp-06-picanha.webp", seed: 0.66, size: 0.9 },
  { src: "assets/floating-meat-2d/temp-07-presa.webp", seed: 0.77, size: 0.82 },
  { src: "assets/floating-meat-2d/temp-08-secreto.webp", seed: 0.88, size: 0.86 },
];

const DEPTH_ROLE_MAP = [
  ["foreground", "midground", "background", "midground", "foreground", "background", "midground", "foreground"],
  ["background", "foreground", "midground", "foreground", "midground", "background", "foreground", "midground"],
  ["midground", "background", "foreground", "midground", "background", "foreground", "midground", "background"],
  ["foreground", "background", "midground", "background", "foreground", "midground", "background", "midground"],
  ["midground", "foreground", "background", "foreground", "background", "midground", "foreground", "background"],
];

const DEPTH = {
  foreground: { scale: 1.2, opacity: 0.38, blur: 1.25, parallax: 0.74, drift: 0.58, contrast: 1.04, z: 30, follow: 0.032 },
  midground: { scale: 0.94, opacity: 0.29, blur: 0.62, parallax: 0.5, drift: 0.42, contrast: 1.01, z: 20, follow: 0.026 },
  background: { scale: 0.7, opacity: 0.16, blur: 1.85, parallax: 0.32, drift: 0.28, contrast: 0.95, z: 10, follow: 0.02 },
};

const BASE_POSITIONS = [
  { x: -42, y: -28, rotation: -12 },
  { x: 37, y: -31, rotation: 10 },
  { x: -26, y: 19, rotation: 8 },
  { x: 34, y: 22, rotation: -14 },
  { x: 4, y: -40, rotation: 18 },
  { x: -48, y: 38, rotation: -5 },
  { x: 49, y: 4, rotation: 7 },
  { x: -5, y: 37, rotation: -18 },
];

const SECTION_COUNT = DEPTH_ROLE_MAP.length;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (from, to, amount) => from + (to - from) * amount;
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function smoothStep(amount) {
  const t = clamp(amount, 0, 1);
  return t * t * (3 - 2 * t);
}

function smootherStep(amount) {
  const t = clamp(amount, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function circularIndex(index) {
  return ((index % SECTION_COUNT) + SECTION_COUNT) % SECTION_COUNT;
}

function circularDelta(from, to) {
  let delta = to - from;

  if (delta > SECTION_COUNT / 2) {
    delta -= SECTION_COUNT;
  }

  if (delta < -SECTION_COUNT / 2) {
    delta += SECTION_COUNT;
  }

  return delta;
}

function getRole(assetIndex, sectionIndex) {
  const map = DEPTH_ROLE_MAP[circularIndex(sectionIndex)];
  return map[assetIndex % map.length] || "midground";
}

function blendDepth(fromRole, toRole, amount) {
  const from = DEPTH[fromRole] || DEPTH.midground;
  const to = DEPTH[toRole] || DEPTH.midground;
  const t = smootherStep(amount);

  return {
    scale: lerp(from.scale, to.scale, t),
    opacity: lerp(from.opacity, to.opacity, t),
    blur: lerp(from.blur, to.blur, t),
    parallax: lerp(from.parallax, to.parallax, t),
    drift: lerp(from.drift, to.drift, t),
    contrast: lerp(from.contrast, to.contrast, t),
    follow: lerp(from.follow, to.follow, t),
    z: t < 0.5 ? from.z : to.z,
  };
}

function getSceneCenters() {
  return Array.from(document.querySelectorAll(".scene")).map((scene) => {
    const rect = scene.getBoundingClientRect();
    return window.scrollY + rect.top + rect.height * 0.5;
  });
}

function getCircularSectionTarget(previousProgress) {
  const centers = getSceneCenters();

  if (centers.length <= 1) {
    return previousProgress;
  }

  const viewportCenter = window.scrollY + window.innerHeight * 0.5;
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  centers.forEach((center, index) => {
    const distance = Math.abs(center - viewportCenter);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = circularIndex(index);
    }
  });

  const currentIndex = circularIndex(Math.round(previousProgress));
  const step = circularDelta(currentIndex, nearestIndex);
  return previousProgress + step;
}

function getSectionPair(progress) {
  const normalized = ((progress % SECTION_COUNT) + SECTION_COUNT) % SECTION_COUNT;
  const fromIndex = Math.floor(normalized);
  const amount = normalized - fromIndex;

  return {
    fromIndex: circularIndex(fromIndex),
    toIndex: circularIndex(fromIndex + 1),
    amount,
  };
}

function getSectionPosition(base, assetIndex, sectionIndex, role) {
  const seed = ASSETS[assetIndex].seed;
  const wave = circularIndex(sectionIndex) * 1.87 + seed * 9.6;
  const rolePush = role === "foreground" ? 5.2 : role === "background" ? -5.2 : 0;

  return {
    x: base.x + Math.sin(wave) * 5.2 + rolePush * 0.32,
    y: base.y + Math.cos(wave * 0.88) * 4.4 - rolePush * 0.18,
    rotation: base.rotation + Math.sin(wave * 1.18) * 8.5,
  };
}

function blendPosition(from, to, amount) {
  const t = smootherStep(amount);

  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    rotation: lerp(from.rotation, to.rotation, t),
  };
}

function createLayer() {
  const existing = document.querySelector(".floating-meat-layer");

  if (existing) {
    existing.remove();
  }

  const layer = document.createElement("div");
  layer.className = "floating-meat-layer";
  layer.dataset.renderer = "2d";
  layer.setAttribute("aria-hidden", "true");
  document.body.prepend(layer);
  return layer;
}

function createItem(asset, index) {
  const image = document.createElement("img");
  image.className = "floating-meat-2d-item";
  image.src = assetPath(asset.src);
  image.alt = "";
  image.decoding = "async";
  image.loading = "eager";
  image.dataset.index = String(index);
  return image;
}

function createState(base, asset, index) {
  return {
    x: base.x,
    y: base.y,
    rotation: base.rotation,
    scale: asset.size,
    opacity: 0,
    blur: 2,
    contrast: 1,
    delay: 0.65 + index * 0.09 + asset.seed * 0.22,
  };
}

export async function initFloatingBackground() {
  if (window.__paragonFloatingBackgroundCleanup) {
    window.__paragonFloatingBackgroundCleanup();
    window.__paragonFloatingBackgroundCleanup = null;
  }

  if (prefersReducedMotion()) {
    console.info("[Paragon Floating Meat] 2D renderer inactive because reduced motion is enabled.");
    return;
  }

  const layer = createLayer();
  const items = ASSETS.map((asset, index) => {
    const element = createItem(asset, index);
    const base = BASE_POSITIONS[index % BASE_POSITIONS.length];
    layer.appendChild(element);

    return {
      asset,
      element,
      base,
      index,
      state: createState(base, asset, index),
    };
  });

  let disposed = false;
  let animationFrame = 0;
  let loopProgress = getCircularSectionTarget(0);
  let targetProgress = loopProgress;
  let lastScrollY = window.scrollY;
  let scrollImpulse = 0;

  const updateTarget = () => {
    const currentScrollY = window.scrollY;
    const delta = clamp(currentScrollY - lastScrollY, -46, 46);
    lastScrollY = currentScrollY;

    scrollImpulse = clamp(scrollImpulse + delta / 260, -0.34, 0.34);
    targetProgress = getCircularSectionTarget(loopProgress);
  };

  const onScrollOrResize = () => {
    updateTarget();
  };

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize, { passive: true });
  updateTarget();

  const render = (time) => {
    if (disposed) {
      return;
    }

    targetProgress = getCircularSectionTarget(loopProgress);
    loopProgress += circularDelta(loopProgress, targetProgress) * 0.032;
    scrollImpulse *= 0.94;

    items.forEach((item) => {
      const delayedProgress = loopProgress - circularDelta(targetProgress, loopProgress) * item.state.delay * 0.18;
      const pair = getSectionPair(delayedProgress);
      const easedAmount = smootherStep(pair.amount);
      const fromRole = getRole(item.index, pair.fromIndex);
      const toRole = getRole(item.index, pair.toIndex);
      const depth = blendDepth(fromRole, toRole, easedAmount);

      const fromPosition = getSectionPosition(item.base, item.index, pair.fromIndex, fromRole);
      const toPosition = getSectionPosition(item.base, item.index, pair.toIndex, toRole);
      const position = blendPosition(fromPosition, toPosition, easedAmount);

      const phase = time * 0.000045 * depth.drift + item.asset.seed * 10.8 + delayedProgress * 0.36;
      const driftX = Math.sin(phase * 1.25) * 2.6 * depth.drift;
      const driftY = Math.cos(phase * 0.96) * 2.1 * depth.drift;
      const impulseX = scrollImpulse * 1.8 * depth.parallax;
      const impulseY = scrollImpulse * -3.2 * depth.parallax;
      const impulseRotation = scrollImpulse * 2.2 * depth.parallax;

      const target = {
        x: position.x + driftX + impulseX,
        y: position.y + driftY + impulseY,
        rotation: position.rotation + Math.sin(phase) * 2.6 + impulseRotation,
        scale: item.asset.size * depth.scale * (1 + Math.sin(phase * 0.62) * 0.01),
        opacity: depth.opacity,
        blur: depth.blur,
        contrast: depth.contrast,
      };

      const follow = clamp(depth.follow * (0.82 + item.asset.seed * 0.28), 0.014, 0.036);
      item.state.x = lerp(item.state.x, target.x, follow);
      item.state.y = lerp(item.state.y, target.y, follow);
      item.state.rotation = lerp(item.state.rotation, target.rotation, follow * 0.78);
      item.state.scale = lerp(item.state.scale, target.scale, follow);
      item.state.opacity = lerp(item.state.opacity, target.opacity, follow * 1.25);
      item.state.blur = lerp(item.state.blur, target.blur, follow);
      item.state.contrast = lerp(item.state.contrast, target.contrast, follow);

      item.element.style.zIndex = String(depth.z + item.index);
      item.element.style.opacity = String(item.state.opacity.toFixed(3));
      item.element.style.filter =
        "blur(" + item.state.blur.toFixed(2) + "px) saturate(0.82) contrast(" + item.state.contrast.toFixed(2) + ")";
      item.element.style.transform =
        "translate3d(" + item.state.x.toFixed(2) + "vw, " + item.state.y.toFixed(2) + "vh, 0) rotate(" +
        item.state.rotation.toFixed(2) + "deg) scale(" + item.state.scale.toFixed(3) + ")";
    });

    animationFrame = window.requestAnimationFrame(render);
  };

  animationFrame = window.requestAnimationFrame(render);

  window.__paragonFloatingBackground = {
    getState() {
      const pair = getSectionPair(loopProgress);

      return {
        mode: "temporary-2d-smooth-circular-depth-field",
        assetCount: items.length,
        loopProgress: Number(loopProgress.toFixed(3)),
        fromSection: pair.fromIndex,
        toSection: pair.toIndex,
        amount: Number(pair.amount.toFixed(3)),
      };
    },
  };

  window.__paragonFloatingBackgroundCleanup = () => {
    disposed = true;
    window.cancelAnimationFrame(animationFrame);
    window.removeEventListener("scroll", onScrollOrResize);
    window.removeEventListener("resize", onScrollOrResize);
    layer.remove();

    if (window.__paragonFloatingBackground?.getState?.().mode === "temporary-2d-smooth-circular-depth-field") {
      delete window.__paragonFloatingBackground;
    }
  };

  console.info("[Paragon Floating Meat] Temporary 2D smooth circular-depth renderer active.");
}
