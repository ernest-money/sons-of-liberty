import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [
        path.resolve(__dirname, "../../dlcdevkit/ddk-wasm/pkg"),
        path.resolve(__dirname, "./src"),
      ],
    },
    proxy: {
      "/api": {
        target: "http://localhost:5150", // Replace 8000 with your target port
        changeOrigin: true,
      },
    },
  },
});
