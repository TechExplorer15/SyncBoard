import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
    hmr: {
      clientPort: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://server:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://server:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
