import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { registerSW } from 'virtual:pwa-register';
import './index.css';

// Global fetch wrapper to automatically inject CSRF token
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };
  
  const csrfToken = getCookie('csrf-token');
  const isMutating = init && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(init.method || '');
  
  if (csrfToken && isMutating) {
    const headers = init.headers || {};
    if (headers instanceof Headers) {
      headers.set('X-CSRF-Token', csrfToken);
    } else if (Array.isArray(headers)) {
      headers.push(['X-CSRF-Token', csrfToken]);
    } else {
      const headerRecord = headers as Record<string, string>;
      headerRecord['X-CSRF-Token'] = csrfToken;
      init.headers = headerRecord;
    }
  }
  return originalFetch(input, init);
};

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
