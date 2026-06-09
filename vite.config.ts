import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/poke-idle-journey/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "logo.png"],
      manifest: {
        name: "PokeIdle - Master of Clicks",
        short_name: "PokeIdle",
        description:
          "An incremental idle game where you catch Pokémon, hire trainers, and climb to the top.",
        theme_color: "#2A3A59",
        background_color: "#2A3A59",
        display: "standalone",
        icons: [
          {
            src: "/poke-idle-journey/logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
