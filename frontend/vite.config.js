import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Force la mise à jour automatique
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Gestion Devis',
        short_name: 'Devis',
        description: 'Application de gestion des devis et BAT',
        theme_color: '#111827',
        background_color: '#f3f4f6',
        display: 'standalone', // Mode application native
        orientation: 'portrait', // Bloque le mode paysage (force le format téléphone)
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})