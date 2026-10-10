/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        emergency: {
          red: '#EF4444',
          amber: '#F59E0B',
          green: '#10B981',
          blue: '#0EA5E9',
          dark: '#0B132B',
          card: '#1C2541',
        }
      }
    },
  },
  plugins: [],
}
