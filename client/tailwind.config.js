/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#1D9E75',
          purple: '#534AB7',
          'purple-soft': '#7F77DD',
        },
      },
    },
  },
  plugins: [],
}
