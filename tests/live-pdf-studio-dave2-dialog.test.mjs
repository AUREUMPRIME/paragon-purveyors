import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) =>
  fs.readFileSync(path, "utf8");

const controller =
  read("src/live-pdf-studio/dave2-dialog.js");

const styles =
  read("src/live-pdf-studio/styles.css");

const game =
  read("public/studio-games/dave2/game.js");

test("mute uses direct SVG hit target", () => {
  assert.match(
    controller,
    /class="dave2-console__surface-sound-shape dave2-console__surface-sound-trigger"[\s\S]*?data-dave2-mute/,
  );

  assert.doesNotMatch(
    controller,
    /surface-sound-hit/,
  );

  assert.doesNotMatch(
    controller,
    /surface-sound-button/,
  );
});

test("mute direct SVG target receives pointer events", () => {
  assert.match(
    styles,
    /surface-sound-trigger[\s\S]*?pointer-events:\s*all/,
  );

  assert.match(
    styles,
    /surface-sound-trigger:hover/,
  );

  assert.match(
    styles,
    /surface-sound-trigger:active/,
  );
});

test("mute preserves red live and dark muted feedback", () => {
  assert.match(
    controller,
    /id="dave2-sound-gradient"[\s\S]*?#b4534b/,
  );

  assert.match(
    styles,
    /data-muted="false"[\s\S]*?surface-sound-trigger/,
  );

  assert.match(
    styles,
    /data-muted="true"[\s\S]*?surface-sound-trigger/,
  );

  assert.match(game, /ci\.mute\(\)/);
  assert.match(game, /ci\.unmute\(\)/);
});

test("mute icon preserves wave and slash states", () => {
  assert.match(
    controller,
    /dave2-console__mute-wave/,
  );

  assert.match(
    controller,
    /dave2-console__mute-slash/,
  );

  assert.match(
    styles,
    /data-muted="true"[\s\S]*?mute-wave[\s\S]*?opacity:\s*0/,
  );

  assert.match(
    styles,
    /data-muted="true"[\s\S]*?mute-slash[\s\S]*?opacity:\s*1/,
  );
});

test("D-pad has hover and physical press feedback", () => {
  assert.match(
    styles,
    /data-dave-key="UP"[\s\S]*?:hover/,
  );

  assert.match(
    styles,
    /data-dave-key="UP"[\s\S]*?data-pressed="true"/,
  );
});

test("CTRL and ALT have custom red feedback", () => {
  assert.match(
    styles,
    /data-dave-key="CTRL"[\s\S]*?:hover/,
  );

  assert.match(
    styles,
    /data-dave-key="ALT"[\s\S]*?:hover/,
  );

  assert.match(
    styles,
    /data-dave-key="CTRL"[\s\S]*?data-pressed="true"/,
  );
});

test("close and power have dedicated hardware feedback", () => {
  assert.match(
    styles,
    /\.dave2-console__close:hover/,
  );

  assert.match(
    styles,
    /\.dave2-console__close:active/,
  );

  assert.match(
    styles,
    /\.dave2-console__power:hover/,
  );

  assert.match(
    styles,
    /\.dave2-console__power:active/,
  );
});

test("old white Gameboy focus is overridden", () => {
  assert.match(
    styles,
    /dave2-console__hardware:focus-visible[\s\S]*?outline:\s*none\s*!important/,
  );
});

test("CRT has scanlines and RGB phosphor mask", () => {
  assert.match(
    styles,
    /\.dave2-console__screen::before/,
  );

  assert.match(
    styles,
    /repeating-linear-gradient/,
  );

  assert.match(
    styles,
    /dave2-crt-flicker/,
  );
});

test("CRT has reflection dust and smudge layer", () => {
  assert.match(
    styles,
    /\.dave2-console__screen::after/,
  );

  assert.match(
    styles,
    /mix-blend-mode:\s*screen/,
  );

  assert.match(
    styles,
    /tan\(\s*var\(--dave-rotate-y\)/,
  );

  assert.match(
    styles,
    /tan\(\s*var\(--dave-rotate-x\)/,
  );
});

test("CRT overlays cannot steal input", () => {
  assert.match(
    styles,
    /\.dave2-console__screen::before[\s\S]*?pointer-events:\s*none/,
  );

  assert.match(
    styles,
    /\.dave2-console__screen::after[\s\S]*?pointer-events:\s*none/,
  );
});

test("CRT polish introduces no gameplay blur", () => {
  const start =
    styles.indexOf(
      "META GAMEBOY v7.2.1 HARDWARE + CRT",
    );

  assert.notEqual(start, -1);

  assert.doesNotMatch(
    styles.slice(start),
    /\bblur\(/,
  );
});

test("full Rupert transmission is present", () => {
  assert.match(
    controller,
    /RUPERT-SYSTEMS-ENTERTAINMENT-INDUSTRIES/,
  );

  assert.match(
    controller,
    /WAKE-UP-CLAYTON/,
  );

  assert.match(
    controller,
    /ME-EXTRAÑA-TU-PREGUNTA/,
  );

  assert.match(
    controller,
    /END-OF-TRANSMISSION/,
  );

  assert.match(
    controller,
    /\(  \.  \)\(  \.  \)/,
  );
});

test("marquee uses two runtime-populated segments", () => {
  assert.match(
    controller,
    /querySelectorAll\(\s*"\[data-dave2-marquee-segment\]"/,
  );

  assert.match(
    controller,
    /segment\.textContent\s*=\s*RUPERT_TRANSMISSION/,
  );
});

test("marquee speed is calculated from rendered width", () => {
  assert.match(
    controller,
    /getBoundingClientRect\(\)\s*\.width/,
  );

  assert.match(
    controller,
    /MARQUEE_SPEED_PX_PER_SECOND\s*=\s*46/,
  );

  assert.match(
    controller,
    /--dave2-marquee-duration/,
  );
});

test("Controls remains direct SVG interaction", () => {
  assert.match(
    controller,
    /surface-controls-trigger[\s\S]*?data-dave2-help/,
  );
});

test("canonical gameplay mappings remain intact", () => {
  for (const [key, code] of [
    ["LEFT", "263"],
    ["RIGHT", "262"],
    ["UP", "265"],
    ["DOWN", "264"],
    ["CTRL", "341"],
    ["ALT", "342"],
  ]) {
    assert.match(
      controller,
      new RegExp(`${key}:\\s*${code}`),
    );

    assert.match(
      game,
      new RegExp(`${key}:\\s*${code}`),
    );
  }
});

test("Power and close lifecycle remain intact", () => {
  assert.match(controller, /data-dave2-power/);
  assert.match(controller, /data-dave2-close/);

  assert.match(
    controller,
    /frame\.src\s*=\s*"about:blank"/,
  );
});

test("physical Space gameplay button remains absent", () => {
  assert.doesNotMatch(
    controller,
    /data-dave-key="SPACE"/,
  );
});

test("Dave bridge remains human-play only", () => {
  assert.doesNotMatch(
    game,
    /simulateKeyPress|afterReady|rl-driver|rl-autoboot|autowalk/i,
  );

  assert.match(
    game,
    /fullScreen:\s*false/,
  );
});