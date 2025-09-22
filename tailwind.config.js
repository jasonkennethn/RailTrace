/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#1773cf",
        "background-light": "#f6f7f8",
        "background-dark": "#111921",
        "card-light": "#ffffff",
        "card-dark": "#1a2530",
        "surface-light": "#ffffff",
        "surface-dark": "#1b252e",
        "content-light": "#111418",
        "content-dark": "#e3e8ed",
        "foreground-light": "#111418",
        "foreground-dark": "#f6f7f8",
        "subtle-light": "#637588",
        "subtle-dark": "#9ba7b6",
        "border-light": "#dce0e5",
        "border-dark": "#323d49",
        "success-light": "#0e9f6e",
        "success-dark": "#31c48d",
        "critical-light": "#f05252",
        "critical-dark": "#ff7878",
        "danger-light": "#e73908",
        "danger-dark": "#f87171",
      },
      fontFamily: {
        "display": ["Public Sans", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
};
