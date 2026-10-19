import { defineConfig } from "vite";
// Generated standalone HTML is an output, not another application entry.
export default defineConfig({ optimizeDeps: { entries: ["index.html"] } });
