/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        primary: "#00FFAA",
        secondary: "#37f5f1",
        surface: "#F8F9FA",
      },
      fontFamily: {
        mono: ["SpaceMono"], // Defaulting to system mono if not loaded
      },
    },
  },
  plugins: [],
}
