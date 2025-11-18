import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs";
import wasm from "vite-plugin-wasm";

// https://vite.dev/config/
export default defineConfig({
  cacheDir: "./.vite",
  build: {
    target: "esnext",
    minify: false,
  },
  // Remove topLevelAwait() - causes SWC parse errors on Alpine with large bundles
  // Target esnext already supports top-level await natively
  plugins: [react(), wasm(), viteCommonjs()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      assert: 'assert',
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify',
      url: 'url',
      fs: 'browserify-fs',
    },
    
  },
  optimizeDeps: {
    // Disable esbuild optimizer to avoid segfault on AMD Ryzen CPUs with Vite 7.x
    // Set to 'disabled' mode which skips dependency pre-bundling entirely
    disabled: 'build',
    esbuildOptions: {
      target: "esnext",
    },
    include: [
      'buffer',
      'process',
    ],
  },
  define: {},
});
