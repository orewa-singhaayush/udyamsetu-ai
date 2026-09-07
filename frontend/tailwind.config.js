/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          slate: "#233D4D",
          "slate-light": "#2D4C5E",
          "slate-dark": "#1A2E3B",
          orange: "#FE7F2D",
          "orange-hover": "#E66A17",
          bg: "#EAECF0",
          card: "#FFFFFF",
          border: "#D0D5DD",
          muted: "#667085",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
      }
    },
  },
  plugins: [],
}
