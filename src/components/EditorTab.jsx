import React, { useState, useEffect } from 'react';
import { useStudySets } from '../contexts/useStudySets'; // Import useStudySets
import { parseAndValidateSetData } from '../services/ValidationService';
import SetManagementControls from './editor/SetManagementControls';
import ClipboardControls from './editor/ClipboardControls';
import SaveActions from './editor/SaveActions';

// Editor Tab Component: Allows editing the quiz questions and managing sets
const EditorTab = () => { // Removed all props
    const {
        quizSets,
        activeQuizSetName,
        activeQuizData,
        flashcardSets,
        activeFlashcardSetName,
        activeFlashcardData,
        quizDefaults,
        flashcardDefaults,
        editorContentType, // Use editorContentType from context
        handleLoadSet: parentOnLoadSet,
        handleSaveChanges: parentOnSaveChanges,
        handleSaveAsNewSet: parentOnSaveAsNewSet,
        handleDeleteSet: parentOnDeleteSet,
        handleResetDefaultSet: parentOnResetDefaultSet
    } = useStudySets();

    // Determine current set type and data based on editorContentType
    const setType = editorContentType;
    const activeSetName = setType === 'quiz' ? activeQuizSetName : activeFlashcardSetName;
    const activeSetData = setType === 'quiz' ? activeQuizData : activeFlashcardData;
    const allSets = setType === 'quiz' ? quizSets : flashcardSets;
    const defaultSetName = setType === 'quiz' ? quizDefaults.defaultSetName : flashcardDefaults.defaultSetName;

    const [jsonString, setJsonString] = useState('');
    const [selectedSetToLoad, setSelectedSetToLoad] = useState(activeSetName || defaultSetName);
    const [newSetNameInput, setNewSetNameInput] = useState('');
    const [statusMessage, setStatusMessage] = useState({ message: '', type: '' });
    const [clipboardMessage, setClipboardMessage] = useState({ message: '', type: '' });

    useEffect(() => {
        try {
            const dataToDisplay = Array.isArray(activeSetData) ? activeSetData : []; // Use activeSetData
            setJsonString(JSON.stringify(dataToDisplay, null, 2));
        } catch (error) {
            setJsonString(`Error cargando datos del set activo (${setType}).`);
            console.error(`Error stringifying active ${setType} data:`, error);
        }
    }, [activeSetData, setType]); // Dependency on activeSetData

    useEffect(() => {
        setSelectedSetToLoad(activeSetName || defaultSetName);
    }, [activeSetName, defaultSetName]);

    const showStatus = (message, type) => {
        setStatusMessage({ message, type });
        setTimeout(() => setStatusMessage({ message: '', type: '' }), 5000);
    };

    const showClipboardStatus = (message, type) => {
        setClipboardMessage({ message, type });
        setTimeout(() => setClipboardMessage({ message: '', type: '' }), 3000);
    };

    const validateAndPrepareData = () => {
        try {
            return parseAndValidateSetData(jsonString, setType);
        } catch (error) {
            console.error(`Error parsing or validating ${setType} JSON:`, error);
            showStatus(`Error de validación (${setType}): ${error.message}. Revisa la sintaxis, estructura, propiedades requeridas e IDs únicos.`, 'error');
            return null;
        }
    };

    // --- Handlers for Set Management (passed to SetManagementControls) ---
    const handleSetSelectionChange = (newSelection) => {
        setSelectedSetToLoad(newSelection);
    };

    const handleLoadSet = () => {
        if (selectedSetToLoad) {
            parentOnLoadSet(setType, selectedSetToLoad); // Pass setType
            showStatus(`Set '${selectedSetToLoad}' (${setType}) cargado.`, 'info');
        }
    };

    const handleDeleteSet = () => {
        if (selectedSetToLoad && selectedSetToLoad !== defaultSetName) {
            if (window.confirm(`¿Estás seguro de que quieres eliminar el set '${selectedSetToLoad}' (${setType})? Esta acción no se puede deshacer.`)) {
                parentOnDeleteSet(setType, selectedSetToLoad); // Pass setType
                showStatus(`Set '${selectedSetToLoad}' (${setType}) eliminado.`, 'info');
            }
        } else if (selectedSetToLoad === defaultSetName) {
            showStatus(`No se puede eliminar el set predeterminado "${defaultSetName}".`, 'error');
        }
    };
    
    const handleResetDefaultSet = () => {
        if (window.confirm(`¿Estás seguro de que quieres restablecer el contenido del set "${defaultSetName}" (${setType}) a su estado original?`)) {
            parentOnResetDefaultSet(setType); // Pass setType
            showStatus(`Set "${defaultSetName}" (${setType}) restablecido.`, 'info');
        }
    };

    // --- Handlers for Clipboard Operations (passed to ClipboardControls) ---
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(jsonString).then(
            () => showClipboardStatus('JSON copiado al portapapeles', 'success'),
            (err) => {
                console.error('Error al copiar al portapapeles:', err);
                showClipboardStatus('Error al copiar. Intenta seleccionar y copiar manualmente (Ctrl+C)', 'error');
            }
        );
    };

    const handlePasteFromClipboard = () => {
        navigator.clipboard.readText().then(
            (clipText) => {
                try {
                    JSON.parse(clipText); // Validate if it's JSON
                    setJsonString(clipText);
                    showClipboardStatus('JSON pegado desde el portapapeles', 'success');
                } catch (err) {
                    console.error('Error parsing pasted JSON:', err);
                    showClipboardStatus('El contenido del portapapeles no es JSON válido', 'error');
                }
            },
            (err) => {
                console.error('Error al leer del portapapeles:', err);
                showClipboardStatus('Error al pegar. Intenta seleccionar y pegar manualmente (Ctrl+V)', 'error');
            }
        );
    };

    // --- Handlers for Saving (passed to SaveActions) ---
    const handleSaveChanges = () => {
        if (activeSetName === defaultSetName) {
            showStatus(`No se pueden guardar cambios directamente en el set predeterminado "${defaultSetName}". Usa "Guardar Como Nuevo Set".`, 'error');
            return;
        }
        const parsedData = validateAndPrepareData();
        if (parsedData) {
            const success = parentOnSaveChanges(setType, activeSetName, parsedData); // Pass setType
            if (success) {
                showStatus(`Cambios guardados en el set '${activeSetName}' (${setType}).`, 'success');
            } else {
                showStatus(`Error al guardar cambios en '${activeSetName}' (${setType}).`, 'error');
            }
        }
    };

    const handleSaveAsNew = () => {
        const newName = newSetNameInput.trim();
        if (!newName) {
            showStatus('Por favor, introduce un nombre para el nuevo set.', 'error');
            return;
        }
        if (newName === defaultSetName) {
            showStatus(`No puedes usar el nombre reservado "${defaultSetName}". Elige otro nombre.`, 'error');
            return;
        }
        if (allSets && allSets[newName]) { // Use allSets
            if (!window.confirm(`El set '${newName}' (${setType}) ya existe. ¿Quieres sobrescribirlo?`)) {
                return;
            }
        }
        const parsedData = validateAndPrepareData();
        if (parsedData) {
            const success = parentOnSaveAsNewSet(setType, newName, parsedData); // Pass setType
            if (success) {
                showStatus(`Set guardado como '${newName}' (${setType}). Ahora es el set activo.`, 'success');
                setNewSetNameInput('');
            } else {
                showStatus(`Error al guardar como '${newName}' (${setType}).`, 'error');
            }
        }
    };
    
    const handleNewSetNameChange = (value) => {
        setNewSetNameInput(value);
    };

    return (
        <div className="space-y-6">
            <SetManagementControls
                sets={allSets} // Use allSets
                selectedSetToLoad={selectedSetToLoad}
                onSetSelectionChange={handleSetSelectionChange}
                onLoadSet={handleLoadSet}
                onDeleteSet={handleDeleteSet}
                onResetDefaultSet={handleResetDefaultSet}
                defaultSetName={defaultSetName}
                setType={setType}
            />

            <div className="p-4 border rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">
                    Editando Set ({setType}): <span className="font-bold text-indigo-700">{activeSetName || 'N/A'}</span>
                </h3>
                <p className="text-sm text-gray-600">
                    Modifica el JSON a continuación. Asegúrate de que el formato sea válido para el tipo '{setType}' y que cada item tenga un `id` único.
                    {setType === 'flashcard' && <span> Cada flashcard debe tener las propiedades `front` y `back`.</span>}
                </p>
                
                <ClipboardControls
                    jsonString={jsonString}
                    onCopyToClipboard={handleCopyToClipboard}
                    onPasteFromClipboard={handlePasteFromClipboard}
                    clipboardMessage={clipboardMessage}
                />
                
                <textarea
                    id="json-editor"
                    spellCheck="false"
                    className="font-mono min-h-[400px] border border-gray-300 p-3 rounded-md w-full box-sizing-border focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    value={jsonString}
                    onChange={(e) => setJsonString(e.target.value)}
                    aria-label={`Editor JSON para el set ${activeSetName} (${setType})`}
                />
                
                <SaveActions
                    activeSetName={activeSetName}
                    defaultSetName={defaultSetName}
                    newSetNameInput={newSetNameInput}
                    onNewSetNameChange={handleNewSetNameChange}
                    onSaveChanges={handleSaveChanges}
                    onSaveAsNew={handleSaveAsNew}
                    setType={setType}
                />
                
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
