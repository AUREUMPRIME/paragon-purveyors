export const STUDIO_SECTIONS = Object.freeze([
  { id: "overview", label: "Overview", number: "01" },
  { id: "header", label: "Header & Campaign", number: "02" },
  { id: "cuts", label: "Featured Cuts", number: "03" },
  { id: "logos", label: "Logos & Marks", number: "04" },
  { id: "contacts", label: "Contacts", number: "05" },
  { id: "footer", label: "Footer", number: "06" },
  { id: "assets", label: "Asset Library", number: "07" },
  { id: "review", label: "Review & Publish", number: "08" },
]);

export const createNavigationController = ({
  root,
  onNavigate,
  initialSection = "overview",
}) => {
  let activeSection = initialSection;

  const setActive = (sectionId) => {
    if (!STUDIO_SECTIONS.some((section) => section.id === sectionId)) return;
    activeSection = sectionId;

    root.querySelectorAll("[data-studio-nav]").forEach((button) => {
      const isActive = button.dataset.studioNav === sectionId;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-current", isActive ? "page" : "false");
    });

    onNavigate(sectionId);
  };

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-studio-nav]");
    if (!button) return;
    setActive(button.dataset.studioNav);
  });

  setActive(activeSection);

  return {
    getActive: () => activeSection,
    setActive,
  };
};
