import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "PokeIdle: Infinite Journey",
        short_name: "PokeIdle",
        description:
          "An incremental idle game where you catch Pokémon, hire trainers, and climb to the top.",
        theme_color: "#2A3A59",
        background_color: "#2A3A59",
        display: "standalone",
        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
