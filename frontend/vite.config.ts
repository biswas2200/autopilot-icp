import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ }) => ({
  envPrefix: "VITE_",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  css: {
    postcss: './postcss.config.js', // Add this line
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "components": path.resolve(__dirname, "./src/components"),
      "ui": path.resolve(__dirname, "./src/components/ui"),
      "utils": path.resolve(__dirname, "./src/lib/utils"),
      "lib": path.resolve(__dirname, "./src/lib"),
      "hooks": path.resolve(__dirname, "./src/hooks"),
    },
  },
}));
// This configuration sets up Vite for a React project with TypeScript support.
// It includes server settings, plugins, and path aliases for easier imports.