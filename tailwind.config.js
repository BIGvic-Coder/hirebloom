/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',
        primaryLight: '#3b82f6',
        accent: '#10b981',
        cream: '#f5f2eb',
        forest: '#113c2c',
        forestDark: '#0b2c1f',
        mint: '#8ecfa9',
        mintLight: '#d1f0dd',
      }
    },
  },
  plugins: [],
}
