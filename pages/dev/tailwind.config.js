/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./main/**/*.{svelte, css}",
      "./create/**/*.{svelte, css}"
    ],
    darkMode: 'class',
    theme: {
      extend: {},
    },
    plugins: [require('tailwind-scrollbar')],
  }