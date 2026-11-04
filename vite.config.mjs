import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {photoCheckPlugin} from './server/photo-check.mjs';
import {companionBridgePlugin} from './server/companion-bridge.mjs';

import {worldToolsPlugin} from './server/world-tools.mjs';

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client", "motion/react"],
  },
  resolve: {dedupe: ["react", "react-dom"]},
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react(),photoCheckPlugin(),companionBridgePlugin(),worldToolsPlugin()],
});
