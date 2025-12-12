import React, { useState, useContext, useCallback, useEffect } from 'react';
import { StudySetContext } from '@/contexts/StudySetContext';
import ImportExportIcon from '@/icons/ImportExportIcon';
import ClipboardControls from '@/components/editor/ClipboardControls';

const ExportPage = () => {
  const {
    quizSets,
    flashcardSets,
    activeQuizSetName,
    activeFlashcardSetName,
    activeQuizData,
    activeFlashcardData
  } = useContext(StudySetContext);

  // Initialize selection with all sets by default
  const [selectedQuizSets, setSelectedQuizSets] = useState([]);
  const [selectedFlashcardSets, setSelectedFlashcardSets] = useState([]);

  const [successMessage, setSuccessMessage] = useState('');
  const [exportError, setExportError] = useState('');
  const [clipboardMessage, setClipboardMessage] = useState({ message: '', type: '' });

  // Initialize selections when sets are loaded
  useEffect(() => {
    if (quizSets) {
      setSelectedQuizSets(Object.keys(quizSets));
    }
  }, [quizSets]);

  useEffect(() => {
    if (flashcardSets) {
      setSelectedFlashcardSets(Object.keys(flashcardSets));
    }
  }, [flashcardSets]);

  // Selection handlers
  const toggleQuizSet = (setName) => {
    setSelectedQuizSets(prev =>
      prev.includes(setName)
        ? prev.filter(n => n !== setName)
        : [...prev, setName]
    );
  };

  const toggleFlashcardSet = (setName) => {
    setSelectedFlashcardSets(prev =>
      prev.includes(setName)
        ? prev.filter(n => n !== setName)
        : [...prev, setName]
    );
  };

  const selectAllQuiz = (select) => {
    setSelectedQuizSets(select ? Object.keys(quizSets) : []);
  };

  const selectAllFlashcard = (select) => {
    setSelectedFlashcardSets(select ? Object.keys(flashcardSets) : []);
  };

  // Generar datos de exportación
  const generateExportData = useCallback(() => {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {}
    };

    // Export Selected Quiz Sets
    if (selectedQuizSets.length > 0) {
      const filteredSets = {};
      selectedQuizSets.forEach(setName => {
        if (quizSets[setName]) {
          filteredSets[setName] = quizSets[setName];
        }
      });

      exportData.data.quiz = {
        sets: filteredSets,
        activeSet: selectedQuizSets.includes(activeQuizSetName) ? activeQuizSetName : null,
        activeData: selectedQuizSets.includes(activeQuizSetName) ? activeQuizData : null
      };
    }

    // Export Selected Flashcard Sets
    if (selectedFlashcardSets.length > 0) {
      const filteredSets = {};
      selectedFlashcardSets.forEach(setName => {
        if (flashcardSets[setName]) {
          filteredSets[setName] = flashcardSets[setName];
        }
      });

      exportData.data.flashcard = {
        sets: filteredSets,
        activeSet: selectedFlashcardSets.includes(activeFlashcardSetName) ? activeFlashcardSetName : null,
        activeData: selectedFlashcardSets.includes(activeFlashcardSetName) ? activeFlashcardData : null
      };
    }

    return exportData;
  }, [selectedQuizSets, selectedFlashcardSets, quizSets, flashcardSets, activeQuizSetName, activeFlashcardSetName, activeQuizData, activeFlashcardData]);

  // Función para mostrar mensajes del portapapeles
  const showClipboardStatus = (message, type) => {
    setClipboardMessage({ message, type });
    setTimeout(() => setClipboardMessage({ message: '', type: '' }), 3000);
  };

  // Copiar al portapapeles
  const handleCopyToClipboard = async () => {
    try {
      if (selectedQuizSets.length === 0 && selectedFlashcardSets.length === 0) {
        setExportError('Debes seleccionar al menos un set para exportar');
        setTimeout(() => setExportError(''), 3000);
        return;
      }
      const data = generateExportData();
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      showClipboardStatus('Configuración copiada al portapapeles', 'success');
      setSuccessMessage('Configuración copiada al portapapeles');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error al copiar:', error);
      showClipboardStatus('Error al copiar al portapapeles', 'error');
      setExportError('Error al copiar al portapapeles');
      setTimeout(() => setExportError(''), 3000);
    }
  };

  // Descargar como archivo JSON
  const handleDownloadJSON = () => {
    try {
      if (selectedQuizSets.length === 0 && selectedFlashcardSets.length === 0) {
        setExportError('Debes seleccionar al menos un set para exportar');
        setTimeout(() => setExportError(''), 3000);
        return;
      }
      const data = generateExportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study-builder-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessMessage('Archivo descargado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error al descargar:', error);
      setExportError('Error al descargar el archivo');
      setTimeout(() => setExportError(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <ImportExportIcon className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Exportar Configuración</h1>
              <p className="text-gray-600">Respalda tu configuración de Study Builder</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
              {successMessage}
            </div>
          )}
          
          {exportError && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {exportError}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Datos a Exportar</h3>
              <p className="text-gray-600 mb-6">
                Elige qué sets deseas incluir en tu archivo de respaldo.
              </p>
            </div>

            {/* Quiz Sets Selection */}
            {quizSets && Object.keys(quizSets).length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <h4 className="font-semibold text-gray-800">Quiz Sets ({Object.keys(quizSets).length})</h4>
                  </div>
                  <div className="space-x-3 text-sm">
                    <button
                      onClick={() => selectAllQuiz(true)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => selectAllQuiz(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Ninguno
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.keys(quizSets).map(setName => (
                    <label key={setName} className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded border border-gray-200 hover:border-indigo-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedQuizSets.includes(setName)}
                        onChange={() => toggleQuizSet(setName)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="text-sm text-gray-700 truncate" title={setName}>{setName}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Flashcard Sets Selection */}
            {flashcardSets && Object.keys(flashcardSets).length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h4 className="font-semibold text-gray-800">Flashcard Sets ({Object.keys(flashcardSets).length})</h4>
                  </div>
                  <div className="space-x-3 text-sm">
                    <button
                      onClick={() => selectAllFlashcard(true)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => selectAllFlashcard(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Ninguno
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.keys(flashcardSets).map(setName => (
                    <label key={setName} className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded border border-gray-200 hover:border-indigo-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedFlashcardSets.includes(setName)}
                        onChange={() => toggleFlashcardSet(setName)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="text-sm text-gray-700 truncate" title={setName}>{setName}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Export Actions */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-end">
                {/* Clipboard Controls */}
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Acciones rápidas:
                  </label>
                  <ClipboardControls
                    onCopyToClipboard={handleCopyToClipboard}
                    onPasteFromClipboard={null}
                    clipboardMessage={clipboardMessage}
                    showCopy={true}
                    showPaste={false}
                    copyLabel="Copiar al Portapapeles"
                    copyTitle="Copiar configuración exportada al portapapeles"
                    buttonSize="md"
                    variant="primary"
                    disabled={selectedQuizSets.length === 0 && selectedFlashcardSets.length === 0}
                  />
                </div>

                {/* Download Button */}
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guardar archivo:
                  </label>
                  <button
                    onClick={handleDownloadJSON}
                    disabled={selectedQuizSets.length === 0 && selectedFlashcardSets.length === 0}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-lg shadow-sm transition-all duration-200 ${
                      selectedQuizSets.length === 0 && selectedFlashcardSets.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md transform hover:-translate-y-0.5'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Descargar JSON
                  </button>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-4 text-sm text-gray-500 text-center">
              Seleccionados: {selectedQuizSets.length} Quiz, {selectedFlashcardSets.length} Flashcards
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
