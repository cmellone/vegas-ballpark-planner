/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist Variable"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ['"Geist Mono Variable"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        page: "#F5F6F4",
        ink: "#13211E",
        muted: "#66736E",
        line: "#E3E7E3",
        green: { 950: "#00261F", 900: "#00352F", 800: "#0A4A40", 700: "#0F6B57", 100: "#E3EFEA", 50: "#F1F7F4" },
        gold: { 500: "#EFB21E", 600: "#D59A0A", 100: "#FDF3D6" },
        rust: { 600: "#C2553A", 100: "#F8E6E0" },
      },
      boxShadow: { card: "0 1px 2px rgba(16,32,28,.05)" },
    },
  },
  plugins: [],
};
