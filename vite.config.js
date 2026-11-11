import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// API «Проценка» работает по HTTP и отдаёт Access-Control-Allow-Origin: *.
// В dev-режиме запросы идут через прокси Vite — это избавляет от проблем с CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/hs/hsprice': {
        target: 'http://api.favorit-parts.ru',
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      '/hs/hsprice': {
        target: 'http://api.favorit-parts.ru',
        changeOrigin: true,
      },
    },
  },
})
