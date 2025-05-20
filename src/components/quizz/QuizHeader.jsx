import React from 'react';
import QuestionIcon from '../../icons/QuestionIcon';
import ProgressBar from '../ProgressBar';

const QuizHeader = ({ activeSetName, quizData, isSubmitted, completionPercentage }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <span className="mr-2 text-indigo-600 dark:text-indigo-400"><QuestionIcon /></span> {/* Assuming QuestionIcon uses currentColor or is dark mode compatible */}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300">
                        {activeSetName || 'Sin título'}
                    </span>
                </h2>
                {quizData && quizData.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {quizData.length} {quizData.length === 1 ? 'pregunta' : 'preguntas'} en este cuestionario
                    </p>
                )}
            </div>

            {/* Progress indicator */}
            {!isSubmitted && quizData && quizData.length > 0 && (
                <div className="mt-4 md:mt-0">
                    <ProgressBar
                        current={completionPercentage.current}
                        total={completionPercentage.total}
                        label="Progreso del Cuestionario"
                    />
                </div>
            )}
        </div>
    );
};

export default QuizHeader;