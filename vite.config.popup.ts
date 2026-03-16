import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: path.resolve(__dirname, "src/popup/index.html"),
      output: {
        entryFileNames: "popup/[name].js",
        chunkFileNames: "popup/[name].js",
        assetFileNames: "popup/[name].[ext]",
      },
    },
  },
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "src/shared"),
      "@popup": path.resolve(__dirname, "src/popup"),
    },
  },
});
