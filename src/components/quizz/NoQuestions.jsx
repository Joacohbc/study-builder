import React from 'react';
import QuestionIcon from '../../icons/QuestionIcon';

const NoQuestions = ({ activeSetName }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-inner text-center">
            <div className="text-gray-400 dark:text-gray-500 flex justify-center mb-4">
                <QuestionIcon /> {/* Assuming QuestionIcon uses currentColor or is dark mode compatible */}
            </div>
            <p className="text-center text-gray-800 dark:text-gray-200 font-medium mb-2">
                No hay preguntas en el set activo
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
                <span className="font-semibold dark:text-gray-100">"{activeSetName}"</span> no contiene preguntas.
                Carga otro set o edita este en la pestaña "Editor de Sets".
            </p>
            <button
                onClick={() => {
                    // Find and click the Editor tab button
                    const tabButton = document.querySelector('button[class*="border-indigo-600"]'); // This selector might need adjustment if App.jsx tab styles change
                    if (tabButton) tabButton.click();
                }}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:bg-opacity-50 dark:text-indigo-300 font-medium rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-700 dark:hover:bg-opacity-60 transition-colors duration-200"
            >
                Ir al Editor
            </button>
        </div>
    );
};

export default NoQuestions;