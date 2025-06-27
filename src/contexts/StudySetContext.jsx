import React, { createContext, useState, useCallback } from 'react';
import { useQuizData } from '@/hooks/useQuizData';
import { useFlashcardData } from '@/hooks/useFlashcardData';

const StudySetContext = createContext();

export const StudySetProvider = ({ children }) => {
    const [editorContentType, setEditorContentType] = useState('quiz'); // 'quiz' or 'flashcard'

    const quizHookData = useQuizData();
    const flashcardHookData = useFlashcardData();

    const handleLoadSet = useCallback((type, setName) => {
        if (type === 'quiz') {
            quizHookData.loadQuizSet(setName);
        } else if (type === 'flashcard') {
            flashcardHookData.loadFlashcardSet(setName);
        } else {
            console.error(`Invalid set type for load: ${type}`);
        }
    }, [quizHookData, flashcardHookData]);

    const handleSaveChanges = useCallback((type, setName, updatedData) => {
        if (type === 'quiz') {
            return quizHookData.saveQuizChanges(setName, updatedData);
        } else if (type === 'flashcard') {
            return flashcardHookData.saveFlashcardChanges(setName, updatedData);
        }
        console.error(`Invalid set type for save changes: ${type}`);
        return false;
    }, [quizHookData, flashcardHookData]);

    const handleSaveAsNewSet = useCallback((type, newSetName, dataToSave) => {
        if (type === 'quiz') {
            return quizHookData.saveAsNewQuizSet(newSetName, dataToSave);
        } else if (type === 'flashcard') {
            return flashcardHookData.saveAsNewFlashcardSet(newSetName, dataToSave);
        }
        console.error(`Invalid set type for save as new: ${type}`);
        return false;
    }, [quizHookData, flashcardHookData]);

    const handleDeleteSet = useCallback((type, setNameToDelete) => {
        if (type === 'quiz') {
            quizHookData.deleteQuizSet(setNameToDelete);
        } else if (type === 'flashcard') {
            flashcardHookData.deleteFlashcardSet(setNameToDelete);
        } else {
            console.error(`Invalid set type for delete: ${type}`);
        }
    }, [quizHookData, flashcardHookData]);

    const handleResetDefaultSet = useCallback((type) => {
        if (type === 'quiz') {
            quizHookData.resetDefaultQuizSet();
        } else if (type === 'flashcard') {
            flashcardHookData.resetDefaultFlashcardSet();
        } else {
            console.error(`Invalid set type for reset: ${type}`);
        }
    }, [quizHookData, flashcardHookData]);

    const value = {
        // Quiz data and functions from useQuizData
        quizSets: quizHookData.quizSets,
        activeQuizSetName: quizHookData.activeQuizSetName,
        activeQuizData: quizHookData.activeQuizData,
        isLoadingQuiz: quizHookData.isLoadingQuiz,
        quizDefaults: quizHookData.quizDefaults,

        // Flashcard data and functions from useFlashcardData
        flashcardSets: flashcardHookData.flashcardSets,
        activeFlashcardSetName: flashcardHookData.activeFlashcardSetName,
        activeFlashcardData: flashcardHookData.activeFlashcardData,
        isLoadingFlashcards: flashcardHookData.isLoadingFlashcards,
        flashcardDefaults: flashcardHookData.flashcardDefaults,

        // Editor content type
        editorContentType,
        setEditorContentType,

        // Generic handlers
        handleLoadSet,
        handleSaveChanges,
        handleSaveAsNewSet,
        handleDeleteSet,
        handleResetDefaultSet,

        // Combined loading state
        isLoading: quizHookData.isLoadingQuiz || flashcardHookData.isLoadingFlashcards,
    };

    return (
        <StudySetContext.Provider value={value}>
            {children}
        </StudySetContext.Provider>
    );
};

export { StudySetContext };
