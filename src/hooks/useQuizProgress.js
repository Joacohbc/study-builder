import { useState, useEffect, useCallback } from 'react';
import { saveQuizProgress, loadQuizProgress, clearQuizProgress } from '@/services/storageManager';
import { useShuffle } from '@/hooks/useShuffle';

export const useQuizProgress = (activeQuizSetName, originalQuestions, isSubmitted) => {
    const [answers, setAnswers] = useState({});
    const [initialLoadedQuestionOrder, setInitialLoadedQuestionOrder] = useState(null);
    const [processedQuestions, setProcessedQuestions] = useState([]);
    
    // Use the shuffle hook for order detection and shuffle functions
    const { 
        isInOriginalOrder,
        shuffle: shuffleFunction,
        resetOrder: resetOrderFunction 
    } = useShuffle(originalQuestions, processedQuestions);

    // Initialize processed questions
    useEffect(() => {
        if (initialLoadedQuestionOrder) {
            setProcessedQuestions(initialLoadedQuestionOrder);
        } else if (originalQuestions) {
            setProcessedQuestions([...originalQuestions]);
        }
    }, [initialLoadedQuestionOrder, originalQuestions]);

    // Wrapper functions that update the processed questions state
    const shuffle = useCallback(() => {
        const shuffledData = shuffleFunction();
        setProcessedQuestions(shuffledData);
    }, [shuffleFunction]);

    const resetOrder = useCallback(() => {
        const resetData = resetOrderFunction();
        setProcessedQuestions(resetData);
    }, [resetOrderFunction]);

    // Effect to load progress when the active quiz set name changes
    useEffect(() => {
        if (activeQuizSetName) {
            console.log(`useQuizProgress: Attempting to load progress for ${activeQuizSetName}`);
            const savedProgress = loadQuizProgress(activeQuizSetName);
            if (savedProgress && savedProgress.questionOrder) {
                setAnswers(savedProgress.answers || {});
                setInitialLoadedQuestionOrder(savedProgress.questionOrder);
            } else {
                setAnswers({});
                setInitialLoadedQuestionOrder(null);
            }
        } else {
            setAnswers({});
            setInitialLoadedQuestionOrder(null);
        }
    }, [activeQuizSetName]);

    // Effect to save progress when answers or processedQuestions change
    useEffect(() => {
        if (activeQuizSetName && !isSubmitted && processedQuestions && processedQuestions.length > 0) {
            saveQuizProgress(activeQuizSetName, { answers, questionOrder: processedQuestions });
        }
    }, [answers, processedQuestions, activeQuizSetName, isSubmitted]);

    const clearCurrentSavedProgress = useCallback(() => {
        if (activeQuizSetName) {
            clearQuizProgress(activeQuizSetName);
            setAnswers({});
            setInitialLoadedQuestionOrder(null);
        }
    }, [activeQuizSetName]);

    return { 
        answers, 
        setAnswers, 
        processedQuestions, 
        isInOriginalOrder,
        shuffle,
        resetOrder,
        clearCurrentSavedProgress 
    };
};
