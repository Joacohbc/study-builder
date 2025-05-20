// src/components/editor/SaveActions.jsx
import React from 'react';

const SaveActions = ({
    activeSetName,
    defaultSetName,
    newSetNameInput,
    onNewSetNameChange,
    onSaveChanges,
    onSaveAsNew,
    setType,
    isLoading // To disable buttons during an operation if needed (optional)
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
                onClick={onSaveChanges}
                className={`bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ${activeSetName === defaultSetName ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={activeSetName === defaultSetName || isLoading}
                title={activeSetName === defaultSetName ? `No se puede sobrescribir "${defaultSetName}"` : `Guardar cambios en "${activeSetName}" (${setType})`}
            >
                Guardar Cambios
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-grow">
                <input
                    type="text"
                    value={newSetNameInput}
                    onChange={(e) => onNewSetNameChange(e.target.value)}
                    placeholder={`Nombre para el nuevo set (${setType})`}
                    className="block w-full sm:w-auto flex-grow pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500"
                    aria-label="Nombre para el nuevo set"
                    disabled={isLoading}
                />
                <button
                    onClick={onSaveAsNew}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300 w-full sm:w-auto"
                    title={`Guardar el contenido actual como un nuevo set (${setType})`}
                    disabled={isLoading || !newSetNameInput.trim()}
                >
                    Guardar Como Nuevo Set
                </button>
            </div>
        </div>
    );
};

export default SaveActions;
