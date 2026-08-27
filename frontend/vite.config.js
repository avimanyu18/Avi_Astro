import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            disable: true,
            manifest: {
                name: 'Vedic Astrology Chatbot',
                short_name: 'AstroChat',
                description: 'Vedic astrology chart interpretation with classical computed facts.',
                theme_color: '#1f2937',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/',
                icons: [
                    {
                        src: 'pwa-192x192.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml'
                    },
                    {
                        src: 'pwa-512x512.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml'
                    }
                ]
            },
            registerType: 'autoUpdate',
            workbox: {
                cleanupOutdatedCaches: true,
                sourcemap: true
            }
        })
    ]
})
