import React, { useState, useEffect, useCallback } from 'react';
import { useStudySets } from '../contexts/useStudySets'; // Import useStudySets
import { evaluateSingleQuestion } from '../services/evaluationService'; // Import the evaluation service
import QuizHeader from '../components/quizz/QuizHeader'; // Import the new QuizHeader component
import NoQuestions from '../components/quizz/NoQuestions'; // Import the new NoQuestions component
import QuestionList from '../components/quizz/QuestionList'; // Import the new QuestionList component
import QuizResults from '../components/quizz/QuizResults'; // Import the new QuizResults component
import { useQuizProgress } from '../hooks/useQuizProgress'; // Added import
import CheckIcon from '../icons/CheckIcon';

// Quiz Tab Component: Manages the quiz state, question rendering, and results
const QuizTab = ({ onQuizComplete }) => {
    const { 
        activeQuizData, 
        activeQuizSetName, 
        // shuffledQuizData, // No longer directly used for rendering, processedQuestions will be used
        isShuffleEnabled, 
        toggleShuffle: toggleShuffleInStudySets // Renamed to avoid conflict
    } = useStudySets();
    // State to store user answers { questionId: answerValue } - REMOVED, now from useQuizProgress
    // const [answers, setAnswers] = useState({});

    // State to track if the quiz has been submitted
    const [isSubmitted, setIsSubmitted] = useState(false);

    // State to store calculated results and feedback for the whole quiz
    const [results, setResults] = useState(null);

    // State to store feedback for individually checked questions
    const [individualFeedback, setIndividualFeedback] = useState({});

    const {
        answers,
        setAnswers,
        processedQuestions, // This will be used instead of shuffledQuizData
        clearCurrentSavedProgress,
        discardLoadedOrderAndShuffle
    } = useQuizProgress(activeQuizSetName, activeQuizData, isShuffleEnabled, isSubmitted);


    // Effect to shuffle questions when the component mounts or activeQuizData changes - REMOVED, logic moved to context/useQuizProgress
    // Also reset state when activeQuizData changes (meaning a new set was loaded)
    useEffect(() => {
        // console.log("QuizTab: activeQuizSetName changed, resetting tab-specific state.");
        setIsSubmitted(false);
        setResults(null);
        setIndividualFeedback({});
        // Answers and question order are reset by useQuizProgress based on activeQuizSetName
        window.scrollTo(0, 0);
    }, [activeQuizSetName]); // Listen to activeQuizSetName

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
        const question = processedQuestions.find(q => q.id === questionId); // Use processedQuestions
        if (!question) return;

        const answer = answers[questionId];
        if (question) {
            const feedback = evaluateSingleQuestion(question, answer);
            setIndividualFeedback(prevFeedback => ({
                ...prevFeedback,
                [questionId]: feedback
            }));
        }
    }, [processedQuestions, answers, evaluateSingleQuestion]); // Dependency updated


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
        clearCurrentSavedProgress(); // Clears saved progress and resets answers/order in useQuizProgress
        setIsSubmitted(false); // Reset submission state
        setResults(null); // Clear results
        setIndividualFeedback({}); // Clear individual feedback
        window.scrollTo(0, 0); // Scroll to the top of the page
    };

    // Calcular el porcentaje de respuestas contestadas
    const calculateCompletionPercentage = () => {
        if (!processedQuestions || processedQuestions.length === 0) return { current: 0, total: 0 }; // Use processedQuestions
        
        const answeredQuestions = processedQuestions.filter(q =>  // Use processedQuestions
            q.id && (
                answers[q.id] !== undefined && 
                answers[q.id] !== null && 
                (typeof answers[q.id] !== 'object' || 
                Object.keys(answers[q.id]).length > 0)
            )
        );
        
        return { current: answeredQuestions.length, total: processedQuestions.length }; // Use processedQuestions
    };

    const handleToggleShuffle = () => {
        const newShuffleState = !isShuffleEnabled;
        toggleShuffleInStudySets(); // Update context state

        if (newShuffleState) {
            // If shuffle is being turned ON, discard any loaded order to force a fresh shuffle.
            discardLoadedOrderAndShuffle();
        }
        // If shuffle is turned OFF, useQuizProgress will use its logic to determine order
        // (either loaded order if available and not shuffled, or original order).
    };

    return (
        <div className="animate-fade-in">
            <QuizHeader
                activeSetName={activeQuizSetName}
                quizData={processedQuestions} // Use processedQuestions
                isSubmitted={isSubmitted}
                completionPercentage={calculateCompletionPercentage()}
            />

            {/* Shuffle Toggle Switch for Quiz */}
            <div className="flex items-center justify-center space-x-2 my-4">
                <label htmlFor="quiz-shuffle-toggle" className="text-sm text-gray-600">
                    Barajar preguntas:
                </label>
                <button
                    id="quiz-shuffle-toggle"
                    onClick={handleToggleShuffle} // Use new handler
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isShuffleEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    aria-pressed={isShuffleEnabled}
                >
                    <span className="sr-only">Activar o desactivar barajado de preguntas</span>
                    <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isShuffleEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </button>
            </div>

            {(!processedQuestions || processedQuestions.length === 0) ? ( // Use processedQuestions
                <NoQuestions activeSetName={activeQuizSetName} />
            ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                    <QuestionList
                        questions={processedQuestions} // Use processedQuestions
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
                            className={`inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-medium py-3 px-8 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ${
                                isSubmitted ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <button className="flex items-center gap-2">
                                <CheckIcon />
                                {isSubmitted ? 'Respuestas Enviadas' : 'Enviar Respuestas'}
                            </button>
                        </button>
                    </div>
                </form>
            )}

            {isSubmitted && results && (
                <QuizResults
                    results={results}
                    activeSetName={activeQuizSetName}
                    onRetry={handleRetry}
                    shuffledQuestions={processedQuestions} // Use processedQuestions, consider renaming prop later
                />
            )}
        </div>
    );
};

export default QuizTab;
