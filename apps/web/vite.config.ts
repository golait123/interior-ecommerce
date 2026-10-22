import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiProxyTarget = process.env.API_PROXY_TARGET || process.env.VITE_API_PROXY_TARGET || (process.env.NODE_ENV === 'production' ? 'http://api:4000' : 'http://localhost:4000');

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'stale-lawyer-studio-cleanup',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = decodeURIComponent(req.url || '');
          if (url.includes('Lawyer Studio') || url.includes('/packages/protocol') || url.includes('/packages/crypto')) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/javascript');
            res.end('console.warn("[InteriorG] Stale session module intercepted. Purging and reloading..."); if ("caches" in window) caches.keys().then(keys => keys.forEach(k => caches.delete(k))); localStorage.clear(); window.location.href = "/";');
            return;
          }
          next();
        });
      },
    },
  ],
  server: {
    host: true,
    port: 5173,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
      '/uploads': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
      '/uploads': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
});
