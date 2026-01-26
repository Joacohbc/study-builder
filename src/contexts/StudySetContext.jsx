import { createContext, useState } from 'react';
import { useQuizData } from '@/features/quiz/hooks/useQuizData';
import { useFlashcardData } from '@/features/flashcards/hooks/useFlashcardData';

const StudySetContext = createContext();

export const StudySetProvider = ({ children }) => {
    const [editorContentType, setEditorContentType] = useState('quiz'); // 'quiz' or 'flashcard'

    const quizHookData = useQuizData();
    const flashcardHookData = useFlashcardData();

    const handleLoadSet = (type, setName) => {
        if (type === 'quiz') {
            quizHookData.loadQuizSet(setName);
        } else if (type === 'flashcard') {
            flashcardHookData.loadFlashcardSet(setName);
        } else {
            console.error(`Invalid set type for load: ${type}`);
        }
    };

    const handleSaveChanges = (type, setName, updatedData) => {
        if (type === 'quiz') {
            return quizHookData.saveQuizChanges(setName, updatedData);
        } else if (type === 'flashcard') {
            return flashcardHookData.saveFlashcardChanges(setName, updatedData);
        }
        console.error(`Invalid set type for save changes: ${type}`);
        return false;
    };

    const handleSaveAsNewSet = (type, newSetName, dataToSave) => {
        if (type === 'quiz') {
            return quizHookData.saveAsNewQuizSet(newSetName, dataToSave);
        } else if (type === 'flashcard') {
            return flashcardHookData.saveAsNewFlashcardSet(newSetName, dataToSave);
        }
        console.error(`Invalid set type for save as new: ${type}`);
        return false;
    };

    const handleDeleteSet = (type, setNameToDelete) => {
        if (type === 'quiz') {
            quizHookData.deleteQuizSet(setNameToDelete);
        } else if (type === 'flashcard') {
            flashcardHookData.deleteFlashcardSet(setNameToDelete);
        } else {
            console.error(`Invalid set type for delete: ${type}`);
        }
    };

    const handleResetDefaultSet = (type) => {
        if (type === 'quiz') {
            quizHookData.resetDefaultQuizSet();
        } else if (type === 'flashcard') {
            flashcardHookData.resetDefaultFlashcardSet();
        } else {
            console.error(`Invalid set type for reset: ${type}`);
        }
    };

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
