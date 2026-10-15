import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/customers': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : null),
      },
      '/products': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : null),
      },
      '/wishlist': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : null),
      },
    },
  },
});
