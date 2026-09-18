/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
          950: '#031726',
        },
        navy: {
          800: '#141E33',
          900: '#0E1726',
          950: '#080E1A',
        },
        risk: {
          standard: '#10B981',
          caution: '#F59E0B',
          unfavorable: '#EF4444',
          critical: '#DC2626',
        }
      },
    },
  },
  plugins: [],
}
