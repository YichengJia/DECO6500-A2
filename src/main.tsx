import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Entry point for the Vite + React application.  This file is
 * responsible for hydrating the root HTML element with the App
 * component.  It imports the global CSS to ensure Tailwind and other
 * styles are applied before rendering.  The React.StrictMode wrapper
 * helps surface potential problems in development.
 */
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element with id="root" not found.');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
