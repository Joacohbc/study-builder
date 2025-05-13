import { useState, useEffect, useCallback } from 'react';
import { saveQuizProgress, loadQuizProgress, clearQuizProgress } from '../services/storageManager';
import { shuffleArray } from '../utils/helpers';

export const useQuizProgress = (activeQuizSetName, originalQuestions, isShuffleEnabled, isSubmitted) => {
    const [answers, setAnswers] = useState({});
    const [initialLoadedQuestionOrder, setInitialLoadedQuestionOrder] = useState(null);
    const [processedQuestions, setProcessedQuestions] = useState([]);

    // Effect to load progress when the active quiz set name changes
    useEffect(() => {
        if (activeQuizSetName) {
            console.log(`useQuizProgress: Attempting to load progress for ${activeQuizSetName}`);
            const savedProgress = loadQuizProgress(activeQuizSetName);
            if (savedProgress && savedProgress.questionOrder) {
                setAnswers(savedProgress.answers || {});
                setInitialLoadedQuestionOrder(savedProgress.questionOrder);
                // console.log(`useQuizProgress: Loaded progress for ${activeQuizSetName}. Answers:`, savedProgress.answers, "Order:", savedProgress.questionOrder);
            } else {
                setAnswers({}); // Reset if no progress found or order is missing
                setInitialLoadedQuestionOrder(null);
                // console.log(`useQuizProgress: No valid progress found for ${activeQuizSetName}, resetting answers and order.`);
            }
        } else {
            setAnswers({}); // Reset if no active quiz set name
            setInitialLoadedQuestionOrder(null);
            // console.log("useQuizProgress: No activeQuizSetName, resetting answers and order.");
        }
    }, [activeQuizSetName]);

    // Effect to determine and set the order of questions
    useEffect(() => {
        if (!originalQuestions || originalQuestions.length === 0) {
            setProcessedQuestions([]);
            return;
        }

        if (initialLoadedQuestionOrder && initialLoadedQuestionOrder.length > 0) {
            // console.log("useQuizProgress: Using initial loaded question order", initialLoadedQuestionOrder);
            setProcessedQuestions(initialLoadedQuestionOrder);
        } else if (isShuffleEnabled) {
            // console.log("useQuizProgress: Shuffling original questions", originalQuestions);
            setProcessedQuestions(shuffleArray(originalQuestions));
        } else {
            // console.log("useQuizProgress: Using original question order", originalQuestions);
            setProcessedQuestions(originalQuestions);
        }
    }, [originalQuestions, initialLoadedQuestionOrder, isShuffleEnabled]);


    // Effect to save progress when answers or processedQuestions change,
    // if the quiz is active and not submitted.
    useEffect(() => {
        // Save progress if we have an active set, it's not submitted, and there are processed questions.
        if (activeQuizSetName && !isSubmitted && processedQuestions && processedQuestions.length > 0) {
            // console.log(`useQuizProgress: Saving progress for ${activeQuizSetName}. Answers:`, answers, "Order:", processedQuestions);
            saveQuizProgress(activeQuizSetName, { answers, questionOrder: processedQuestions });
        } else if (activeQuizSetName && !isSubmitted && (!processedQuestions || processedQuestions.length === 0)) {
            // This case might occur if a quiz is loaded that has no questions.
            // We probably don't want to save progress for an empty quiz or if the order is somehow lost.
            // console.log(`useQuizProgress: Not saving progress for ${activeQuizSetName} due to empty/invalid processed questions.`);
        }
    }, [answers, processedQuestions, activeQuizSetName, isSubmitted]);

    const clearCurrentSavedProgress = useCallback(() => {
        if (activeQuizSetName) {
            // console.log(`useQuizProgress: Clearing saved progress for ${activeQuizSetName}`);
            clearQuizProgress(activeQuizSetName);
            setAnswers({});
            setInitialLoadedQuestionOrder(null); // This will trigger re-evaluation of processedQuestions
        }
    }, [activeQuizSetName]);

    // Function to explicitly discard loaded order, e.g., when user toggles shuffle ON
    const discardLoadedOrderAndShuffle = useCallback(() => {
        setInitialLoadedQuestionOrder(null);
        // The useEffect for processedQuestions will then re-shuffle if isShuffleEnabled is true
    }, []);

    return { answers, setAnswers, processedQuestions, clearCurrentSavedProgress, discardLoadedOrderAndShuffle };
};
