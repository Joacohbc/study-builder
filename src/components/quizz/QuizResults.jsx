import React from 'react';
import TrophyIcon from '../../icons/TrophyIcon';
import RefreshIcon from '../../icons/RefreshIcon';

const QuizResults = ({ results, activeSetName, onRetry, shuffledQuestions }) => {
    if (!results) return null;

    // Calculate for SVG circular progress bar
    const rawPercentage = results.total > 0 ? Math.min(results.score / results.total, 1) : 0;
    const displayPercentage = rawPercentage * 100;

    const size = 128; // Corresponds to h-32 w-32 container
    const strokeWidth = 16; // Thickness of the progress ring
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (displayPercentage / 100) * circumference;

    return (
        <div
            id="results-container"
            className="mt-12 p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in"
        >
            <div className="flex justify-center mb-6">
                <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-800 dark:bg-opacity-50 text-indigo-600 dark:text-indigo-400">
                    <TrophyIcon /> {/* Assuming TrophyIcon uses currentColor or is dark mode compatible */}
                </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300 mb-2">
                Resultados
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                {activeSetName}
            </p>

            {/* Score display with visual graph */}
            <div className="flex flex-col items-center mb-8">
                <div className="relative h-32 w-32">
                    <svg width={size} height={size} className="absolute inset-0 transform -rotate-90">
                        <defs>
                            {/* Tailwind doesn't support SVG gradient stops directly with classes. Below uses hex. Consider if a dark mode specific gradient is needed */}
                            <linearGradient id="progressGradientCircular" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#4f46e5" /> {/* indigo-600 */}
                                <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500 */}
                            </linearGradient>
                            {/* Example for a dark mode specific gradient if needed:
                            <linearGradient id="progressGradientCircularDark" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6366f1" /> // indigo-500
                                <stop offset="100%" stopColor="#60a5fa" /> // blue-400
                            </linearGradient>
                            */}
                        </defs>
                        {/* Background Circle */}
                        <circle
                            strokeWidth={strokeWidth}
                            className="stroke-gray-200 dark:stroke-gray-700" // Use Tailwind classes for stroke color
                            fill="transparent"
                            r={radius}
                            cx={size / 2}
                            cy={size / 2}
                        />
                        {/* Progress Circle */}
                        <circle
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            stroke="url(#progressGradientCircular)" // Could potentially switch this URL based on dark mode if a different gradient is defined
                            fill="transparent"
                            r={radius}
                            cx={size / 2}
                            cy={size / 2}
                            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                        />
                    </svg>
                    {/* Inner circle for text content */}
                    <div className="absolute inset-4 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{results.score}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">de {results.total}</div>
                        </div>
                    </div>
                </div> {/* Closing div for "relative h-32 w-32" */}

                <p className="text-center mt-4">
                    <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {results.total > 0 ? Math.round((results.score / results.total) * 100) : 0}%
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-1 text-sm">
                        de aciertos
                    </span>
                </p>
            </div> {/* Closing div for "flex flex-col items-center mb-8" */}

            {/* Container for detailed feedback (optional, basic feedback shown here) */}
            <div id="feedback" className="space-y-4 max-w-2xl mx-auto">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Detalle de respuestas</h3>

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
                        feedbackClass += 'bg-red-50 dark:bg-red-800 dark:bg-opacity-50 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600';
                        feedbackText = feedback.error;
                    }
                    else if (feedback.isCorrect) {
                        feedbackClass += 'bg-green-50 dark:bg-green-800 dark:bg-opacity-50 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600';
                        feedbackText = '¡Correcto!';
                    }
                    else if (feedback.isAnswered) {
                        feedbackClass += 'bg-red-50 dark:bg-red-800 dark:bg-opacity-50 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600';
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
                        feedbackClass += 'bg-yellow-50 dark:bg-yellow-800 dark:bg-opacity-50 border-yellow-200 dark:border-yellow-700 hover:border-yellow-300 dark:hover:border-yellow-600';
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
                                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium text-sm mr-3">
                                        {index + 1}
                                    </span>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{questionTitle}</p>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${feedback.isCorrect ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:bg-opacity-60 dark:text-green-200' :
                                    feedback.isAnswered ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:bg-opacity-60 dark:text-red-200' :
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:bg-opacity-60 dark:text-yellow-200'}`}>
                                    {feedback.isCorrect ? 'Correcto' : feedback.isAnswered ? 'Incorrecto' : 'Sin responder'}
                                </span>
                            </div>
                            <p className={`mt-2 text-sm ${feedback.isCorrect ? 'text-green-700 dark:text-green-300' : feedback.isAnswered ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
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
                    onClick={onRetry}
                    className="flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-800 dark:bg-opacity-50 dark:text-indigo-300 dark:hover:bg-indigo-700 dark:hover:bg-opacity-60 font-medium py-2 px-6 rounded-lg transition-all duration-200"
                >
                    <RefreshIcon/> {/* Assuming RefreshIcon uses currentColor or is dark mode compatible */}
                    Intentar de Nuevo
                </button>
            </div>
        </div>
    );
};

export default QuizResults;