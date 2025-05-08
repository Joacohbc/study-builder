// src/components/editor/SetManagementControls.jsx
import React from 'react';

const SetManagementControls = ({
    sets,
    selectedSetToLoad,
    onSetSelectionChange,
    onLoadSet,
    onDeleteSet,
    onResetDefaultSet,
    defaultSetName,
    setType,
    isLoading // To disable buttons during an operation if needed (optional)
}) => {
    const setNames = sets ? Object.keys(sets) : [];

    return (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                Gestión de Sets ({setType === 'quiz' ? 'Cuestionarios' : setType === 'flashcard' ? 'Flashcards' : setType})
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label htmlFor="set-select" className="block text-sm font-medium text-gray-700 sm:w-24">Elegir Set:</label>
                <select
                    id="set-select"
                    value={selectedSetToLoad}
                    onChange={(e) => onSetSelectionChange(e.target.value)}
                    className="mt-1 sm:mt-0 block w-full sm:w-auto flex-grow pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
                    disabled={setNames.length === 0 || isLoading}
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
                    onClick={onLoadSet}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm shadow-sm transition duration-150 w-full sm:w-auto"
                    disabled={!selectedSetToLoad || isLoading}
                >
                    Cargar Set
                </button>
                <button
                    onClick={onDeleteSet}
                    className={`bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md text-sm shadow-sm transition duration-150 w-full sm:w-auto ${selectedSetToLoad === defaultSetName ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!selectedSetToLoad || selectedSetToLoad === defaultSetName || isLoading}
                    title={selectedSetToLoad === defaultSetName ? `No se puede eliminar el set predeterminado "${defaultSetName}"` : `Eliminar el set "${selectedSetToLoad}"`}
                >
                    Eliminar Set
                </button>
            </div>
            <button
                onClick={onResetDefaultSet}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md text-sm shadow-sm transition duration-150 w-full sm:w-auto"
                title={`Restablecer el contenido de "${defaultSetName}" a su estado original`}
                disabled={isLoading}
            >
                Restablecer "{defaultSetName}"
            </button>
        </div>
    );
};

export default SetManagementControls;
