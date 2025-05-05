import React, { useState, useEffect } from 'react';
import { loadAllSets, saveAllSets, loadActiveSetName, saveActiveSetName, getDefaultsForType } from './utils/storageManager';
import QuizTab from './components/QuizTab';
import EditorTab from './components/EditorTab';
import HelpTab from './components/HelpTab';
import FlashcardTab from './components/FlashcardTab'; // Import FlashcardTab

// --- GitHub Icon SVG ---
const GitHubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);


// --- Main App Component ---
function App() {
    // State for active UI tab ('quiz', 'flashcards', 'editor', 'explanation')
    const [activeUITab, setActiveUITab] = useState('quiz');
    // State for the type of content being edited ('quiz', 'flashcard')
    const [editorContentType, setEditorContentType] = useState('quiz');

    // --- Quiz State ---
    const [quizSets, setQuizSets] = useState(null);
    const [activeQuizSetName, setActiveQuizSetName] = useState('');
    const [activeQuizData, setActiveQuizData] = useState([]);

    // --- Flashcard State ---
    const [flashcardSets, setFlashcardSets] = useState(null);
    const [activeFlashcardSetName, setActiveFlashcardSetName] = useState('');
    const [activeFlashcardData, setActiveFlashcardData] = useState([]);

    // --- Get Defaults from Storage Manager ---
    const quizDefaults = getDefaultsForType('quiz');
    const flashcardDefaults = getDefaultsForType('flashcard');

    // --- Effect to Load All Data on Mount ---
    useEffect(() => {
        console.log("App useEffect: Loading all data...");

        // Load Quiz Data
        const loadedQuizSets = loadAllSets(quizDefaults.storageKey, quizDefaults.defaultSetName, quizDefaults.defaultData);
        const currentActiveQuizSetName = loadActiveSetName(quizDefaults.activeSetKey, loadedQuizSets, quizDefaults.defaultSetName);
        setQuizSets(loadedQuizSets);
        setActiveQuizSetName(currentActiveQuizSetName);
        setActiveQuizData(loadedQuizSets[currentActiveQuizSetName] || []);
        console.log("Quiz loaded. Active:", currentActiveQuizSetName, "Total:", Object.keys(loadedQuizSets).length);

        // Load Flashcard Data
        const loadedFlashcardSets = loadAllSets(flashcardDefaults.storageKey, flashcardDefaults.defaultSetName, flashcardDefaults.defaultData);
        const currentActiveFlashcardSetName = loadActiveSetName(flashcardDefaults.activeSetKey, loadedFlashcardSets, flashcardDefaults.defaultSetName);
        setFlashcardSets(loadedFlashcardSets);
        setActiveFlashcardSetName(currentActiveFlashcardSetName);
        setActiveFlashcardData(loadedFlashcardSets[currentActiveFlashcardSetName] || []);
        console.log("Flashcards loaded. Active:", currentActiveFlashcardSetName, "Total:", Object.keys(loadedFlashcardSets).length);

        // Set initial editor type based on the last active quiz set (or default)
        // This could be more sophisticated later (e.g., remember last edited type)
        setEditorContentType('quiz');

    }, [quizDefaults.storageKey, quizDefaults.defaultSetName, quizDefaults.defaultData, quizDefaults.activeSetKey,
        flashcardDefaults.storageKey, flashcardDefaults.defaultSetName, flashcardDefaults.defaultData, flashcardDefaults.activeSetKey]);

    // --- Generic Handler Functions for Set Management ---

    const getSetFunctions = (type) => {
        if (type === 'quiz') {
            return {
                sets: quizSets,
                setSets: setQuizSets,
                activeSetName: activeQuizSetName,
                setActiveSetName: setActiveQuizSetName,
                setActiveData: setActiveQuizData,
                defaults: quizDefaults,
            };
        } else if (type === 'flashcard') {
            return {
                sets: flashcardSets,
                setSets: setFlashcardSets,
                activeSetName: activeFlashcardSetName,
                setActiveSetName: setActiveFlashcardSetName,
                setActiveData: setActiveFlashcardData,
                defaults: flashcardDefaults,
            };
        }
        throw new Error(`Invalid set type: ${type}`);
    };

    const updateSets = (type, newSets) => {
        const { setSets, defaults } = getSetFunctions(type);
        setSets(newSets);
        saveAllSets(defaults.storageKey, newSets);
    };

    const handleLoadSet = (type, setName) => {
        const { sets, setActiveSetName, setActiveData, defaults } = getSetFunctions(type);
        if (sets && sets[setName]) {
            setActiveSetName(setName);
            setActiveData(sets[setName]);
            saveActiveSetName(defaults.activeSetKey, setName);
            console.log(`${type} set '${setName}' loaded.`);
        } else {
            console.error(`Attempted to load non-existent ${type} set: ${setName}`);
        }
    };

    const handleSaveChanges = (type, setName, updatedData) => {
        const { sets, activeSetName, setActiveData, defaults } = getSetFunctions(type);
        if (setName === defaults.defaultSetName) {
            console.error(`Attempted to save changes to the default ${type} set. Use 'Save As New'.`);
            return false;
        }
        if (sets && sets[setName]) {
            const newSets = { ...sets, [setName]: updatedData };
            updateSets(type, newSets);
            if (activeSetName === setName) {
                setActiveData(updatedData);
            }
            console.log(`Changes saved to ${type} set '${setName}'.`);
            return true;
        }
        console.error(`Attempted to save changes to non-existent ${type} set: ${setName}`);
        return false;
    };

    const handleSaveAsNewSet = (type, newSetName, dataToSave) => {
        const { sets, setActiveSetName, setActiveData, defaults } = getSetFunctions(type);
        if (!newSetName || newSetName.trim() === '') {
            console.error(`Attempted to save ${type} set with empty name.`);
            return false;
        }
        if (newSetName === defaults.defaultSetName) {
            console.error(`Attempted to save ${type} set with reserved default name "${defaults.defaultSetName}".`);
            return false;
        }

        const newSets = { ...(sets || {}), [newSetName]: dataToSave };
        updateSets(type, newSets);

        setActiveSetName(newSetName);
        setActiveData(dataToSave);
        saveActiveSetName(defaults.activeSetKey, newSetName);

        console.log(`${type} set saved as '${newSetName}' and activated.`);
        return true;
    };

    const handleDeleteSet = (type, setNameToDelete) => {
        const { sets, activeSetName, defaults } = getSetFunctions(type);
        if (!setNameToDelete || setNameToDelete === defaults.defaultSetName) {
            console.error(`Attempted to delete invalid or default ${type} set: ${setNameToDelete}`);
            return;
        }
        if (sets && sets[setNameToDelete]) {
            const newSets = { ...sets };
            delete newSets[setNameToDelete];
            updateSets(type, newSets);
            console.log(`${type} set '${setNameToDelete}' deleted.`);

            if (activeSetName === setNameToDelete) {
                console.log(`Active ${type} set deleted. Switching to default set.`);
                handleLoadSet(type, defaults.defaultSetName);
            }
        } else {
            console.error(`Attempted to delete non-existent ${type} set: ${setNameToDelete}`);
        }
    };

    const handleResetDefaultSet = (type) => {
        const { sets, activeSetName, setActiveData, defaults } = getSetFunctions(type);
        const defaultDataWithIds = defaults.defaultData.map((item, index) => ({ ...item, id: item.id || `${type}_default_${index}` }));
        if (sets) {
            const newSets = { ...sets, [defaults.defaultSetName]: defaultDataWithIds };
            updateSets(type, newSets);
            console.log(`${type} set '${defaults.defaultSetName}' reset to defaults.`);
            if (activeSetName === defaults.defaultSetName) {
                setActiveData(defaultDataWithIds);
            }
        }
    };

    // --- Tab Configuration ---
    const uiTabs = [
        { id: 'quiz', label: 'Cuestionario' },
        { id: 'flashcards', label: 'Flashcards' }, // New Flashcards tab
        { id: 'editor', label: 'Editor de Sets' },
        { id: 'explanation', label: 'Ayuda / README' },
    ];

    // Render loading state
    if (quizSets === null || flashcardSets === null) {
        return <div className="p-8 text-center text-gray-500">Cargando datos...</div>;
    }

    // Determine props for EditorTab based on editorContentType
    const editorProps = editorContentType === 'quiz'
        ? {
            quizSets: quizSets,
            activeSetName: activeQuizSetName,
            activeQuizData: activeQuizData,
            onLoadSet: (setName) => handleLoadSet('quiz', setName),
            onSaveChanges: (setName, data) => handleSaveChanges('quiz', setName, data),
            onSaveAsNewSet: (newName, data) => handleSaveAsNewSet('quiz', newName, data),
            onDeleteSet: (setName) => handleDeleteSet('quiz', setName),
            onResetDefaultSet: () => handleResetDefaultSet('quiz'),
            defaultSetName: quizDefaults.defaultSetName,
            setType: 'quiz',
        }
        : {
            quizSets: flashcardSets, // Pass flashcard sets here
            activeSetName: activeFlashcardSetName,
            activeQuizData: activeFlashcardData, // Pass flashcard data here
            onLoadSet: (setName) => handleLoadSet('flashcard', setName),
            onSaveChanges: (setName, data) => handleSaveChanges('flashcard', setName, data),
            onSaveAsNewSet: (newName, data) => handleSaveAsNewSet('flashcard', newName, data),
            onDeleteSet: (setName) => handleDeleteSet('flashcard', setName),
            onResetDefaultSet: () => handleResetDefaultSet('flashcard'),
            defaultSetName: flashcardDefaults.defaultSetName,
            setType: 'flashcard',
        };

    return (
        <div className="bg-gray-100 font-sans p-4 md:p-8 min-h-screen relative">
            {/* GitHub Link - Added */}
            <a
                href="https://github.com/Joacohbc/study-builder"
                target="_blank"
                rel="noopener noreferrer"
                title="Ver Repositorio en GitHub"
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors duration-200 z-10"
                aria-label="GitHub Repository"
            >
                <GitHubIcon />
            </a>

            {/* Centered content card */}
            <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow-lg">
                {/* App Title - Updated */}
                <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
                    Cuestionario Interactivo
                </h1>

                {/* Tab Navigation Area */}
                <div className="mb-6">
                    {/* Tab Buttons */}
                    <div className="flex flex-wrap border-b border-gray-300">
                        {uiTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveUITab(tab.id)} // Set active tab on click
                                // Apply conditional styling for active/inactive tabs
                                className={`py-2 px-4 text-sm md:text-base cursor-pointer border-b-2 font-medium transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 rounded-t-md
                                    ${activeUITab === tab.id
                                        ? 'border-blue-600 text-blue-600' // Active tab style
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' // Inactive tab style
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content Area */}
                    <div className="mt-6">
                        {/* Conditionally render the content based on the active tab */}
                        {activeUITab === 'quiz' && (
                            <QuizTab
                                // Pass only the data for the currently active set
                                quizData={activeQuizData}
                                activeSetName={activeQuizSetName} // Pass name for context
                                onQuizComplete={(results) => console.log("Quiz Completed:", results)} // Example callback
                            />
                        )}
                        {activeUITab === 'flashcards' && (
                            <FlashcardTab
                                flashcardData={activeFlashcardData}
                                activeSetName={activeFlashcardSetName}
                            />
                        )}
                        {activeUITab === 'editor' && (
                            <div>
                                {/* Radio buttons to select editor type */}
                                <div className="mb-4 flex items-center space-x-4 border-b pb-3">
                                    <span className="font-medium text-gray-700">Editar tipo de set:</span>
                                    <label className="flex items-center space-x-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="editorType"
                                            value="quiz"
                                            checked={editorContentType === 'quiz'}
                                            onChange={() => setEditorContentType('quiz')}
                                            className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                        />
                                        <span>Cuestionarios</span>
                                    </label>
                                    <label className="flex items-center space-x-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="editorType"
                                            value="flashcard"
                                            checked={editorContentType === 'flashcard'}
                                            onChange={() => setEditorContentType('flashcard')}
                                            className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                        />
                                        <span>Flashcards</span>
                                    </label>
                                </div>
                                <EditorTab {...editorProps} />
                            </div>
                        )}
                        {activeUITab === 'explanation' && (
                            <HelpTab />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App; // Export the main App component
