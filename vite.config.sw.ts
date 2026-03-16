import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/background/serviceWorker.ts"),
      name: "serviceWorker",
      fileName: () => "background/serviceWorker.js",
      formats: ["es"],
    },
    outDir: "dist",
    rollupOptions: {
      output: {
        entryFileNames: "background/serviceWorker.js",
      },
    },
  },
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "src/shared"),
      "@background": path.resolve(__dirname, "src/background"),
    },
  },
});
