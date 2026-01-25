import { useState, useContext, useCallback } from 'react';
import { StudySetContext } from '@/contexts/StudySetContext';
import ImportExportIcon from '@/icons/ImportExportIcon';
import ClipboardControls from '@/features/editor/components/ClipboardControls';

const ExportPage = () => {
  const {
    quizSets,
    flashcardSets,
    activeQuizSetName,
    activeFlashcardSetName,
    activeQuizData,
    activeFlashcardData
  } = useContext(StudySetContext);

  const [exportFormat, setExportFormat] = useState('all'); // 'all', 'quiz', 'flashcard'
  const [successMessage, setSuccessMessage] = useState('');
  const [exportError, setExportError] = useState('');
  const [clipboardMessage, setClipboardMessage] = useState({ message: '', type: '' });

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

  // Función para mostrar mensajes del portapapeles
  const showClipboardStatus = (message, type) => {
    setClipboardMessage({ message, type });
    setTimeout(() => setClipboardMessage({ message: '', type: '' }), 3000);
  };

  // Copiar al portapapeles
  const handleCopyToClipboard = async () => {
    try {
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
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer bg-white px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="all"
                    checked={exportFormat === 'all'}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <span className="font-medium">Todo (Quiz y Flashcards)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer bg-white px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="quiz"
                    checked={exportFormat === 'quiz'}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <span className="font-medium">Solo Quiz</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer bg-white px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="flashcard"
                    checked={exportFormat === 'flashcard'}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <span className="font-medium">Solo Flashcards</span>
                </label>
              </div>
            </div>

            {/* Export Actions */}
            <div className="space-y-4">
              {/* Clipboard Controls */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Acciones rápidas:
                </label>
                <ClipboardControls
                  onCopyToClipboard={handleCopyToClipboard}
                  onPasteFromClipboard={null} // No mostrar paste en export
                  clipboardMessage={clipboardMessage}
                  showCopy={true}
                  showPaste={false}
                  copyLabel="Copiar al Portapapeles"
                  copyTitle="Copiar configuración exportada al portapapeles"
                  buttonSize="md"
                  variant="primary"
                />
              </div>
              
              {/* Download Button */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Guardar archivo:
                </label>
                <button
                  onClick={handleDownloadJSON}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar JSON
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Vista previa de datos a exportar:</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                {exportFormat === 'all' || exportFormat === 'quiz' ? (
                  <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <span className="font-medium text-gray-700">Quiz:</span>
                    </div>
                    <span className="text-gray-600 text-sm">
                      {Object.keys(quizSets || {}).length} sets {activeQuizSetName && `(activo: ${activeQuizSetName})`}
                    </span>
                  </div>
                ) : null}
                {exportFormat === 'all' || exportFormat === 'flashcard' ? (
                  <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-gray-700">Flashcards:</span>
                    </div>
                    <span className="text-gray-600 text-sm">
                      {Object.keys(flashcardSets || {}).length} sets {activeFlashcardSetName && `(activo: ${activeFlashcardSetName})`}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
