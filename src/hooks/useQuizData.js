import { useState, useEffect, useCallback } from 'react';
import { loadAllSets, saveAllSets, loadActiveSetName, saveActiveSetName, getDefaultsForType } from '@/services/storageManager';

const quizDefaults = getDefaultsForType('quiz');

export const useQuizData = () => {
    const [quizSets, setQuizSets] = useState(null);
    const [activeQuizSetName, setActiveQuizSetName] = useState('');
    const [activeQuizData, setActiveQuizData] = useState([]);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);

    useEffect(() => {
        console.log("useQuizData useEffect: Loading quiz data...");
        const loadedQuizSets = loadAllSets(quizDefaults.storageKey, quizDefaults.defaultSetName, quizDefaults.defaultData);
        const currentActiveQuizSetName = loadActiveSetName(quizDefaults.activeSetKey, loadedQuizSets, quizDefaults.defaultSetName);
        setQuizSets(loadedQuizSets);
        setActiveQuizSetName(currentActiveQuizSetName);
        const currentActiveQuizData = loadedQuizSets[currentActiveQuizSetName] || [];
        setActiveQuizData(currentActiveQuizData);
        setIsLoadingQuiz(false);
        console.log("Quiz loaded via useQuizData. Active:", currentActiveQuizSetName, "Total:", Object.keys(loadedQuizSets).length);
    }, []);

    const updateQuizSets = (newSets) => {
        setQuizSets(newSets);
        saveAllSets(quizDefaults.storageKey, newSets);
    };

    const loadQuizSet = useCallback((setName) => {
        if (quizSets && quizSets[setName]) {
            setActiveQuizSetName(setName);
            const newActiveData = quizSets[setName] || [];
            setActiveQuizData(newActiveData);
            saveActiveSetName(quizDefaults.activeSetKey, setName);
            console.log(`Quiz set '${setName}' loaded via useQuizData.`);
        } else {
            console.error(`Attempted to load non-existent quiz set: ${setName}`);
        }
    }, [quizSets]);

    const saveQuizChanges = useCallback((setName, updatedData) => {
        if (setName === quizDefaults.defaultSetName) {
            console.error("Attempted to save changes to the default quiz set. Use 'Save As New'.");
            return false;
        }
        if (quizSets && quizSets[setName]) {
            const newSets = { ...quizSets, [setName]: updatedData };
            updateQuizSets(newSets);
            if (activeQuizSetName === setName) {
                setActiveQuizData(updatedData);
            }
            console.log(`Changes saved to quiz set '${setName}' via useQuizData.`);
            return true;
        }
        console.error(`Attempted to save changes to non-existent quiz set: ${setName}`);
        return false;
    }, [quizSets, activeQuizSetName]);

    const saveAsNewQuizSet = useCallback((newSetName, dataToSave) => {
        if (!newSetName || newSetName.trim() === '') {
            console.error("Attempted to save quiz set with empty name.");
            return false;
        }
        if (newSetName === quizDefaults.defaultSetName) {
            console.error(`Attempted to save quiz set with reserved default name "${quizDefaults.defaultSetName}".`);
            return false;
        }

        const newSets = { ...(quizSets || {}), [newSetName]: dataToSave };
        updateQuizSets(newSets);

        setActiveQuizSetName(newSetName);
        setActiveQuizData(dataToSave);
        saveActiveSetName(quizDefaults.activeSetKey, newSetName);

        console.log(`Quiz set saved as '${newSetName}' and activated via useQuizData.`);
        return true;
    }, [quizSets]);

    const deleteQuizSet = useCallback((setNameToDelete) => {
        if (!setNameToDelete || setNameToDelete === quizDefaults.defaultSetName) {
            console.error(`Attempted to delete invalid or default quiz set: ${setNameToDelete}`);
            return;
        }
        if (quizSets && quizSets[setNameToDelete]) {
            const newSets = { ...quizSets };
            delete newSets[setNameToDelete];
            updateQuizSets(newSets);
            console.log(`Quiz set '${setNameToDelete}' deleted via useQuizData.`);

            if (activeQuizSetName === setNameToDelete) {
                console.log("Active quiz set deleted. Switching to default set.");
                loadQuizSet(quizDefaults.defaultSetName);
            }
        } else {
            console.error(`Attempted to delete non-existent quiz set: ${setNameToDelete}`);
        }
    }, [quizSets, activeQuizSetName, loadQuizSet]);

    const resetDefaultQuizSet = useCallback(() => {
        const defaultDataWithIds = quizDefaults.defaultData.map((item, index) => ({ ...item, id: item.id || `quiz_default_${index}` }));
        if (quizSets) {
            const newSets = { ...quizSets, [quizDefaults.defaultSetName]: defaultDataWithIds };
            updateQuizSets(newSets);
            console.log(`Quiz set '${quizDefaults.defaultSetName}' reset to defaults via useQuizData.`);
            if (activeQuizSetName === quizDefaults.defaultSetName) {
                setActiveQuizData(defaultDataWithIds);
            }
        }
    }, [quizSets, activeQuizSetName]);

    return {
        quizSets,
        activeQuizSetName,
        activeQuizData,
        loadQuizSet,
        saveQuizChanges,
        saveAsNewQuizSet,
        deleteQuizSet,
        resetDefaultQuizSet,
        isLoadingQuiz,
        quizDefaults,
    };
};
