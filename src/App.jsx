import React, { useState, useEffect } from 'react';
import { loadAllSets, saveAllSets, loadActiveSetName, saveActiveSetName, getDefaultsForType } from './utils/storageManager';
import QuizTab from './components/QuizTab';
import EditorTab from './components/EditorTab';
import HelpTab from './components/HelpTab';
import FlashcardTab from './components/FlashcardTab';

// --- Iconos SVG mejorados ---
const GitHubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const QuizIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
);

const HelpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6"></path>
        <path d="M10 22h4"></path>
        <path d="M8 2h8l4 10H4L8 2z"></path>
        <path d="M12 14v4"></path>
    </svg>
);

const CardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
        <line x1="12" y1="6" x2="12" y2="18"></line>
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
        { id: 'quiz', label: 'Cuestionario', icon: <QuizIcon /> },
        { id: 'flashcards', label: 'Flashcards', icon: <CardIcon /> },
        { id: 'editor', label: 'Editor de Sets', icon: <EditIcon /> },
        { id: 'explanation', label: 'Ayuda', icon: <HelpIcon /> },
    ];

    // Render loading state
    if (quizSets === null || flashcardSets === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
                <div className="animate-pulse flex flex-col items-center p-8">
                    <BookIcon />
                    <p className="mt-4 text-lg text-indigo-800 font-medium">Cargando datos...</p>
                </div>
            </div>
        );
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
            quizSets: flashcardSets,
            activeSetName: activeFlashcardSetName,
            activeQuizData: activeFlashcardData,
            onLoadSet: (setName) => handleLoadSet('flashcard', setName),
            onSaveChanges: (setName, data) => handleSaveChanges('flashcard', setName, data),
            onSaveAsNewSet: (newName, data) => handleSaveAsNewSet('flashcard', newName, data),
            onDeleteSet: (setName) => handleDeleteSet('flashcard', setName),
            onResetDefaultSet: () => handleResetDefaultSet('flashcard'),
            defaultSetName: flashcardDefaults.defaultSetName,
            setType: 'flashcard',
        };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-100 font-sans min-h-screen relative">
            {/* Formas decorativas */}
            <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 left-0 w-32 h-32 md:w-64 md:h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 right-1/4 w-32 h-32 md:w-64 md:h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            
            {/* Contenedor principal con padding */}
            <div className="relative z-10 px-4 md:px-8 py-8 md:py-12">
                {/* GitHub Link - Improved */}
                <a
                    href="https://github.com/Joacohbc/study-builder"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver Repositorio en GitHub"
                    className="fixed top-4 right-4 p-2 bg-white rounded-full shadow-lg text-gray-700 hover:text-indigo-600 hover:shadow-xl transition-all duration-300 z-20"
                    aria-label="GitHub Repository"
                >
                    <GitHubIcon />
                </a>

                {/* Centered content card */}
                <div className="max-w-5xl mx-auto bg-white bg-opacity-95 p-6 md:p-8 rounded-xl shadow-2xl card animate-fade-in">
                    {/* App Title - Enhanced */}
                    <div className="mb-8 text-center">
                        <div className="flex justify-center mb-2">
                            <BookIcon />
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                            Study Builder
                        </h1>
                        <p className="text-gray-600 mt-2">Tu herramienta de estudio personalizada</p>
                    </div>

                    {/* Tab Navigation Area - Enhanced */}
                    <div className="mb-8">
                        {/* Tab Buttons - Responsive and Modern */}
                        <div className="flex flex-wrap border-b border-gray-200 mb-6">
                            {uiTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveUITab(tab.id)}
                                    className={`flex items-center py-3 px-4 md:px-6 text-sm md:text-base cursor-pointer font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50 border-b-2 mr-1 md:mr-2
                                        ${activeUITab === tab.id
                                            ? 'border-indigo-600 text-indigo-600' 
                                            : 'border-transparent text-gray-500 hover:text-indigo-500 hover:border-indigo-300'
                                        }`}
                                >
                                    <span className="mr-2 opacity-75">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content Area - With Transitions */}
                        <div className="mt-6 tab-transition">
                            {/* Conditionally render the content based on the active tab */}
                            {activeUITab === 'quiz' && (
                                <div className="animate-fade-in">
                                    <QuizTab
                                        quizData={activeQuizData}
                                        activeSetName={activeQuizSetName}
                                        onQuizComplete={(results) => console.log("Quiz Completed:", results)}
                                    />
                                </div>
                            )}
                            {activeUITab === 'flashcards' && (
                                <div className="animate-fade-in">
                                    <FlashcardTab
                                        flashcardData={activeFlashcardData}
                                        activeSetName={activeFlashcardSetName}
                                    />
                                </div>
                            )}
                            {activeUITab === 'editor' && (
                                <div className="animate-fade-in">
                                    {/* Radio buttons to select editor type - Styled */}
                                    <div className="mb-6 flex flex-wrap items-center gap-6 bg-gray-50 p-4 rounded-lg shadow-inner">
                                        <span className="font-medium text-gray-700">Editar tipo de set:</span>
                                        <div className="flex flex-wrap gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-md shadow-sm hover:shadow transition-shadow duration-200">
                                                <input
                                                    type="radio"
                                                    name="editorType"
                                                    value="quiz"
                                                    checked={editorContentType === 'quiz'}
                                                    onChange={() => setEditorContentType('quiz')}
                                                    className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                                />
                                                <span className="flex items-center gap-1">
                                                    <QuizIcon />
                                                    <span>Cuestionarios</span>
                                                </span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-md shadow-sm hover:shadow transition-shadow duration-200">
                                                <input
                                                    type="radio"
                                                    name="editorType"
                                                    value="flashcard"
                                                    checked={editorContentType === 'flashcard'}
                                                    onChange={() => setEditorContentType('flashcard')}
                                                    className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                                />
                                                <span className="flex items-center gap-1">
                                                    <CardIcon />
                                                    <span>Flashcards</span>
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                    <EditorTab {...editorProps} />
                                </div>
                            )}
                            {activeUITab === 'explanation' && (
                                <div className="animate-fade-in">
                                    <HelpTab />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <footer className="mt-8 text-center text-sm text-gray-500">
                    <p className="mb-1">Desarrollado con ❤️ para ayudarte a estudiar</p>
                    <p>© {new Date().getFullYear()} Study Builder</p>
                </footer>
            </div>
        </div>
    );
}

export default App;
