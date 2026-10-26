/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4e9f2",
          100: "#eadfe8",
          500: "#593a67",
          600: "#473052",
          700: "#35253d",
        },
      },
    },
  },
  plugins: [],
};
