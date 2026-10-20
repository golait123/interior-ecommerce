import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import '@flaticon/flaticon-uicons/css/bold/rounded.css';
import '@flaticon/flaticon-uicons/css/brands/all.css';
import './style.css';

// Manage Service Worker registration based on environment:
// In DEV: aggressively unregister any existing service worker and clear caches to avoid stale assets or blank screens!
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          console.log('[InteriorG Dev] Unregistered stale service worker');
        });
      }
    });

    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
        }
      });
    }
  } else {
    // In Production: register PWA service worker
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[InteriorG PWA] Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[InteriorG PWA] Service Worker registration failed:', err);
        });
    });
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  console.error('[InteriorG] Failed to find root element');
}
