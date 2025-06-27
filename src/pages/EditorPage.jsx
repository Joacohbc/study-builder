import React from 'react';
import { useStudySets } from '@/contexts/useStudySets';
import EditorTab from '@/tabs/EditorTab';
import QuizIcon from '@/icons/QuizIcon';
import CardIcon from '@/icons/CardIcon';

/**
 * Página del Editor con selector de tipo de contenido
 */
const EditorPage = () => {
  const { editorContentType, setEditorContentType } = useStudySets();

  return (
    <div className="animate-fade-in">
      {/* Radio buttons to select editor type - Styled */}
      <div className="mb-6 flex flex-wrap items-center gap-6 bg-gray-50 p-4 rounded-lg shadow-inner">
        <span className="font-medium text-gray-700">Editar tipo de set:</span>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-md shadow-sm hover:shadow transition-shadow duration-200">
            <input
              type="radio"
              name="editorType"
              value="quiz"
              checked={editorContentType === 'quiz'}
              onChange={() => setEditorContentType('quiz')}
              className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
            />
            <span className="flex items-center gap-1">
              <QuizIcon className="w-5 h-5" />
              <span>Cuestionarios</span>
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-md shadow-sm hover:shadow transition-shadow duration-200">
            <input
              type="radio"
              name="editorType"
              value="flashcard"
              checked={editorContentType === 'flashcard'}
              onChange={() => setEditorContentType('flashcard')}
              className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
            />
            <span className="flex items-center gap-1">
              <CardIcon className="w-5 h-5" />
              <span>Flashcards</span>
            </span>
          </label>
        </div>
      </div>
      <EditorTab />
    </div>
  );
};

export default EditorPage;
