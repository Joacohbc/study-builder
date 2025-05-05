import React, { useState, useEffect } from 'react';

// Icons for copy and paste functionality
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const PasteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
  </svg>
);

// Editor Tab Component: Allows editing the quiz questions and managing sets
const EditorTab = ({
    quizSets,           // Object containing all sets { setName: [questions] }
    activeSetName,      // Name of the currently loaded set
    activeQuizData,     // Array of questions for the active set
    onLoadSet,          // Function to load a set: (setName) => void
    onSaveChanges,      // Function to save changes to the active set: (setName, updatedQuestions) => boolean (returns true if successful)
    onSaveAsNewSet,     // Function to save as a new set: (newSetName, questions) => boolean (returns true if successful)
    onDeleteSet,        // Function to delete a set: (setName) => void
    onResetDefaultSet,  // Function to reset the default set: () => void
    defaultSetName,     // The name of the default set for this type (passed from App.jsx)
    setType             // The type of set being edited ('quiz', 'flashcard', etc.)
}) => {
    // State for the JSON string in the textarea
    const [jsonString, setJsonString] = useState('');
    // State for the set name selected in the dropdown
    const [selectedSetToLoad, setSelectedSetToLoad] = useState(activeSetName || defaultSetName);
    // State for the name input when saving as a new set
    const [newSetNameInput, setNewSetNameInput] = useState('');
    // State for status messages (save success/error, load, delete)
    const [statusMessage, setStatusMessage] = useState({ message: '', type: '' }); // type: 'success', 'error', 'info'
    // State for clipboard operation messages
    const [clipboardMessage, setClipboardMessage] = useState({ message: '', type: '' });

    // Effect to update the textarea when the active set data changes
    useEffect(() => {
        try {
            // Ensure activeQuizData is an array before stringifying
            const dataToDisplay = Array.isArray(activeQuizData) ? activeQuizData : [];
            setJsonString(JSON.stringify(dataToDisplay, null, 2)); // Pretty-print JSON
        } catch (error) {
            setJsonString(`Error cargando datos del set activo (${setType}).`);
            console.error(`Error stringifying active ${setType} data:`, error);
        }
    }, [activeQuizData, setType]); // Rerun when activeQuizData or setType changes

    // Effect to update the dropdown selection when the active set name changes externally
    useEffect(() => {
        setSelectedSetToLoad(activeSetName || defaultSetName);
    }, [activeSetName, defaultSetName]);

    // --- Handlers for Set Management ---

    const handleLoadClick = () => {
        if (selectedSetToLoad) {
            onLoadSet(selectedSetToLoad);
            showStatus(`Set '${selectedSetToLoad}' (${setType}) cargado.`, 'info');
        }
    };

    const handleDeleteClick = () => {
        if (selectedSetToLoad && selectedSetToLoad !== defaultSetName) {
            if (window.confirm(`¿Estás seguro de que quieres eliminar el set '${selectedSetToLoad}' (${setType})? Esta acción no se puede deshacer.`)) {
                onDeleteSet(selectedSetToLoad);
                showStatus(`Set '${selectedSetToLoad}' (${setType}) eliminado.`, 'info');
                // Dropdown will update via props, selectedSetToLoad might need adjustment if it was deleted
                // App component handles switching to default if active was deleted
            }
        } else if (selectedSetToLoad === defaultSetName) {
            showStatus(`No se puede eliminar el set predeterminado "${defaultSetName}".`, 'error');
        }
    };

    // --- Handlers for Saving ---

    // Shared function to parse and validate JSON before saving
    const parseAndValidateJson = () => {
        try {
            const parsedData = JSON.parse(jsonString);
            if (!Array.isArray(parsedData)) { throw new Error("El formato debe ser un array JSON: [...]"); }
            const ids = new Set(); // Keep track of IDs to ensure uniqueness

            parsedData.forEach((item, index) => {
                if (!item || typeof item !== 'object') throw new Error(`Item en índice ${index} no es un objeto.`);

                // --- ID Validation (Common to all item types) ---
                if (!item.id || typeof item.id !== 'string' || item.id.trim() === '') throw new Error(`Item en índice ${index} necesita un 'id' (string) no vacío.`);
                if (ids.has(item.id)) throw new Error(`ID duplicado encontrado: '${item.id}'. Los IDs deben ser únicos dentro del set.`);
                ids.add(item.id);

                // --- Type-Specific Validation ---
                if (setType === 'quiz') {
                    if (!item.type || typeof item.type !== 'string') throw new Error(`Pregunta '${item.id}' necesita un 'type' (string).`);
                    if (!item.question || typeof item.question !== 'string') throw new Error(`Pregunta '${item.id}' necesita una 'question' (string).`);

                    switch (item.type) {
                        case 'single':
                            if (!Array.isArray(item.options) || item.options.length < 2) throw new Error(`Pregunta 'single' '${item.id}' necesita un array 'options' con al menos 2 strings.`);
                            if (typeof item.correctAnswer !== 'string' || !item.options.includes(item.correctAnswer)) throw new Error(`Pregunta 'single' '${item.id}' necesita un 'correctAnswer' (string) que esté presente en 'options'.`);
                            break;
                        case 'multiple':
                            if (!Array.isArray(item.options) || item.options.length < 2) throw new Error(`Pregunta 'multiple' '${item.id}' necesita un array 'options' con al menos 2 strings.`);
                            if (!Array.isArray(item.correctAnswers) || item.correctAnswers.length < 1) throw new Error(`Pregunta 'multiple' '${item.id}' necesita un array 'correctAnswers' con al menos 1 string.`);
                            item.correctAnswers.forEach(ans => { if (typeof ans !== 'string' || !item.options.includes(ans)) throw new Error(`En pregunta 'multiple' '${item.id}', cada 'correctAnswer' debe ser un string presente en 'options'.`); });
                            break;
                        case 'matching':
                            if (!Array.isArray(item.terms) || item.terms.length < 1) throw new Error(`Pregunta 'matching' '${item.id}' necesita un array 'terms' con al menos 1 string.`);
                            if (!Array.isArray(item.definitions) || item.definitions.length < 1) throw new Error(`Pregunta 'matching' '${item.id}' necesita un array 'definitions' con al menos 1 string.`);
                            if (item.terms.length !== item.definitions.length) throw new Error(`Pregunta 'matching' '${item.id}' debe tener el mismo número de 'terms' y 'definitions'.`);
                            if (!item.correctMatches || typeof item.correctMatches !== 'object' || Object.keys(item.correctMatches).length !== item.terms.length) throw new Error(`Pregunta 'matching' '${item.id}' necesita un objeto 'correctMatches' con una entrada para cada término.`);
                            Object.entries(item.correctMatches).forEach(([term, definition]) => { if (!item.terms.includes(term) || !item.definitions.includes(definition)) throw new Error(`En pregunta 'matching' '${item.id}', cada clave/valor en 'correctMatches' debe existir en 'terms' y 'definitions' respectivamente.`); });
                            break;
                        case 'fill-in-the-blanks': {
                            // Basic validation for blanks object
                            if (!item.blanks || typeof item.blanks !== 'object') throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}' necesita un objeto 'blanks'.`);
                            // Allow empty blanks object if question has no placeholders
                            const hasPlaceholders = /\[[a-zA-Z0-9_]+\]/.test(item.question);
                            const hasBlankEntries = Object.keys(item.blanks).length > 0;

                            if (hasPlaceholders && !hasBlankEntries) throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}' tiene placeholders en 'question' pero el objeto 'blanks' está vacío.`);
                            if (!hasPlaceholders && hasBlankEntries) throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}' tiene entradas en 'blanks' pero no hay placeholders [...] en 'question'.`);
                            if (!hasPlaceholders && !hasBlankEntries) break; // Valid case: no blanks needed

                            // Extract placeholder IDs from the question string (case-insensitive ID within brackets)
                            const placeholderMatches = [...item.question.matchAll(/\[([a-zA-Z0-9_]+)\]/g)]; // Corrected Regex
                            const placeholderIdsInQuestion = new Set(placeholderMatches.map(match => match[1])); // Use a Set for efficient lookup and uniqueness

                            // Get keys from the blanks object
                            const blankKeys = new Set(Object.keys(item.blanks));

                            // Check for mismatches between placeholders and blank definitions
                            if (placeholderIdsInQuestion.size !== blankKeys.size) {
                                throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}': Discrepancia entre placeholders [ID] en 'question' (${placeholderIdsInQuestion.size}) y entradas en 'blanks' (${blankKeys.size}). Deben coincidir.`);
                            }

                            // Check if every placeholder in the question has a corresponding blank definition
                            for (const idInQ of placeholderIdsInQuestion) {
                                if (!blankKeys.has(idInQ)) {
                                    // This check might be redundant due to the size comparison, but ensures clarity
                                    throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}': El placeholder [${idInQ}] existe en 'question' pero no hay entrada para él en 'blanks'.`);
                                }
                            }

                            // Check if every blank definition corresponds to a placeholder in the question
                            for (const blankId of blankKeys) {
                                if (!placeholderIdsInQuestion.has(blankId)) {
                                    // This check might be redundant due to the size comparison, but ensures clarity
                                    throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}': El ID de blank '${blankId}' existe en 'blanks' pero no como placeholder [${blankId}] en 'question'.`);
                                }
                            }

                            // Validate each blank entry
                            Object.entries(item.blanks).forEach(([blankId, blankData]) => {
                                // Ensure the blankId actually corresponds to a placeholder found in the question
                                // This check is somewhat redundant given the previous checks, but safe to keep.
                                if (!placeholderIdsInQuestion.has(blankId)) {
                                    throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}': El ID de blank '${blankId}' existe en 'blanks' pero no como placeholder [${blankId}] en 'question'.`);
                                }

                                if (!blankData || typeof blankData !== 'object') throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}': La entrada para '${blankId}' en 'blanks' debe ser un objeto.`);
                                if (!Array.isArray(blankData.options) || blankData.options.length < 2) throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}', blank '${blankId}': necesita un array 'options' con al menos 2 strings.`);
                                if (typeof blankData.correctAnswer !== 'string' || !blankData.options.includes(blankData.correctAnswer)) throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}', blank '${blankId}': necesita un 'correctAnswer' (string) que esté presente en sus 'options'.`);
                            });
                            break;
                        }
                        default:
                            throw new Error(`Tipo de pregunta desconocido '${item.type}' para la pregunta '${item.id}'. Tipos válidos: 'single', 'multiple', 'matching', 'fill-in-the-blanks'.`);
                    }
                }
                // --- Add validation for 'flashcard' type ---
                else if (setType === 'flashcard') {
                    if (!item.front || typeof item.front !== 'string' || item.front.trim() === '') {
                        throw new Error(`Flashcard '${item.id}' necesita una propiedad 'front' (string) no vacía.`);
                    }
                    if (!item.back || typeof item.back !== 'string' || item.back.trim() === '') {
                        throw new Error(`Flashcard '${item.id}' necesita una propiedad 'back' (string) no vacía.`);
                    }
                    // Check for extra unexpected properties (optional but good practice)
                    const allowedKeys = ['id', 'front', 'back'];
                    Object.keys(item).forEach(key => {
                        if (!allowedKeys.includes(key)) {
                            console.warn(`Flashcard '${item.id}' tiene una propiedad inesperada: '${key}'. Será ignorada o puedes eliminarla.`);
                            // Optionally, you could throw an error here if strict adherence is required
                        }
                    });
                } else {
                    // Handle unknown set types if necessary, though App.jsx should prevent this
                    throw new Error(`Tipo de set desconocido en validación: '${setType}'`);
                }
            });
            return parsedData; // Return parsed data if valid
        } catch (error) {
            console.error(`Error parsing or validating ${setType} JSON:`, error);
            showStatus(`Error de validación (${setType}): ${error.message}. Revisa la sintaxis, estructura, propiedades requeridas e IDs únicos.`, 'error');
            return null; // Return null if invalid
        }
    };


    const handleSaveChangesClick = () => {
        if (activeSetName === defaultSetName) {
            showStatus(`No se pueden guardar cambios directamente en el set predeterminado "${defaultSetName}". Usa "Guardar Como Nuevo Set".`, 'error');
            return;
        }
        const parsedData = parseAndValidateJson();
        if (parsedData) {
            const success = onSaveChanges(activeSetName, parsedData);
            if (success) {
                showStatus(`Cambios guardados en el set '${activeSetName}' (${setType}).`, 'success');
            } else {
                showStatus(`Error al guardar cambios en '${activeSetName}' (${setType}).`, 'error'); // Should not happen if validation passed, but good practice
            }
        }
    };

    const handleSaveAsNewClick = () => {
        const newName = newSetNameInput.trim();
        if (!newName) {
            showStatus('Por favor, introduce un nombre para el nuevo set.', 'error');
            return;
        }
        if (newName === defaultSetName) {
            showStatus(`No puedes usar el nombre reservado "${defaultSetName}". Elige otro nombre.`, 'error');
            return;
        }
        // Optional: Check if name already exists and ask for confirmation to overwrite
        if (quizSets && quizSets[newName]) {
            if (!window.confirm(`El set '${newName}' (${setType}) ya existe. ¿Quieres sobrescribirlo?`)) {
                return; // User cancelled overwrite
            }
        }

        const parsedData = parseAndValidateJson();
        if (parsedData) {
            const success = onSaveAsNewSet(newName, parsedData);
            if (success) {
                showStatus(`Set guardado como '${newName}' (${setType}). Ahora es el set activo.`, 'success');
                setNewSetNameInput(''); // Clear the input field
            } else {
                showStatus(`Error al guardar como '${newName}' (${setType}).`, 'error');
            }
        }
    };

    // --- Handler for Reset ---
    const handleResetClick = () => {
        if (window.confirm(`¿Estás seguro de que quieres restablecer el contenido del set "${defaultSetName}" (${setType}) a su estado original?`)) {
            onResetDefaultSet();
            showStatus(`Set "${defaultSetName}" (${setType}) restablecido.`, 'info');
        }
    };

    // --- Handlers for Clipboard Operations ---

    const handleCopyToClipboard = () => {
        try {
            navigator.clipboard.writeText(jsonString).then(
                () => {
                    showClipboardStatus('JSON copiado al portapapeles', 'success');
                },
                (err) => {
                    console.error('Error al copiar al portapapeles:', err);
                    showClipboardStatus('Error al copiar. Intenta seleccionar y copiar manualmente (Ctrl+C)', 'error');
                }
            );
        } catch (err) {
            console.error('Error al acceder al portapapeles:', err);
            showClipboardStatus('Error al acceder al portapapeles. Tu navegador puede no soportar esta función', 'error');
        }
    };

    const handlePasteFromClipboard = () => {
        try {
            navigator.clipboard.readText().then(
                (clipText) => {
                    try {
                        // Verify it's valid JSON before setting it
                        JSON.parse(clipText);
                        setJsonString(clipText);
                        showClipboardStatus('JSON pegado desde el portapapeles', 'success');
                    } catch (parseErr) {
                        console.error('El texto pegado no es JSON válido:', parseErr);
                        showClipboardStatus('El contenido del portapapeles no es JSON válido', 'error');
                    }
                },
                (err) => {
                    console.error('Error al leer del portapapeles:', err);
                    showClipboardStatus('Error al pegar. Intenta seleccionar y pegar manualmente (Ctrl+V)', 'error');
                }
            );
        } catch (err) {
            console.error('Error al acceder al portapapeles:', err);
            showClipboardStatus('Error al acceder al portapapeles. Tu navegador puede no soportar esta función', 'error');
        }
    };

    // Helper to show clipboard operation messages and clear them after a delay
    const showClipboardStatus = (message, type) => {
        setClipboardMessage({ message, type });
        setTimeout(() => setClipboardMessage({ message: '', type: '' }), 3000);
    };

    // Helper to show status messages and clear them after a delay
    const showStatus = (message, type) => {
        setStatusMessage({ message, type });
        setTimeout(() => setStatusMessage({ message: '', type: '' }), 5000);
    };

    // Use the correct prop name 'quizSets' which now holds either quiz or flashcard sets based on context
    const setNames = quizSets ? Object.keys(quizSets) : [];

    return (
        <div className="space-y-6">
            {/* --- Section: Set Management --- */}
            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                {/* Updated title to include setType dynamically */}
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Gestión de Sets ({setType === 'quiz' ? 'Cuestionarios' : setType === 'flashcard' ? 'Flashcards' : setType})</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label htmlFor="set-select" className="block text-sm font-medium text-gray-700 sm:w-24">Elegir Set:</label>
                    <select
                        id="set-select"
                        value={selectedSetToLoad}
                        onChange={(e) => setSelectedSetToLoad(e.target.value)}
                        className="mt-1 sm:mt-0 block w-full sm:w-auto flex-grow pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
                        // Disable if there are no sets of the current type (except maybe default)
                        disabled={setNames.length === 0}
                    >
                        {setNames.length > 0 ? (
                            setNames.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))
                        ) : (
                            <option value="" disabled>No hay sets de tipo '{setType}'</option>
                        )}
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
                        className={`bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md text-sm shadow-sm transition duration-150 w-full sm:w-auto ${selectedSetToLoad === defaultSetName ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!selectedSetToLoad || selectedSetToLoad === defaultSetName}
                        title={selectedSetToLoad === defaultSetName ? `No se puede eliminar el set predeterminado "${defaultSetName}"` : `Eliminar el set "${selectedSetToLoad}"`}
                    >
                        Eliminar Set
                    </button>
                </div>
                {/* --- Reset button always visible --- */}
                <button
                    onClick={handleResetClick}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md text-sm shadow-sm transition duration-150 w-full sm:w-auto"
                    title={`Restablecer el contenido de "${defaultSetName}" a su estado original`}
                >
                    Restablecer "{defaultSetName}"
                </button>
            </div>

            {/* --- Section: Editing Area --- */}
            <div className="p-4 border rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">
                    {/* Updated title */}
                    Editando Set ({setType}): <span className="font-bold text-indigo-700">{activeSetName || 'N/A'}</span>
                </h3>
                <p className="text-sm text-gray-600">
                    {/* Updated description */}
                    Modifica el JSON a continuación. Asegúrate de que el formato sea válido para el tipo '{setType}' y que cada item tenga un `id` único.
                    {setType === 'flashcard' && <span> Cada flashcard debe tener las propiedades `front` y `back`.</span>}
                    {/* Add hints for other types if needed */}
                </p>
                
                {/* Clipboard Actions */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleCopyToClipboard}
                        className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded-md text-sm transition duration-150"
                        title="Copiar todo el JSON al portapapeles"
                    >
                        <CopyIcon /> Copiar JSON
                    </button>
                    <button
                        onClick={handlePasteFromClipboard}
                        className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded-md text-sm transition duration-150"
                        title="Pegar JSON desde el portapapeles"
                    >
                        <PasteIcon /> Pegar JSON
                    </button>
                    
                    {/* Clipboard operation message */}
                    {clipboardMessage.message && (
                        <span className={`inline-flex items-center text-xs py-1 px-2 rounded ${
                            clipboardMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {clipboardMessage.message}
                        </span>
                    )}
                </div>
                
                {/* Textarea for JSON editing */}
                <textarea
                    id="json-editor"
                    spellCheck="false"
                    className="font-mono min-h-[400px] border border-gray-300 p-3 rounded-md w-full box-sizing-border focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    value={jsonString}
                    onChange={(e) => setJsonString(e.target.value)} // Update state on change
                    aria-label={`Editor JSON para el set ${activeSetName} (${setType})`}
                />
                {/* Save Buttons and Status Message */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 border-t pt-4">
                    {/* Save Changes */}
                    <button
                        onClick={handleSaveChangesClick}
                        className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ${activeSetName === defaultSetName ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={activeSetName === defaultSetName}
                        title={activeSetName === defaultSetName ? `No se puede sobrescribir "${defaultSetName}"` : `Guardar cambios en "${activeSetName}" (${setType})`}
                    >
                        Guardar Cambios
                    </button>

                    {/* Save As New */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-grow">
                        <input
                            type="text"
                            value={newSetNameInput}
                            onChange={(e) => setNewSetNameInput(e.target.value)}
                            placeholder={`Nombre para el nuevo set (${setType})`}
                            className="block w-full sm:w-auto flex-grow pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
                            aria-label="Nombre para el nuevo set"
                        />
                        <button
                            onClick={handleSaveAsNewClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 w-full sm:w-auto"
                            title={`Guardar el contenido actual como un nuevo set (${setType})`}
                        >
                            Guardar Como Nuevo Set
                        </button>
                    </div>
                </div>
                {/* Display status message */}
                {statusMessage.message && (
                    <div className={`mt-4 text-sm p-2 rounded border ${statusMessage.type === 'success' ? 'bg-green-50 border-green-300 text-green-700' : statusMessage.type === 'error' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-blue-50 border-blue-300 text-blue-700'}`} role="alert">
                        {statusMessage.message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditorTab;
