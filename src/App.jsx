import React, { useState, useEffect } from 'react';
import { DEFAULT_SET_NAME, LOCAL_STORAGE_SETS_KEY, LOCAL_STORAGE_ACTIVE_SET_KEY, defaultQuizData } from './constants';
import QuizTab from './components/QuizTab';
import EditorTab from './components/EditorTab';
import HelpTab from './components/HelpTab';

// --- GitHub Icon SVG ---
const GitHubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);


// --- Main App Component ---
function App() {
    // State to manage the currently active tab
    const [activeTab, setActiveTab] = useState('quiz'); // 'quiz', 'editor', 'explanation'
    // State to hold all quiz sets { setName: [questions] }
    const [quizSets, setQuizSets] = useState(null); // Initialize as null to detect loading
    // State to hold the name of the currently active set
    const [activeSetName, setActiveSetName] = useState('');
    // State to hold the actual question data for the active set
    const [activeQuizData, setActiveQuizData] = useState([]);

    // Effect to load data from localStorage on initial mount
    useEffect(() => {
        // console.log("App useEffect: Loading data from localStorage...");
        let loadedSets = {};
        let storedSets = localStorage.getItem(LOCAL_STORAGE_SETS_KEY);

        // Try parsing stored sets
        if (storedSets) {
            try {
                loadedSets = JSON.parse(storedSets);
                if (typeof loadedSets !== 'object' || loadedSets === null) {
                    console.warn("Stored sets data is not an object. Resetting.");
                    loadedSets = {}; // Reset if not an object
                }
            } catch (error) {
                console.error("Error parsing stored sets data:", error);
                loadedSets = {}; // Reset on error
            }
        }

        // Ensure the default set exists
        if (!loadedSets[DEFAULT_SET_NAME]) {
            // console.log("Default set not found in storage. Adding it.");
            // Ensure default data has unique IDs
            const defaultDataWithIds = defaultQuizData.map((q, index) => ({ ...q, id: q.id || `q_default_${index}` }));
            loadedSets[DEFAULT_SET_NAME] = defaultDataWithIds;
            // Save back immediately if default was added
            localStorage.setItem(LOCAL_STORAGE_SETS_KEY, JSON.stringify(loadedSets));
        }

        // Determine the active set name
        let currentActiveSetName = localStorage.getItem(LOCAL_STORAGE_ACTIVE_SET_KEY);
        // Validate if the stored active set name actually exists in the loaded sets
        if (!currentActiveSetName || !loadedSets[currentActiveSetName]) {
            // console.log("Active set name not found or invalid. Using default.");
            currentActiveSetName = DEFAULT_SET_NAME;
            localStorage.setItem(LOCAL_STORAGE_ACTIVE_SET_KEY, currentActiveSetName);
        }

        // Set the state
        setQuizSets(loadedSets);
        setActiveSetName(currentActiveSetName);
        setActiveQuizData(loadedSets[currentActiveSetName] || []); // Load active set data or empty array

        // console.log("App loaded. Active set:", currentActiveSetName, "Total sets:", Object.keys(loadedSets).length);

    }, []); // Empty dependency array ensures this runs only once on mount

    // --- Handler Functions for Set Management ---

    // Function to update state and localStorage when sets change
    const updateQuizSets = (newSets) => {
        setQuizSets(newSets);
        try {
            localStorage.setItem(LOCAL_STORAGE_SETS_KEY, JSON.stringify(newSets));
        } catch (error) {
            console.error("Error saving sets to localStorage:", error);
            // TODO: Show error to user?
        }
    };

    // Function to change the active set
    const handleLoadSet = (setName) => {
        if (quizSets && quizSets[setName]) {
            setActiveSetName(setName);
            setActiveQuizData(quizSets[setName]);
            localStorage.setItem(LOCAL_STORAGE_ACTIVE_SET_KEY, setName);
            // console.log(`Set '${setName}' loaded.`);
        } else {
            console.error(`Attempted to load non-existent set: ${setName}`);
        }
    };

    // Function to save changes to the currently active set
    const handleSaveChanges = (setName, updatedQuestions) => {
        if (setName === DEFAULT_SET_NAME) {
            console.error("Attempted to save changes to the default set.");
            return false; // Indicate failure
        }
        if (quizSets && quizSets[setName]) {
            const newSets = { ...quizSets, [setName]: updatedQuestions };
            updateQuizSets(newSets);
            // Also update activeQuizData if the saved set is the active one
            if (activeSetName === setName) {
                setActiveQuizData(updatedQuestions);
            }
            // console.log(`Changes saved to set '${setName}'.`);
            return true; // Indicate success
        }
        console.error(`Attempted to save changes to non-existent set: ${setName}`);
        return false; // Indicate failure
    };

    // Function to save the current editor content as a new set
    const handleSaveAsNewSet = (newSetName, questionsToSave) => {
        if (!newSetName || newSetName.trim() === '') {
            console.error("Attempted to save with empty name.");
            return false; // Indicate failure (handled also in component, but good practice)
        }
        if (newSetName === DEFAULT_SET_NAME) {
            console.error("Attempted to save with reserved default name.");
            return false;
        }

        const newSets = { ...(quizSets || {}), [newSetName]: questionsToSave };
        updateQuizSets(newSets);

        // Make the newly saved set the active one
        setActiveSetName(newSetName);
        setActiveQuizData(questionsToSave);
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_SET_KEY, newSetName);

        // console.log(`Set saved as '${newSetName}' and activated.`);
        return true; // Indicate success
    };

    // Function to delete a specific set
    const handleDeleteSet = (setNameToDelete) => {
        if (!setNameToDelete || setNameToDelete === DEFAULT_SET_NAME) {
            console.error(`Attempted to delete invalid or default set: ${setNameToDelete}`);
            return;
        }
        if (quizSets && quizSets[setNameToDelete]) {
            const newSets = { ...quizSets };
            delete newSets[setNameToDelete];
            updateQuizSets(newSets);
            // console.log(`Set '${setNameToDelete}' deleted.`);

            // If the deleted set was the active one, switch to the default set
            if (activeSetName === setNameToDelete) {
                // console.log("Active set deleted. Switching to default set.");
                handleLoadSet(DEFAULT_SET_NAME);
            }
        } else {
            console.error(`Attempted to delete non-existent set: ${setNameToDelete}`);
        }
    };

    // Function to reset the default set to its original questions
    const handleResetDefaultSet = () => {
        // Ensure default data has unique IDs
        const defaultDataWithIds = defaultQuizData.map((q, index) => ({ ...q, id: q.id || `q_default_${index}` }));
        if (quizSets) {
            const newSets = { ...quizSets, [DEFAULT_SET_NAME]: defaultDataWithIds };
            updateQuizSets(newSets);
            // console.log(`Set '${DEFAULT_SET_NAME}' reset to defaults.`);

            // If the default set is currently active, reload its data into the state
            if (activeSetName === DEFAULT_SET_NAME) {
                setActiveQuizData(defaultDataWithIds);
            }
        }
    };


    // --- Tab Configuration ---
    const tabs = [
        { id: 'quiz', label: 'Cuestionario' },
        { id: 'editor', label: 'Editor de Sets' }, // Renamed tab
        { id: 'explanation', label: 'Ayuda / README' },
    ];

    // Render loading state until sets are loaded from localStorage
    if (quizSets === null) {
        return <div className="p-8 text-center text-gray-500">Cargando datos...</div>;
    }

    return (
        // Main container - Added relative positioning
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
                    Cuestionario Interactivo (React)
                </h1>

                {/* Tab Navigation Area */}
                <div className="mb-6">
                    {/* Tab Buttons */}
                    <div className="flex border-b border-gray-300">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)} // Set active tab on click
                                // Apply conditional styling for active/inactive tabs
                                className={`py-2 px-4 text-sm md:text-base cursor-pointer border-b-2 font-medium transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 rounded-t-md
                                    ${activeTab === tab.id
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
                        {activeTab === 'quiz' && (
                            <QuizTab
                                // Pass only the data for the currently active set
                                quizData={activeQuizData}
                                activeSetName={activeSetName} // Pass name for context
                                onQuizComplete={(results) => console.log("Quiz Completed:", results)} // Example callback
                            />
                        )}
                        {activeTab === 'editor' && (
                            <EditorTab
                                quizSets={quizSets}
                                activeSetName={activeSetName}
                                activeQuizData={activeQuizData}
                                onLoadSet={handleLoadSet}
                                onSaveChanges={handleSaveChanges}
                                onSaveAsNewSet={handleSaveAsNewSet}
                                onDeleteSet={handleDeleteSet}
                                onResetDefaultSet={handleResetDefaultSet}
                            />
                        )}
                        {activeTab === 'explanation' && (
                            <HelpTab />
                        )}
                    </div>
                </div>
            </div>
            {/* Global Styles (Optional) - Moved from App.jsx */}
            <style jsx global>{`
                .draggable { cursor: grab; user-select: none; touch-action: none; }
                .dragging { opacity: 0.5; cursor: grabbing; }
                .drop-zone { transition: background-color 0.2s ease, border-color 0.2s ease; }
             `}</style>
        </div>
    );
}

export default App; // Export the main App component
