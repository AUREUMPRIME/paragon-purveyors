const CONFIG = Object.freeze({
  recipientEmail: "info@paragonpurveyors.com",
  subject: "Paragon Purveyors Inquiry",
  minMessageLength: 12,
  maxMessageLength: 5000,
  maxEmailLength: 254,
  throttleSeconds: 60,
});

function doGet() {
  return createJsonResponse({
    ok: true,
    service: "Paragon Purveyors inquiry email endpoint",
  });
}

function doPost(event) {
  try {
    const data = getRequestData(event);

    if (normalizeText(data.website || data.company || data.companyWebsite)) {
      return createJsonResponse({ ok: true, ignored: true });
    }

    const customerEmail = normalizeText(data.email);
    const message = normalizeText(data.message);
    const sourcePage = normalizeText(data.sourcePage || data.page || "https://paragonpurveyors.com");
    const userAgent = normalizeText(data.userAgent || "");
    const submittedAt = new Date().toISOString();

    if (!isValidEmail(customerEmail)) {
      return createJsonResponse({ ok: false, error: "Enter a valid email address." });
    }

    if (message.length < CONFIG.minMessageLength) {
      return createJsonResponse({ ok: false, error: "Add a brief message before sending the inquiry." });
    }

    if (message.length > CONFIG.maxMessageLength) {
      return createJsonResponse({ ok: false, error: "Message is too long." });
    }

    if (isRateLimited(customerEmail)) {
      return createJsonResponse({ ok: false, error: "Please wait before sending another inquiry." });
    }

    const emailBody = [
      "New website inquiry from Paragon Purveyors.",
      "",
      "Customer email:",
      customerEmail,
      "",
      "Message:",
      message,
      "",
      "Source page:",
      sourcePage,
      "",
      "Submitted at:",
      submittedAt,
      "",
      "Technical context:",
      userAgent || "Not provided",
    ].join("\n");

    MailApp.sendEmail({
      to: CONFIG.recipientEmail,
      replyTo: customerEmail,
      subject: CONFIG.subject,
      body: emailBody,
      name: "Paragon Purveyors Website",
    });

    recordRateLimit(customerEmail);

    return createJsonResponse({ ok: true });
  } catch (error) {
    console.error(error);
    return createJsonResponse({ ok: false, error: "Inquiry could not be sent." });
  }
}

function getRequestData(event) {
  if (!event) {
    return {};
  }

  if (event.parameter && Object.keys(event.parameter).length > 0) {
    return event.parameter;
  }

  const contents = event.postData && event.postData.contents ? event.postData.contents : "";

  if (!contents) {
    return {};
  }

  try {
    return JSON.parse(contents);
  } catch (error) {
    return parseFormEncodedBody(contents);
  }
}

function parseFormEncodedBody(contents) {
  return contents.split("&").reduce((result, pair) => {
    const separatorIndex = pair.indexOf("=");

    if (separatorIndex === -1) {
      return result;
    }

    const key = decodeURIComponent(pair.slice(0, separatorIndex).replace(/\+/g, " "));
    const value = decodeURIComponent(pair.slice(separatorIndex + 1).replace(/\+/g, " "));

    result[key] = value;
    return result;
  }, {});
}

function normalizeText(value) {
  return String(value || "").trim();
}

function isValidEmail(value) {
  if (!value || value.length > CONFIG.maxEmailLength) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getRateLimitKey(email) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    email.toLowerCase(),
    Utilities.Charset.UTF_8
  );

  return "inquiry_" + Utilities.base64EncodeWebSafe(digest).slice(0, 32);
}

function isRateLimited(email) {
  const cache = CacheService.getScriptCache();
  return cache.get(getRateLimitKey(email)) === "1";
}

function recordRateLimit(email) {
  const cache = CacheService.getScriptCache();
  cache.put(getRateLimitKey(email), "1", CONFIG.throttleSeconds);
}

function createJsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
