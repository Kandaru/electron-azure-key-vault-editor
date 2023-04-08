/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{svelte, css}"],
    darkMode: 'class',
    theme: {
      extend: {},
    },
    plugins: [require('tailwind-scrollbar')],
  }