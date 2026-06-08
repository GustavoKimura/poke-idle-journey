export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pokeRed: "#EE1515",
        pokeDarkBlue: "#2A3A59",
        pokeYellow: "#FFDE00",
      },
      keyframes: {
        "float-up": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-100px) scale(1.5)", opacity: "0" },
        },
      },
      animation: {
        "float-up": "float-up 1s ease-out forwards",
      },
    },
  },
  plugins: [],
};
