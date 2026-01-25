import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import QuizView from '@/features/quiz/views/QuizView';
import EditorPage from '@/pages/EditorPage';
import ImportPage from '@/pages/ImportPage';
import ExportPage from '@/pages/ExportPage';
import HelpView from '@/features/help/views/HelpView';
import FlashcardView from '@/features/flashcards/views/FlashcardView';

/**
 * Configuración declarativa de rutas de la aplicación
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta por defecto - redirige a quiz */}
      <Route path="/" element={<Navigate to="/quiz" replace />} />
      
      {/* Ruta para Quiz */}
      <Route path="/quiz" element={<QuizView />} />
      
      {/* Ruta para Flashcards */}
      <Route path="/flashcards" element={<FlashcardView />} />
      
      {/* Ruta para Editor */}
      <Route path="/editor" element={<EditorPage />} />
      
      {/* Ruta para Importar */}
      <Route path="/import" element={<ImportPage />} />
      
      {/* Ruta para Exportar */}
      <Route path="/export" element={<ExportPage />} />
      
      {/* Ruta para Ayuda */}
      <Route path="/help" element={<HelpView />} />
      
      {/* Ruta de fallback - redirige a quiz si no se encuentra la ruta */}
      <Route path="*" element={<Navigate to="/quiz" replace />} />
    </Routes>
  );
};

export default AppRoutes;
