import React, { useState, useContext } from 'react';
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

  // Validar y procesar datos de importación
  const validateImportData = (data) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (!parsed.data) {
        throw new Error('Formato de datos inválido: falta propiedad "data"');
      }

      // Validar estructura de datos
      const { data: importData } = parsed;
      let validSets = { quiz: 0, flashcard: 0 };

      if (importData.quiz && importData.quiz.sets) {
        validSets.quiz = Object.keys(importData.quiz.sets).length;
      }

      if (importData.flashcard && importData.flashcard.sets) {
        validSets.flashcard = Object.keys(importData.flashcard.sets).length;
      }

      if (validSets.quiz === 0 && validSets.flashcard === 0) {
        throw new Error('No se encontraron sets válidos para importar');
      }

      return { parsed, validSets };
    } catch (error) {
      throw new Error(`Error al validar datos: ${error.message}`);
    }
  };

  // Procesar datos importados
  const processImportData = async (importData) => {
    const { data } = importData;
    let imported = { quiz: 0, flashcard: 0 };
    
    // Importar datos de quiz
    if (data.quiz && data.quiz.sets) {
      for (const [setName, setData] of Object.entries(data.quiz.sets)) {
        if (setName !== 'default') { // No sobrescribir el set por defecto
          const success = handleSaveAsNewSet('quiz', `${setName}_imported`, setData);
          if (success) {
            imported.quiz++;
          } else {
            console.warn(`No se pudo importar el set de quiz: ${setName}`);
          }
        }
      }
    }

    // Importar datos de flashcard
    if (data.flashcard && data.flashcard.sets) {
      for (const [setName, setData] of Object.entries(data.flashcard.sets)) {
        if (setName !== 'default') { // No sobrescribir el set por defecto
          const success = handleSaveAsNewSet('flashcard', `${setName}_imported`, setData);
          if (success) {
            imported.flashcard++;
          } else {
            console.warn(`No se pudo importar el set de flashcard: ${setName}`);
          }
        }
      }
    }

    return { imported };
  };

  // Importar desde texto
  const handleImportFromText = async () => {
    if (!importText.trim()) {
      setImportError('Por favor, pega la configuración a importar');
      return;
    }

    try {
      setImportError('');
      const { parsed, validSets } = validateImportData(importText);
      const { imported } = await processImportData(parsed);
      setImportText('');
      setSuccessMessage(
        `Configuración importada exitosamente: ${imported.quiz} sets de quiz y ${imported.flashcard} sets de flashcards`
      );
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error al importar:', error);
      setImportError(error.message);
    }
  };

  // Procesar archivo
  const processFile = async (file) => {
    try {
      setImportError('');
      const text = await file.text();
      const { parsed, validSets } = validateImportData(text);
      const { imported } = await processImportData(parsed);
      setSuccessMessage(
        `Archivo importado exitosamente: ${imported.quiz} sets de quiz y ${imported.flashcard} sets de flashcards`
      );
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error al procesar archivo:', error);
      setImportError(error.message);
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

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Importar Configuración</h3>
              <p className="text-gray-600 mb-6">
                Importa una configuración previamente exportada desde texto o archivo.
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
                
                {/* Clipboard Controls and Import Button */}
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <ClipboardControls
                    onCopyToClipboard={null} // No mostrar copy en import
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
                    onClick={handleImportFromText}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 text-sm"
                  >
                    <ImportExportIcon className="w-4 h-4" />
                    Importar desde Texto
                  </button>
                </div>
              </div>
            </div>

            {/* Import from File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Importar desde archivo:
              </label>
              
              <FileDropZone onFileSelect={processFile} />
            </div>

            {/* Import Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-amber-800 mb-1">Importante</h4>
                  <p className="text-sm text-amber-700">
                    Los sets importados se añadirán con el sufijo "_imported" para evitar sobrescribir tus datos existentes.
                    Puedes renombrarlos después desde el Editor de Sets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPage;
