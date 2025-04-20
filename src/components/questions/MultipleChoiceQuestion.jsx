import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../../utils/helpers';

// MultipleChoiceQuestion Component
const MultipleChoiceQuestion = ({ questionData, questionIndex, selectedAnswers = [], onChange, isSubmitted, feedback }) => {
     const [shuffledOptions, setShuffledOptions] = useState([]);
    useEffect(() => { setShuffledOptions(shuffleArray(questionData.options)); }, [questionData.options]);
    const handleChange = (event) => { if (isSubmitted) return; const { value, checked } = event.target; const newSelectedAnswers = checked ? [...selectedAnswers, value] : selectedAnswers.filter(answer => answer !== value); onChange(questionData.id, newSelectedAnswers); };
    return ( <div className="space-y-3"> {shuffledOptions.map((option, index) => { const inputId = `q${questionIndex}_option${index}`; let labelClass = 'flex items-center p-3 border rounded-md hover:bg-gray-50 transition duration-150 cursor-pointer'; let inputClass = `mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${isSubmitted ? 'cursor-not-allowed' : ''}`; const isSelected = selectedAnswers.includes(option); const isCorrect = questionData.correctAnswers.includes(option); if (isSubmitted) { if (isCorrect) { labelClass += ' bg-green-50 border-green-400'; } if (isSelected && !isCorrect) { labelClass += ' bg-red-50 border-red-400'; } if (!isSelected && !isCorrect) { labelClass += ' opacity-70'; } } return ( <label key={inputId} htmlFor={inputId} className={labelClass}> <input type="checkbox" id={inputId} name={`question_${questionIndex}`} value={option} checked={isSelected} onChange={handleChange} disabled={isSubmitted} className={inputClass} /> <span className="text-gray-800">{option}</span> {isSubmitted && isCorrect && <span className="ml-auto text-green-600 font-bold">✓</span>} {isSubmitted && isSelected && !isCorrect && <span className="ml-auto text-red-600 font-bold">✗</span>} </label> ); })} </div> );
};

export default MultipleChoiceQuestion;
