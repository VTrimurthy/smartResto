/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        body: ["Plus Jakarta Sans", "Manrope", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#fff8f1",
          100: "#ffeedb",
          200: "#ffd7b0",
          300: "#ffba7a",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        leaf: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        onyx: {
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        moss: {
          500: "#16a34a",
          600: "#15803d",
        },
        bistro: {
          500: "#ea580c",
          600: "#c2410c",
        },
      },
      boxShadow: {
        soft: "0 24px 70px rgba(234, 88, 12, 0.12)",
        glow: "0 0 35px rgba(249, 115, 22, 0.25)",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(249, 115, 22, 0.18), transparent 28%), radial-gradient(circle at top right, rgba(34, 197, 94, 0.08), transparent 22%), radial-gradient(circle at bottom, rgba(234, 88, 12, 0.10), transparent 28%)",
      },
    },
  },
  plugins: [],
};
