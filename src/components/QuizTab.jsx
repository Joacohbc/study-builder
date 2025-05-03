import React, { useState, useEffect, useCallback } from 'react';
import { shuffleArray } from '../utils/helpers';
import SingleChoiceQuestion from './questions/SingleChoiceQuestion';
import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion';
import MatchingQuestion from './questions/MatchingQuestion';
import FillInTheBlanksQuestion from './questions/FillInTheBlanksQuestion'; // Import the new component

// Quiz Tab Component: Manages the quiz state, question rendering, and results
const QuizTab = ({ quizData, onQuizComplete, activeSetName }) => { // Added activeSetName prop for context
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

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4 text-center text-gray-600">Set Actual: {activeSetName || 'N/A'}</h2>
            {/* Show message if no questions are loaded */}
            {(!quizData || quizData.length === 0) ? (
                 <p className="text-center text-red-600 font-semibold">
                    No hay preguntas en el set activo ('{activeSetName}'). Carga otro set o edita este en la pestaña "Editor de Sets".
                 </p>
            ) : (
                /* Render the quiz form */
                <form onSubmit={handleSubmit}>
                    <div id="quiz-container" className="space-y-8">
                        {/* Map over shuffled questions to render each one */}
                        {shuffledQuestions.map((qData, index) => {
                             if (!qData || !qData.id) return <p key={`error-${index}`} className="text-red-500">Error: Datos de pregunta inválidos.</p>; // Basic check

                             const isIndividuallyChecked = !!individualFeedback[qData.id];
                             // Determine the feedback to show: individual first, then overall results if submitted
                             const questionFeedback = individualFeedback[qData.id] || (isSubmitted ? results?.feedback?.[qData.id] : null);
                             // Determine if inputs should be disabled
                             const isDisabled = isSubmitted || isIndividuallyChecked;

                             return (
                                <div key={qData.id} className="bg-white p-6 rounded-lg shadow" data-question-index={index}>
                                    {/* Question Title */}
                                    <h3 className="text-lg font-semibold mb-4 text-gray-700">
                                        Pregunta {index + 1}: {/* Display question text differently for fill-in-the-blanks */}
                                        {qData.type === 'fill-in-the-blanks' ? "Completa la frase:" : qData.question}
                                    </h3>
                                    {/* Container for options/matching areas */}
                                    <div className="options-container">
                                        {/* Render specific component based on question type */}
                                        {qData.type === 'single' && ( <SingleChoiceQuestion questionData={qData} questionIndex={index} selectedAnswer={answers[qData.id] || ''} onChange={handleAnswerChange} isSubmitted={isDisabled} feedback={questionFeedback} isIndividuallyChecked={isIndividuallyChecked} /> )}
                                        {qData.type === 'multiple' && ( <MultipleChoiceQuestion questionData={qData} questionIndex={index} selectedAnswers={answers[qData.id] || []} onChange={handleAnswerChange} isSubmitted={isDisabled} feedback={questionFeedback} isIndividuallyChecked={isIndividuallyChecked} /> )}
                                        {qData.type === 'matching' && ( <MatchingQuestion questionData={qData} questionIndex={index} matches={answers[qData.id] || {}} onMatchChange={handleMatchChange} isSubmitted={isDisabled} feedback={questionFeedback} isIndividuallyChecked={isIndividuallyChecked} /> )}
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
                                     {(isSubmitted || isIndividuallyChecked) && questionFeedback?.error && ( <p className="mt-2 text-sm text-red-600 font-semibold">{questionFeedback.error}</p> )}

                                     {/* Add Check Answer Button */}
                                     {!isSubmitted && (
                                        <div className="mt-4">
                                            <button
                                                type="button"
                                                onClick={() => handleCheckSingleQuestion(qData.id)}
                                                disabled={isIndividuallyChecked}
                                                className="px-4 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded shadow-sm transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed" // Changed from purple to gray
                                            >
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
                        <button type="submit" disabled={isSubmitted} className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 ${isSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`} >
                            {isSubmitted ? 'Respuestas Enviadas' : 'Enviar Respuestas'}
                        </button>
                    </div>
                </form>
            )}

            {/* Results Section (conditionally rendered after submission) */}
            {isSubmitted && results && (
                <div id="results-container" className="mt-10 p-6 bg-gray-50 rounded-lg">
                    <h2 className="text-xl font-semibold text-center mb-4">Resultados ({activeSetName})</h2>
                    {/* Display overall score */}
                    <p id="score" className="text-center text-lg font-bold mb-6"> Tu puntuación: {results.score} de {results.total} </p>
                    {/* Container for detailed feedback (optional, basic feedback shown here) */}
                    <div id="feedback" className="space-y-4">
                        {/* Map over the *shuffled* questions again to show feedback in displayed order */}
                        {shuffledQuestions.map((qData, index) => {
                             if (!qData || !qData.id) return null; // Skip if invalid
                             const feedback = results.feedback[qData.id];
                             if (!feedback) return null; // Should not happen

                             let feedbackClass = 'p-4 border rounded-md mb-4 '; let feedbackText = '';
                             let questionTitle = qData.question;
                             if (qData.type === 'fill-in-the-blanks') questionTitle = "Completa la frase (Pregunta " + (index + 1) + ")";


                             if (feedback.error) { feedbackClass += 'bg-red-100 border-red-300'; feedbackText = feedback.error; }
                             else if (feedback.isCorrect) { feedbackClass += 'bg-green-100 border-green-300'; feedbackText = '¡Correcto!'; }
                             else if (feedback.isAnswered) {
                                 feedbackClass += 'bg-red-100 border-red-300'; feedbackText = 'Incorrecto.';
                                 if (qData.type === 'single') feedbackText += ` La respuesta correcta es: ${feedback.correctAnswer}`;
                                 if (qData.type === 'multiple') feedbackText += ` Las respuestas correctas son: ${(feedback.correctAnswers || []).join(', ')}`;
                                 // Add feedback for fill-in-the-blanks (already shown in the component, but can add summary here)
                                 if (qData.type === 'fill-in-the-blanks') {
                                     const correctAnswersSummary = Object.entries(qData.blanks)
                                         .map(([id, data]) => `[${id}]: ${data.correctAnswer}`)
                                         .join(', ');
                                     feedbackText += ` Respuestas correctas: ${correctAnswersSummary}`;
                                 }
                                 // Add feedback for matching (can be complex, maybe just indicate incorrect)
                                 if (qData.type === 'matching') {
                                     feedbackText += ` Revisa las uniones correctas arriba.`;
                                 }
                             }
                             else { // Not answered
                                 feedbackClass += 'bg-yellow-100 border-yellow-400'; feedbackText = 'No respondida.';
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
                                    <p className="font-semibold">Pregunta {index + 1}: {questionTitle}</p>
                                    <p className={`mt-1 text-sm ${feedback.isCorrect ? 'text-green-700' : feedback.isAnswered ? 'text-red-700' : 'text-yellow-700'}`}>
                                        {feedbackText}
                                    </p>
                                </div>
                             );
                        })}
                    </div>
                    {/* Retry Button */}
                    <div className="mt-6 text-center"> <button id="retry-button" onClick={handleRetry} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300" > Intentar de Nuevo </button> </div>
                </div>
            )}
        </div>
    );
};

export default QuizTab;
