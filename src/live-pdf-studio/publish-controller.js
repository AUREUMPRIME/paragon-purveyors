import { createPublishFormData } from "./publish-payload.js";
import { fingerprintDocument } from "./state.js";

export const PUBLICATION_STATE = Object.freeze({
  DISABLED: "disabled",
  READY: "ready",
  REVIEWING: "reviewing",
  VALIDATING: "validating",
  CONFIRMING: "confirming",
  SUBMITTING: "submitting",
  QUEUED: "queued",
  BUILDING: "building",
  PROMOTING: "promoting",
  DEPLOYING: "deploying",
  VERIFYING: "verifying",
  SUCCESS: "success",
  CONFLICT: "conflict",
  FAILED: "failed",
});

const ACTIVE_STATES = new Set([
  PUBLICATION_STATE.REVIEWING,
  PUBLICATION_STATE.VALIDATING,
  PUBLICATION_STATE.CONFIRMING,
  PUBLICATION_STATE.SUBMITTING,
  PUBLICATION_STATE.QUEUED,
  PUBLICATION_STATE.BUILDING,
  PUBLICATION_STATE.PROMOTING,
  PUBLICATION_STATE.DEPLOYING,
  PUBLICATION_STATE.VERIFYING,
]);

const TERMINAL_STATES = new Set([
  PUBLICATION_STATE.SUCCESS,
  PUBLICATION_STATE.CONFLICT,
  PUBLICATION_STATE.FAILED,
]);

const SERVER_ACTIVE_STATES = new Set([
  "queued",
  "validating",
  "building",
  "promoting",
  "deploying",
  "verifying",
]);

const sleepDefault = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const publicationErrorMessage = (error) => {
  switch (error?.code) {
    case "STALE_MAIN":
      return "The live Monthly Specials changed. Reload the Studio before publishing.";
    case "PUBLISHING_DISABLED":
      return "Live publishing is currently unavailable.";
    case "STAGING_REF_EXISTS":
      return "This publication already exists. Wait for it to finish or reload the Studio.";
    case "WORKFLOW_DISPATCH_FAILED":
      return "The publication could not start. Your draft is still safe.";
    default:
      return error instanceof Error
        ? error.message
        : "The publication could not be completed. Your draft is still safe.";
  }
};

export const createPublishController = ({
  apiClient,
  authController,
  shell,
  state,
  store,
  reviewController,
  navigateToOverview = () => {},
  reload = () => globalThis.location?.reload(),
  sleep = sleepDefault,
  pollIntervalMs = 2000,
  maxPollAttempts = 450,
} = {}) => {
  if (
    !apiClient
    || !authController
    || !shell
    || !state
    || !store
    || !reviewController
  ) {
    throw new TypeError(
      "Publish controller requires API, auth, shell, state, storage, and Review dependencies.",
    );
  }

  let productionPublishingEnabled = false;
  let currentState = PUBLICATION_STATE.DISABLED;
  let activePublishId = "";
  let disposed = false;

  const present = (nextState, message = "") => {
    currentState = nextState;
    shell.setPublishingState({
      enabled: productionPublishingEnabled,
      state: nextState,
      message,
    });
  };

  const setAvailability = (enabled) => {
    productionPublishingEnabled = enabled === true;

    if (ACTIVE_STATES.has(currentState)) {
      shell.setPublishingState({
        enabled: productionPublishingEnabled,
        state: currentState,
        message: "",
      });
      return currentState;
    }

    present(
      productionPublishingEnabled
        ? PUBLICATION_STATE.READY
        : PUBLICATION_STATE.DISABLED,
    );
    return currentState;
  };

  const getAccessToken = () => {
    const session = authController.getSession();
    if (!session?.accessToken) {
      const error = new Error("Studio authentication is required.");
      error.code = "AUTH_REQUIRED";
      throw error;
    }
    return session.accessToken;
  };

  const reviewCurrentDraft = async () => {
    present(PUBLICATION_STATE.REVIEWING);
    const validation = await reviewController.open();
    const draftFingerprint = fingerprintDocument(state.getDraft());

    if (
      !validation
      || validation.isValid !== true
      || validation.errorCount !== 0
      || validation.draftFingerprint !== draftFingerprint
    ) {
      const error = new Error(
        "Review the current draft and resolve every error before publishing.",
      );
      error.code = "REVIEW_BLOCKED";
      throw error;
    }

    return validation;
  };

  const pollPublication = async (accessToken, publishId) => {
    for (let attempt = 0; attempt < maxPollAttempts; attempt += 1) {
      if (disposed) {
        throw new Error("Publication monitoring was stopped.");
      }

      const status = await apiClient.publicationStatus(
        accessToken,
        publishId,
      );
      const nextState = String(status?.status || "").toLowerCase();

      if (SERVER_ACTIVE_STATES.has(nextState)) {
        present(nextState);
      } else if (nextState === "success") {
        present(PUBLICATION_STATE.SUCCESS);
        return status;
      } else if (nextState === "conflict") {
        present(
          PUBLICATION_STATE.CONFLICT,
          "The live revision changed during publication. Your draft is still safe.",
        );
        return status;
      } else if (nextState === "failed") {
        present(
          PUBLICATION_STATE.FAILED,
          "The publication workflow failed. Your draft is still safe.",
        );
        return status;
      } else {
        present(PUBLICATION_STATE.QUEUED);
      }

      if (attempt < maxPollAttempts - 1) {
        await sleep(pollIntervalMs);
      }
    }

    throw new Error(
      "Publication verification timed out. Your draft is still safe.",
    );
  };

  const publish = async () => {
    let progressOpened = false;

    if (disposed) {
      return Object.freeze({ accepted: false, reason: "DISPOSED" });
    }

    if (ACTIVE_STATES.has(currentState)) {
      return Object.freeze({ accepted: false, reason: "BUSY" });
    }

    if (!productionPublishingEnabled) {
      present(
        PUBLICATION_STATE.DISABLED,
        "Live publishing is currently unavailable.",
      );
      return Object.freeze({ accepted: false, reason: "PUBLISHING_DISABLED" });
    }

    try {
      const accessToken = getAccessToken();
      await reviewCurrentDraft();

      const snapshot = state.getSnapshot();
      const document = state.getDraft();

      present(PUBLICATION_STATE.VALIDATING);
      await apiClient.validate(accessToken, {
        document,
        assetCatalog: document.assetLibrary,
        baseMainSha: snapshot.baseMainSha,
      });

      present(PUBLICATION_STATE.CONFIRMING);
      const confirmed = await shell.confirmPublishLive();
      if (!confirmed) {
        present(PUBLICATION_STATE.READY);
        return Object.freeze({ accepted: false, reason: "CANCELLED" });
      }

      reviewController.close();
      navigateToOverview();
      shell.openPublicationProgress();
      progressOpened = true;

      const uploads = await store.listUploads(snapshot.documentId);
      const payload = createPublishFormData({
        document,
        baseMainSha: snapshot.baseMainSha,
        uploads,
      });

      activePublishId = payload.publishId;
      present(PUBLICATION_STATE.SUBMITTING);

      const accepted = await apiClient.publish(
        accessToken,
        payload.formData,
      );

      if (
        accepted?.accepted !== true
        || accepted.publishId !== payload.publishId
      ) {
        throw new Error("The Studio service returned an invalid publication response.");
      }

      present(PUBLICATION_STATE.QUEUED);
      const terminal = await pollPublication(
        accessToken,
        payload.publishId,
      );

      if (terminal?.status === "success") {
        await shell.waitForPublicationClose();
        await store.clearDraft(snapshot.documentId);
        await reload();

        return Object.freeze({
          accepted: true,
          publishId: payload.publishId,
          status: "success",
        });
      }

      await shell.waitForPublicationClose();

      return Object.freeze({
        accepted: false,
        publishId: payload.publishId,
        status: terminal?.status || "failed",
      });
    } catch (error) {
      const conflict =
        error?.code === "STALE_MAIN"
        || error?.code === "STAGING_REF_EXISTS";

      present(
        conflict
          ? PUBLICATION_STATE.CONFLICT
          : PUBLICATION_STATE.FAILED,
        publicationErrorMessage(error),
      );

      if (progressOpened) {
        await shell.waitForPublicationClose();
      }

      return Object.freeze({
        accepted: false,
        reason: String(error?.code || "PUBLICATION_FAILED"),
      });
    } finally {
      if (TERMINAL_STATES.has(currentState)) {
        activePublishId = "";
      }
    }
  };

  return Object.freeze({
    publish,
    setAvailability,
    getState: () => Object.freeze({
      state: currentState,
      enabled: productionPublishingEnabled,
      activePublishId,
      busy: ACTIVE_STATES.has(currentState),
    }),
    dispose() {
      disposed = true;
      activePublishId = "";
    },
  });
};
