export const STUDIO_SESSION_STORAGE_KEY =
  "paragon-live-pdf-studio-session";

const parseExpiry = (value) => {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
};

const normalizeSession = (value) => {
  if (!value || typeof value !== "object") return null;

  const accessToken = typeof value.accessToken === "string"
    ? value.accessToken
    : "";
  const expiresAt = typeof value.expiresAt === "string"
    ? value.expiresAt
    : "";

  if (!accessToken || parseExpiry(expiresAt) === null) return null;
  return Object.freeze({ accessToken, expiresAt });
};

export const createStudioAuthController = ({
  client,
  sessionStorage = globalThis.sessionStorage,
  now = () => Date.now(),
  onStateChange = () => {},
} = {}) => {
  if (!client || typeof client !== "object") {
    throw new TypeError("A Studio API client is required.");
  }

  if (
    !sessionStorage
    || typeof sessionStorage.getItem !== "function"
    || typeof sessionStorage.setItem !== "function"
    || typeof sessionStorage.removeItem !== "function"
  ) {
    throw new TypeError("Session storage is unavailable.");
  }

  let currentSession = null;

  const emit = (state) => {
    onStateChange(Object.freeze({ ...state }));
  };

  const clearSession = () => {
    currentSession = null;
    sessionStorage.removeItem(STUDIO_SESSION_STORAGE_KEY);
    emit({ authenticated: false, session: null });
  };

  const onUnauthorized = () => {
    clearSession();
  };

  client.setUnauthorizedHandler?.(onUnauthorized);

  const saveSession = (value) => {
    const session = normalizeSession(value);
    if (!session) {
      throw new TypeError("A valid access token and expiry are required.");
    }

    currentSession = session;
    sessionStorage.setItem(
      STUDIO_SESSION_STORAGE_KEY,
      JSON.stringify({
        accessToken: session.accessToken,
        expiresAt: session.expiresAt,
      }),
    );

    return session;
  };

  const readSession = () => {
    if (currentSession) return currentSession;

    const stored = sessionStorage.getItem(STUDIO_SESSION_STORAGE_KEY);
    if (!stored) return null;

    try {
      const session = normalizeSession(JSON.parse(stored));
      if (!session) {
        clearSession();
        return null;
      }

      currentSession = session;
      return session;
    } catch {
      clearSession();
      return null;
    }
  };

  const requireActiveSession = () => {
    const session = readSession();
    if (!session || parseExpiry(session.expiresAt) <= now()) {
      clearSession();
      return null;
    }

    return session;
  };

  const startup = async () => {
    const stored = requireActiveSession();
    if (!stored) return Object.freeze({ authenticated: false });

    try {
      const session = await client.session(stored.accessToken);
      const bootstrap = await client.bootstrap(stored.accessToken);
      const refreshed = saveSession({
        accessToken: stored.accessToken,
        expiresAt: session.expiresAt || stored.expiresAt,
      });
      const result = Object.freeze({
        authenticated: true,
        session: refreshed,
        bootstrap,
      });
      emit(result);
      return result;
    } catch (error) {
      if (error?.status === 401) clearSession();
      throw error;
    }
  };

  const login = async (password) => {
    const response = await client.login(password);
    const session = saveSession(response);

    try {
      const bootstrap = await client.bootstrap(session.accessToken);
      const result = Object.freeze({
        authenticated: true,
        session,
        bootstrap,
      });
      emit(result);
      return result;
    } catch (error) {
      if (error?.status === 401) clearSession();
      throw error;
    }
  };

  const logout = () => {
    clearSession();
  };

  return Object.freeze({
    startup,
    login,
    logout,
    clearSession,
    onUnauthorized,
    getSession: readSession,
    isAuthenticated: () => Boolean(requireActiveSession()),
  });
};
