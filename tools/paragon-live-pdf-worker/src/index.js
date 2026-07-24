import {
  handlePreflight,
  hasRejectedOrigin,
  jsonResponse,
} from "./cors.js";
import { handleLogin, handleSession } from "./routes/auth.js";
import { handleHealth } from "./routes/health.js";

const routeRequest = async (request, env) => {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/v1/health") {
    return handleHealth(request, env);
  }

  if (request.method === "POST" && url.pathname === "/v1/auth/login") {
    return handleLogin(request, env);
  }

  if (request.method === "GET" && url.pathname === "/v1/auth/session") {
    return handleSession(request, env);
  }

  return jsonResponse(request, env, { error: "Not found." }, { status: 404 });
};

export const handleRequest = async (request, env) => {
  const preflight = handlePreflight(request, env);
  if (preflight) {
    return preflight;
  }

  if (hasRejectedOrigin(request, env)) {
    return jsonResponse(request, env, { error: "Origin not allowed." }, { status: 403 });
  }

  try {
    return await routeRequest(request, env);
  } catch {
    return jsonResponse(request, env, { error: "Internal server error." }, { status: 500 });
  }
};

export default {
  fetch: handleRequest,
};
