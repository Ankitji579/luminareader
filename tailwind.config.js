/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sepia: {
          50: '#fbf0d9',
          100: '#f7e5be',
          800: '#5c4523',
          900: '#433422',
        }
      }
    },
  },
  plugins: [],
}
