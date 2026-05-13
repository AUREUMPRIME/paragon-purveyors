const COPY_READY_TEXT = "Copy";
const COPY_DONE_TEXT = "Copied";

const copyToClipboard = async (value) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
};

const setStatus = (statusNode, message, type = "neutral") => {
  if (!statusNode) {
    return;
  }

  statusNode.textContent = message;
  statusNode.dataset.statusType = type;
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function initInquiryForm() {
  const form = document.querySelector("[data-inquiry-form]");
  const statusNode = document.querySelector("[data-inquiry-status]");

  document.querySelectorAll("[data-copy-value]").forEach((button) => {
    if (button.dataset.copyReady === "true") {
      return;
    }

    button.dataset.copyReady = "true";

    button.addEventListener("click", async () => {
      const value = button.dataset.copyValue || "";

      if (!value) {
        return;
      }

      try {
        await copyToClipboard(value);
        button.textContent = COPY_DONE_TEXT;
        setStatus(statusNode, "Contact detail copied.", "success");

        window.setTimeout(() => {
          button.textContent = COPY_READY_TEXT;
        }, 1500);
      } catch {
        setStatus(statusNode, "Copy failed. Select the contact detail manually.", "error");
      }
    });
  });

  if (!form || form.dataset.inquiryReady === "true") {
    return;
  }

  form.dataset.inquiryReady = "true";

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const emailInput = form.querySelector("[data-inquiry-email]");
    const messageInput = form.querySelector("[data-inquiry-message]");

    const email = emailInput?.value.trim() || "";
    const message = messageInput?.value.trim() || "";

    if (!isValidEmail(email)) {
      emailInput?.focus();
      setStatus(statusNode, "Enter a valid email address.", "error");
      return;
    }

    if (message.length < 12) {
      messageInput?.focus();
      setStatus(statusNode, "Add a brief message before preparing the inquiry.", "error");
      return;
    }

    setStatus(
      statusNode,
      "Inquiry prepared locally. Email sending will be connected during the final hosting setup.",
      "success",
    );
  });
}
