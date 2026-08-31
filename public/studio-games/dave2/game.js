(() => {
  "use strict";

  const MESSAGE = Object.freeze({
    READY: "paragon-dave2-ready",
    ERROR: "paragon-dave2-error",
    CLOSE: "paragon-dave2-close",
    KEY: "paragon-dave2-key",
    MUTE: "paragon-dave2-mute",
  });

  const KEY_CODE = Object.freeze({
    SPACE: 32,
    LEFT: 263,
    RIGHT: 262,
    UP: 265,
    DOWN: 264,
    CTRL: 341,
    ALT: 342,
  });

  const root =
    document.getElementById("dos");

  if (!root) {
    throw new Error(
      "Dave 2 game root not found.",
    );
  }

  let ci = null;

  const postParent = (
    type,
    extra = {},
  ) => {
    window.parent.postMessage(
      {
        type,
        ...extra,
      },
      window.location.origin,
    );
  };

  const requestClose = (
    event,
  ) => {
    if (event.key !== "Escape") {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    postParent(
      MESSAGE.CLOSE,
    );
  };

  const handleParentMessage = (
    event,
  ) => {
    if (
      event.origin !==
        window.location.origin ||
      event.source !==
        window.parent ||
      !ci
    ) {
      return;
    }

    if (
      event.data?.type ===
      MESSAGE.MUTE
    ) {
      const nextMuted =
        event.data.muted === true;

      if (
        nextMuted &&
        typeof ci.mute ===
          "function"
      ) {
        ci.mute();
      }

      if (
        !nextMuted &&
        typeof ci.unmute ===
          "function"
      ) {
        ci.unmute();
      }

      return;
    }

    if (
      event.data?.type !==
      MESSAGE.KEY
    ) {
      return;
    }

    const key =
      String(
        event.data.key ?? "",
      )
        .trim()
        .toUpperCase();

    const keyCode =
      KEY_CODE[key];

    const pressed =
      event.data.pressed === true;

    if (
      !Number.isInteger(keyCode) ||
      typeof ci.sendKeyEvent !==
        "function"
    ) {
      return;
    }

    ci.sendKeyEvent(
      keyCode,
      pressed,
    );
  };

  window.addEventListener(
    "keydown",
    requestClose,
    true,
  );

  window.addEventListener(
    "message",
    handleParentMessage,
  );

  root.addEventListener(
    "pointerdown",
    () => {
      window.focus();
      root.focus();
    },
  );

  Dos(root, {
    url: "./dave2.jsdos",

    pathPrefix:
      "./vendor/jsdos/emulators/",

    autoStart: true,
    kiosk: true,
    fullScreen: false,

    onEvent: (
      event,
      commandInterface,
    ) => {
      if (
        event !== "ci-ready"
      ) {
        return;
      }

      ci =
        commandInterface;

      if (
        !ci ||
        typeof ci.sendKeyEvent !==
          "function"
      ) {
        postParent(
          MESSAGE.ERROR,
          {
            reason:
              "sendKeyEvent unavailable",
          },
        );

        return;
      }

      window.__PARAGON_DAVE2__ =
        Object.freeze({
          ci,
        });

      requestAnimationFrame(
        () => {
          window.focus();
          root.focus();

          postParent(
            MESSAGE.READY,
          );
        },
      );
    },
  });
})();