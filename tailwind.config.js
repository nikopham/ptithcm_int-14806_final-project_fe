/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#DF6951", // primary
          hover: "#cc593f",
        },
      },
    },
  },
  plugins: [],
};
