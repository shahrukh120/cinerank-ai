/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",           // Checks App.tsx, index.tsx, etc. in root
    "./components/**/*.{js,ts,jsx,tsx}", // Checks your components folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}