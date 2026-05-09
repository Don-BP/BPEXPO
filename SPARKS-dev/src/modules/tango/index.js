// ========= START: src/index.js - IGNORE BENIGN ERRORS =========
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// --- ERROR SUPPRESSION START ---
// This suppresses the benign "ResizeObserver loop" error overlay in development.
// It does not affect the actual application logic, just hides the annoying red box.
const originalError = console.error;
console.error = (...args) => {
  if (/ResizeObserver loop/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};

window.addEventListener('error', (e) => {
  if (e.message === 'ResizeObserver loop limit exceeded' || e.message === 'ResizeObserver loop completed with undelivered notifications.') {
    const resizeObserverErrDiv = document.getElementById(
      'webpack-dev-server-client-overlay-div'
    );
    const resizeObserverErrStyle = document.getElementById(
      'webpack-dev-server-client-overlay'
    );
    if (resizeObserverErrDiv) resizeObserverErrDiv.setAttribute('style', 'display: none');
    if (resizeObserverErrStyle) resizeObserverErrStyle.setAttribute('style', 'display: none');
  }
});
// --- ERROR SUPPRESSION END ---

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
// ========= END: src/index.js - IGNORE BENIGN ERRORS =========