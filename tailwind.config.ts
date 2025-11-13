import defaultTheme from "tailwindcss/defaultTheme"; // SỬA 1: Đổi tên import
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0b0b0b",
        foreground: "#e4e4e7",
      },
      fontFamily: {
        // SỬA 2: Truy cập thông qua defaultTheme.fontFamily.sans
        sans: ["Manrope", ...defaultTheme.fontFamily.sans],
        heading: ["Manrope", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config;
