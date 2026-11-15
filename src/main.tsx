import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Offline support. The in-app update prompt comes in Phase 4.
try {
  registerSW({ immediate: true });
} catch (err) {
  console.error('PWA registration failed (non-fatal):', err);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
