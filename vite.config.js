import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'MedTrack — Medication Monitoring',
        short_name: 'MedTrack',
        description: 'Track medications and doses for yourself or someone you care for.',
        theme_color: '#1B4B43',
        background_color: '#F7F5F0',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // MVP: cache the app shell only. No background sync / push yet —
        // that lands when we build the notifications feature.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallbackDenylist: [/^\/\.netlify\/functions\//]
      }
    })
  ],
  server: {
    host: true, // listen on the LAN too, so it's reachable from a phone on the same wifi
    proxy: {
      // Lets `vite dev` talk to `netlify dev`'s functions server when both are running.
      '/.netlify/functions': 'http://localhost:9999'
    }
  }
})
