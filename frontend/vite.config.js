import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    fs: {
      allow: [
        path.resolve(__dirname, "../../dlcdevkit/ddk-wasm/pkg"),
        path.resolve(__dirname, "./src"),
        path.resolve(__dirname, "./public"),
      ],
    },
    proxy: {
      "/api": {
        target: "http://localhost:5150",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    force: true,
  },
});
