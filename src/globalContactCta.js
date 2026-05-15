import gsap from "gsap";

export function initGlobalContactCta() {
  const cta = document.querySelector(".global-contact-cta");

  if (!cta || cta.dataset.motionReady === "true") {
    return;
  }

  cta.dataset.motionReady = "true";

  const inner = cta.querySelector(".global-contact-cta__inner");
  const mark = cta.querySelector(".global-contact-cta__mark");
  const line = cta.querySelector(".global-contact-cta__line");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!inner || !mark || !line) {
    return;
  }

  gsap.killTweensOf([inner, mark, line]);

  gsap.set(mark, {
    opacity: 1,
    visibility: "visible",
    x: 0,
    scale: 1,
    transformOrigin: "50% 50%",
  });

  gsap.set(line, {
    scaleX: 0.34,
    transformOrigin: "left center",
  });

  if (reduceMotion) {
    gsap.set(inner, {
      opacity: 1,
      visibility: "visible",
      y: 0,
    });

    gsap.set(line, {
      scaleX: 1,
    });

    return;
  }

  gsap.fromTo(
    inner,
    {
      opacity: 0,
      visibility: "visible",
      y: 10,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.72,
      delay: 0.48,
      ease: "power2.out",
      overwrite: true,
    },
  );

  const idleTimeline = gsap.timeline({
    repeat: -1,
    yoyo: true,
    repeatDelay: 0.65,
    defaults: {
      ease: "sine.inOut",
      overwrite: true,
    },
  });

  idleTimeline.to(mark, {
    opacity: 0.55,
    duration: 6.8,
  });

  const enter = () => {
    idleTimeline.pause();

    gsap.to(mark, {
      opacity: 1,
      x: 0,
      scale: 1.035,
      duration: 0.28,
      ease: "power2.out",
      overwrite: true,
    });

    gsap.to(line, {
      scaleX: 1,
      duration: 0.32,
      ease: "power2.out",
      overwrite: true,
    });
  };

  const leave = () => {
    gsap.to(mark, {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: 0.32,
      ease: "power2.out",
      overwrite: true,
      onComplete: () => {
        idleTimeline.resume();
      },
    });

    gsap.to(line, {
      scaleX: 0.34,
      duration: 0.32,
      ease: "power2.out",
      overwrite: true,
    });
  };

  cta.addEventListener("mouseenter", enter);
  cta.addEventListener("focus", enter);
  cta.addEventListener("mouseleave", leave);
  cta.addEventListener("blur", leave);
}

