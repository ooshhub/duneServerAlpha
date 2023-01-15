/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/interface/index.html",
    "./src/interface/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deadspace': '#12033b',
        'main-bg': '#12235b',
        'main-border': '#22336b', 
        'module-bg': '#102150',
        'module-border': '#111d44',
        'button-bg': '#4366d8',
        'button-border': '#6cddff',
        'button-text': '#5fe45f',
        'button-text-disabled': 'rgb(15 23 42)',
        'button-text-active': '#a2eea2',
        'input-bg': '#080130',
        'input-text': 'whitesmoke',
        'console-text': '#06e206',
        'console-border': '#02a002',
        'console-separator': '#024102',
      },
    },
  },
  plugins: [],
}