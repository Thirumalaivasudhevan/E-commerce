/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Emerald Palette
        primary: {
          DEFAULT: "#EF4444", // Bright Red 500
          hover: "#DC2626",   // Red 600
          active: "#B91C1C",  // Red 700
          light: "#FEF2F2",   // Red 50
          dark: "#991B1B",    // Red 800 (for Sidebar)
          darker: "#7F1D1D",  // Red 900 (for Sidebar border/accents)
        },
        secondary: "#3B82F6", // Blue (for info/secondary actions)
        danger: "#EF4444",    // Red
        
        // Neutral / Surface
        background: "#F9FAFB", // Gray 50 (Very clean light gray)
        surface: "#FFFFFF",
        
        // Text
        "text-main": "#111827", // Gray 900
        "text-muted": "#6B7280", // Gray 500
        
        // Dark Mode Placeholders (if needed later)
        "dark-body": "#111827",
        "dark-card": "#1F2937"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Professional font
      }
    },
  },
  plugins: [],
}
