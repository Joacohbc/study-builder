import {
    DEFAULT_QUIZ_SET_NAME,
    defaultQuizData,
    DEFAULT_FLASHCARD_SET_NAME,
    defaultFlashcardData,
    FLASHCARD_SETS_KEY,
    FLASHCARD_ACTIVE_SET_KEY,
    QUIZ_SETS_KEY,
    QUIZ_ACTIVE_SET_KEY,
    QUIZ_PROGRESS_KEY // Import the new key
} from '../constants/localStorage';

// --- Generic LocalStorage Interaction ---

const loadFromLocalStorage = (key, defaultValue = null) => {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
        try {
            const parsed = JSON.parse(storedValue);
            // Basic validation: ensure objects are objects, arrays are arrays
            if (defaultValue !== null) {
                if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
                    console.warn(`LocalStorage key "${key}" expected array, found ${typeof parsed}. Using default.`);
                    return defaultValue;
                }
                if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue) && (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))) {
                    console.warn(`LocalStorage key "${key}" expected object, found ${typeof parsed}. Using default.`);
                    return defaultValue;
                }
            }
            return parsed;
        } catch (error) {
            console.error(`Error parsing localStorage key "${key}":`, error);
            return defaultValue; // Return default on parsing error
        }
    }
    return defaultValue; // Return default if not found
};

const saveToLocalStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving to localStorage key "${key}":`, error);
        // Optionally: Show error to user?
    }
};

// --- Set Management Logic ---

/**
 * Loads all sets for a given type (e.g., 'quiz') from localStorage.
 * Ensures the default set exists.
 * @param {string} storageKey - The localStorage key for all sets (e.g., 'quizSetsReactGeneric').
 * @param {string} defaultSetName - The name of the default set (e.g., 'Set de Ejemplo').
 * @param {Array} defaultData - The default data array for the default set.
 * @returns {object} The loaded sets object { setName: [items] }.
 */
export const loadAllSets = (storageKey, defaultSetName, defaultData) => {
    let loadedSets = loadFromLocalStorage(storageKey, {});

    // Ensure loadedSets is a valid object
    if (typeof loadedSets !== 'object' || loadedSets === null || Array.isArray(loadedSets)) {
        console.warn(`Data for key "${storageKey}" is not an object. Resetting.`);
        loadedSets = {};
    }

    // Ensure the default set exists and has unique IDs
    if (!loadedSets[defaultSetName]) {
        console.log(`Default set "${defaultSetName}" not found in storage for key "${storageKey}". Adding it.`);
        // Ensure default data has unique IDs (simple index-based fallback)
        const defaultDataWithIds = defaultData.map((item, index) => ({
            ...item,
            id: item.id || `default_${index}` // Ensure unique ID
        }));
        loadedSets[defaultSetName] = defaultDataWithIds;
        // Save back immediately if default was added
        saveToLocalStorage(storageKey, loadedSets);
    } else {
        // Optional: Validate existing default set items have IDs?
    }

    // Optional: Validate other sets? (e.g., ensure they are arrays)
    Object.keys(loadedSets).forEach(setName => {
        if (!Array.isArray(loadedSets[setName])) {
            console.warn(`Data for set "${setName}" under key "${storageKey}" is not an array. Attempting to recover or remove.`);
            // Decide on recovery strategy or simply delete the invalid set
            delete loadedSets[setName];
            saveToLocalStorage(storageKey, loadedSets); // Save correction
        } else {
             // Ensure items within the set have unique IDs
            const ids = new Set();
            loadedSets[setName] = loadedSets[setName].map((item, index) => {
                const itemId = item.id || `${setName}_item_${index}`;
                if (ids.has(itemId)) {
                    console.warn(`Duplicate ID "${itemId}" found in set "${setName}". Assigning a new unique ID.`);
                    const uniqueId = `${itemId}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
                    ids.add(uniqueId);
                    return { ...item, id: uniqueId };
                }
                ids.add(itemId);
                return { ...item, id: itemId }; // Ensure ID exists
            });
        }
    });


    return loadedSets;
};

/**
 * Saves all sets for a given type to localStorage.
 * @param {string} storageKey - The localStorage key for all sets.
 * @param {object} sets - The sets object to save.
 */
export const saveAllSets = (storageKey, sets) => {
    saveToLocalStorage(storageKey, sets);
};

/**
 * Loads the active set name for a given type from localStorage.
 * Validates it against existing sets and falls back to default if needed.
 * @param {string} activeSetKey - The localStorage key for the active set name.
 * @param {object} loadedSets - The currently loaded sets object.
 * @param {string} defaultSetName - The name of the default set.
 * @returns {string} The validated active set name.
 */
export const loadActiveSetName = (activeSetKey, loadedSets, defaultSetName) => {
    let currentActiveSetName = loadFromLocalStorage(activeSetKey, defaultSetName);

    // Validate if the stored active set name actually exists in the loaded sets
    if (!currentActiveSetName || typeof currentActiveSetName !== 'string' || !loadedSets[currentActiveSetName]) {
        console.log(`Active set name ("${currentActiveSetName}") for key "${activeSetKey}" not found or invalid. Using default "${defaultSetName}".`);
        currentActiveSetName = defaultSetName;
        saveToLocalStorage(activeSetKey, currentActiveSetName); // Save the fallback
    }
    return currentActiveSetName;
};

/**
 * Saves the active set name for a given type to localStorage.
 * @param {string} activeSetKey - The localStorage key for the active set name.
 * @param {string} name - The name of the set to mark as active.
 */
export const saveActiveSetName = (activeSetKey, name) => {
    saveToLocalStorage(activeSetKey, name);
};

// --- Quiz Progress Management ---

/**
 * Saves the current quiz progress (e.g., answers and question order) to localStorage.
 * @param {string} quizSetName - The name of the quiz set for which progress is being saved.
 * @param {object} progressData - The progress data to save (e.g., { answers: {...}, questionOrder: [] }).
 */
export const saveQuizProgress = (quizSetName, progressData) => {
    if (!quizSetName) {
        console.error("Cannot save quiz progress without a quizSetName.");
        return;
    }
    const allProgress = loadFromLocalStorage(QUIZ_PROGRESS_KEY, {});
    // Ensure progressData contains answers and questionOrder
    if (!progressData || typeof progressData.answers === 'undefined' || typeof progressData.questionOrder === 'undefined') {
        console.error("Attempted to save progress without answers or questionOrder:", progressData);
        // Potentially clear progress if it's in an invalid state or just return
        // For now, let's prevent saving incomplete progress data.
        return;
    }
    allProgress[quizSetName] = progressData;
    saveToLocalStorage(QUIZ_PROGRESS_KEY, allProgress);
    console.log(`Progress for quiz '${quizSetName}' saved with answers and question order.`);
};

/**
 * Loads the quiz progress (answers and question order) for a specific quiz set from localStorage.
 * @param {string} quizSetName - The name of the quiz set to load progress for.
 * @returns {object|null} The saved progress data { answers, questionOrder }, or null if not found or error.
 */
export const loadQuizProgress = (quizSetName) => {
    if (!quizSetName) {
        console.warn("Cannot load quiz progress without a quizSetName.");
        return null;
    }
    const allProgress = loadFromLocalStorage(QUIZ_PROGRESS_KEY, {});
    if (allProgress && allProgress[quizSetName]) {
        // Validate that the loaded progress has the expected structure
        if (typeof allProgress[quizSetName].answers !== 'undefined' && Array.isArray(allProgress[quizSetName].questionOrder)) {
            console.log(`Progress for quiz '${quizSetName}' loaded (includes answers and questionOrder).`);
            return allProgress[quizSetName];
        } else {
            console.warn(`Loaded progress for quiz '${quizSetName}' has incorrect structure. Discarding.`);
            // Optionally, clear this malformed progress
            // delete allProgress[quizSetName];
            // saveToLocalStorage(QUIZ_PROGRESS_KEY, allProgress);
            return null;
        }
    }
    console.log(`No saved progress found for quiz '${quizSetName}'.`);
    return null;
};

/**
 * Clears the quiz progress for a specific quiz set from localStorage.
 * @param {string} quizSetName - The name of the quiz set to clear progress for.
 */
export const clearQuizProgress = (quizSetName) => {
    if (!quizSetName) {
        console.warn("Cannot clear quiz progress without a quizSetName.");
        return;
    }
    const allProgress = loadFromLocalStorage(QUIZ_PROGRESS_KEY, {});
    if (allProgress && allProgress[quizSetName]) {
        delete allProgress[quizSetName];
        saveToLocalStorage(QUIZ_PROGRESS_KEY, allProgress);
        console.log(`Progress for quiz '${quizSetName}' cleared.`);
    }
};

/**
 * Gets the appropriate default data based on type.
 * @param {string} type - 'quiz' or 'flashcard'
 * @returns {{defaultSetName: string, defaultData: Array, storageKey: string, activeSetKey: string}}
 */
export const getDefaultsForType = (type) => {
    if (type === 'quiz') {
        return {
            defaultSetName: DEFAULT_QUIZ_SET_NAME,
            defaultData: defaultQuizData,
            storageKey: QUIZ_SETS_KEY,
            activeSetKey: QUIZ_ACTIVE_SET_KEY
        };
    }
    // Add flashcard defaults
    if (type === 'flashcard') {
        return {
            defaultSetName: DEFAULT_FLASHCARD_SET_NAME,
            defaultData: defaultFlashcardData,
            storageKey: FLASHCARD_SETS_KEY,
            activeSetKey: FLASHCARD_ACTIVE_SET_KEY
        };
    }

    // Fallback or error for unknown type
    console.error(`Unknown data type requested: ${type}`);
    return { defaultSetName: 'Default', defaultData: [], storageKey: 'unknownSets', activeSetKey: 'activeUnknownSet' };
};
