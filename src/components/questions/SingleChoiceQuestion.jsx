import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../../utils/helpers';

// SingleChoiceQuestion Component
const SingleChoiceQuestion = ({ questionData, questionIndex, selectedAnswer, onChange, isSubmitted, feedback, isIndividuallyChecked }) => { // Added isIndividuallyChecked
    const [shuffledOptions, setShuffledOptions] = useState([]);
    useEffect(() => { setShuffledOptions(shuffleArray(questionData.options)); }, [questionData.options]);
    const handleChange = (event) => { if (!isSubmitted) { onChange(questionData.id, event.target.value); } }; // isSubmitted here refers to the combined disabled state
    const shouldShowFeedback = (isSubmitted || isIndividuallyChecked) && feedback; // Show feedback if globally submitted OR individually checked AND feedback exists

    return ( <div className="space-y-3"> {shuffledOptions.map((option, index) => { const inputId = `q${questionIndex}_option${index}`; let labelClass = 'flex items-center p-3 border rounded-md hover:bg-gray-50 transition duration-150 cursor-pointer'; let inputClass = `mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${isSubmitted ? 'cursor-not-allowed' : ''}`; // isSubmitted controls disabled state

        if (shouldShowFeedback) { // Apply feedback styling if needed
            const isCorrectAnswer = option === questionData.correctAnswer;
            const isSelected = selectedAnswer === option;
            if (isCorrectAnswer) { labelClass += ' bg-green-50 border-green-400 font-medium'; }
            if (isSelected && !isCorrectAnswer) { labelClass += ' bg-red-50 border-red-400'; }
            if (!isSelected && !isCorrectAnswer) { labelClass += ' opacity-70'; }
        }

        return ( <label key={inputId} htmlFor={inputId} className={labelClass}> <input type="radio" id={inputId} name={`question_${questionIndex}`} value={option} checked={selectedAnswer === option} onChange={handleChange} disabled={isSubmitted} className={inputClass} /> {/* Use isSubmitted for disabled */} <span className="text-gray-800">{option}</span> {shouldShowFeedback && option === questionData.correctAnswer && <span className="ml-auto text-green-600 font-bold">✓ Correcta</span>} {shouldShowFeedback && selectedAnswer === option && option !== questionData.correctAnswer && <span className="ml-auto text-red-600 font-bold">✗ Tu selección</span>} </label> ); })} </div> );
};

export default SingleChoiceQuestion;
