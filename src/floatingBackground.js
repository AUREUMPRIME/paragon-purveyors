import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

const FLOATING_BASE_PATH = "/assets/floating-meat";
const LAYOUT_PATH = `${FLOATING_BASE_PATH}/composition/floating_background_layout.json`;
const REDUCE_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MOBILE_QUERY = "(max-width: 700px)";
const BASE_X_ROTATION_DEGREES = -90;
const TRANSITION_DURATION_SECONDS = 1.08;

/**
 * V5.4 Mixed Depth Field:
 * - Global section blur stays restrained.
 * - Every section contains close, mid, and far assets.
 * - Asset depth roles rotate per section for a more homogeneous layered field.
 */
const SECTION_PROFILES = [
  { name: "Hero", spread: 1.0, zOffset: 0.06, cameraZ: 9.72, blur: 2.4, opacity: 0.78, brightness: 0.82, saturation: 0.9 },
  { name: "About", spread: 1.03, zOffset: 0.02, cameraZ: 9.86, blur: 2.8, opacity: 0.74, brightness: 0.79, saturation: 0.86 },
  { name: "Portfolio", spread: 1.06, zOffset: -0.02, cameraZ: 10.0, blur: 3.2, opacity: 0.7, brightness: 0.75, saturation: 0.82 },
  { name: "Selected Cuts", spread: 1.08, zOffset: -0.06, cameraZ: 10.14, blur: 3.6, opacity: 0.66, brightness: 0.71, saturation: 0.78 },
  { name: "Inquiry", spread: 1.1, zOffset: -0.1, cameraZ: 10.28, blur: 4.1, opacity: 0.62, brightness: 0.67, saturation: 0.74 },
];

const SECTION_DEPTH_ROLE_MAP = [
  ["foreground", "midground", "background", "midground", "foreground", "background", "midground", "foreground", "midground", "background"],
  ["background", "foreground", "midground", "foreground", "midground", "background", "foreground", "midground", "background", "midground"],
  ["midground", "background", "foreground", "midground", "background", "foreground", "midground", "background", "foreground", "midground"],
  ["foreground", "background", "midground", "background", "foreground", "midground", "background", "midground", "foreground", "midground"],
  ["midground", "foreground", "background", "foreground", "background", "midground", "foreground", "background", "midground", "foreground"],
];

const ASSET_DEPTH_TIERS = {
  foreground: {
    zBias: 0.32,
    scaleBias: 1.045,
    parallax: 1.08,
    drift: 0.11,
    directionPush: 0.052,
    depthPush: 0.12,
    rotationBoost: 0.54,
    delay: 0.0,
  },
  midground: {
    zBias: 0.02,
    scaleBias: 1.0,
    parallax: 0.78,
    drift: 0.07,
    directionPush: 0.034,
    depthPush: 0.07,
    rotationBoost: 0.34,
    delay: 0.045,
  },
  background: {
    zBias: -0.3,
    scaleBias: 0.94,
    parallax: 0.52,
    drift: 0.04,
    directionPush: 0.02,
    depthPush: 0.038,
    rotationBoost: 0.2,
    delay: 0.09,
  },
};
const MOBILE_LAYOUT_PRESET = [
  // Mobile viewport-balanced layout.
  // Targeted adjustment:
  // - 09_meat_piece_07 moves from top-center to bottom-center.
  // - 02_wooden_plate_01 moves into the previous top-center position.
  // Desktop layout remains untouched.
  { x: -1.72, y: 2.72, z: -4.35, scaleBias: 0.68, rotationZ: -16 },
  { x: 0.82, y: 3.02, z: -4.75, scaleBias: 0.58, rotationZ: 14 },
  { x: 1.66, y: 2.28, z: -4.2, scaleBias: 0.66, rotationZ: 8 },
  { x: -1.78, y: -1.98, z: -4.65, scaleBias: 0.66, rotationZ: -18 },
  { x: -0.34, y: 3.16, z: -4.9, scaleBias: 0.58, rotationZ: 19 },
  { x: 1.82, y: -0.38, z: -4.3, scaleBias: 0.64, rotationZ: 11 },
  { x: -1.86, y: 0.82, z: -4.72, scaleBias: 0.6, rotationZ: -10 },
  { x: -1.38, y: -3.18, z: -4.9, scaleBias: 0.62, rotationZ: 17 },
  { x: 0.08, y: -3.18, z: -4.85, scaleBias: 0.62, rotationZ: 10 },
  { x: 1.54, y: -2.22, z: -5.15, scaleBias: 0.56, rotationZ: -14 },
];

function createCenterDirection(position) {
  const centerDirection = new THREE.Vector3(position.x, position.y, 0);

  if (centerDirection.length() < 0.01) {
    centerDirection.set(1, 0, 0);
  }

  centerDirection.normalize();

  return centerDirection;
}

function getMobileTransform(index, transform) {
  const preset = MOBILE_LAYOUT_PRESET[index % MOBILE_LAYOUT_PRESET.length] || MOBILE_LAYOUT_PRESET[0];

  return {
    position: new THREE.Vector3(preset.x, preset.y, preset.z),
    rotation: new THREE.Euler(
      transform.rotation.x,
      transform.rotation.y,
      transform.rotation.z + degreesToRadians(preset.rotationZ || 0),
    ),
    scale: transform.scale * preset.scaleBias,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

function splitAssetPath(path) {
  const normalized = path.replace(/\\/g, "/");
  const parts = normalized.split("/");
  const file = parts.pop();

  return {
    directory: parts.length > 0 ? `${parts.join("/")}/` : "",
    file,
  };
}

function degreesToRadians(degrees) {
  return THREE.MathUtils.degToRad(degrees);
}

function getProfile(index) {
  return SECTION_PROFILES[clamp(index, 0, SECTION_PROFILES.length - 1)] || SECTION_PROFILES[0];
}

function getSectionDepthRole(assetIndex, sectionIndex) {
  const sectionMap = SECTION_DEPTH_ROLE_MAP[clamp(sectionIndex, 0, SECTION_DEPTH_ROLE_MAP.length - 1)];

  return sectionMap[assetIndex % sectionMap.length] || "midground";
}

function blendProfiles(fromProfile, toProfile, amount) {
  return {
    name: amount < 0.5 ? fromProfile.name : toProfile.name,
    spread: lerp(fromProfile.spread, toProfile.spread, amount),
    zOffset: lerp(fromProfile.zOffset, toProfile.zOffset, amount),
    cameraZ: lerp(fromProfile.cameraZ, toProfile.cameraZ, amount),
    blur: lerp(fromProfile.blur, toProfile.blur, amount),
    opacity: lerp(fromProfile.opacity, toProfile.opacity, amount),
    brightness: lerp(fromProfile.brightness, toProfile.brightness, amount),
    saturation: lerp(fromProfile.saturation, toProfile.saturation, amount),
  };
}

function blendAssetDepth(fromDepth, toDepth, amount) {
  return {
    tier: amount < 0.5 ? fromDepth.tier : toDepth.tier,
    zBias: lerp(fromDepth.zBias, toDepth.zBias, amount),
    scaleBias: lerp(fromDepth.scaleBias, toDepth.scaleBias, amount),
    parallax: lerp(fromDepth.parallax, toDepth.parallax, amount),
    drift: lerp(fromDepth.drift, toDepth.drift, amount),
    directionPush: lerp(fromDepth.directionPush, toDepth.directionPush, amount),
    depthPush: lerp(fromDepth.depthPush, toDepth.depthPush, amount),
    rotationBoost: lerp(fromDepth.rotationBoost, toDepth.rotationBoost, amount),
    delay: lerp(fromDepth.delay, toDepth.delay, amount),
    diagonal: fromDepth.diagonal,
    seed: fromDepth.seed,
  };
}

function getTransform(item) {
  const transform = item.staticTransform || {};
  const position = transform.position || { x: 0, y: 0, z: 0 };
  const rotationDegrees = transform.rotationDegrees || { x: 0, y: 0, z: 0 };
  const scale = typeof transform.scale === "number" ? transform.scale : 1;

  return {
    position: {
      x: Number(position.x || 0),
      y: Number(position.y || 0),
      z: Number(position.z || 0),
    },
    rotation: {
      x: degreesToRadians(BASE_X_ROTATION_DEGREES + Number(rotationDegrees.x || 0)),
      y: degreesToRadians(Number(rotationDegrees.y || 0)),
      z: degreesToRadians(Number(rotationDegrees.z || 0)),
    },
    scale,
  };
}

function getLoop(item) {
  const loop = item.loopIntent || {};
  const rotationAmplitudeDegrees = loop.rotationAmplitudeDegrees || {};

  return {
    durationSeconds: Number(loop.durationSeconds || 42),
    phaseOffset: Number(loop.phaseOffset || 0),
    xAmplitude: Number(loop.xAmplitude || 0.12),
    yAmplitude: Number(loop.yAmplitude || 0.18),
    zAmplitude: Number(loop.zAmplitude || 0.08),
    rotationAmplitude: {
      x: degreesToRadians(Number(rotationAmplitudeDegrees.x || 2)),
      y: degreesToRadians(Number(rotationAmplitudeDegrees.y || 3)),
      z: degreesToRadians(Number(rotationAmplitudeDegrees.z || 2.5)),
    },
  };
}

function getAssetBaseProfile(index, basePosition) {
  const seed = Math.sin((index + 1) * 12.9898) * 43758.5453;
  const normalizedSeed = seed - Math.floor(seed);
  const angle = normalizedSeed * Math.PI * 2;
  const diagonal = new THREE.Vector2(Math.cos(angle), Math.sin(angle)).normalize();
  const centerBias = new THREE.Vector2(basePosition.x || 0, basePosition.y || 0);

  if (centerBias.length() > 0.01) {
    centerBias.normalize();
    diagonal.lerp(centerBias, 0.42).normalize();
  }

  return {
    index,
    seed: normalizedSeed,
    diagonal,
  };
}

function getAssetDepthProfile(assetBase, sectionIndex) {
  const tierName = getSectionDepthRole(assetBase.index, sectionIndex);
  const tier = ASSET_DEPTH_TIERS[tierName] || ASSET_DEPTH_TIERS.midground;
  const sectionShift = Math.sin((assetBase.index + 1) * (sectionIndex + 2) * 3.17) * 0.5 + 0.5;

  return {
    tier: tierName,
    zBias: tier.zBias + (assetBase.seed - 0.5) * 0.055 + (sectionShift - 0.5) * 0.035,
    scaleBias: tier.scaleBias + (assetBase.seed - 0.5) * 0.018,
    parallax: tier.parallax + (sectionShift - 0.5) * 0.08,
    drift: tier.drift + (assetBase.seed - 0.5) * 0.018,
    directionPush: tier.directionPush + (sectionShift - 0.5) * 0.009,
    depthPush: tier.depthPush + (assetBase.seed - 0.5) * 0.015,
    rotationBoost: tier.rotationBoost + (sectionShift - 0.5) * 0.1,
    delay: clamp(tier.delay + assetBase.seed * 0.03 + sectionShift * 0.018, 0, 0.16),
    diagonal: assetBase.diagonal,
    seed: assetBase.seed,
  };
}

function getDelayedTransitionPower(progress, assetProfile) {
  const delay = assetProfile.delay;
  const delayedProgress = smoothstep(clamp((progress - delay) / (1 - delay), 0, 1));

  return Math.sin(delayedProgress * Math.PI) * 0.34 * assetProfile.parallax;
}

function applyMaterialIntent(object, item) {
  const opacity = Number(item.renderIntent?.opacity || 0.24);

  object.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.castShadow = false;
    child.receiveShadow = false;

    const materials = Array.isArray(child.material) ? child.material : [child.material];

    materials.forEach((material) => {
      if (!material) {
        return;
      }

      material.transparent = true;
      material.opacity = opacity;
      material.depthWrite = false;
      material.side = THREE.DoubleSide;

      if (material.map) {
        material.map.colorSpace = THREE.SRGBColorSpace;
        material.map.anisotropy = 4;
      }

      material.needsUpdate = true;
    });
  });
}

function loadMtl(path) {
  const { directory, file } = splitAssetPath(path);
  const loader = new MTLLoader();

  loader.setPath(`${FLOATING_BASE_PATH}/${directory}`);
  loader.setResourcePath(`${FLOATING_BASE_PATH}/${directory}`);

  return new Promise((resolve, reject) => {
    loader.load(
      file,
      (materials) => {
        materials.preload();
        resolve(materials);
      },
      undefined,
      reject,
    );
  });
}

function loadObj(path, materials) {
  const { directory, file } = splitAssetPath(path);
  const loader = new OBJLoader();

  loader.setPath(`${FLOATING_BASE_PATH}/${directory}`);

  if (materials) {
    loader.setMaterials(materials);
  }

  return new Promise((resolve, reject) => {
    loader.load(file, resolve, undefined, reject);
  });
}

function createLayer() {
  const existing = document.querySelector(".floating-meat-layer");

  if (existing) {
    existing.remove();
  }

  const layer = document.createElement("div");
  layer.className = "floating-meat-layer";
  layer.setAttribute("aria-hidden", "true");

  document.body.prepend(layer);

  return layer;
}

async function loadFloatingObjects(layout, scene) {
  const items = Array.isArray(layout.items) ? layout.items : [];
  const loadedObjects = [];

  for (const [index, item] of items.entries()) {
    if (!item.asset || !item.material) {
      continue;
    }

    try {
      const materials = await loadMtl(item.material);
      const object = await loadObj(item.asset, materials);
      const transform = getTransform(item);
      const loop = getLoop(item);

      object.name = item.id || item.asset;
      object.position.set(transform.position.x, transform.position.y, transform.position.z);
      object.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
      object.scale.setScalar(transform.scale);

      const desktopBasePosition = object.position.clone();
      const desktopBaseRotation = object.rotation.clone();
      const mobileTransform = getMobileTransform(index, transform);

      object.userData.desktopBase = {
        position: desktopBasePosition,
        rotation: desktopBaseRotation,
        scale: transform.scale,
        centerDirection: createCenterDirection(desktopBasePosition),
        assetBase: getAssetBaseProfile(index, transform.position),
      };

      object.userData.mobileBase = {
        position: mobileTransform.position,
        rotation: mobileTransform.rotation,
        scale: mobileTransform.scale,
        centerDirection: createCenterDirection(mobileTransform.position),
        assetBase: getAssetBaseProfile(index, mobileTransform.position),
      };

      object.userData.basePosition = object.userData.desktopBase.position;
      object.userData.baseRotation = object.userData.desktopBase.rotation;
      object.userData.baseScale = object.userData.desktopBase.scale;
      object.userData.centerDirection = object.userData.desktopBase.centerDirection;
      object.userData.assetBase = object.userData.desktopBase.assetBase;
      object.userData.loop = loop;

      applyMaterialIntent(object, item);

      scene.add(object);
      loadedObjects.push(object);
    } catch (error) {
      console.warn(`[Paragon Floating Meat] Failed to load ${item.id || item.asset}`, error);
    }
  }

  return loadedObjects;
}

export async function initFloatingBackground() {
  const reducedMotion = window.matchMedia(REDUCE_MOTION_QUERY).matches;

  if (reducedMotion) {
    console.info("[Paragon Floating Meat] Inactive because reduced motion is enabled.");
    return;
  }

  if (window.__paragonFloatingBackgroundCleanup) {
    window.__paragonFloatingBackgroundCleanup();
    window.__paragonFloatingBackgroundCleanup = null;
  }

  const layer = createLayer();
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 100);
  camera.position.set(0, 0, SECTION_PROFILES[0].cameraZ);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  layer.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 1.15);
  const directional = new THREE.DirectionalLight(0xffffff, 1.85);

  directional.position.set(-2, 3, 6);

  scene.add(ambient);
  scene.add(directional);

  let frameId = null;
  let loadedObjects = [];
  let disposed = false;

  const reactive = {
    currentIndex: 0,
    targetIndex: 0,
    direction: 1,
    source: "idle",
    sceneCount: 0,
    startedAt: 0,
    transitionDuration: TRANSITION_DURATION_SECONDS,
    transitionProgress: 0,
    transitionPower: 0,
    activeTransition: false,
    lastDepthEvent: null,
  };

  function resize() {
    const width = Math.max(1, layer.clientWidth);
    const height = Math.max(1, layer.clientHeight);

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function updateLayerStyle(profile, transitionPower, direction, isMobile) {
    const activeBlur = isMobile
      ? clamp(profile.blur * 0.72 - transitionPower * 0.5, 1.65, 3.4)
      : clamp(profile.blur - transitionPower * 0.38, 2.2, 4.6);

    const activeOpacity = isMobile
      ? clamp(profile.opacity + 0.1 + transitionPower * 0.06, 0.58, 0.84)
      : clamp(profile.opacity + transitionPower * 0.028, 0.5, 0.82);

    const activeBrightness = isMobile
      ? clamp(profile.brightness + 0.08 + transitionPower * 0.04, 0.68, 0.92)
      : clamp(profile.brightness + transitionPower * 0.022, 0.6, 0.86);

    const activeSaturation = isMobile
      ? clamp(profile.saturation + 0.08 + transitionPower * 0.04, 0.74, 1)
      : clamp(profile.saturation + transitionPower * 0.025, 0.68, 0.94);

    const xShift = direction * transitionPower * (isMobile ? -0.1 : -0.075);
    const yShift = transitionPower * (isMobile ? -0.025 : 0);

    layer.style.opacity = activeOpacity.toFixed(3);
    layer.style.filter = `blur(${activeBlur.toFixed(2)}px) saturate(${activeSaturation.toFixed(2)}) brightness(${activeBrightness.toFixed(2)})`;
    layer.style.transform = `translate3d(${xShift.toFixed(3)}vw, ${yShift.toFixed(3)}vh, 0)`;
  }

  function setDepthBridgeState(type, event) {
    const detail = event.detail || {};
    const fromIndex = Number(detail.fromIndex ?? reactive.currentIndex);
    const toIndex = Number(detail.toIndex ?? fromIndex);
    const direction = Number(detail.direction || (toIndex >= fromIndex ? 1 : -1));

    reactive.direction = direction;
    reactive.source = detail.source || "unknown";
    reactive.sceneCount = Number(detail.sceneCount || reactive.sceneCount || 0);
    reactive.lastDepthEvent = {
      type,
      fromIndex,
      toIndex,
      direction,
      source: reactive.source,
      sceneCount: reactive.sceneCount,
      receivedAt: Number(performance.now().toFixed(2)),
    };

    if (type === "transition-start") {
      reactive.currentIndex = fromIndex;
      reactive.targetIndex = toIndex;
      reactive.startedAt = performance.now();
      reactive.transitionDuration = TRANSITION_DURATION_SECONDS;
      reactive.transitionProgress = 0;
      reactive.activeTransition = true;
    }

    if (type === "transition-complete") {
      reactive.currentIndex = toIndex;
      reactive.targetIndex = toIndex;
      reactive.transitionProgress = 1;
      reactive.transitionPower = 0;
      reactive.activeTransition = false;
    }

    window.__paragonFloatingBackgroundState = {
      active: true,
      objectCount: loadedObjects.length,
      mode: "mixed-depth-field",
      reactive: { ...reactive },
      roles: loadedObjects.map((object) => getSectionDepthRole(object.userData.assetBase?.index || 0, reactive.currentIndex)),
    };

    console.info(
      `[Paragon Floating Meat Bridge] ${type}: ${fromIndex} -> ${toIndex} via ${reactive.source}.`,
    );
  }

  function handleDepthTransitionStart(event) {
    setDepthBridgeState("transition-start", event);
  }

  function handleDepthTransitionComplete(event) {
    setDepthBridgeState("transition-complete", event);
  }

  function animate() {
    if (disposed) {
      return;
    }

    const now = performance.now();
    const elapsed = now / 1000;
    const isMobile = window.matchMedia(MOBILE_QUERY).matches;
    const mobileMotionFactor = isMobile ? 0.72 : 1;

    if (reactive.activeTransition) {
      const rawProgress = clamp((now - reactive.startedAt) / (reactive.transitionDuration * 1000), 0, 1);
      reactive.transitionProgress = smoothstep(rawProgress);
      reactive.transitionPower = Math.sin(reactive.transitionProgress * Math.PI) * 0.34;

      if (rawProgress >= 1) {
        reactive.activeTransition = false;
        reactive.currentIndex = reactive.targetIndex;
        reactive.transitionProgress = 1;
        reactive.transitionPower = 0;
      }
    } else {
      reactive.transitionProgress = 0;
      reactive.transitionPower = lerp(reactive.transitionPower, 0, 0.12);
    }

    const fromProfile = getProfile(reactive.currentIndex);
    const toProfile = getProfile(reactive.targetIndex);
    const profile = reactive.activeTransition
      ? blendProfiles(fromProfile, toProfile, reactive.transitionProgress)
      : getProfile(reactive.currentIndex);

    const direction = reactive.direction || 1;
    const globalTransitionPower = reactive.transitionPower;

    const cameraXTarget = direction * globalTransitionPower * (isMobile ? -0.018 : -0.045);
    const cameraYTarget = globalTransitionPower * (isMobile ? 0.006 : 0.016);
    const cameraZTarget = profile.cameraZ - globalTransitionPower * (isMobile ? 0.03 : 0.045);

    camera.position.x = lerp(camera.position.x, cameraXTarget, 0.08);
    camera.position.y = lerp(camera.position.y, cameraYTarget, 0.08);
    camera.position.z = lerp(camera.position.z, cameraZTarget, 0.08);
    camera.lookAt(0, 0, 0);

    updateLayerStyle(profile, globalTransitionPower, direction, isMobile);

    loadedObjects.forEach((object, index) => {
      const responsiveBase = isMobile ? object.userData.mobileBase : object.userData.desktopBase;
      const basePosition = responsiveBase?.position || object.userData.basePosition;
      const baseRotation = responsiveBase?.rotation || object.userData.baseRotation;
      const baseScale = responsiveBase?.scale || object.userData.baseScale || 1;
      const centerDirection = responsiveBase?.centerDirection || object.userData.centerDirection;
      const assetBase = responsiveBase?.assetBase || object.userData.assetBase;
      const loop = object.userData.loop;

      if (!basePosition || !baseRotation || !centerDirection || !assetBase || !loop) {
        return;
      }

      const currentDepth = getAssetDepthProfile(assetBase, reactive.currentIndex);
      const targetDepth = getAssetDepthProfile(assetBase, reactive.targetIndex);
      const assetDepth = reactive.activeTransition
        ? blendAssetDepth(currentDepth, targetDepth, reactive.transitionProgress)
        : currentDepth;

      const phase = loop.phaseOffset * Math.PI * 2;
      const t = (elapsed / loop.durationSeconds) * Math.PI * 2 + phase;
      const depthPhase = elapsed * (0.82 + assetDepth.seed * 0.38) + index * 0.61;
      const assetPower = reactive.activeTransition
        ? getDelayedTransitionPower(reactive.transitionProgress, assetDepth)
        : 0;

      const idleX = Math.sin(t) * loop.xAmplitude * mobileMotionFactor;
      const idleY = Math.cos(t * 0.91 + phase) * loop.yAmplitude * mobileMotionFactor;
      const idleZ = Math.sin(t * 0.73 + phase) * loop.zAmplitude * mobileMotionFactor;

      const diagonalX = assetDepth.diagonal.x * assetDepth.drift * assetPower * mobileMotionFactor;
      const diagonalY = assetDepth.diagonal.y * assetDepth.drift * assetPower * mobileMotionFactor;
      const outwardPush = 0.06 * assetPower * mobileMotionFactor;
      const directionalPushX = direction * assetPower * assetDepth.directionPush * mobileMotionFactor;
      const forwardPushZ = assetPower * (assetDepth.depthPush + Math.sin(depthPhase) * 0.01) * mobileMotionFactor;

      object.position.x =
        basePosition.x * profile.spread +
        idleX +
        centerDirection.x * outwardPush +
        diagonalX +
        directionalPushX;

      object.position.y =
        basePosition.y * profile.spread +
        idleY +
        centerDirection.y * outwardPush * 0.58 +
        diagonalY;

      object.position.z =
        basePosition.z +
        profile.zOffset +
        assetDepth.zBias +
        idleZ +
        forwardPushZ;

      const rotationBoost = 1 + assetPower * assetDepth.rotationBoost;

      object.rotation.x =
        baseRotation.x +
        Math.sin(t * 0.83) * loop.rotationAmplitude.x * mobileMotionFactor * rotationBoost +
        assetPower * direction * 0.007;

      object.rotation.y =
        baseRotation.y +
        Math.cos(t * 0.71) * loop.rotationAmplitude.y * mobileMotionFactor * rotationBoost +
        assetPower * direction * 0.009;

      object.rotation.z =
        baseRotation.z +
        Math.sin(t * 0.67) * loop.rotationAmplitude.z * mobileMotionFactor * rotationBoost;

      object.scale.setScalar(baseScale * assetDepth.scaleBias * (1 + assetPower * 0.009));
    });

    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(animate);
  }

  try {
    const response = await fetch(LAYOUT_PATH);

    if (!response.ok) {
      throw new Error(`Layout request failed: ${response.status}`);
    }

    const layout = await response.json();

    resize();
    loadedObjects = await loadFloatingObjects(layout, scene);

    if (loadedObjects.length < 1) {
      throw new Error("No floating objects loaded.");
    }

    document.addEventListener("paragon:depth-transition-start", handleDepthTransitionStart);
    document.addEventListener("paragon:depth-transition-complete", handleDepthTransitionComplete);
    window.addEventListener("resize", resize);

    window.__paragonFloatingBackground = {
      getState: () => ({
        active: true,
        objectCount: loadedObjects.length,
        mode: "mixed-depth-field",
        reactive: { ...reactive },
        roles: loadedObjects.map((object) => getSectionDepthRole(object.userData.assetBase?.index || 0, reactive.currentIndex)),
      }),
    };

    animate();

    console.info(`[Paragon Floating Meat] Active with ${loadedObjects.length} objects. Mixed depth field enabled.`);
  } catch (error) {
    console.warn("[Paragon Floating Meat] Failed to initialize.", error);
    layer.remove();
    return;
  }

  window.__paragonFloatingBackgroundCleanup = () => {
    disposed = true;

    if (frameId) {
      window.cancelAnimationFrame(frameId);
    }

    document.removeEventListener("paragon:depth-transition-start", handleDepthTransitionStart);
    document.removeEventListener("paragon:depth-transition-complete", handleDepthTransitionComplete);
    window.removeEventListener("resize", resize);

    if (window.__paragonFloatingBackground?.getState?.().mode === "mixed-depth-field") {
      delete window.__paragonFloatingBackground;
    }

    loadedObjects.forEach((object) => {
      object.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }

        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];

          materials.forEach((material) => {
            if (material.map) {
              material.map.dispose();
            }

            material.dispose();
          });
        }
      });

      scene.remove(object);
    });

    renderer.dispose();
    layer.remove();
  };
}
