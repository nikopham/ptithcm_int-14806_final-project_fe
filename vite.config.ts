import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Tắt TypeScript type checking khi build
      typescript: {
        ignoreBuildErrors: true,
      },
    }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: { 
    port: 5173,
    // Cấu hình cho Capacitor
    host: '0.0.0.0',
  },
  // Cấu hình build cho Capacitor
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild', // Dùng esbuild (mặc định, không cần cài thêm)
  },
  // Tắt TypeScript type checking khi build (chỉ dùng cho type checking, không block build)
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
});
