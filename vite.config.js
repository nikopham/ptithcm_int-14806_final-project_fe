import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // server: {
  //   host: "0.0.0.0",
  //   port: 5173,
  // },
  // preview: {
  //   host: "0.0.0.0",
  //   port: Number(process.env.PORT) || 4173,
  //   strictPort: true,
  //   allowedHosts: ["ptithcm-tttn-2025-homestay-booking.onrender.com"],
  // },
});
