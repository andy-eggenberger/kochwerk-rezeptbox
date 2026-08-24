import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/kochwerk-rezeptbox/',

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'Kochwerk – meine Rezeptbox',
        short_name: 'Kochwerk',
        description: 'Moderne Rezeptverwaltung als Web-App',

        theme_color: '#ffffff',
        background_color: '#ffffff',

        display: 'standalone',

        start_url: '/kochwerk-rezeptbox/',

        icons: [
          {
            src: '/kochwerk-rezeptbox/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/kochwerk-rezeptbox/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})