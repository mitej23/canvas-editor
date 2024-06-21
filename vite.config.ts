import MillionLint from '@million/lint';
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
const _plugins = [react()];
_plugins.unshift(MillionLint.vite())
export default defineConfig({
  plugins: _plugins,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});