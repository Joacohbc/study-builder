import React, { createContext, useState, useEffect, useCallback } from 'react';
import { loadAllSets, saveAllSets, loadActiveSetName, saveActiveSetName, getDefaultsForType } from '../services/storageManager';
import { shuffleArray } from '../utils/helpers'; // Import shuffleArray

const StudySetContext = createContext();

export const StudySetProvider = ({ children }) => {
    // State for the type of content being edited ('quiz', 'flashcard') - moved from App.jsx for editor context
    const [editorContentType, setEditorContentType] = useState('quiz');

    // --- Quiz State ---
    const [quizSets, setQuizSets] = useState(null);
    const [activeQuizSetName, setActiveQuizSetName] = useState('');
    const [activeQuizData, setActiveQuizData] = useState([]);
    const [shuffledQuizData, setShuffledQuizData] = useState([]); // New state for shuffled quiz data
    const [isShuffleEnabled, setIsShuffleEnabled] = useState(false); // New state for shuffle preference


    // --- Flashcard State ---
    const [flashcardSets, setFlashcardSets] = useState(null);
    const [activeFlashcardSetName, setActiveFlashcardSetName] = useState('');
    const [activeFlashcardData, setActiveFlashcardData] = useState([]);

    // --- Get Defaults from Storage Manager ---
    const quizDefaults = getDefaultsForType('quiz');
    const flashcardDefaults = getDefaultsForType('flashcard');

    // --- Effect to Load All Data on Mount ---
    useEffect(() => {
        console.log("StudySetContext useEffect: Loading all data...");

        // Load Quiz Data
        const loadedQuizSets = loadAllSets(quizDefaults.storageKey, quizDefaults.defaultSetName, quizDefaults.defaultData);
        const currentActiveQuizSetName = loadActiveSetName(quizDefaults.activeSetKey, loadedQuizSets, quizDefaults.defaultSetName);
        setQuizSets(loadedQuizSets);
        setActiveQuizSetName(currentActiveQuizSetName);
        const currentActiveQuizData = loadedQuizSets[currentActiveQuizSetName] || [];
        setActiveQuizData(currentActiveQuizData);
        // Initialize shuffled data
        setShuffledQuizData(isShuffleEnabled ? shuffleArray(currentActiveQuizData) : [...currentActiveQuizData]);
        console.log("Quiz loaded via Context. Active:", currentActiveQuizSetName, "Total:", Object.keys(loadedQuizSets).length);

        // Load Flashcard Data
        const loadedFlashcardSets = loadAllSets(flashcardDefaults.storageKey, flashcardDefaults.defaultSetName, flashcardDefaults.defaultData);
        const currentActiveFlashcardSetName = loadActiveSetName(flashcardDefaults.activeSetKey, loadedFlashcardSets, flashcardDefaults.defaultSetName);
        setFlashcardSets(loadedFlashcardSets);
        setActiveFlashcardSetName(currentActiveFlashcardSetName);
        setActiveFlashcardData(loadedFlashcardSets[currentActiveFlashcardSetName] || []);
        console.log("Flashcards loaded via Context. Active:", currentActiveFlashcardSetName, "Total:", Object.keys(loadedFlashcardSets).length);
         // Set initial editor type based on the last active quiz set (or default)
        setEditorContentType('quiz'); // Default to quiz, can be changed by user
    }, [quizDefaults.storageKey, quizDefaults.defaultSetName, quizDefaults.defaultData, quizDefaults.activeSetKey,
        flashcardDefaults.storageKey, flashcardDefaults.defaultSetName, flashcardDefaults.defaultData, flashcardDefaults.activeSetKey]);

    // --- Effect to update shuffledQuizData when activeQuizData or isShuffleEnabled changes ---
    useEffect(() => {
        if (activeQuizData && activeQuizData.length > 0) {
            setShuffledQuizData(isShuffleEnabled ? shuffleArray([...activeQuizData]) : [...activeQuizData]);
        } else {
            setShuffledQuizData([]);
        }
    }, [activeQuizData, isShuffleEnabled]);

    // --- Toggle Shuffle Function ---
    const toggleShuffle = useCallback(() => {
        setIsShuffleEnabled(prev => !prev);
    }, []);


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
            const newActiveData = sets[setName] || [];
            setActiveData(newActiveData);
            // Update shuffled data if it's a quiz
            if (type === 'quiz') {
                setShuffledQuizData(isShuffleEnabled ? shuffleArray([...newActiveData]) : [...newActiveData]);
            }
            saveActiveSetName(defaults.activeSetKey, setName);
            console.log(`${type} set '${setName}' loaded via Context.`);
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
                // Update shuffled data if it's a quiz
                if (type === 'quiz') {
                    setShuffledQuizData(isShuffleEnabled ? shuffleArray([...updatedData]) : [...updatedData]);
                }
            }
            console.log(`Changes saved to ${type} set '${setName}' via Context.`);
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
        // Update shuffled data if it's a quiz
        if (type === 'quiz') {
            setShuffledQuizData(isShuffleEnabled ? shuffleArray([...dataToSave]) : [...dataToSave]);
        }
        saveActiveSetName(defaults.activeSetKey, newSetName);

        console.log(`${type} set saved as '${newSetName}' and activated via Context.`);
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
            console.log(`${type} set '${setNameToDelete}' deleted via Context.`);

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
            console.log(`${type} set '${defaults.defaultSetName}' reset to defaults via Context.`);
            if (activeSetName === defaults.defaultSetName) {
                setActiveData(defaultDataWithIds);
                 // Update shuffled data if it's a quiz
                if (type === 'quiz') {
                    setShuffledQuizData(isShuffleEnabled ? shuffleArray([...defaultDataWithIds]) : [...defaultDataWithIds]);
                }
            }
        }
    };

    const value = {
        quizSets,
        activeQuizSetName,
        activeQuizData,
        shuffledQuizData, // Expose shuffled quiz data
        isShuffleEnabled, // Expose shuffle state
        toggleShuffle, // Expose shuffle toggle function
        flashcardSets,
        activeFlashcardSetName,
        activeFlashcardData,
        quizDefaults,
        flashcardDefaults,
        editorContentType,
        setEditorContentType,
        handleLoadSet,
        handleSaveChanges,
        handleSaveAsNewSet,
        handleDeleteSet,
        handleResetDefaultSet,
        isLoading: quizSets === null || flashcardSets === null, // Add a loading state
    };

    return (
        <StudySetContext.Provider value={value}>
            {children}
        </StudySetContext.Provider>
    );
};

export { StudySetContext };
