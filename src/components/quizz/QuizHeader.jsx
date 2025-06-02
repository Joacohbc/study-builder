import React from 'react';
import QuestionIcon from '../../icons/QuestionIcon';
import ResetIcon from '../../icons/ResetIcon';
import ProgressBar from '../ProgressBar';

const QuizHeader = ({ activeSetName, quizData, isSubmitted, completionPercentage, onClearProgress }) => {
    return (
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
                <div className="mt-4 md:mt-0 flex items-center gap-3">
                    <ProgressBar
                        current={completionPercentage.current}
                        total={completionPercentage.total}
                        label="Progreso del Cuestionario"
                    />
                    {/* Clear Progress Button */}
                    {completionPercentage.current > 0 && onClearProgress && (
                        <button
                            type="button"
                            onClick={() => {
                                if (window.confirm('¿Estás seguro de que quieres limpiar todo el progreso? Se perderán todas las respuestas guardadas.')) {
                                    onClearProgress();
                                }
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200"
                            title="Limpiar progreso del cuestionario"
                        >
                            <ResetIcon />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuizHeader;