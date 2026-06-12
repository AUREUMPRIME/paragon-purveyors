const COPY_READY_TEXT = "Copy";
const COPY_DONE_TEXT = "Copied";
const INQUIRY_ENDPOINT_URL =
  "https://script.google.com/macros/s/AKfycbxNFlI8SbEBiRB_x9rQ-JDGxvGwSPp6vWlrhlsFdG8P1pmLAq6_sm-B9H_P-dEBSUfTuA/exec";

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

const sendInquiry = async ({ name, email, message, honeypot }) => {
  const payload = new URLSearchParams({
    name,
    email,
    message,
    website: honeypot,
    sourcePage: window.location.href,
    userAgent: window.navigator.userAgent,
  });

  await fetch(INQUIRY_ENDPOINT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: payload.toString(),
  });
};

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

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameInput = form.querySelector("[data-inquiry-name]");
    const emailInput = form.querySelector("[data-inquiry-email]");
    const messageInput = form.querySelector("[data-inquiry-message]");
    const honeypotInput = form.querySelector("[data-inquiry-website]");
    const submitButton = form.querySelector("[data-inquiry-submit]");

    const name = nameInput?.value.trim() || "";
    const email = emailInput?.value.trim() || "";
    const message = messageInput?.value.trim() || "";
    const honeypot = honeypotInput?.value.trim() || "";

    if (name.length < 2 || name.length > 120) {
      nameInput?.focus();
      setStatus(statusNode, "Enter your full name.", "error");
      return;
    }

    if (!isValidEmail(email)) {
      emailInput?.focus();
      setStatus(statusNode, "Enter a valid email address.", "error");
      return;
    }

    if (message.length < 12) {
      messageInput?.focus();
      setStatus(statusNode, "Add a brief message before sending the inquiry.", "error");
      return;
    }

    try {
      submitButton?.setAttribute("disabled", "");
      submitButton?.setAttribute("aria-disabled", "true");
      setStatus(statusNode, "Sending inquiry...", "neutral");

      await sendInquiry({ name, email, message, honeypot });

      form.reset();
      setStatus(
        statusNode,
        "Inquiry sent. The Paragon Purveyors team will review your request.",
        "success",
      );
    } catch {
      setStatus(
        statusNode,
        "Inquiry could not be sent. Please email info@paragonpurveyors.com directly.",
        "error",
      );
    } finally {
      submitButton?.removeAttribute("disabled");
      submitButton?.setAttribute("aria-disabled", "false");
    }
  });
}
