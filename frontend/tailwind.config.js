/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Montserrat"', 'sans-serif'],
        montserrat: ['"Montserrat"', 'sans-serif'],
      },
      colors: {
        brand: {
          green: '#00FB00',
          'green-hover': '#00DB00',
          'green-dark': '#006400',
          navy: '#101625',
          slate: '#2C394C',
          ice: '#EFF3F8',
          surface: '#1E2538',
        },
        primary: {
          DEFAULT: '#00FB00',
          hover: '#00DB00',
          dark: '#006400',
        },
        dark: {
          DEFAULT: '#101625',
          surface: '#202635',
        },
        ebenezer: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      borderRadius: {
        'pill': '300px',
        '20': '20px',
        '30': '30px',
      }
    },
  },
  plugins: [],
};
