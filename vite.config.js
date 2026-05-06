import { defineConfig } from "vite";

const basePath = process.env.VITE_BASE_PATH || "/paragon-purveyors/";

export default defineConfig({
  base: basePath,
});
