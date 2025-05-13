import { useState, useEffect, useCallback } from 'react';
import { loadAllSets, saveAllSets, loadActiveSetName, saveActiveSetName, getDefaultsForType } from '../services/storageManager';

const flashcardDefaults = getDefaultsForType('flashcard');

export const useFlashcardData = () => {
    const [flashcardSets, setFlashcardSets] = useState(null);
    const [activeFlashcardSetName, setActiveFlashcardSetName] = useState('');
    const [activeFlashcardData, setActiveFlashcardData] = useState([]);
    const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(true);

    useEffect(() => {
        console.log("useFlashcardData useEffect: Loading flashcard data...");
        const loadedFlashcardSets = loadAllSets(flashcardDefaults.storageKey, flashcardDefaults.defaultSetName, flashcardDefaults.defaultData);
        const currentActiveFlashcardSetName = loadActiveSetName(flashcardDefaults.activeSetKey, loadedFlashcardSets, flashcardDefaults.defaultSetName);
        setFlashcardSets(loadedFlashcardSets);
        setActiveFlashcardSetName(currentActiveFlashcardSetName);
        setActiveFlashcardData(loadedFlashcardSets[currentActiveFlashcardSetName] || []);
        setIsLoadingFlashcards(false);
        console.log("Flashcards loaded via useFlashcardData. Active:", currentActiveFlashcardSetName, "Total:", Object.keys(loadedFlashcardSets).length);
    }, []);

    const updateFlashcardSets = (newSets) => {
        setFlashcardSets(newSets);
        saveAllSets(flashcardDefaults.storageKey, newSets);
    };

    const loadFlashcardSet = useCallback((setName) => {
        if (flashcardSets && flashcardSets[setName]) {
            setActiveFlashcardSetName(setName);
            setActiveFlashcardData(flashcardSets[setName] || []);
            saveActiveSetName(flashcardDefaults.activeSetKey, setName);
            console.log(`Flashcard set '${setName}' loaded via useFlashcardData.`);
        } else {
            console.error(`Attempted to load non-existent flashcard set: ${setName}`);
        }
    }, [flashcardSets]);

    const saveFlashcardChanges = useCallback((setName, updatedData) => {
        if (setName === flashcardDefaults.defaultSetName) {
            console.error("Attempted to save changes to the default flashcard set. Use 'Save As New'.");
            return false;
        }
        if (flashcardSets && flashcardSets[setName]) {
            const newSets = { ...flashcardSets, [setName]: updatedData };
            updateFlashcardSets(newSets);
            if (activeFlashcardSetName === setName) {
                setActiveFlashcardData(updatedData);
            }
            console.log(`Changes saved to flashcard set '${setName}' via useFlashcardData.`);
            return true;
        }
        console.error(`Attempted to save changes to non-existent flashcard set: ${setName}`);
        return false;
    }, [flashcardSets, activeFlashcardSetName]);

    const saveAsNewFlashcardSet = useCallback((newSetName, dataToSave) => {
        if (!newSetName || newSetName.trim() === '') {
            console.error("Attempted to save flashcard set with empty name.");
            return false;
        }
        if (newSetName === flashcardDefaults.defaultSetName) {
            console.error(`Attempted to save flashcard set with reserved default name "${flashcardDefaults.defaultSetName}".`);
            return false;
        }

        const newSets = { ...(flashcardSets || {}), [newSetName]: dataToSave };
        updateFlashcardSets(newSets);

        setActiveFlashcardSetName(newSetName);
        setActiveFlashcardData(dataToSave);
        saveActiveSetName(flashcardDefaults.activeSetKey, newSetName);

        console.log(`Flashcard set saved as '${newSetName}' and activated via useFlashcardData.`);
        return true;
    }, [flashcardSets]);

    const deleteFlashcardSet = useCallback((setNameToDelete) => {
        if (!setNameToDelete || setNameToDelete === flashcardDefaults.defaultSetName) {
            console.error(`Attempted to delete invalid or default flashcard set: ${setNameToDelete}`);
            return;
        }
        if (flashcardSets && flashcardSets[setNameToDelete]) {
            const newSets = { ...flashcardSets };
            delete newSets[setNameToDelete];
            updateFlashcardSets(newSets);
            console.log(`Flashcard set '${setNameToDelete}' deleted via useFlashcardData.`);

            if (activeFlashcardSetName === setNameToDelete) {
                console.log("Active flashcard set deleted. Switching to default set.");
                loadFlashcardSet(flashcardDefaults.defaultSetName);
            }
        } else {
            console.error(`Attempted to delete non-existent flashcard set: ${setNameToDelete}`);
        }
    }, [flashcardSets, activeFlashcardSetName, loadFlashcardSet]);

    const resetDefaultFlashcardSet = useCallback(() => {
        const defaultDataWithIds = flashcardDefaults.defaultData.map((item, index) => ({ ...item, id: item.id || `flashcard_default_${index}` }));
        if (flashcardSets) {
            const newSets = { ...flashcardSets, [flashcardDefaults.defaultSetName]: defaultDataWithIds };
            updateFlashcardSets(newSets);
            console.log(`Flashcard set '${flashcardDefaults.defaultSetName}' reset to defaults via useFlashcardData.`);
            if (activeFlashcardSetName === flashcardDefaults.defaultSetName) {
                setActiveFlashcardData(defaultDataWithIds);
            }
        }
    }, [flashcardSets, activeFlashcardSetName]);

    return {
        flashcardSets,
        activeFlashcardSetName,
        activeFlashcardData,
        loadFlashcardSet,
        saveFlashcardChanges,
        saveAsNewFlashcardSet,
        deleteFlashcardSet,
        resetDefaultFlashcardSet,
        isLoadingFlashcards,
        flashcardDefaults,
    };
};
