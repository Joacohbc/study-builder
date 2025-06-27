import React, { useState, useContext, useCallback } from 'react';
import { StudySetContext } from '../contexts/StudySetContext';
import CopyIcon from '../icons/CopyIcon';
import PasteIcon from '../icons/PasteIcon';
import ImportExportIcon from '../icons/ImportExportIcon';

const ImportExportPage = () => {
  const {
    quizSets,
    flashcardSets,
    activeQuizSetName,
    activeFlashcardSetName,
    activeQuizData,
    activeFlashcardData,
    handleSaveAsNewSet
  } = useContext(StudySetContext);

  const [activeTab, setActiveTab] = useState('export');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [exportFormat, setExportFormat] = useState('all'); // 'all', 'quiz', 'flashcard'
  const [successMessage, setSuccessMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Generar datos de exportación
  const generateExportData = useCallback(() => {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {}
    };

    if (exportFormat === 'all' || exportFormat === 'quiz') {
      exportData.data.quiz = {
        sets: quizSets,
        activeSet: activeQuizSetName,
        activeData: activeQuizData
      };
    }

    if (exportFormat === 'all' || exportFormat === 'flashcard') {
      exportData.data.flashcard = {
        sets: flashcardSets,
        activeSet: activeFlashcardSetName,
        activeData: activeFlashcardData
      };
    }

    return exportData;
  }, [exportFormat, quizSets, flashcardSets, activeQuizSetName, activeFlashcardSetName, activeQuizData, activeFlashcardData]);

  // Copiar al portapapeles
  const handleCopyToClipboard = async () => {
    try {
      const data = generateExportData();
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setSuccessMessage('Configuración copiada al portapapeles');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error al copiar:', error);
      setImportError('Error al copiar al portapapeles');
      setTimeout(() => setImportError(''), 3000);
    }
  };

  // Descargar como archivo JSON
  const handleDownloadJSON = () => {
    try {
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
      setImportError('Error al descargar el archivo');
      setTimeout(() => setImportError(''), 3000);
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

  // Manejar archivos arrastrados
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => file.type === 'application/json' || file.name.endsWith('.json'));
    
    if (jsonFile) {
      await processFile(jsonFile);
    } else {
      setImportError('Por favor, arrastra un archivo JSON válido');
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await processFile(file);
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
              <h1 className="text-2xl font-bold text-gray-900">Importar / Exportar</h1>
              <p className="text-gray-600">Respalda o restaura tu configuración de Study Builder</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'export'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Exportar Configuración
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'import'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Importar Configuración
          </button>
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

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportar Configuración</h3>
                <p className="text-gray-600 mb-6">
                  Selecciona qué datos quieres exportar y elige el método de exportación.
                </p>
              </div>

              {/* Export Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Datos a exportar:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="all"
                      checked={exportFormat === 'all'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="mr-2"
                    />
                    <span>Todo (Quiz y Flashcards)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="quiz"
                      checked={exportFormat === 'quiz'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="mr-2"
                    />
                    <span>Solo Quiz</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="flashcard"
                      checked={exportFormat === 'flashcard'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="mr-2"
                    />
                    <span>Solo Flashcards</span>
                  </label>
                </div>
              </div>

              {/* Export Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleCopyToClipboard}
                  className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <CopyIcon className="w-5 h-5 mr-2" />
                  Copiar al Portapapeles
                </button>
                
                <button
                  onClick={handleDownloadJSON}
                  className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar JSON
                </button>
              </div>

              {/* Preview */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Vista previa de datos a exportar:</h4>
                <div className="bg-gray-50 border rounded-md p-4">
                  {exportFormat === 'all' || exportFormat === 'quiz' ? (
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">Quiz:</span>
                      <span className="ml-2 text-gray-600">
                        {Object.keys(quizSets || {}).length} sets ({activeQuizSetName ? `activo: ${activeQuizSetName}` : 'ninguno activo'})
                      </span>
                    </div>
                  ) : null}
                  {exportFormat === 'all' || exportFormat === 'flashcard' ? (
                    <div>
                      <span className="font-medium text-gray-700">Flashcards:</span>
                      <span className="ml-2 text-gray-600">
                        {Object.keys(flashcardSets || {}).length} sets ({activeFlashcardSetName ? `activo: ${activeFlashcardSetName}` : 'ninguno activo'})
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
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
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Pega aquí la configuración JSON exportada..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={handleImportFromText}
                  className="mt-3 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <PasteIcon className="w-4 h-4 mr-2" />
                  Importar desde Texto
                </button>
              </div>

              {/* Import from File */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Importar desde archivo:
                </label>
                
                {/* File Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Arrastra y suelta un archivo JSON aquí, o{' '}
                      <label className="text-indigo-600 hover:text-indigo-500 cursor-pointer">
                        selecciona un archivo
                        <input
                          type="file"
                          accept=".json,application/json"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </p>
                  </div>
                </div>
              </div>

              {/* Import Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Importante</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Los sets importados se añadirán con el sufijo "_imported" para evitar sobrescribir tus datos existentes.
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

export default ImportExportPage;
