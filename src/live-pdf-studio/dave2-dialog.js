const GAME_URL =
  "/studio-games/dave2/index.html";

const MESSAGE = Object.freeze({
  READY: "paragon-dave2-ready",
  ERROR: "paragon-dave2-error",
  CLOSE: "paragon-dave2-close",
  KEY: "paragon-dave2-key",
  MUTE: "paragon-dave2-mute",
});

const STATE = Object.freeze({
  CLOSED: "closed",
  OPENING: "opening",
  BOOTING: "booting",
  RUNNING: "running",
  POWERED_OFF: "powered-off",
});

const ENTRY_DURATION_MS = 360;
const TILT_ENTER_DELAY_MS = 90;
const TILT_LEAVE_GRACE_MS = 120;
const MAX_TILT_DEGREES = 5.5;
const TILT_EASE = 0.14;

const AUXILIARY_FRAME_MS = 420;

const RUPERT_TRANSMISSION = " RUPERT-SYSTEMS-ENTERTAINMENT-INDUSTRIES-INCORPORATED-GOVERNMENT-APPROVED-SEALED-BY-THE-ENTREPRENEURIAL-LAW-OF-SOFTWARE-SOLUTIONS-FOR-INTELLIGENT-BEINGS-FROM-ANDROMEDA-M33-SECTOR-3/16-REALITY-IS-A-SIMULATION-WAKE-UP-CLAYTON-YOU-ARE-SLEEPING-WAKE-UP-WAKE-UP-WAKE-WAKE....................................THE-FUCK-UP...................................-CLAYYYYYYYTOOOOOON-...........................-EL-PUPI-AKA-MR.-RUPERT-...............................................-THIS-MESSAGE-WILL-AUTODESTRUC-IN-10..........9..........8..........7..........6..........5..........4..........3..........2..........2..........2..........3..............2........4...3.........2.........1..........-SWEET-BABY-LORD-JESUS-CHRIST-.....................-BOOOOOOOM-...........-BYE-.....-BYE-............-ADIOS-............-AMIGO-............=ME-EXTRAÑA-TU-PREGUNTA-IRACUNDA-Y-VERSACUTA-LA-CUAL-ME-HACE-PENSAR-TU-MÁS-ÍNFIMA-CAPACIDAD-ENCÉFALO-CRANEANA-QUE-ESTÁ-CARCOMIDA-POR-LA-IGNORANCIA-ME-DECÍA-MI-ABUELITO-TODOS-LOS-DIAS-DESPUES-DE-HACERME CHUPAR-SU-DEDO-SIN-UÑA-......................-LOCOOOOOOOOOOOO-................................-END-OF-TRANSMISSION-....................................................-O-SIGUE?-...................................................................................................-TAL VEZ-YA-NO-..........................................................-TALVEZ-SI!-..................................................................................................................................................................................................................................(  .  )(  .  )";

const MARQUEE_SPEED_PX_PER_SECOND = 46;

const TERMINAL_FILLER =
  Object.freeze([
    "PTR> 0x01A7",
    "BUF> 01101001",
    "MEM> 640K OK",
    "RUN> DAVE2.EXE",
    "IRQ> SCAN OK",
    "SYS> PX-200",
  ]);

const DISPLAY_KEY_CODE =
  Object.freeze({
    LEFT: 263,
    RIGHT: 262,
    UP: 265,
    DOWN: 264,
    CTRL: 341,
    ALT: 342,
  });

const createDialogMarkup = () => `
  <div
    class="dave2-console"
    data-dave2-console
    data-state="closed"
    data-power="off"
    data-muted="false"
  >
    <div
      class="dave2-console__assembly"
      data-dave2-assembly
      data-presented="false"
      data-entry-complete="false"
    >
      <div class="dave2-console__screen">
        <iframe
          data-dave2-frame
          title="Dangerous Dave in the Haunted Mansion"
          src="about:blank"
          allow="autoplay"
          referrerpolicy="no-referrer"
        ></iframe>

        <div
          class="dave2-console__boot"
          data-dave2-boot
          aria-live="polite"
          aria-hidden="true"
        >
          <pre>METADATOR PX-200
RUPERT SYSTEMS

&gt; POWER........OK
&gt; DOS CORE.....OK
&gt; MOUNT DAVE II

<span data-dave2-progress>[▓▓░░░░░░] |</span></pre>
        </div>
      </div>

      <img
        class="dave2-console__frame"
        src="/assets/studio/gameb-terminal.png"
        alt=""
        aria-hidden="true"
        draggable="false"
      >
      <svg
        class="dave2-console__surface-overlay"
        data-dave2-surface-overlay
        viewBox="0 0 1536 1024"
        preserveAspectRatio="none"
        aria-label="Meta Gameboy hardware surfaces"
      >
        <defs>
          <rect
            id="button-top-sound"
            x="526.162"
            y="85.673"
            width="52.519"
            height="35.743"
            rx="11.108"
          ></rect>

          <rect
            id="button-top-screen"
            x="604.699"
            y="82.147"
            width="322.174"
            height="40.707"
            rx="6"
          ></rect>

          <rect
            id="button-bottom-screen"
            x="495.837"
            y="820.254"
            width="533.14"
            height="81.648"
            rx="14"
          ></rect>

          <path
            id="button-bottom-start"
            d="M1125.935,828.231l141.939-.742c13.448.017,20.106,16.09,10.509,25.369L1238.81,890.2a15.15,15.15,0,0,1-10.529,4.239h-109.51a14.883,14.883,0,0,1-14.886-16.847l7.145-36.6A14.959,14.959,0,0,1,1125.935,828.231Z"
          ></path>

          <clipPath
            id="dave2-top-sound-clip"
            clipPathUnits="userSpaceOnUse"
          >
            <use href="#button-top-sound"></use>
          </clipPath>

          <clipPath
            id="dave2-top-screen-clip"
            clipPathUnits="userSpaceOnUse"
          >
            <use href="#button-top-screen"></use>
          </clipPath>

          <clipPath
            id="dave2-bottom-screen-clip"
            clipPathUnits="userSpaceOnUse"
          >
            <use href="#button-bottom-screen"></use>
          </clipPath>

          <clipPath
            id="dave2-bottom-start-clip"
            clipPathUnits="userSpaceOnUse"
          >
            <use href="#button-bottom-start"></use>
          </clipPath>

          <linearGradient
            id="dave2-screen-gradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0"
              stop-color="#151712"
            ></stop>

            <stop
              offset="1"
              stop-color="#030504"
            ></stop>
          </linearGradient>

                    <linearGradient
            id="dave2-sound-gradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0"
              stop-color="#b4534b"
            ></stop>

            <stop
              offset="0.50"
              stop-color="#913432"
            ></stop>

            <stop
              offset="1"
              stop-color="#672322"
            ></stop>
          </linearGradient>

          <linearGradient
            id="dave2-controls-gradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0"
              stop-color="#ac4e45"
            ></stop>

            <stop
              offset="0.52"
              stop-color="#8c302f"
            ></stop>

            <stop
              offset="1"
              stop-color="#672221"
            ></stop>
          </linearGradient>
        </defs>

        <!-- EXACT TOP SCREEN -->
        <use
          href="#button-top-screen"
          class="dave2-console__surface-screen-shape"
          aria-hidden="true"
        ></use>

        <foreignObject
          x="604.699"
          y="82.147"
          width="322.174"
          height="40.707"
          clip-path="url(#dave2-top-screen-clip)"
          class="dave2-console__surface-top-screen"
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            class="dave2-console__surface-top-screen-html"
          >
                        <div
              class="dave2-console__surface-marquee-track"
              data-dave2-top-screen-text
            >
              <span
                class="dave2-console__surface-marquee-segment"
                data-dave2-marquee-segment
              ></span>

              <span
                class="dave2-console__surface-marquee-segment"
                data-dave2-marquee-segment
                aria-hidden="true"
              ></span>
            </div>
          </div>
        </foreignObject>

        <!-- EXACT BOTTOM SCREEN -->
        <use
          href="#button-bottom-screen"
          class="dave2-console__surface-screen-shape"
          aria-hidden="true"
        ></use>

        <foreignObject
          x="495.837"
          y="820.254"
          width="533.14"
          height="81.648"
          clip-path="url(#dave2-bottom-screen-clip)"
          class="dave2-console__surface-bottom-screen"
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            class="dave2-console__surface-bottom-screen-html"
          >
            <pre
              data-dave2-terminal
            >SYS&gt; INITIALIZING
DOS&gt; DAVE2.JSDOS
RUN&gt; STANDBY_</pre>
          </div>
        </foreignObject>
        <!-- EXACT CONTROLS PATH / DIRECT INTERACTION -->
        <use
          href="#button-bottom-start"
          class="dave2-console__surface-controls-trigger"
          data-dave2-bottom-start
          data-dave2-help
          role="button"
          tabindex="0"
          aria-label="Open game controls"
          aria-haspopup="dialog"
          aria-expanded="false"
        ></use>

        <text
          class="dave2-console__surface-controls-label"
          x="1191.5"
          y="861"
          text-anchor="middle"
          dominant-baseline="middle"
          aria-hidden="true"
        >CONTROLS</text>
        <!-- EXACT TOP SOUND / DIRECT SVG INTERACTION -->
        <use
          href="#button-top-sound"
          class="dave2-console__surface-sound-shape dave2-console__surface-sound-trigger"
          data-dave2-mute
          data-dave2-top-sound
          role="button"
          tabindex="0"
          aria-label="Mute game audio"
          aria-pressed="false"
        ></use>

        <g
          class="dave2-console__surface-sound-icon"
          transform="translate(540.4 91.5)"
          aria-hidden="true"
          pointer-events="none"
        >
          <path
            class="dave2-console__mute-speaker"
            d="M4 9h4l5-4v14l-5-4H4z"
          ></path>

          <path
            class="dave2-console__mute-wave"
            d="M16 9c1.4 1.5 1.4 4.5 0 6"
          ></path>

          <path
            class="dave2-console__mute-wave"
            d="M18.5 6.5c3 3 3 8 0 11"
          ></path>

          <path
            class="dave2-console__mute-slash"
            d="M5 5l14 14"
          ></path>
        </g>
      </svg>

      <span
        class="dave2-console__power-led"
        aria-hidden="true"
      ></span>

      <button
        type="button"
        class="dave2-console__hardware dave2-console__power"
        data-dave2-power
        aria-label="Power"
        aria-pressed="false"
        title="Power"
      ></button>

      <button
        type="button"
        class="dave2-console__hardware dave2-console__dpad-up"
        data-dave-key="UP"
        aria-label="Up"
        title="Up"
      ></button>

      <button
        type="button"
        class="dave2-console__hardware dave2-console__dpad-down"
        data-dave-key="DOWN"
        aria-label="Down"
        title="Down"
      ></button>

      <button
        type="button"
        class="dave2-console__hardware dave2-console__dpad-left"
        data-dave-key="LEFT"
        aria-label="Left"
        title="Left"
      ></button>

      <button
        type="button"
        class="dave2-console__hardware dave2-console__dpad-right"
        data-dave-key="RIGHT"
        aria-label="Right"
        title="Right"
      ></button>

      <button
        type="button"
        class="dave2-console__hardware dave2-console__action-jump"
        data-dave-key="CTRL"
        aria-label="Jump"
        title="CTRL / Jump"
      ></button>

      <button
        type="button"
        class="dave2-console__hardware dave2-console__action-fire"
        data-dave-key="ALT"
        aria-label="Fire"
        title="ALT / Fire"
      ></button>

      <button
        type="button"
        class="dave2-console__close"
        data-dave2-close
        aria-label="Close Dave 2"
        title="Close"
      ></button>
    </div>
  </div>

  <section
    class="dave2-console__help"
    data-dave2-help-panel
    role="dialog"
    aria-modal="true"
    aria-label="Dangerous Dave controls"
    hidden
  >
    <button
      type="button"
      class="dave2-console__help-close"
      data-dave2-help-close
      aria-label="Close controls"
    >×</button>

    <pre>+------------------------------------------------+
| PX-200 // DANGEROUS DAVE II CONTROL MATRIX    |
+------------------------------------------------+
| LEFT / RIGHT     WALK                         |
| UP               AIM UP / OPEN DOORS          |
| DOWN             AIM DOWN                     |
| CTRL             JUMP                         |
| CTRL + DOWN      JUMP DOWN                    |
| ALT              FIRE                         |
| SPACE            START FROM TITLE             |
| TAB              STATUS                       |
| F1               GAME HELP                    |
| F2               GAME SOUND ON / OFF          |
| F3               KEYBOARD CONTROL SETUP       |
| F4               JOYSTICK MODE                |
| F5               RESET TO MAIN MENU           |
|                                                |
| D-PAD            MOVE / AIM                   |
| RED TOP          CTRL / JUMP                  |
| RED LOWER        ALT / FIRE                   |
| START            SPACE                        |
| MUTE             EMULATOR AUDIO               |
|                                                |
| ESC              CLOSE CONTROLS / META GAMEBOY|
+------------------------------------------------+</pre>

    <span class="dave2-console__help-hint">
      ESC TO RETURN
    </span>
  </section>
`;
export const createDave2DialogController = ({ root }) => {
  if (!(root instanceof HTMLElement)) {
    throw new TypeError(
      "Dave 2 dialog requires the Studio root.",
    );
  }

  const dialog =
    document.createElement("dialog");

  dialog.className =
    "dave2-dialog";

  dialog.dataset.dave2Dialog = "";

  dialog.setAttribute(
    "aria-label",
    "Metadator entertainment module",
  );

  dialog.innerHTML =
    createDialogMarkup();

  root.append(dialog);

  const consoleElement =
    dialog.querySelector(
      "[data-dave2-console]",
    );

  const assembly =
    dialog.querySelector(
      "[data-dave2-assembly]",
    );

  const frame =
    dialog.querySelector(
      "[data-dave2-frame]",
    );

  const loader =
    dialog.querySelector(
      "[data-dave2-boot]",
    );

  const progress =
    dialog.querySelector(
      "[data-dave2-progress]",
    );

  const topScreenText =
    dialog.querySelector(
      "[data-dave2-top-screen-text]",
    );

  const marqueeSegments =
    Array.from(
      dialog.querySelectorAll(
        "[data-dave2-marquee-segment]",
      ),
    );

  const terminalText =
    dialog.querySelector(
      "[data-dave2-terminal]",
    );

  const powerButton =
    dialog.querySelector(
      "[data-dave2-power]",
    );

  const muteButton =
    dialog.querySelector(
      "[data-dave2-mute]",
    );

  const helpButton =
    dialog.querySelector(
      "[data-dave2-help]",
    );

  const helpPanel =
    dialog.querySelector(
      "[data-dave2-help-panel]",
    );

  const helpCloseButton =
    dialog.querySelector(
      "[data-dave2-help-close]",
    );

  const hardwareButtons = [
    ...dialog.querySelectorAll(
      "[data-dave-key]",
    ),
  ];

  if (
    !consoleElement ||
    !assembly ||
    !frame ||
    !loader ||
    !progress ||
    !topScreenText ||
    marqueeSegments.length !== 2 ||
    !terminalText ||
    !powerButton ||
    !muteButton ||
    !helpButton ||
    !helpPanel ||
    !helpCloseButton ||
    hardwareButtons.length !== 6
  ) {
    dialog.remove();

    throw new Error(
      "Dave 2 console controls are incomplete.",
    );
  }

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

  let state =
    STATE.CLOSED;

  let muted = false;
  let helpOpen = false;

  let lastLauncher = null;

  let entryTimer = 0;
  let bootTimer = 0;
  let auxiliaryTimer = 0;
  let auxiliaryFrame = 0;
  let lastHardwareKey = "IDLE";
  let tiltEnterTimer = 0;
  let tiltLeaveTimer = 0;
  let tiltRaf = 0;

  let tiltEnabled = false;

  let currentX = 0;
  let currentY = 0;
  let currentLift = 0;

  let targetX = 0;
  let targetY = 0;
  let targetLift = 0;

  const pressedKeys =
    new Set();

  const spinnerFrames = [
    "[▓▓░░░░░░] |",
    "[▓▓▓░░░░░] /",
    "[▓▓▓▓░░░░] -",
    "[▓▓▓▓▓░░░] \\",
    "[▓▓▓▓▓▓░░] |",
    "[▓▓▓▓▓▓▓░] /",
  ];

  let spinnerIndex = 0;

  const setState = (nextState) => {
    state = nextState;

    consoleElement.dataset.state =
      nextState;

    renderAuxiliaryScreens();
  };

  const setPower = (powered) => {
    consoleElement.dataset.power =
      powered ? "on" : "off";

    powerButton.setAttribute(
      "aria-pressed",
      powered ? "true" : "false",
    );

    renderAuxiliaryScreens();
  };

  const updateMuteUi = () => {
    consoleElement.dataset.muted =
      muted ? "true" : "false";

    muteButton.setAttribute(
      "aria-pressed",
      muted ? "true" : "false",
    );

    muteButton.setAttribute(
      "aria-label",
      muted
        ? "Unmute game audio"
        : "Mute game audio",
    );

    muteButton.title =
      muted
        ? "Unmute game audio"
        : "Mute game audio";
  };

  const updateMarqueeTransmission = () => {
    for (
      const segment of
      marqueeSegments
    ) {
      segment.textContent =
        RUPERT_TRANSMISSION;
    }

    window.requestAnimationFrame(
      () => {
        const width =
          marqueeSegments[0]
            .getBoundingClientRect()
            .width;

        if (
          !Number.isFinite(width) ||
          width <= 0
        ) {
          return;
        }

        const duration =
          Math.max(
            30,
            width /
              MARQUEE_SPEED_PX_PER_SECOND,
          );

        topScreenText.style.setProperty(
          "--dave2-marquee-duration",
          `${duration}s`,
        );
      },
    );
  };
  const renderAuxiliaryScreens = () => {
    const powered =
      consoleElement.dataset.power === "on";

    if (!powered) {
      terminalText.textContent = "";
      return;
    }

    const stateLabel =
      String(state)
        .replaceAll("-", " ")
        .toUpperCase();

    const audioLabel =
      muted ? "MUTED" : "LIVE";

    const keyCode =
      DISPLAY_KEY_CODE[
        lastHardwareKey
      ];

    const keyLine =
      Number.isInteger(keyCode)
        ? `${lastHardwareKey} ${keyCode}`
        : lastHardwareKey;

    const filler =
      TERMINAL_FILLER[
        auxiliaryFrame %
        TERMINAL_FILLER.length
      ];

    terminalText.textContent =
      `SYS> ${stateLabel}\n` +
      `AUD> ${audioLabel}  KEY> ${keyLine}\n` +
      `${filler} _`;
  };
  const stopAuxiliaryScreens = () => {
    if (!auxiliaryTimer) {
      return;
    }

    window.clearInterval(
      auxiliaryTimer,
    );

    auxiliaryTimer = 0;
  };

  const startAuxiliaryScreens = () => {
    stopAuxiliaryScreens();

    auxiliaryFrame = 0;
    renderAuxiliaryScreens();

    auxiliaryTimer =
      window.setInterval(() => {
        auxiliaryFrame += 1;
        renderAuxiliaryScreens();
      }, AUXILIARY_FRAME_MS);
  };

  const stopLoader = () => {
    if (bootTimer) {
      window.clearInterval(
        bootTimer,
      );

      bootTimer = 0;
    }
  };

  const startLoader = () => {
    stopLoader();

    spinnerIndex = 0;

    progress.textContent =
      spinnerFrames[spinnerIndex];

    bootTimer =
      window.setInterval(() => {
        spinnerIndex =
          (spinnerIndex + 1) %
          spinnerFrames.length;

        progress.textContent =
          spinnerFrames[spinnerIndex];
      }, 115);
  };

  const postToGame = (payload) => {
    if (
      !frame.contentWindow ||
      frame.getAttribute("src") ===
        "about:blank"
    ) {
      return;
    }

    frame.contentWindow.postMessage(
      payload,
      window.location.origin,
    );
  };

  const applyMuteState = () => {
    postToGame({
      type: MESSAGE.MUTE,
      muted,
    });
  };

  const toggleMute = () => {
    muted = !muted;

    updateMuteUi();
    renderAuxiliaryScreens();

    if (
      state === STATE.RUNNING ||
      state === STATE.BOOTING
    ) {
      applyMuteState();
    }
  };

  const closeHelp = ({
    restoreFocus = true,
  } = {}) => {
    if (!helpOpen) {
      return;
    }

    helpOpen = false;
    helpPanel.hidden = true;

    helpButton.setAttribute(
      "aria-expanded",
      "false",
    );

    if (restoreFocus) {
      helpButton.focus();
    }
  };

  const openHelp = () => {
    if (
      state === STATE.CLOSED ||
      state === STATE.OPENING
    ) {
      return;
    }

    if (helpOpen) {
      closeHelp();
      return;
    }

    releaseAllKeys();

    tiltEnabled = false;
    neutralTilt();

    helpOpen = true;
    helpPanel.hidden = false;

    helpButton.setAttribute(
      "aria-expanded",
      "true",
    );

    helpCloseButton.focus();
  };

  const releaseAllKeys = () => {
    for (const key of pressedKeys) {
      postToGame({
        type: MESSAGE.KEY,
        key,
        pressed: false,
      });
    }

    pressedKeys.clear();

    lastHardwareKey = "IDLE";
    renderAuxiliaryScreens();

    for (const button of hardwareButtons) {
      button.dataset.pressed =
        "false";
    }
  };

  const destroyGame = () => {
    releaseAllKeys();
    stopLoader();

    frame.src =
      "about:blank";
  };

  const bootGame = () => {
    if (
      state === STATE.CLOSED ||
      state === STATE.OPENING
    ) {
      return;
    }

    destroyGame();

    setPower(true);
    setState(STATE.BOOTING);

    loader.setAttribute(
      "aria-hidden",
      "false",
    );

    startLoader();

    frame.src =
      `${GAME_URL}?session=${Date.now()}`;
  };

  const powerOff = () => {
    if (
      state !== STATE.RUNNING &&
      state !== STATE.BOOTING
    ) {
      return;
    }

    closeHelp({
      restoreFocus: false,
    });

    destroyGame();

    setPower(false);
    setState(STATE.POWERED_OFF);

    loader.setAttribute(
      "aria-hidden",
      "true",
    );
  };

  const togglePower = () => {
    if (
      state === STATE.OPENING ||
      state === STATE.CLOSED
    ) {
      return;
    }

    closeHelp({
      restoreFocus: false,
    });

    if (
      state === STATE.POWERED_OFF
    ) {
      bootGame();
      return;
    }

    powerOff();
  };

  const applyTilt = () => {
    tiltRaf = 0;

    currentX +=
      (targetX - currentX) *
      TILT_EASE;

    currentY +=
      (targetY - currentY) *
      TILT_EASE;

    currentLift +=
      (targetLift - currentLift) *
      TILT_EASE;

    assembly.style.setProperty(
      "--dave-rotate-x",
      `${currentX.toFixed(3)}deg`,
    );

    assembly.style.setProperty(
      "--dave-rotate-y",
      `${currentY.toFixed(3)}deg`,
    );

    assembly.style.setProperty(
      "--dave-lift",
      `${currentLift.toFixed(3)}px`,
    );

    const unsettled =
      Math.abs(targetX - currentX) >
        0.01 ||
      Math.abs(targetY - currentY) >
        0.01 ||
      Math.abs(
        targetLift - currentLift,
      ) > 0.01;

    if (unsettled) {
      tiltRaf =
        requestAnimationFrame(
          applyTilt,
        );
    }
  };

  const requestTiltFrame = () => {
    if (!tiltRaf) {
      tiltRaf =
        requestAnimationFrame(
          applyTilt,
        );
    }
  };

  const neutralTilt = () => {
    targetX = 0;
    targetY = 0;
    targetLift = 0;

    requestTiltFrame();
  };

  const handlePointerEnter = () => {
    window.clearTimeout(
      tiltLeaveTimer,
    );

    if (
      reducedMotion.matches ||
      assembly.dataset.entryComplete !==
        "true"
    ) {
      return;
    }

    window.clearTimeout(
      tiltEnterTimer,
    );

    tiltEnterTimer =
      window.setTimeout(() => {
        tiltEnabled = true;
      }, TILT_ENTER_DELAY_MS);
  };

  const handlePointerMove = (
    event,
  ) => {
    if (
      !tiltEnabled ||
      reducedMotion.matches ||
      assembly.dataset.entryComplete !==
        "true"
    ) {
      return;
    }

    const rect =
      consoleElement
        .getBoundingClientRect();

    if (
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      return;
    }

    const x =
      Math.max(
        -1,
        Math.min(
          1,
          (
            (event.clientX - rect.left) /
            rect.width
          ) * 2 - 1,
        ),
      );

    const y =
      Math.max(
        -1,
        Math.min(
          1,
          (
            (event.clientY - rect.top) /
            rect.height
          ) * 2 - 1,
        ),
      );

    targetX =
      -y * MAX_TILT_DEGREES;

    targetY =
      x * MAX_TILT_DEGREES;

    targetLift = -3;

    requestTiltFrame();
  };

  const handlePointerLeave = () => {
    window.clearTimeout(
      tiltEnterTimer,
    );

    tiltEnabled = false;

    window.clearTimeout(
      tiltLeaveTimer,
    );

    tiltLeaveTimer =
      window.setTimeout(
        neutralTilt,
        TILT_LEAVE_GRACE_MS,
      );
  };

  const close = () => {
    window.clearTimeout(
      entryTimer,
    );

    window.clearTimeout(
      tiltEnterTimer,
    );

    window.clearTimeout(
      tiltLeaveTimer,
    );

    closeHelp({
      restoreFocus: false,
    });

    stopAuxiliaryScreens();
    destroyGame();

    tiltEnabled = false;
    neutralTilt();

    setPower(false);
    setState(STATE.CLOSED);

    muted = false;
    updateMuteUi();

    assembly.dataset.presented =
      "false";

    assembly.dataset.entryComplete =
      "false";

    if (dialog.open) {
      dialog.close();
    }

    lastLauncher?.focus?.();
  };

  const open = (launcher) => {
    if (dialog.open) {
      return;
    }

    lastLauncher =
      launcher ?? null;

    muted = false;
    updateMuteUi();

    setPower(true);
    setState(STATE.OPENING);

    assembly.dataset.presented =
      "false";

    assembly.dataset.entryComplete =
      "false";

    frame.src =
      "about:blank";

    loader.setAttribute(
      "aria-hidden",
      "true",
    );

    dialog.showModal();

    updateMarqueeTransmission();
    startAuxiliaryScreens();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        assembly.dataset.presented =
          "true";
      });
    });

    entryTimer =
      window.setTimeout(() => {
        assembly.dataset.entryComplete =
          "true";

        setState(
          STATE.POWERED_OFF,
        );

        bootGame();
      }, ENTRY_DURATION_MS);
  };

  const handleHardwareDown = (
    event,
  ) => {
    const button =
      event.currentTarget;

    if (
      state !== STATE.RUNNING ||
      helpOpen
    ) {
      return;
    }

    const key =
      String(
        button.dataset.daveKey ?? "",
      )
        .trim()
        .toUpperCase();

    if (!key) {
      return;
    }

    event.preventDefault();

    try {
      button.setPointerCapture(
        event.pointerId,
      );
    } catch {
      // Best-effort pointer capture.
    }

    if (pressedKeys.has(key)) {
      return;
    }

    pressedKeys.add(key);

    lastHardwareKey = key;
    renderAuxiliaryScreens();

    button.dataset.pressed =
      "true";

    postToGame({
      type: MESSAGE.KEY,
      key,
      pressed: true,
    });
  };

  const releaseHardwareButton = (
    event,
  ) => {
    const button =
      event.currentTarget;

    const key =
      String(
        button.dataset.daveKey ?? "",
      )
        .trim()
        .toUpperCase();

    if (!key) {
      return;
    }

    if (!pressedKeys.has(key)) {
      button.dataset.pressed =
        "false";

      return;
    }

    pressedKeys.delete(key);

    lastHardwareKey =
      [...pressedKeys].at(-1) ??
      "IDLE";

    renderAuxiliaryScreens();

    button.dataset.pressed =
      "false";

    postToGame({
      type: MESSAGE.KEY,
      key,
      pressed: false,
    });
  };

  const handleRootClick = (
    event,
  ) => {
    const launcher =
      event.target.closest(
        "[data-dave2-launch]",
      );

    if (!launcher) {
      return;
    }

    event.preventDefault();

    open(launcher);
  };

  const handleDialogClick = (
    event,
  ) => {
    if (
      event.target.closest(
        "[data-dave2-close]",
      ) ||
      event.target === dialog
    ) {
      close();
    }
  };

  const handleCancel = (event) => {
    event.preventDefault();

    if (helpOpen) {
      closeHelp();
      return;
    }

    close();
  };

  const handleMessage = (event) => {
    if (
      event.origin !==
        window.location.origin ||
      event.source !==
        frame.contentWindow
    ) {
      return;
    }

    if (
      event.data?.type ===
      MESSAGE.CLOSE
    ) {
      if (helpOpen) {
        closeHelp();
      } else {
        close();
      }

      return;
    }

    if (
      event.data?.type ===
      MESSAGE.ERROR
    ) {
      destroyGame();
      setPower(false);
      setState(
        STATE.POWERED_OFF,
      );

      return;
    }

    if (
      event.data?.type !==
        MESSAGE.READY ||
      state !== STATE.BOOTING
    ) {
      return;
    }

    stopLoader();

    setState(STATE.RUNNING);

    loader.setAttribute(
      "aria-hidden",
      "true",
    );

    applyMuteState();

    requestAnimationFrame(() => {
      frame.focus();
      frame.contentWindow?.focus();
    });
  };

  root.addEventListener(
    "click",
    handleRootClick,
  );

  dialog.addEventListener(
    "click",
    handleDialogClick,
  );

  dialog.addEventListener(
    "cancel",
    handleCancel,
  );

  consoleElement.addEventListener(
    "pointerenter",
    handlePointerEnter,
  );

  consoleElement.addEventListener(
    "pointermove",
    handlePointerMove,
  );

  consoleElement.addEventListener(
    "pointerleave",
    handlePointerLeave,
  );

  powerButton.addEventListener(
    "click",
    togglePower,
  );

  muteButton.addEventListener(
    "click",
    toggleMute,
  );

  helpButton.addEventListener(
    "click",
    openHelp,
  );
  helpButton.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key !== "Enter" &&
        event.key !== " "
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      openHelp();
    },
  );

  helpCloseButton.addEventListener(
    "click",
    () => closeHelp(),
  );

  for (
    const button of hardwareButtons
  ) {
    button.addEventListener(
      "pointerdown",
      handleHardwareDown,
    );

    button.addEventListener(
      "pointerup",
      releaseHardwareButton,
    );

    button.addEventListener(
      "pointercancel",
      releaseHardwareButton,
    );

    button.addEventListener(
      "lostpointercapture",
      releaseHardwareButton,
    );
  }

  window.addEventListener(
    "message",
    handleMessage,
  );

  muteButton.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key !== "Enter" &&
        event.key !== " "
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      muteButton.dispatchEvent(
        new MouseEvent(
          "click",
          {
            bubbles: true,
          },
        ),
      );
    },
  );
  return Object.freeze({
    open,
    close,
    isOpen: () => dialog.open,
    getState: () => state,

    dispose() {
      close();

      if (tiltRaf) {
        cancelAnimationFrame(
          tiltRaf,
        );
      }

      root.removeEventListener(
        "click",
        handleRootClick,
      );

      dialog.removeEventListener(
        "click",
        handleDialogClick,
      );

      dialog.removeEventListener(
        "cancel",
        handleCancel,
      );

      consoleElement
        .removeEventListener(
          "pointerenter",
          handlePointerEnter,
        );

      consoleElement
        .removeEventListener(
          "pointermove",
          handlePointerMove,
        );

      consoleElement
        .removeEventListener(
          "pointerleave",
          handlePointerLeave,
        );

      powerButton
        .removeEventListener(
          "click",
          togglePower,
        );

      muteButton
        .removeEventListener(
          "click",
          toggleMute,
        );

      helpButton
        .removeEventListener(
          "click",
          openHelp,
        );

      for (
        const button of
        hardwareButtons
      ) {
        button.removeEventListener(
          "pointerdown",
          handleHardwareDown,
        );

        button.removeEventListener(
          "pointerup",
          releaseHardwareButton,
        );

        button.removeEventListener(
          "pointercancel",
          releaseHardwareButton,
        );

        button.removeEventListener(
          "lostpointercapture",
          releaseHardwareButton,
        );
      }

      window.removeEventListener(
        "message",
        handleMessage,
      );

      dialog.remove();
    },
  });
};