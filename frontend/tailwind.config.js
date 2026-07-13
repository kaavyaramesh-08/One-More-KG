/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32',
          light: '#4CAF50',
          dark: '#1B5E20'
        },
        accent: {
          DEFAULT: '#FF7043',
          light: '#FF8A65',
          dark: '#F4511E'
        },
        brandbg: '#F7FAF7',
        surface: '#FFFFFF',
        brandtext: {
          primary: '#1B1B1B',
          secondary: '#6B6B6B'
        },
        warning: '#E53935'
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
