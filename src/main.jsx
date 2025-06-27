import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { StudySetProvider } from '@/contexts/StudySetContext'; // Import the provider
import { ConfirmationModalProvider } from '@/contexts/ConfirmationModalContext'; // Import the modal provider

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StudySetProvider> {/* Wrap App with the provider */}
      <ConfirmationModalProvider> {/* Wrap App with the modal provider */}
        <App />
      </ConfirmationModalProvider>
    </StudySetProvider>
  </React.StrictMode>
);
