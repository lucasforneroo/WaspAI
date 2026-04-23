'use client';

import { useEffect } from 'react';

export default function PWARegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('WaspAI SW registered:', registration.scope);
        })
        .catch((err) => {
          console.error('WaspAI SW registration failed:', err);
        });
    }
  }, []);

  return null;
}
