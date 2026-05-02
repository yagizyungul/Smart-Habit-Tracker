/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          cream: '#E3DBA9',
          sage: '#639D75',
          forest: '#0B735F',
          ink: '#384166',
          neon: '#0CDC2A',
        },
      },
    },
  },
  plugins: [],
}
