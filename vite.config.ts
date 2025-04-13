import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your API server port
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:5000', // Your WebSocket server port
        ws: true,
      },
      '/openai': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
