/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#011C60",
        secondaryText: "#808DAF",
        background: "#E6E8EF",
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
      },
      boxShadow: {
        authBtn: "4px 8px 12px 0px #171A1E40",
      },
    },
  },
  plugins: [],
};