import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "My React App",
        short_name: "ReactApp",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    headers: {
      "Service-Worker-Allowed": "/",
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html",
        "firebase-messaging-sw": "./public/firebase-messaging-sw.js",
      },
    },
  },
});
