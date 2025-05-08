import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { StudySetProvider } from './contexts/StudySetContext'; // Import the provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StudySetProvider> {/* Wrap App with the provider */}
      <App />
    </StudySetProvider>
  </React.StrictMode>
);
