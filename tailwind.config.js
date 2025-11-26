/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#001F5C',
          DEFAULT: '#0038B8',
          light: '#007FFF',
        },
        secondary: {
          light: '#F5F5F5',
          DEFAULT: '#6C757D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
