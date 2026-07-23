const PAGE_WIDTH = 816;
const PAGE_HEIGHT = 1344;
const SAFE_ZONE = 64;

const fitReviewPage = (dialog) => {
  const viewport = dialog.querySelector("[data-review-viewport]");
  const stage = dialog.querySelector("[data-review-stage]");
  const scaleOutput = dialog.querySelector("[data-review-scale]");

  if (!viewport || !stage || !scaleOutput) return;

  const availableWidth = Math.max(1, viewport.clientWidth - SAFE_ZONE);
  const availableHeight = Math.max(1, viewport.clientHeight - SAFE_ZONE);
  const scale = Math.min(
    availableWidth / PAGE_WIDTH,
    availableHeight / PAGE_HEIGHT,
    1,
  );

  stage.style.setProperty("--review-scale", String(scale));
  scaleOutput.textContent = `${Math.round(scale * 100)}%`;
};

export const createReviewDialogController = (dialog) => {
  const handleResize = () => {
    if (dialog.open) fitReviewPage(dialog);
  };

  const open = () => {
    if (!dialog.open) dialog.showModal();
    requestAnimationFrame(() => fitReviewPage(dialog));
    window.addEventListener("resize", handleResize);
  };

  const close = () => {
    window.removeEventListener("resize", handleResize);
    if (dialog.open) dialog.close();
  };

  dialog.addEventListener("click", (event) => {
    if (event.target.matches("[data-review-close]")) close();
    if (event.target === dialog) close();
  });

  dialog.addEventListener("close", () => {
    window.removeEventListener("resize", handleResize);
  });

  return { open, close, fit: () => fitReviewPage(dialog) };
};
