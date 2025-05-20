import React from 'react';

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
                    return <span key={index} className="text-red-500 dark:text-red-400 font-bold"> [Error: Blank '{blankId}' no definido] </span>;
                }

                let selectClass = "inline-block mx-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm p-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200";
                if (isSubmitted) { // Apply disabled styling based on isSubmitted
                    selectClass += " cursor-not-allowed bg-gray-100 dark:bg-gray-600";
                }
                if (blankFeedback) { // Apply feedback styling if feedback exists
                    if (blankFeedback.isCorrect) {
                        selectClass += " border-green-500 dark:border-green-600 ring-1 ring-green-500 dark:ring-green-600 bg-green-50 dark:bg-green-800 dark:bg-opacity-60 text-green-800 dark:text-green-200";
                    } else {
                        selectClass += " border-red-500 dark:border-red-600 ring-1 ring-red-500 dark:ring-red-600 bg-red-50 dark:bg-red-800 dark:bg-opacity-60 text-red-800 dark:text-red-200";
                    }
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
        <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
            {renderQuestionText()}
            {/* Show overall feedback only if needed and the whole question is incorrect */}
            {shouldShowFeedback && feedback && !feedback.isCorrect && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400">
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
