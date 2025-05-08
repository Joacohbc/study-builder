import React, { useState, useEffect, useCallback } from 'react';
import { shuffleArray } from '../utils/helpers';
import CheckIcon from './icons/CheckIcon';
import RefreshIcon from './icons/RefreshIcon';
import QuizHeader from './QuizHeader'; // Import the new QuizHeader component
import NoQuestions from './NoQuestions'; // Import the new NoQuestions component
import QuestionList from './QuestionList'; // Import the new QuestionList component
import QuizResults from './QuizResults'; // Import the new QuizResults component

// Quiz Tab Component: Manages the quiz state, question rendering, and results
const QuizTab = ({ quizData, onQuizComplete, activeSetName }) => {
    // State for shuffled questions to display
    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    // State to store user answers { questionId: answerValue }
    const [answers, setAnswers] = useState({});
    // State to track if the quiz has been submitted
    const [isSubmitted, setIsSubmitted] = useState(false);
    // State to store calculated results and feedback for the whole quiz
    const [results, setResults] = useState(null); // { score, total, feedback: { questionId: {...} } }
    // State to store feedback for individually checked questions
    const [individualFeedback, setIndividualFeedback] = useState({}); // { questionId: feedbackObject }

    // Effect to shuffle questions when the component mounts or quizData changes
    // Also reset state when quizData changes (meaning a new set was loaded)
    useEffect(() => {
        setShuffledQuestions(shuffleArray(quizData || [])); // Ensure quizData is an array
        // Reset quiz state if quizData changes
        setAnswers({});
        setIsSubmitted(false);
        setResults(null);
        setIndividualFeedback({}); // Reset individual feedback
    }, [quizData]); // Dependency on quizData

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

    // Function to evaluate a single question based on its type and user answer
    const evaluateSingleQuestion = useCallback((qData, userAnswer) => {
        if (!qData || !qData.id) return { isCorrect: false, error: "Invalid question data." };

        let isCorrect = false;
        let questionFeedback = { isAnswered: false }; // Initialize feedback object

        try {
            if (qData.type === 'single') {
                questionFeedback.isAnswered = userAnswer !== undefined && userAnswer !== null && userAnswer !== '';
                isCorrect = questionFeedback.isAnswered && userAnswer === qData.correctAnswer;
                questionFeedback.correctAnswer = qData.correctAnswer;
                questionFeedback.userAnswer = userAnswer;
            } else if (qData.type === 'multiple') {
                const correctAnswers = qData.correctAnswers || [];
                const selectedAnswers = Array.isArray(userAnswer) ? userAnswer : [];
                questionFeedback.isAnswered = selectedAnswers.length > 0;
                isCorrect = questionFeedback.isAnswered && selectedAnswers.length === correctAnswers.length && correctAnswers.every(answer => selectedAnswers.includes(answer));
                questionFeedback.correctAnswers = correctAnswers;
                questionFeedback.userAnswers = selectedAnswers;
            } else if (qData.type === 'matching') {
                const userMatches = typeof userAnswer === 'object' && userAnswer !== null ? userAnswer : {};
                const correctMatches = qData.correctMatches || {};
                const totalTerms = qData.terms?.length || 0;
                let correctMatchCount = 0; let answeredMatchCount = 0;
                questionFeedback.definitionFeedback = {}; questionFeedback.unplacedTerms = [...(qData.terms || [])];
                (qData.definitions || []).forEach(definition => {
                    const droppedTerm = userMatches[definition] || null;
                    // Find the correct term for this definition
                    const correctTerm = Object.keys(correctMatches).find(termKey => correctMatches[termKey] === definition) || null;
                    if (droppedTerm) {
                        answeredMatchCount++;
                        // Check if the dropped term correctly matches this definition
                        const isMatchCorrect = correctMatches[droppedTerm] === definition;
                        if (isMatchCorrect) { correctMatchCount++; }
                        questionFeedback.definitionFeedback[definition] = { userTerm: droppedTerm, correctTerm: correctTerm, isCorrect: isMatchCorrect };
                        questionFeedback.unplacedTerms = questionFeedback.unplacedTerms.filter(t => t !== droppedTerm);
                    } else {
                        questionFeedback.definitionFeedback[definition] = { userTerm: null, correctTerm: correctTerm, isCorrect: false };
                    }
                });
                questionFeedback.isAnswered = answeredMatchCount > 0 || questionFeedback.unplacedTerms.length < totalTerms;
                isCorrect = totalTerms > 0 && correctMatchCount === totalTerms && questionFeedback.unplacedTerms.length === 0;
                questionFeedback.correctMatchesCount = correctMatchCount; questionFeedback.totalMatches = totalTerms;
            } else if (qData.type === 'fill-in-the-blanks') {
                const userBlanks = typeof userAnswer === 'object' && userAnswer !== null ? userAnswer : {};
                const correctBlanks = qData.blanks || {};
                const blankIds = Object.keys(correctBlanks);
                let correctBlanksCount = 0;
                let answeredBlanksCount = 0;
                questionFeedback.blankFeedback = {}; // Store feedback per blank

                blankIds.forEach(blankId => {
                    const userAnswerForBlank = userBlanks[blankId] || null;
                    const correctAnswerForBlank = correctBlanks[blankId]?.correctAnswer;
                    const isBlankAnswered = userAnswerForBlank !== null && userAnswerForBlank !== "";
                    const isBlankCorrect = isBlankAnswered && userAnswerForBlank === correctAnswerForBlank;

                    if (isBlankAnswered) {
                        answeredBlanksCount++;
                    }
                    if (isBlankCorrect) {
                        correctBlanksCount++;
                    }
                    questionFeedback.blankFeedback[blankId] = {
                        userAnswer: userAnswerForBlank,
                        correctAnswer: correctAnswerForBlank,
                        isCorrect: isBlankCorrect
                    };
                });

                questionFeedback.isAnswered = answeredBlanksCount > 0;
                // Considered correct only if all blanks are answered correctly
                isCorrect = blankIds.length > 0 && correctBlanksCount === blankIds.length;
                questionFeedback.correctBlanksCount = correctBlanksCount;
                questionFeedback.totalBlanks = blankIds.length;
            }

            questionFeedback.isCorrect = isCorrect;

        } catch (error) {
            console.error(`Error evaluating question ${qData.id}:`, error, qData);
            questionFeedback.error = "Error al evaluar esta pregunta.";
            questionFeedback.isCorrect = false;
        }
        return questionFeedback;
    }, []); // Dependencies: none, as it only uses arguments

    // Handle checking a single question
    const handleCheckSingleQuestion = useCallback((questionId) => {
        const questionData = (quizData || []).find(q => q.id === questionId);
        const userAnswer = answers[questionId];
        if (questionData) {
            const feedback = evaluateSingleQuestion(questionData, userAnswer);
            setIndividualFeedback(prev => ({
                ...prev,
                [questionId]: feedback,
            }));
        }
    }, [quizData, answers, evaluateSingleQuestion]);


    // Handle form submission: calculate score and generate feedback
    const handleSubmit = (event) => {
        event.preventDefault();
        if (isSubmitted) return; // Prevent re-submission

        let score = 0;
        const detailedFeedback = {}; // Store feedback for each question
        const currentQuestions = quizData || []; // Use the currently loaded data

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
        setShuffledQuestions(shuffleArray(quizData || [])); // Reshuffle questions from the current set
        setAnswers({}); // Clear answers
        setIsSubmitted(false); // Reset submission state
        setResults(null); // Clear results
        setIndividualFeedback({}); // Clear individual feedback
        window.scrollTo(0, 0); // Scroll to the top of the page
    };

    // Calcular el porcentaje de respuestas contestadas
    const calculateCompletionPercentage = () => {
        if (!quizData || quizData.length === 0) return 0;
        
        const answeredQuestions = shuffledQuestions.filter(q => 
            q.id && (
                answers[q.id] !== undefined && 
                answers[q.id] !== null && 
                (typeof answers[q.id] !== 'object' || 
                Object.keys(answers[q.id]).length > 0)
            )
        );
        
        // Return current and total for the ProgressBar component
        return { current: answeredQuestions.length, total: shuffledQuestions.length };
    };

    return (
        <div className="animate-fade-in">
            <QuizHeader
                activeSetName={activeSetName}
                quizData={quizData}
                isSubmitted={isSubmitted}
                completionPercentage={calculateCompletionPercentage()}
            />

            {(!quizData || quizData.length === 0) ? (
                <NoQuestions activeSetName={activeSetName} />
            ) : (
                /* Render the quiz form */
                <form onSubmit={handleSubmit} className="space-y-8">
                    <QuestionList
                        questions={shuffledQuestions}
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
                    activeSetName={activeSetName}
                    onRetry={handleRetry}
                    shuffledQuestions={shuffledQuestions}
                />
            )}
        </div>
    );
};

export default QuizTab;
