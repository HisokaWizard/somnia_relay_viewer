import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@/app/App';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    (
      <React.StrictMode>
        <App />
      </React.StrictMode>
    ) as React.ReactNode
  );
} else {
  throw new Error('Root element not found');
}
