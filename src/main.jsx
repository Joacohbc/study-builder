import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n/i18n'; // Import i18n configuration
import { StudySetProvider } from './contexts/StudySetContext'; // Import the provider
import { ConfirmationModalProvider } from './contexts/ConfirmationModalContext'; // Import the modal provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StudySetProvider> {/* Wrap App with the provider */}
      <ConfirmationModalProvider> {/* Wrap App with the modal provider */}
        <App />
      </ConfirmationModalProvider>
    </StudySetProvider>
  </React.StrictMode>
);
