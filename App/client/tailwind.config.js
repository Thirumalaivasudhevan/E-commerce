/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#121212', // Slightly lighter than bg
        'surface-highlight': '#262626', // Cards
        border: '#363636',
        primary: '#0095F6', // Insta Blue
        'primary-hover': '#0088E6',
        text: {
          main: '#F5F5F5',
          muted: '#A8A8A8'
        },
        success: '#00BA7C',
        error: '#ED4956'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 12px 0 rgba(0,0,0,0.5)',
        'glow': '0 0 20px rgba(0, 149, 246, 0.15)',
      }
    },
  },
  plugins: [],
}
