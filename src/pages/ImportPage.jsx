import React, { useState, useContext, useEffect } from 'react';
import { StudySetContext } from '@/contexts/StudySetContext';
import ImportExportIcon from '@/icons/ImportExportIcon';
import ClipboardControls from '@/components/editor/ClipboardControls';
import FileDropZone from '@/components/common/FileDropZone';

const ImportPage = () => {
  const { handleSaveAsNewSet } = useContext(StudySetContext);

  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [clipboardMessage, setClipboardMessage] = useState({ message: '', type: '' });

  // Staged data for preview/selection before actual import
  const [previewData, setPreviewData] = useState(null);
  const [selectedImportQuizzes, setSelectedImportQuizzes] = useState([]);
  const [selectedImportFlashcards, setSelectedImportFlashcards] = useState([]);

  // Clear selections when preview data changes
  useEffect(() => {
    if (previewData) {
        const quizzes = previewData.data.quiz?.sets ? Object.keys(previewData.data.quiz.sets) : [];
        const flashcards = previewData.data.flashcard?.sets ? Object.keys(previewData.data.flashcard.sets) : [];
        setSelectedImportQuizzes(quizzes);
        setSelectedImportFlashcards(flashcards);
    } else {
        setSelectedImportQuizzes([]);
        setSelectedImportFlashcards([]);
    }
  }, [previewData]);


  // Función para mostrar mensajes del portapapeles
  const showClipboardStatus = (message, type) => {
    setClipboardMessage({ message, type });
    setTimeout(() => setClipboardMessage({ message: '', type: '' }), 3000);
  };

  // Pegar desde portapapeles
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setImportText(text);
        showClipboardStatus('JSON pegado desde el portapapeles', 'success');
      } else {
        showClipboardStatus('No hay contenido en el portapapeles', 'error');
      }
    } catch (error) {
      console.error('Error al pegar:', error);
      showClipboardStatus('Error al leer del portapapeles', 'error');
    }
  };

  // Selection toggles
  const toggleImportQuiz = (setName) => {
    setSelectedImportQuizzes(prev =>
      prev.includes(setName) ? prev.filter(n => n !== setName) : [...prev, setName]
    );
  };

  const toggleImportFlashcard = (setName) => {
    setSelectedImportFlashcards(prev =>
      prev.includes(setName) ? prev.filter(n => n !== setName) : [...prev, setName]
    );
  };

  const selectAllImportQuiz = (select) => {
    if (!previewData?.data?.quiz?.sets) return;
    setSelectedImportQuizzes(select ? Object.keys(previewData.data.quiz.sets) : []);
  };

  const selectAllImportFlashcard = (select) => {
    if (!previewData?.data?.flashcard?.sets) return;
    setSelectedImportFlashcards(select ? Object.keys(previewData.data.flashcard.sets) : []);
  };


  // Validar datos de importación (Parsing)
  const validateAndParse = (data) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (!parsed.data) {
        throw new Error('Formato de datos inválido: falta propiedad "data"');
      }

      const { data: importData } = parsed;
      let hasContent = false;

      if (importData.quiz && importData.quiz.sets && Object.keys(importData.quiz.sets).length > 0) {
        hasContent = true;
      }

      if (importData.flashcard && importData.flashcard.sets && Object.keys(importData.flashcard.sets).length > 0) {
        hasContent = true;
      }

      if (!hasContent) {
        throw new Error('No se encontraron sets válidos para importar en el archivo');
      }

      return parsed;
    } catch (error) {
      throw new Error(`Error al validar datos: ${error.message}`);
    }
  };


  // Load data into preview stage
  const loadForPreview = (textOrData) => {
    try {
        setImportError('');
        const parsed = validateAndParse(textOrData);
        setPreviewData(parsed);
    } catch (error) {
        console.error('Error al cargar datos:', error);
        setImportError(error.message);
    }
  };


  const handleLoadFromText = () => {
    if (!importText.trim()) {
      setImportError('Por favor, pega la configuración a importar');
      return;
    }
    loadForPreview(importText);
  };

  const handleFileSelect = async (file) => {
    try {
        const text = await file.text();
        loadForPreview(text);
    } catch (error) {
        setImportError('Error al leer el archivo');
    }
  };

  // Final Import Execution
  const executeImport = async () => {
    if (!previewData) return;

    const { data } = previewData;
    let importedCount = { quiz: 0, flashcard: 0 };
    
    // Import Selected Quiz Sets
    if (data.quiz && data.quiz.sets) {
      for (const setName of selectedImportQuizzes) {
        const setData = data.quiz.sets[setName];
        if (setData && setName !== 'default') {
          // Check collision logic - handled by adding _imported or keeping distinct names
          // The requirement is to maintain _imported functionality
          // handleSaveAsNewSet likely handles duplicates if we don't handle it here,
          // but let's check if collision handling is needed explicitly or if unique name generation is inside context.
          // Re-reading context: handleSaveAsNewSet(type, newSetName, dataToSave)
          // It calls hook methods. Usually "saveAsNew" implies creation.
          // The previous code did `${setName}_imported`.
          // We should probably attempt to import with the original name first?
          // Wait, the previous code ALWAYS appended `_imported`.
          // "Los sets importados se añadirán con el sufijo "_imported" para evitar sobrescribir..."
          // The user said: "Manten funcional el _imported".
          // So I should keep appending `_imported`? Or maybe check if it exists?
          // If I append `_imported` always, it avoids collision but changes name.
          // Let's stick to the previous logic: explicitly append `_imported`.
          // Actually, if I select specific ones, maybe I want their original names?
          // But to be safe and consistent with "Manten funcional el _imported", I will add the suffix.

          const success = handleSaveAsNewSet('quiz', `${setName}_imported`, setData);
          if (success) {
            importedCount.quiz++;
          } else {
            console.warn(`No se pudo importar el set de quiz: ${setName}`);
          }
        }
      }
    }

    // Import Selected Flashcard Sets
    if (data.flashcard && data.flashcard.sets) {
        for (const setName of selectedImportFlashcards) {
          const setData = data.flashcard.sets[setName];
          if (setData && setName !== 'default') {
            const success = handleSaveAsNewSet('flashcard', `${setName}_imported`, setData);
            if (success) {
              importedCount.flashcard++;
            } else {
              console.warn(`No se pudo importar el set de flashcard: ${setName}`);
            }
          }
        }
    }

    setSuccessMessage(
        `Importación completada: ${importedCount.quiz} sets de quiz y ${importedCount.flashcard} sets de flashcards`
    );
    setPreviewData(null); // Reset preview
    setImportText(''); // Clear text
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const cancelImport = () => {
    setPreviewData(null);
    setImportText('');
    setImportError('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <ImportExportIcon className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Importar Configuración</h1>
              <p className="text-gray-600">Restaura tu configuración de Study Builder</p>
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
          
          {importError && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {importError}
            </div>
          )}

          {!previewData ? (
            /* Initial State: Drop Zone / Text Area */
            <div className="space-y-6">
                <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Importar Configuración</h3>
                <p className="text-gray-600 mb-6">
                    Selecciona un archivo o pega el texto para previsualizar y seleccionar qué importar.
                </p>
                </div>

                {/* Import from Text */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Pegar configuración:
                </label>
                <div className="space-y-3">
                    <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Pega aquí la configuración JSON exportada..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm font-mono text-sm"
                    />

                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                    <ClipboardControls
                        onCopyToClipboard={null}
                        onPasteFromClipboard={handlePasteFromClipboard}
                        clipboardMessage={clipboardMessage}
                        showCopy={false}
                        showPaste={true}
                        pasteLabel="Pegar desde Portapapeles"
                        pasteTitle="Pegar configuración JSON desde el portapapeles"
                        buttonSize="md"
                        variant="secondary"
                    />

                    <button
                        onClick={handleLoadFromText}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 text-sm"
                    >
                        <ImportExportIcon className="w-4 h-4" />
                        Analizar Texto
                    </button>
                    </div>
                </div>
                </div>

                {/* Import from File */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Importar desde archivo:
                </label>
                
                <FileDropZone onFileSelect={handleFileSelect} />
                </div>
            </div>
          ) : (
            /* Preview / Selection State */
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Seleccionar Sets a Importar</h3>
                    <button
                        onClick={cancelImport}
                        className="text-gray-500 hover:text-gray-700 text-sm underline"
                    >
                        Cancelar y volver
                    </button>
                </div>
                <p className="text-gray-600 mb-4">
                    Se han encontrado los siguientes sets. Selecciona cuáles deseas añadir a tu colección.
                </p>

                {/* Quiz Sets Found */}
                {previewData.data.quiz?.sets && Object.keys(previewData.data.quiz.sets).length > 0 && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                <h4 className="font-semibold text-gray-800">
                                    Quiz Sets ({Object.keys(previewData.data.quiz.sets).length})
                                </h4>
                            </div>
                            <div className="space-x-3 text-sm">
                                <button
                                    onClick={() => selectAllImportQuiz(true)}
                                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => selectAllImportQuiz(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    Ninguno
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.keys(previewData.data.quiz.sets).map(setName => (
                                <label key={setName} className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded border border-gray-200 hover:border-indigo-300 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedImportQuizzes.includes(setName)}
                                        onChange={() => toggleImportQuiz(setName)}
                                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                    />
                                    <span className="text-sm text-gray-700 truncate" title={setName}>{setName}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Flashcard Sets Found */}
                {previewData.data.flashcard?.sets && Object.keys(previewData.data.flashcard.sets).length > 0 && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <h4 className="font-semibold text-gray-800">
                                    Flashcard Sets ({Object.keys(previewData.data.flashcard.sets).length})
                                </h4>
                            </div>
                            <div className="space-x-3 text-sm">
                                <button
                                    onClick={() => selectAllImportFlashcard(true)}
                                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => selectAllImportFlashcard(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    Ninguno
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.keys(previewData.data.flashcard.sets).map(setName => (
                                <label key={setName} className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded border border-gray-200 hover:border-indigo-300 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedImportFlashcards.includes(setName)}
                                        onChange={() => toggleImportFlashcard(setName)}
                                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                    />
                                    <span className="text-sm text-gray-700 truncate" title={setName}>{setName}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Confirm Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                    <button
                        onClick={executeImport}
                        disabled={selectedImportQuizzes.length === 0 && selectedImportFlashcards.length === 0}
                        className={`flex-1 inline-flex justify-center items-center gap-2 px-6 py-3 font-medium rounded-lg shadow-sm transition-all duration-200 ${
                            selectedImportQuizzes.length === 0 && selectedImportFlashcards.length === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md transform hover:-translate-y-0.5'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Confirmar e Importar
                    </button>

                    <button
                        onClick={cancelImport}
                        className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>

                 {/* Import Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-amber-800 mb-1">Nota sobre duplicados</h4>
                            <p className="text-sm text-amber-700">
                                Los sets seleccionados se añadirán con el sufijo "_imported" si ya existen, para evitar sobrescribir tus datos actuales.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportPage;
