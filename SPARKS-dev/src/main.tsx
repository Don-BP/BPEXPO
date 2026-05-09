import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';

// Import global styles if needed, or rely on modules to load them.
// For tailwind, we might want to ensure it's loaded globally.
// Assuming PlannerApp loads it for now.

const container = document.getElementById('root');
const root = createRoot(container!);

// FORCE UNREGISTER ANY SERVICE WORKERS
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
            console.log('Unregistering SW:', registration);
            registration.unregister();
        }
    });
}

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);