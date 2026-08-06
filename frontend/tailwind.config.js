/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        linen: 'rgb(var(--color-linen) / <alpha-value>)',
        fawn: 'rgb(var(--color-fawn) / <alpha-value>)',
        bronze: 'rgb(var(--color-bronze) / <alpha-value>)',
        gold: 'rgb(var(--color-gold) / <alpha-value>)',
        goldlight: 'rgb(var(--color-goldlight) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Lato', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
