import React from 'react';
import QuestionIcon from './icons/QuestionIcon';

const NoQuestions = ({ activeSetName }) => {
    return (
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
    );
};

export default NoQuestions;