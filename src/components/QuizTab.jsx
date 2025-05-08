import React, { useState, useEffect, useCallback } from 'react';
import { shuffleArray } from '../utils/helpers';
import SingleChoiceQuestion from './questions/SingleChoiceQuestion';
import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion';
import MatchingQuestion from './questions/MatchingQuestion';
import FillInTheBlanksQuestion from './questions/FillInTheBlanksQuestion';
import CheckIcon from './icons/CheckIcon';
import RefreshIcon from './icons/RefreshIcon';
import QuestionIcon from './icons/QuestionIcon';
import TrophyIcon from './icons/TrophyIcon';

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
        // console.log("QuizTab useEffect triggered. New quizData length:", quizData?.length);
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
        
        return Math.round((answeredQuestions.length / shuffledQuestions.length) * 100);
    };

    return (
        <div className="animate-fade-in">
            {/* Header with visual indicators */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <span className="mr-2 text-indigo-600"><QuestionIcon /></span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                            {activeSetName || 'Sin título'}
                        </span>
                    </h2>
                    {quizData && quizData.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                            {quizData.length} {quizData.length === 1 ? 'pregunta' : 'preguntas'} en este cuestionario
                        </p>
                    )}
                </div>

                {/* Progress indicator */}
                {!isSubmitted && quizData && quizData.length > 0 && (
                    <div className="mt-4 md:mt-0 w-full md:w-60">
                        <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                            <span>Progreso</span>
                            <span>{calculateCompletionPercentage()}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-gradient-to-r from-indigo-600 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${calculateCompletionPercentage()}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Show message if no questions are loaded */}
            {(!quizData || quizData.length === 0) ? (
                <div className="bg-gray-50 p-8 rounded-xl shadow-inner text-center">
                    <div className="text-gray-400 flex justify-center mb-4">
                        <QuestionIcon />
                    </div>
                    <p className="text-center text-gray-800 font-medium mb-2">
                        No hay preguntas en el set activo
                    </p>
                    <p className="text-gray-600 mb-6">
                        <span className="font-semibold">"{activeSetName}"</span> no contiene preguntas. 
                        Carga otro set o edita este en la pestaña "Editor de Sets".
                    </p>
                    <button 
                        onClick={() => {
                            // Find and click the Editor tab button
                            const tabButton = document.querySelector('button[class*="border-indigo-600"]');
                            if (tabButton) tabButton.click();
                        }}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 font-medium rounded-lg hover:bg-indigo-200 transition-colors duration-200"
                    >
                        Ir al Editor
                    </button>
                </div>
            ) : (
                /* Render the quiz form */
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div id="quiz-container" className="space-y-8">
                        {/* Map over shuffled questions to render each one */}
                        {shuffledQuestions.map((qData, index) => {
                            if (!qData || !qData.id) return (
                                <p key={`error-${index}`} className="text-red-500">Error: Datos de pregunta inválidos.</p>
                            ); // Basic check

                            const isIndividuallyChecked = !!individualFeedback[qData.id];
                            // Determine the feedback to show: individual first, then overall results if submitted
                            const questionFeedback = individualFeedback[qData.id] || (isSubmitted ? results?.feedback?.[qData.id] : null);
                            // Determine if inputs should be disabled
                            const isDisabled = isSubmitted || isIndividuallyChecked;

                            // Determine question status for styling
                            let questionStatus = '';
                            let statusBgClass = 'bg-white';
                            let statusBorderClass = 'border-gray-200';

                            if (questionFeedback) {
                                if (questionFeedback.isCorrect) {
                                    questionStatus = 'Correcta';
                                    statusBgClass = 'bg-green-50';
                                    statusBorderClass = 'border-green-200';
                                } else if (questionFeedback.isAnswered) {
                                    questionStatus = 'Incorrecta';
                                    statusBgClass = 'bg-red-50';
                                    statusBorderClass = 'border-red-200';
                                } else {
                                    questionStatus = 'Sin responder';
                                    statusBgClass = 'bg-yellow-50';
                                    statusBorderClass = 'border-yellow-200';
                                }
                            }

                            return (
                                <div 
                                    key={qData.id} 
                                    className={`p-6 rounded-xl shadow-sm border transition-all duration-300 ${statusBgClass} ${statusBorderClass} hover:shadow-md`}
                                    data-question-index={index}
                                >
                                    <div className="flex flex-wrap justify-between items-start mb-4">
                                        {/* Question Title with Question Number Badge */}
                                        <div className="flex items-center mb-2 md:mb-0">
                                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 font-medium text-sm mr-3">
                                                {index + 1}
                                            </span>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {qData.type === 'fill-in-the-blanks' ? "Completa la frase:" : qData.question}
                                            </h3>
                                        </div>

                                        {/* Question Status Badge - Only shown if feedback exists */}
                                        {questionStatus && (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                ${questionFeedback?.isCorrect ? 'bg-green-100 text-green-800' : 
                                                  questionFeedback?.isAnswered ? 'bg-red-100 text-red-800' : 
                                                  'bg-yellow-100 text-yellow-800'}`}>
                                                {questionStatus}
                                            </span>
                                        )}
                                    </div>

                                    {/* Container for options/matching areas */}
                                    <div className="options-container mt-4">
                                        {/* Render specific component based on question type */}
                                        {qData.type === 'single' && (
                                            <SingleChoiceQuestion 
                                                questionData={qData} 
                                                questionIndex={index} 
                                                selectedAnswer={answers[qData.id] || ''} 
                                                onChange={handleAnswerChange} 
                                                isSubmitted={isDisabled} 
                                                feedback={questionFeedback} 
                                                isIndividuallyChecked={isIndividuallyChecked} 
                                            />
                                        )}
                                        {qData.type === 'multiple' && (
                                            <MultipleChoiceQuestion 
                                                questionData={qData} 
                                                questionIndex={index} 
                                                selectedAnswers={answers[qData.id] || []} 
                                                onChange={handleAnswerChange} 
                                                isSubmitted={isDisabled} 
                                                feedback={questionFeedback} 
                                                isIndividuallyChecked={isIndividuallyChecked} 
                                            />
                                        )}
                                        {qData.type === 'matching' && (
                                            <MatchingQuestion 
                                                questionData={qData} 
                                                questionIndex={index} 
                                                matches={answers[qData.id] || {}} 
                                                onMatchChange={handleMatchChange} 
                                                isSubmitted={isDisabled} 
                                                feedback={questionFeedback} 
                                                isIndividuallyChecked={isIndividuallyChecked} 
                                            />
                                        )}
                                        {/* Render FillInTheBlanksQuestion */}
                                        {qData.type === 'fill-in-the-blanks' && (
                                            <FillInTheBlanksQuestion
                                                questionData={qData}
                                                questionIndex={index}
                                                selectedAnswers={answers[qData.id] || {}}
                                                onChange={handleFillInTheBlanksChange} // Use the specific handler
                                                isSubmitted={isDisabled}
                                                feedback={questionFeedback}
                                                isIndividuallyChecked={isIndividuallyChecked}
                                            />
                                        )}
                                    </div>
                                    
                                    {/* Display evaluation error message if it occurred */}
                                    {(isSubmitted || isIndividuallyChecked) && questionFeedback?.error && (
                                        <p className="mt-3 text-sm text-red-600 font-medium">{questionFeedback.error}</p>
                                    )}

                                    {/* Add Check Answer Button */}
                                    {!isSubmitted && (
                                        <div className="mt-4">
                                            <button
                                                type="button"
                                                onClick={() => handleCheckSingleQuestion(qData.id)}
                                                disabled={isIndividuallyChecked}
                                                className={`flex items-center px-4 py-2 text-sm rounded-lg shadow-sm transition duration-200 
                                                    ${isIndividuallyChecked 
                                                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                                    }`}
                                            >
                                                <CheckIcon className="mr-1" />
                                                {isIndividuallyChecked ? 'Respuesta Revisada' : 'Revisar Respuesta'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

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

            {/* Results Section (conditionally rendered after submission) */}
            {isSubmitted && results && (
                (() => {
                    // Calculate clipPath for the score circle
                    const percentage = results.total > 0 ? Math.min(results.score / results.total, 1) : 0;
                    const angle = (percentage * 2 * Math.PI) - (Math.PI / 2); // Start from 12 o'clock
                    const Px = 50 + 50 * Math.cos(angle);
                    const Py = 50 + 50 * Math.sin(angle);

                    let points = ['50% 50%', '50% 0%']; // Center, Top-Mid

                    if (percentage > 0.25) { points.push('100% 0%'); } // Past 1st quadrant (East)
                    if (percentage > 0.50) { points.push('100% 100%'); }  // Past 2nd quadrant (South)
                    if (percentage > 0.75) { points.push('0% 100%'); }   // Past 3rd quadrant (West)

                    points.push(`${Px}% ${Py}%`); // Final arc point
                    const clipPathValue = `polygon(${points.join(', ')})`;

                    return (
                        <div
                            id="results-container"
                            className="mt-12 p-8 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg border border-gray-200 animate-fade-in"
                        >
                            <div className="flex justify-center mb-6">
                                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                                    <TrophyIcon />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 mb-2">
                                Resultados
                            </h2>
                            <p className="text-center text-gray-600 mb-6">
                                {activeSetName}
                            </p>

                            {/* Score display with visual graph */}
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative h-32 w-32">
                                    {/* Background circle */}
                                    <div className="absolute inset-0 rounded-full bg-gray-100"></div>

                                    {/* Score circle with animation */}
                                    <div
                                        className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-1000 ease-out"
                                        style={{
                                            clipPath: clipPathValue
                                        }}
                                    ></div>

                                    {/* Inner white circle */}
                                    <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-gray-800">{results.score}</div>
                                            <div className="text-xs text-gray-500">de {results.total}</div>
                                        </div>
                                    </div>
                                </div> {/* Closing div for "relative h-32 w-32" */}

                                <p className="text-center mt-4">
                                    <span className="text-xl font-bold text-gray-800">
                                        {results.total > 0 ? Math.round((results.score / results.total) * 100) : 0}%
                                    </span>
                                    <span className="text-gray-600 ml-1 text-sm">
                                        de aciertos
                                    </span>
                                </p>
                            </div> {/* Closing div for "flex flex-col items-center mb-8" */}

                            {/* Container for detailed feedback (optional, basic feedback shown here) */}
                            <div id="feedback" className="space-y-4 max-w-2xl mx-auto">
                                <h3 className="text-lg font-medium text-gray-800 mb-2">Detalle de respuestas</h3>
                                
                                {/* Map over the *shuffled* questions again to show feedback in displayed order */}
                                {shuffledQuestions.map((qData, index) => {
                                    if (!qData || !qData.id) return null; // Skip if invalid
                                    const feedback = results.feedback[qData.id];
                                    if (!feedback) return null; // Should not happen

                                    let feedbackClass = 'p-4 border rounded-lg mb-4 transition-all duration-200 '; 
                                    let feedbackText = '';
                                    let questionTitle = qData.question;
                                    
                                    if (qData.type === 'fill-in-the-blanks') {
                                        questionTitle = "Completa la frase (Pregunta " + (index + 1) + ")";
                                    }

                                    if (feedback.error) { 
                                        feedbackClass += 'bg-red-50 border-red-200 hover:border-red-300'; 
                                        feedbackText = feedback.error; 
                                    }
                                    else if (feedback.isCorrect) { 
                                        feedbackClass += 'bg-green-50 border-green-200 hover:border-green-300'; 
                                        feedbackText = '¡Correcto!'; 
                                    }
                                    else if (feedback.isAnswered) {
                                        feedbackClass += 'bg-red-50 border-red-200 hover:border-red-300'; 
                                        feedbackText = 'Incorrecto.';
                                        if (qData.type === 'single') feedbackText += ` La respuesta correcta es: ${feedback.correctAnswer}`;
                                        if (qData.type === 'multiple') feedbackText += ` Las respuestas correctas son: ${(feedback.correctAnswers || []).join(', ')}`;
                                        
                                        // Add feedback for fill-in-the-blanks
                                        if (qData.type === 'fill-in-the-blanks') {
                                            const correctAnswersSummary = Object.entries(qData.blanks)
                                                .map(([id, data]) => `[${id}]: ${data.correctAnswer}`)
                                                .join(', ');
                                            feedbackText += ` Respuestas correctas: ${correctAnswersSummary}`;
                                        }
                                        
                                        // Add feedback for matching
                                        if (qData.type === 'matching') {
                                            feedbackText += ` Revisa las uniones correctas arriba.`;
                                        }
                                    }
                                    else { // Not answered
                                        feedbackClass += 'bg-yellow-50 border-yellow-200 hover:border-yellow-300'; 
                                        feedbackText = 'No respondida.';
                                        if (qData.type === 'single') feedbackText += ` La respuesta correcta es: ${feedback.correctAnswer}`;
                                        if (qData.type === 'multiple') feedbackText += ` Las respuestas correctas son: ${(feedback.correctAnswers || []).join(', ')}`;
                                        if (qData.type === 'fill-in-the-blanks') {
                                            const correctAnswersSummary = Object.entries(qData.blanks)
                                                .map(([id, data]) => `[${id}]: ${data.correctAnswer}`)
                                                .join(', ');
                                            feedbackText += ` Respuestas correctas: ${correctAnswersSummary}`;
                                        }
                                        if (qData.type === 'matching') {
                                            feedbackText += ` Revisa las uniones correctas arriba.`;
                                        }
                                    }

                                    return (
                                        <div key={`feedback-${qData.id}`} className={feedbackClass}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-800 font-medium text-sm mr-3">
                                                        {index + 1}
                                                    </span>
                                                    <p className="font-medium text-gray-800">{questionTitle}</p>
                                                </div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                    ${feedback.isCorrect ? 'bg-green-100 text-green-800' : 
                                                      feedback.isAnswered ? 'bg-red-100 text-red-800' : 
                                                      'bg-yellow-100 text-yellow-800'}`}>
                                                    {feedback.isCorrect ? 'Correcto' : feedback.isAnswered ? 'Incorrecto' : 'Sin responder'}
                                                </span>
                                            </div>
                                            <p className={`mt-2 text-sm ${feedback.isCorrect ? 'text-green-700' : feedback.isAnswered ? 'text-red-700' : 'text-yellow-700'}`}>
                                                {feedbackText}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="mt-8 flex justify-center">
                                <button 
                                    id="retry-button" 
                                    onClick={handleRetry} 
                                    className="flex items-center bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-medium py-2 px-6 rounded-lg transition-all duration-200" 
                                >
                                    <RefreshIcon className="mr-2" />
                                    Intentar de Nuevo
                                </button>
                            </div>
                        </div>
                    );
                })()
            )}
        </div>
    );
};

export default QuizTab;
