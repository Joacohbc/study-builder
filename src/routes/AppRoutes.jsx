import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import QuizTab from '../tabs/QuizTab';
import EditorPage from '../pages/EditorPage';
import HelpTab from '../tabs/HelpTab';
import FlashcardTab from '../tabs/FlashcardTab';

/**
 * Configuración declarativa de rutas de la aplicación
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta por defecto - redirige a quiz */}
      <Route path="/" element={<Navigate to="/quiz" replace />} />
      
      {/* Ruta para Quiz */}
      <Route path="/quiz" element={<QuizTab />} />
      
      {/* Ruta para Flashcards */}
      <Route path="/flashcards" element={<FlashcardTab />} />
      
      {/* Ruta para Editor */}
      <Route path="/editor" element={<EditorPage />} />
      
      {/* Ruta para Ayuda */}
      <Route path="/help" element={<HelpTab />} />
      
      {/* Ruta de fallback - redirige a quiz si no se encuentra la ruta */}
      <Route path="*" element={<Navigate to="/quiz" replace />} />
    </Routes>
  );
};

export default AppRoutes;
