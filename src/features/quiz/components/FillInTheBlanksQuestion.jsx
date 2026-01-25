import React from 'react';
import QuestionImage from '@/components/ui/QuestionImage';

// FillInTheBlanksQuestion Component
// Removed unused questionIndex prop
const FillInTheBlanksQuestion = ({ questionData, selectedAnswers = {}, onChange, isSubmitted, feedback, isIndividuallyChecked }) => { // Added isIndividuallyChecked

    const handleChange = (event, blankId) => {
        if (!isSubmitted) { // isSubmitted controls disabled state
            onChange(questionData.id, blankId, event.target.value);
        }
    };

    const shouldShowFeedback = (isSubmitted || isIndividuallyChecked) && feedback; // Show feedback if globally submitted OR individually checked AND feedback exists

    // Function to parse the question text and replace blanks with dropdowns
    const renderQuestionText = () => {
        const parts = questionData.question.split(/(\[[A-Z0-9_]+\])/g); // Split by [BLANK_ID] pattern

        return parts.map((part, index) => {
            if (part.match(/^\[([A-Z0-9_]+)\]$/)) {
                const blankId = part.substring(1, part.length - 1);
                const blankData = questionData.blanks[blankId];
                const selectedValue = selectedAnswers[blankId] || "";
                const blankFeedback = shouldShowFeedback ? feedback?.blankFeedback?.[blankId] : null; // Get feedback only if needed

                if (!blankData) {
                    console.warn(`Blank ID "${blankId}" found in question text but not in blanks data for question ${questionData.id}`);
                    return <span key={index} className="text-red-500 font-bold"> [Error: Blank '{blankId}' no definido] </span>;
                }

                let selectClass = "inline-block mx-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-1";
                if (isSubmitted) { // Apply disabled styling based on isSubmitted
                    selectClass += " cursor-not-allowed bg-gray-100";
                }
                if (blankFeedback) { // Apply feedback styling if feedback exists
                    selectClass += blankFeedback.isCorrect ? " border-green-500 ring-1 ring-green-500 bg-green-50" : " border-red-500 ring-1 ring-red-500 bg-red-50";
                }

                return (
                    <select
                        key={`${questionData.id}-${blankId}-${index}`}
                        id={`${questionData.id}-${blankId}`}
                        value={selectedValue}
                        onChange={(e) => handleChange(e, blankId)}
                        disabled={isSubmitted} // Use isSubmitted for disabled attribute
                        className={selectClass}
                        aria-label={`Respuesta para ${blankId}`}
                    >
                        <option value="" disabled>Selecciona...</option>
                        {blankData.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                );
            }
            // Return text parts directly
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div className="text-gray-800 leading-relaxed">
            {/* Question Image */}
            {questionData.image && (
                <QuestionImage 
                    imageData={questionData.image} 
                    altText={`Imagen para la pregunta: ${questionData.question}`}
                    className="mb-4"
                />
            )}
            
            {renderQuestionText()}
            {/* Show overall feedback only if needed and the whole question is incorrect */}
            {shouldShowFeedback && feedback && !feedback.isCorrect && (
                <div className="mt-2 text-xs text-red-600">
                    Respuestas correctas:
                    {Object.entries(questionData.blanks).map(([id, data]) => (
                        <span key={id} className="ml-2 font-semibold">{`[${id}]: ${data.correctAnswer}`}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FillInTheBlanksQuestion;
