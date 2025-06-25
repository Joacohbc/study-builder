import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../../utils/helpers';
import QuestionImage from '../common/QuestionImage';

// MultipleChoiceQuestion Component
const MultipleChoiceQuestion = ({ questionData, questionIndex, selectedAnswers = [], onChange, isSubmitted, feedback, isIndividuallyChecked }) => {
    const [shuffledOptions, setShuffledOptions] = useState([]);
    
    useEffect(() => { 
        setShuffledOptions(shuffleArray(questionData.options)); 
    }, [questionData.options]);
    
    const handleChange = (event) => { 
        if (isSubmitted) return; 
        
        const { value, checked } = event.target; 
        const newSelectedAnswers = checked 
            ? [...selectedAnswers, value] 
            : selectedAnswers.filter(answer => answer !== value); 
        
        onChange(questionData.id, newSelectedAnswers); 
    }; 
    
    const shouldShowFeedback = (isSubmitted || isIndividuallyChecked) && feedback;

    return (
        <div className="space-y-3">
            {/* Question Image */}
            {questionData.image && (
                <QuestionImage 
                    imageData={questionData.image} 
                    altText={`Imagen para la pregunta: ${questionData.question}`}
                    className="mb-4"
                />
            )}
            
            {shuffledOptions.map((option, index) => {
                const inputId = `q${questionIndex}_option${index}`;
                const isSelected = selectedAnswers.includes(option);
                const isCorrect = questionData.correctAnswers?.includes(option);
                
                // Base styles for all options
                let labelClass = 'flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200';
                let checkboxClass = 'form-checkbox h-5 w-5 text-indigo-600 rounded transition duration-150 ease-in-out';
                let contentClass = 'flex items-center';
                
                if (!isSubmitted) {
                    // Styles for options when not submitted
                    labelClass += ' hover:border-indigo-300 hover:bg-indigo-50';
                    
                    // Selected option
                    if (isSelected) {
                        labelClass += ' border-indigo-300 bg-indigo-50';
                    } else {
                        labelClass += ' border-gray-200';
                    }
                } else {
                    // Styles for options when submitted or individually checked
                    labelClass += ' cursor-not-allowed';
                    checkboxClass += ' cursor-not-allowed';
                    
                    if (shouldShowFeedback) {
                        if (isCorrect) { 
                            labelClass += ' bg-green-50 border-green-300'; 
                            if (isSelected) {
                                labelClass += ' ring-2 ring-green-200 ring-opacity-50';
                            }
                        } else if (isSelected) { 
                            labelClass += ' bg-red-50 border-red-300'; 
                        } else { 
                            labelClass += ' opacity-70'; 
                        }
                    }
                }

                return (
                    <label key={inputId} htmlFor={inputId} className={labelClass}> 
                        <div className={contentClass}>
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    id={inputId} 
                                    name={`question_${questionIndex}`} 
                                    value={option} 
                                    checked={isSelected} 
                                    onChange={handleChange} 
                                    disabled={isSubmitted} 
                                    className={checkboxClass}
                                    aria-label={option}
                                /> 
                                {isSelected && !shouldShowFeedback && (
                                    <span className="absolute top-0 left-0 flex h-5 w-5 items-center justify-center">
                                        <span className="animate-ping absolute h-4 w-4 rounded-md bg-indigo-400 opacity-75"></span>
                                    </span>
                                )}
                            </div>
                            <span className="ml-3 text-gray-800 font-medium">{option}</span>
                        </div>
                        
                        {/* Feedback indicators */}
                        {shouldShowFeedback && isCorrect && (
                            <span className="ml-auto text-green-600 font-semibold flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {isSelected ? 'Correcto' : 'Debería seleccionarse'}
                            </span>
                        )}
                        
                        {shouldShowFeedback && isSelected && !isCorrect && (
                            <span className="ml-auto text-red-600 font-semibold flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Incorrecto
                            </span>
                        )}
                    </label>
                );
            })}
            
            {/* Optional hint for multiple selection */}
            {questionData.correctAnswers && questionData.correctAnswers.length > 1 && !shouldShowFeedback && (
                <p className="text-xs text-gray-500 italic mt-2">
                    Puedes seleccionar múltiples opciones para esta pregunta
                </p>
            )}
        </div>
    );
};

export default MultipleChoiceQuestion;
