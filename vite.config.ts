import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { devApiPlugin } from "./server/dev-api";

// Vite configuration for the SPA.
// `npm run dev` serves /api/send-inquiry through the dev middleware so the
// form works locally; on Vercel the same file runs as a serverless function.
export default defineConfig({
  plugins: [react(), devApiPlugin()],
  server: {
    port: 5173,
    open: false,
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
