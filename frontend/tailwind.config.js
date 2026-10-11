/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'Work Sans', 'Inter', 'sans-serif'],
      },
      zIndex: {
        1: '1',
        5: '5',
      },
      colors: {
        neutral: {
          50: '#fafbfc',
          100: '#f4f6f8',
          200: '#e5e9ed',
          300: '#d1d7de',
          400: '#a3aeba',
          500: '#7b8794',
          600: '#5a6775',
          700: '#424c58',
          800: '#2f3842',
          900: '#1e2329',
          950: '#0f1419',
        },
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#000000',
          600: '#000000',
          700: '#000000',
          800: '#000000',
          900: '#000000',
          950: '#000000',
        },
      },
    },
  },
  plugins: [],
}
