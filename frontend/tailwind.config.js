/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', '"Work Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"SF Mono"', 'Consolas', 'monospace'],
      },
      zIndex: {
        1: '1',
        5: '5',
      },
      borderRadius: {
        '2xs': '0.125rem', // 2px
        xs: '0.1875rem',  // 3px
        sm: '0.25rem',    // 4px
        md: '0.375rem',   // 6px
        lg: '0.5rem',     // 8px
        xl: '0.75rem',    // 12px
        '2xl': '1rem',    // 16px
        '3xl': '1.5rem',  // 24px
        '4xl': '2rem',    // 32px
        full: '9999px',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        xs: '0 1px 2px 0 rgba(15, 23, 42, 0.05), 0 1px 3px 0 rgba(15, 23, 42, 0.03)',
        sm: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        md: '0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        lg: '0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.03)',
        xl: '0 20px 25px -5px rgba(15, 23, 42, 0.06), 0 8px 10px -6px rgba(15, 23, 42, 0.03)',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.16, 1, 0.3, 1)',
        decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
      },
      colors: {
        paper: {
          DEFAULT: '#f3f0e8',
          edge: '#e3ddcf',
        },
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
          500: '#1e293b',
          600: '#0f172a',
          700: '#090d16',
          800: '#06090e',
          900: '#030508',
          950: '#020305',
        },
        accent: {
          50: '#fdeaf3',
          100: '#fbd3e6',
          500: '#e6007e',
          600: '#b8005f',
          700: '#8f004a',
        },
      },
    },
  },
  plugins: [],
}
