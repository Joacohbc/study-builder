import React, { useState, useEffect, useCallback } from 'react';
import { useStudySets } from '../contexts/useStudySets';
import { evaluateSingleQuestion } from '../services/evaluationService';
import QuizHeader from '../components/quizz/QuizHeader';
import NoQuestions from '../components/quizz/NoQuestions';
import QuestionList from '../components/quizz/QuestionList';
import QuizResults from '../components/quizz/QuizResults';
import ShuffleControls from '../components/common/ShuffleControls';
import { useQuizProgress } from '../hooks/useQuizProgress';
import CheckIcon from '../icons/CheckIcon';

// Quiz Tab Component: Manages the quiz state, question rendering, and results
const QuizTab = ({ onQuizComplete }) => {
    const { 
        activeQuizData, 
        activeQuizSetName
    } = useStudySets();

    // State to track if the quiz has been submitted
    const [isSubmitted, setIsSubmitted] = useState(false);

    // State to store calculated results and feedback for the whole quiz
    const [results, setResults] = useState(null);

    // State to store feedback for individually checked questions
    const [individualFeedback, setIndividualFeedback] = useState({});

    const {
        answers,
        setAnswers,
        processedQuestions,
        isInOriginalOrder,
        shuffle,
        resetOrder,
        clearCurrentSavedProgress
    } = useQuizProgress(activeQuizSetName, activeQuizData, isSubmitted);


    // Effect to reset state when activeQuizSetName changes
    useEffect(() => {
        setIsSubmitted(false);
        setResults(null);
        setIndividualFeedback({});
        window.scrollTo(0, 0);
    }, [activeQuizSetName]);

    // Callback to handle answer changes from single/multiple choice questions
    const handleAnswerChange = useCallback((questionId, value) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: value,
        }));
    }, []);

    // Callback to handle answer changes from matching questions
    const handleMatchChange = useCallback((questionId, definition, term) => {
        setAnswers(prevAnswers => {
            const currentMatches = prevAnswers[questionId] || {}; // Get current matches for this question
            const newMatches = { ...currentMatches };
            if (term === null) { delete newMatches[definition]; }
            else { Object.keys(newMatches).forEach(defKey => { if (newMatches[defKey] === term) { delete newMatches[defKey]; } }); newMatches[definition] = term; }
            return { ...prevAnswers, [questionId]: newMatches, };
        });
    }, []);

    // Callback to handle answer changes from fill-in-the-blanks questions
    const handleFillInTheBlanksChange = useCallback((questionId, blankId, value) => {
        setAnswers(prevAnswers => {
            const currentBlanks = prevAnswers[questionId] || {}; // Get current answers for this question
            const newBlanks = {
                ...currentBlanks,
                [blankId]: value, // Update the specific blank's value
            };
            return {
                ...prevAnswers,
                [questionId]: newBlanks,
            };
        });
    }, []);


    // --- Evaluation Logic ---

    // Handle checking a single question
    const handleCheckSingleQuestion = useCallback((questionId) => {
        const question = processedQuestions.find(q => q.id === questionId);
        if (!question) return;

        const answer = answers[questionId];
        if (question) {
            const feedback = evaluateSingleQuestion(question, answer);
            setIndividualFeedback(prevFeedback => ({
                ...prevFeedback,
                [questionId]: feedback
            }));
        }
    }, [processedQuestions, answers]);


    // Handle form submission: calculate score and generate feedback
    const handleSubmit = (event) => {
        event.preventDefault();
        if (isSubmitted) return;

        let correctAnswersCount = 0;
        const detailedFeedback = {};
        const totalQuestions = processedQuestions.length; // Use processedQuestions

        processedQuestions.forEach(question => { // Use processedQuestions
            const evaluation = evaluateSingleQuestion(question, answers[question.id]);
            if (evaluation.isCorrect) {
                correctAnswersCount++;
            }
            detailedFeedback[question.id] = {
                ...evaluation,
                userAnswer: answers[question.id] || null, // Ensure userAnswer is captured
                questionText: question.question, // Include question text for results display
                options: question.options, // Include options for context in results
                questionType: question.type // Include question type
            };
        });

        // Compile final results object
        const finalResults = { score: correctAnswersCount, total: totalQuestions, feedback: detailedFeedback };
        setResults(finalResults); // Update state with results
        setIsSubmitted(true); // Set submitted flag
        onQuizComplete(finalResults); // Notify parent component (optional)

        // Scroll smoothly to the results container
        const resultsElement = document.getElementById('results-container');
        if (resultsElement) { resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    };

    // Handle the "Retry" button click
    const handleRetry = () => {
        clearCurrentSavedProgress();
        setIsSubmitted(false);
        setResults(null);
        setIndividualFeedback({});
        window.scrollTo(0, 0);
    };

    // Calculate completion percentage
    const calculateCompletionPercentage = () => {
        if (!processedQuestions || processedQuestions.length === 0) return { current: 0, total: 0 };
        
        const answeredQuestions = processedQuestions.filter(q => 
            q.id && (
                answers[q.id] !== undefined && 
                answers[q.id] !== null && 
                (typeof answers[q.id] !== 'object' || 
                Object.keys(answers[q.id]).length > 0)
            )
        );
        
        return { current: answeredQuestions.length, total: processedQuestions.length };
    };

    const handleShuffle = () => {
        shuffle(); // Always shuffle when button is clicked
    };

    const handleResetOrder = () => {
        resetOrder(); // Reset to original order
    };

    return (
        <div className="animate-fade-in">
            <QuizHeader
                activeSetName={activeQuizSetName}
                quizData={processedQuestions} // Use processedQuestions
                isSubmitted={isSubmitted}
                completionPercentage={calculateCompletionPercentage()}
            />

            {/* Shuffle Controls for Quiz */}
            <ShuffleControls
                onShuffle={handleShuffle}
                onResetOrder={handleResetOrder}
                isInOriginalOrder={isInOriginalOrder}
                shuffleLabel="Barjar preguntas"
                resetLabel="Orden original"
            />

            {(!processedQuestions || processedQuestions.length === 0) ? (
                <NoQuestions activeSetName={activeQuizSetName} />
            ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                    <QuestionList
                        questions={processedQuestions}
                        answers={answers}
                        individualFeedback={individualFeedback}
                        isSubmitted={isSubmitted}
                        results={results}
                        handleAnswerChange={handleAnswerChange}
                        handleMatchChange={handleMatchChange}
                        handleFillInTheBlanksChange={handleFillInTheBlanksChange}
                        handleCheckSingleQuestion={handleCheckSingleQuestion}
                    />

                    {/* Submit Button */}
                    <div className="mt-10 text-center">
                        <button 
                            type="submit" 
                            disabled={isSubmitted} 
                            className={`inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-medium py-3 px-8 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ${
                                isSubmitted ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <CheckIcon />
                            {isSubmitted ? 'Respuestas Enviadas' : 'Enviar Respuestas'}
                        </button>
                    </div>
                </form>
            )}

            {isSubmitted && results && (
                <QuizResults
                    results={results}
                    activeSetName={activeQuizSetName}
                    onRetry={handleRetry}
                    shuffledQuestions={processedQuestions}
                />
            )}
        </div>
    );
};

export default QuizTab;
