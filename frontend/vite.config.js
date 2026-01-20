import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,        // listen on all network interfaces (required for Docker)
    port: 5173,
    watch: {
      // use polling for watching if needed, slower but more reliable inside Docker
      usePolling: true,
      interval: 100, // ms
    },
    proxy: {
      // Proxy API requests starting with /grafana-proxy to backend
      '/grafana-proxy': {
        target: 'http://backend:3000',
        changeOrigin: true,
      },
      // Proxy any /grafana requests to backend (localhost:3000)
      '/grafana': {
        target: 'http://backend:3000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy any /auth requests to backend (localhost:3000)
      '/auth': {
        target: 'http://backend:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})