/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B1C2D",
        surface: "#102A43",
        primary: "#10B981",
        gold: "#D4AF37",
        muted: "#94A3B8",
        light: "#F8FAFC",
      },
    },
  },
  plugins: [],
};