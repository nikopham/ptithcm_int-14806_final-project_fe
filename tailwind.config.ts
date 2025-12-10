import defaultTheme from "tailwindcss/defaultTheme"; // SỬA 1: Đổi tên import
import type { Config } from "tailwindcss";

export default {
  content: ["index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#1a1a1a",
      },
      fontFamily: {
        // SỬA 2: Truy cập thông qua defaultTheme.fontFamily.sans
        sans: ["Manrope", ...defaultTheme.fontFamily.sans],
        heading: ["Manrope", ...defaultTheme.fontFamily.sans],
        logo: ["Just Another Hand", "cursive"],
      },
    },
  },
  plugins: [],
} satisfies Config;
