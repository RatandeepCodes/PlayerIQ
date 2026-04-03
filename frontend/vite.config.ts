import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("recharts")) {
            return "charts-vendor";
          }

          if (id.includes("@radix-ui") || id.includes("cmdk") || id.includes("embla-carousel") || id.includes("vaul")) {
            return "ui-vendor";
          }

          if (id.includes("@tanstack")) {
            return "data-vendor";
          }

          if (
            id.includes("react-router-dom") ||
            id.includes("react-dom") ||
            id.includes("/react/") ||
            id.includes("\\react\\") ||
            id.includes("framer-motion")
          ) {
            return "app-vendor";
          }

          return "vendor";
        },
      },
    },
  },
}));
