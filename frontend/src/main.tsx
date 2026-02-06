import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('✓ Service Worker registered');
        
        // Check for updates periodically
        setInterval(() => {
          reg.update();
        }, 60000);
      })
      .catch((err) => {
        console.log('Service Worker registration failed:', err);
      });
  });
}

// Handle beforeinstallprompt to show install button/notification
let deferredPrompt: Event | null = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('✓ PWA install prompt is ready');
  
  // Emit custom event so components can listen for install availability
  window.dispatchEvent(new CustomEvent('pwa-installable'));
});

window.addEventListener('appinstalled', () => {
  console.log('✓ PWA was installed');
  deferredPrompt = null;
  window.dispatchEvent(new CustomEvent('pwa-installed'));
});

// Make deferredPrompt globally accessible for manual install trigger
(window as any).triggerPWAInstall = async () => {
  if (!deferredPrompt) {
    console.log('PWA install prompt not available');
    return false;
  }
  
  (deferredPrompt as any).prompt();
  const { outcome } = await (deferredPrompt as any).userChoice;
  console.log(`User response to the install prompt: ${outcome}`);
  deferredPrompt = null;
  return true;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
