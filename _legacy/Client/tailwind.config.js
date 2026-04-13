/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wasp: {
          purple: '#150e16ff',        // Color Principal (Fondo)
          'purple-light': '#633869', // Matiz claro para casillas
          'purple-dark': '#231824ff',  // Matiz oscuro para sidebar
          yellow: '#f5ff88ff',        // Color Secundario (Bordes/Accentos)
        }
      }
    },
  },
  plugins: [],
}
