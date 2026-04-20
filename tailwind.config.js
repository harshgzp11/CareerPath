/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0f1115",
        darkCard: "#1f2229",
        brandPrimary: "#4F46E5",
        brandSecondary: "#10B981"
      }
    },
  },
  plugins: [],
}
