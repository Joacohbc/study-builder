import React, { useState, useEffect } from 'react';
import { DEFAULT_SET_NAME } from '../constants';

// Editor Tab Component: Allows editing the quiz questions and managing sets
const EditorTab = ({
    quizSets,           // Object containing all sets { setName: [questions] }
    activeSetName,      // Name of the currently loaded set
    activeQuizData,     // Array of questions for the active set
    onLoadSet,          // Function to load a set: (setName) => void
    onSaveChanges,      // Function to save changes to the active set: (setName, updatedQuestions) => boolean (returns true if successful)
    onSaveAsNewSet,     // Function to save as a new set: (newSetName, questions) => boolean (returns true if successful)
    onDeleteSet,        // Function to delete a set: (setName) => void
    onResetDefaultSet   // Function to reset the default set: () => void
}) => {
    // State for the JSON string in the textarea
    const [jsonString, setJsonString] = useState('');
    // State for the set name selected in the dropdown
    const [selectedSetToLoad, setSelectedSetToLoad] = useState(activeSetName || DEFAULT_SET_NAME);
    // State for the name input when saving as a new set
    const [newSetNameInput, setNewSetNameInput] = useState('');
    // State for status messages (save success/error, load, delete)
    const [statusMessage, setStatusMessage] = useState({ message: '', type: '' }); // type: 'success', 'error', 'info'

    // Effect to update the textarea when the active set data changes
    useEffect(() => {
        try {
            setJsonString(JSON.stringify(activeQuizData || [], null, 2)); // Pretty-print JSON or empty array
        } catch (error) {
            setJsonString("Error cargando datos del set activo.");
            console.error("Error stringifying active quiz data:", error);
        }
    }, [activeQuizData]); // Rerun when activeQuizData changes

    // Effect to update the dropdown selection when the active set name changes externally
    useEffect(() => {
        setSelectedSetToLoad(activeSetName || DEFAULT_SET_NAME);
    }, [activeSetName]);

    // --- Handlers for Set Management ---

    const handleLoadClick = () => {
        if (selectedSetToLoad) {
            onLoadSet(selectedSetToLoad);
            showStatus(`Set '${selectedSetToLoad}' cargado.`, 'info');
        }
    };

    const handleDeleteClick = () => {
        if (selectedSetToLoad && selectedSetToLoad !== DEFAULT_SET_NAME) {
            if (window.confirm(`¿Estás seguro de que quieres eliminar el set '${selectedSetToLoad}'? Esta acción no se puede deshacer.`)) {
                onDeleteSet(selectedSetToLoad);
                showStatus(`Set '${selectedSetToLoad}' eliminado.`, 'info');
                // Dropdown will update via props, selectedSetToLoad might need adjustment if it was deleted
                // App component handles switching to default if active was deleted
            }
        } else if (selectedSetToLoad === DEFAULT_SET_NAME) {
             showStatus(`No se puede eliminar el set "${DEFAULT_SET_NAME}".`, 'error');
        }
    };

    // --- Handlers for Saving ---

    // Shared function to parse and validate JSON before saving
    const parseAndValidateJson = () => {
        try {
            const parsedData = JSON.parse(jsonString);
            if (!Array.isArray(parsedData)) { throw new Error("El formato debe ser un array JSON: [...]"); }
            const ids = new Set(); // Keep track of IDs to ensure uniqueness

            parsedData.forEach((q, index) => {
                 if (!q || typeof q !== 'object') throw new Error(`Item en índice ${index} no es un objeto.`);

                 // --- ID Validation ---
                 if (!q.id || typeof q.id !== 'string' || q.id.trim() === '') throw new Error(`Pregunta en índice ${index} necesita un 'id' (string) no vacío.`);
                 if (ids.has(q.id)) throw new Error(`ID duplicado encontrado: '${q.id}'. Los IDs deben ser únicos dentro del set.`);
                 ids.add(q.id);

                 // --- Common Fields Validation ---
                 if (!q.type || typeof q.type !== 'string') throw new Error(`Pregunta '${q.id}' necesita un 'type' (string).`);
                 if (!q.question || typeof q.question !== 'string') throw new Error(`Pregunta '${q.id}' necesita una 'question' (string).`);

                 // --- Type-Specific Validation ---
                 switch (q.type) {
                    case 'single':
                        if (!Array.isArray(q.options) || q.options.length < 2) throw new Error(`Pregunta 'single' '${q.id}' necesita un array 'options' con al menos 2 strings.`);
                        if (typeof q.correctAnswer !== 'string' || !q.options.includes(q.correctAnswer)) throw new Error(`Pregunta 'single' '${q.id}' necesita un 'correctAnswer' (string) que esté presente en 'options'.`);
                        break;
                    case 'multiple':
                        if (!Array.isArray(q.options) || q.options.length < 2) throw new Error(`Pregunta 'multiple' '${q.id}' necesita un array 'options' con al menos 2 strings.`);
                        if (!Array.isArray(q.correctAnswers) || q.correctAnswers.length < 1) throw new Error(`Pregunta 'multiple' '${q.id}' necesita un array 'correctAnswers' con al menos 1 string.`);
                        q.correctAnswers.forEach(ans => { if (typeof ans !== 'string' || !q.options.includes(ans)) throw new Error(`En pregunta 'multiple' '${q.id}', cada 'correctAnswer' debe ser un string presente en 'options'.`); });
                        break;
                    case 'matching':
                        if (!Array.isArray(q.terms) || q.terms.length < 1) throw new Error(`Pregunta 'matching' '${q.id}' necesita un array 'terms' con al menos 1 string.`);
                        if (!Array.isArray(q.definitions) || q.definitions.length < 1) throw new Error(`Pregunta 'matching' '${q.id}' necesita un array 'definitions' con al menos 1 string.`);
                        if (q.terms.length !== q.definitions.length) throw new Error(`Pregunta 'matching' '${q.id}' debe tener el mismo número de 'terms' y 'definitions'.`);
                        if (!q.correctMatches || typeof q.correctMatches !== 'object' || Object.keys(q.correctMatches).length !== q.terms.length) throw new Error(`Pregunta 'matching' '${q.id}' necesita un objeto 'correctMatches' con una entrada para cada término.`);
                        Object.entries(q.correctMatches).forEach(([term, definition]) => { if (!q.terms.includes(term) || !q.definitions.includes(definition)) throw new Error(`En pregunta 'matching' '${q.id}', cada clave/valor en 'correctMatches' debe existir en 'terms' y 'definitions' respectivamente.`); });
                        break;
                    case 'fill-in-the-blanks': {
                        if (!q.blanks || typeof q.blanks !== 'object' || Object.keys(q.blanks).length === 0) throw new Error(`Pregunta 'fill-in-the-blanks' '${q.id}' necesita un objeto 'blanks' no vacío.`);
                        const blankIdsInQuestion = (q.question.match(/\\[[A-Z0-9_]+\\]/g) || []).map(b => b.substring(1, b.length - 1));
                        if (blankIdsInQuestion.length !== Object.keys(q.blanks).length) throw new Error(`Pregunta 'fill-in-the-blanks' '${q.id}': El número de placeholders [BLANK_ID] en 'question' no coincide con el número de entradas en 'blanks'.`);
                        Object.entries(q.blanks).forEach(([blankId, blankData]) => {
                            if (!blankIdsInQuestion.includes(blankId)) throw new Error(`Pregunta 'fill-in-the-blanks' '${q.id}': El ID de blank '${blankId}' existe en 'blanks' pero no como placeholder [${blankId}] en 'question'.`);
                            if (!blankData || typeof blankData !== 'object') throw new Error(`Pregunta 'fill-in-the-blanks' '${q.id}': La entrada para '${blankId}' en 'blanks' debe ser un objeto.`);
                            if (!Array.isArray(blankData.options) || blankData.options.length < 2) throw new Error(`Pregunta 'fill-in-the-blanks' '${q.id}', blank '${blankId}': necesita un array 'options' con al menos 2 strings.`);
                            if (typeof blankData.correctAnswer !== 'string' || !blankData.options.includes(blankData.correctAnswer)) throw new Error(`Pregunta 'fill-in-the-blanks' '${q.id}', blank '${blankId}': necesita un 'correctAnswer' (string) que esté presente en sus 'options'.`);
                        });
                        blankIdsInQuestion.forEach(idInQ => { if (!q.blanks[idInQ]) throw new Error(`Pregunta 'fill-in-the-blanks' '${q.id}': El placeholder [${idInQ}] existe en 'question' pero no hay entrada para él en 'blanks'.`); });
                        break;
                    }
                    default:
                        throw new Error(`Tipo de pregunta desconocido '${q.type}' para la pregunta '${q.id}'. Tipos válidos: 'single', 'multiple', 'matching', 'fill-in-the-blanks'.`);
                 }
             });
            return parsedData; // Return parsed data if valid
        } catch (error) {
            console.error("Error parsing or validating JSON:", error);
            showStatus(`Error de validación: ${error.message}. Revisa la sintaxis, estructura e IDs únicos.`, 'error');
            return null; // Return null if invalid
        }
    };

    const handleSaveChangesClick = () => {
        if (activeSetName === DEFAULT_SET_NAME) {
            showStatus(`No se pueden guardar cambios directamente en el set "${DEFAULT_SET_NAME}". Usa "Guardar Como Nuevo Set".`, 'error');
            return;
        }
        const parsedData = parseAndValidateJson();
        if (parsedData) {
            const success = onSaveChanges(activeSetName, parsedData);
            if (success) {
                showStatus(`Cambios guardados en el set '${activeSetName}'.`, 'success');
            } else {
                 showStatus(`Error al guardar cambios en '${activeSetName}'.`, 'error'); // Should not happen if validation passed, but good practice
            }
        }
    };

    const handleSaveAsNewClick = () => {
        const newName = newSetNameInput.trim();
        if (!newName) {
            showStatus('Por favor, introduce un nombre para el nuevo set.', 'error');
            return;
        }
        if (newName === DEFAULT_SET_NAME) {
             showStatus(`No puedes usar el nombre reservado "${DEFAULT_SET_NAME}". Elige otro nombre.`, 'error');
             return;
        }
        // Optional: Check if name already exists and ask for confirmation to overwrite
        if (quizSets && quizSets[newName]) {
            if (!window.confirm(`El set '${newName}' ya existe. ¿Quieres sobrescribirlo?`)) {
                return; // User cancelled overwrite
            }
        }

        const parsedData = parseAndValidateJson();
        if (parsedData) {
            const success = onSaveAsNewSet(newName, parsedData);
            if (success) {
                showStatus(`Set guardado como '${newName}'. Ahora es el set activo.`, 'success');
                setNewSetNameInput(''); // Clear the input field
            } else {
                 showStatus(`Error al guardar como '${newName}'.`, 'error');
            }
        }
    };

    // --- Handler for Reset ---
    const handleResetClick = () => {
        if (window.confirm(`¿Estás seguro de que quieres restablecer el contenido del set "${DEFAULT_SET_NAME}" a su estado original?`)) {
            onResetDefaultSet();
            showStatus(`Set "${DEFAULT_SET_NAME}" restablecido.`, 'info');
        }
    };

    // Helper to show status messages and clear them after a delay
    const showStatus = (message, type) => {
        setStatusMessage({ message, type });
        setTimeout(() => setStatusMessage({ message: '', type: '' }), 5000);
    };

    const setNames = quizSets ? Object.keys(quizSets) : [];

    return (
        <div className="space-y-6">
            {/* --- Section: Set Management --- */}
            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Gestión de Sets de Preguntas</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label htmlFor="set-select" className="block text-sm font-medium text-gray-700 sm:w-24">Elegir Set:</label>
                    <select
                        id="set-select"
                        value={selectedSetToLoad}
                        onChange={(e) => setSelectedSetToLoad(e.target.value)}
                        className="mt-1 sm:mt-0 block w-full sm:w-auto flex-grow pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
                    >
                        {setNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleLoadClick}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm shadow-sm transition duration-150 w-full sm:w-auto"
                        disabled={!selectedSetToLoad}
                    >
                        Cargar Set
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className={`bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md text-sm shadow-sm transition duration-150 w-full sm:w-auto ${selectedSetToLoad === DEFAULT_SET_NAME ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!selectedSetToLoad || selectedSetToLoad === DEFAULT_SET_NAME}
                    >
                        Eliminar Set
                    </button>
                </div>
                 <button
                    onClick={handleResetClick}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md text-sm shadow-sm transition duration-150 w-full sm:w-auto"
                 >
                    Restablecer "{DEFAULT_SET_NAME}"
                 </button>
            </div>

            {/* --- Section: Editing Area --- */}
            <div className="p-4 border rounded-lg space-y-4">
                 <h3 className="text-lg font-semibold text-gray-700">
                    Editando Set: <span className="font-bold text-indigo-700">{activeSetName || 'N/A'}</span>
                 </h3>
                 <p className="text-sm text-gray-600">
                    Modifica el JSON a continuación. Asegúrate de que el formato sea válido y que cada pregunta tenga un `id` único antes de guardar.
                 </p>
                {/* Textarea for JSON editing */}
                <textarea
                    id="json-editor"
                    spellCheck="false"
                    className="font-mono min-h-[400px] border border-gray-300 p-3 rounded-md w-full box-sizing-border focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    value={jsonString}
                    onChange={(e) => setJsonString(e.target.value)} // Update state on change
                />
                {/* Save Buttons and Status Message */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 border-t pt-4">
                    {/* Save Changes */}
                    <button
                        onClick={handleSaveChangesClick}
                        className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ${activeSetName === DEFAULT_SET_NAME ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={activeSetName === DEFAULT_SET_NAME}
                        title={activeSetName === DEFAULT_SET_NAME ? `No se puede sobrescribir "${DEFAULT_SET_NAME}"` : `Guardar cambios en "${activeSetName}"`}
                    >
                        Guardar Cambios
                    </button>

                    {/* Save As New */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-grow">
                       <input
                            type="text"
                            value={newSetNameInput}
                            onChange={(e) => setNewSetNameInput(e.target.value)}
                            placeholder="Nombre para el nuevo set"
                            className="block w-full sm:w-auto flex-grow pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
                       />
                       <button
                            onClick={handleSaveAsNewClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 w-full sm:w-auto"
                       >
                            Guardar Como Nuevo Set
                       </button>
                    </div>
                </div>
                 {/* Display status message */}
                 {statusMessage.message && (
                    <div className={`mt-4 text-sm p-2 rounded border ${statusMessage.type === 'success' ? 'bg-green-50 border-green-300 text-green-700' : statusMessage.type === 'error' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-blue-50 border-blue-300 text-blue-700'}`}>
                        {statusMessage.message}
                    </div>
                 )}
            </div>
        </div>
    );
};

export default EditorTab;
