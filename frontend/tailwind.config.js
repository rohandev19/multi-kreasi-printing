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
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
    },
  },
  plugins: [],
}
