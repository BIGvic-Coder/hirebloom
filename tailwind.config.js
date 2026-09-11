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
        primary: '#113c2c',
        primaryDark: '#0b2c1f',
        accent: '#8ecfa9',
        cream: '#f5f2eb',
        forest: '#113c2c',
        forestDark: '#0b2c1f',
        forestLight: '#1c543e',
        mint: '#8ecfa9',
        mintLight: '#d1f0dd',
        mintDark: '#5eac80',
        canvas: '#f7f9f7',
        surface: '#ffffff',
        surfaceMuted: '#f0f4f1',
        ink: '#17352d',
        inkMuted: '#66736d',
        inkSubtle: '#94a39b',
      }
    },
  },
  plugins: [],
}
