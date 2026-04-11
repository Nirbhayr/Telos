/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        osint: {
          bg: '#050505',
          panel: '#0a0a0a',
          border: '#1f2937'
        }
      }
    },
  },
  plugins: [],
}