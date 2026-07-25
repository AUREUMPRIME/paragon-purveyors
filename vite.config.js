import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const basePath = process.env.VITE_BASE_PATH || "/";
const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: basePath,
  build: {
    rollupOptions: {
      input: {
        main: resolve(projectRoot, "index.html"),
        specials: resolve(projectRoot, "specials/index.html"),
      },
    },
  },
});
