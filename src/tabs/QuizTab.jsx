import React, { useState, useEffect, useCallback } from 'react';
import { useStudySets } from '../contexts/useStudySets'; // Import useStudySets
import { evaluateSingleQuestion } from '../services/evaluationService'; // Import the evaluation service
import CheckIcon from '../icons/CheckIcon';
import RefreshIcon from '../icons/RefreshIcon';
import QuizHeader from '../components/quizz/QuizHeader'; // Import the new QuizHeader component
import NoQuestions from '../components/quizz/NoQuestions'; // Import the new NoQuestions component
import QuestionList from '../components/quizz/QuestionList'; // Import the new QuestionList component
import QuizResults from '../components/quizz/QuizResults'; // Import the new QuizResults component

// Quiz Tab Component: Manages the quiz state, question rendering, and results
const QuizTab = ({ onQuizComplete }) => {
    const { 
        activeQuizData, 
        activeQuizSetName, 
        shuffledQuizData, 
        isShuffleEnabled, 
        toggleShuffle 
    } = useStudySets(); // Get data and shuffle logic from context

    // State to store user answers { questionId: answerValue }
    const [answers, setAnswers] = useState({});

    // State to track if the quiz has been submitted
    const [isSubmitted, setIsSubmitted] = useState(false);

    // State to store calculated results and feedback for the whole quiz
    const [results, setResults] = useState(null);

    // State to store feedback for individually checked questions
    const [individualFeedback, setIndividualFeedback] = useState({});

    // Effect to shuffle questions when the component mounts or activeQuizData changes - REMOVED, logic moved to context
    // Also reset state when activeQuizData changes (meaning a new set was loaded)
    useEffect(() => {
        // Reset quiz state if activeQuizData changes (new set loaded) or shuffle preference changes
        // Shuffling itself is now handled by the context
        setAnswers({});
        setIsSubmitted(false);
        setResults(null);
        setIndividualFeedback({}); // Reset individual feedback
    }, [activeQuizData, isShuffleEnabled]); // Dependency on activeQuizData and isShuffleEnabled (from context)

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
        const questionData = (shuffledQuizData || []).find(q => q.id === questionId); // Use shuffledQuizData
        const userAnswer = answers[questionId];
        if (questionData) {
            const feedback = evaluateSingleQuestion(questionData, userAnswer);
            setIndividualFeedback(prev => ({
                ...prev,
                [questionId]: feedback,
            }));
        }
    }, [shuffledQuizData, answers, evaluateSingleQuestion]);


    // Handle form submission: calculate score and generate feedback
    const handleSubmit = (event) => {
        event.preventDefault();
        if (isSubmitted) return; // Prevent re-submission

        let score = 0;
        const detailedFeedback = {}; // Store feedback for each question
        const currentQuestions = shuffledQuizData || []; // Use shuffledQuizData from context

        // Iterate over the current questions to evaluate
        currentQuestions.forEach(qData => {
            if (!qData || !qData.id) return; // Skip invalid question data
            const questionId = qData.id;
            const userAnswer = answers[questionId];
            // Use the evaluation function
            const feedback = evaluateSingleQuestion(qData, userAnswer);
            detailedFeedback[questionId] = feedback;
            if (feedback.isCorrect) {
                score++;
            }
        });

        // Compile final results object
        const finalResults = { score, total: currentQuestions.length, feedback: detailedFeedback };
        setResults(finalResults); // Update state with results
        setIsSubmitted(true); // Set submitted flag
        onQuizComplete(finalResults); // Notify parent component (optional)

        // Scroll smoothly to the results container
        const resultsElement = document.getElementById('results-container');
        if (resultsElement) { resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    };

    // Handle the "Retry" button click
    const handleRetry = () => {
        // Shuffling is handled by context, just reset other states
        setAnswers({}); // Clear answers
        setIsSubmitted(false); // Reset submission state
        setResults(null); // Clear results
        setIndividualFeedback({}); // Clear individual feedback
        window.scrollTo(0, 0); // Scroll to the top of the page
        // If shuffle is enabled, the context will provide a new shuffle on next render if activeQuizData changes.
        // If we want to force a re-shuffle even if activeQuizData hasn't changed,
        // we might need a dedicated "reshuffle" function in the context.
        // For now, this relies on the existing context logic.
    };

    // Calcular el porcentaje de respuestas contestadas
    const calculateCompletionPercentage = () => {
        if (!shuffledQuizData || shuffledQuizData.length === 0) return 0; // Use shuffledQuizData
        
        const answeredQuestions = shuffledQuizData.filter(q =>  // Use shuffledQuizData
            q.id && (
                answers[q.id] !== undefined && 
                answers[q.id] !== null && 
                (typeof answers[q.id] !== 'object' || 
                Object.keys(answers[q.id]).length > 0)
            )
        );
        
        // Return current and total for the ProgressBar component
        return { current: answeredQuestions.length, total: shuffledQuizData.length }; // Use shuffledQuizData
    };

    return (
        <div className="animate-fade-in">
            <QuizHeader
                activeSetName={activeQuizSetName}
                quizData={shuffledQuizData} // Use shuffledQuizData
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
                    onClick={toggleShuffle} // Use toggleShuffle from context
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isShuffleEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    aria-pressed={isShuffleEnabled}
                >
                    <span className="sr-only">Activar o desactivar barajado de preguntas</span>
                    <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isShuffleEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </button>
            </div>

            {(!shuffledQuizData || shuffledQuizData.length === 0) ? ( // Use shuffledQuizData
                <NoQuestions activeSetName={activeQuizSetName} />
            ) : (
                /* Render the quiz form */
                <form onSubmit={handleSubmit} className="space-y-8">
                    <QuestionList
                        questions={shuffledQuizData} // Use shuffledQuizData
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
                            <CheckIcon className="mr-2" />
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
                    shuffledQuestions={shuffledQuizData} // Use shuffledQuizData
                />
            )}
        </div>
    );
};

export default QuizTab;
