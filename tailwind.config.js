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
        shake: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(5px, -5px)" },
          "50%": { transform: "translate(-5px, 5px)" },
          "75%": { transform: "translate(5px, 5px)" },
        },
        "crit-shake": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(12px, -12px) scale(1.1)" },
          "50%": { transform: "translate(-12px, 12px) scale(1.1)" },
          "75%": { transform: "translate(12px, 12px) scale(1.1)" },
        },
        "suck-in": {
          "0%": {
            transform: "scale(1) rotate(0deg)",
            opacity: "1",
            filter: "brightness(1)",
          },
          "100%": {
            transform: "scale(0) rotate(720deg)",
            opacity: "0",
            filter: "brightness(3)",
          },
        },
      },
      animation: {
        "float-up": "float-up 1s ease-out forwards",
        shake: "shake 0.2s ease-in-out",
        "crit-shake": "crit-shake 0.15s ease-in-out",
        "suck-in": "suck-in 0.8s ease-in forwards",
      },
    },
  },
  plugins: [],
};
