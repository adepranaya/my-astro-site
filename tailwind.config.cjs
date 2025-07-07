const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#02474F',
        secondary: '#4EA5D9',
        darkGray: '#212223',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
