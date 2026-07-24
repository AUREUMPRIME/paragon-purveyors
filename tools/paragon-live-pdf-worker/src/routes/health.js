import { jsonResponse } from "../cors.js";

export const handleHealth = (request, env, { nowMs = Date.now() } = {}) => jsonResponse(
  request,
  env,
  {
    ok: true,
    service: "paragon-live-pdf-worker",
    phase: "4B",
    time: new Date(nowMs).toISOString(),
  },
);
