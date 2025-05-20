import React, { useState } from 'react';

// DropZoneDefinition Component
const DropZoneDefinition = ({ definition, questionId, droppedTerm, onDrop, isSubmitted, feedback }) => { // isSubmitted controls drop state, feedback controls styling
    const [isOver, setIsOver] = useState(false);
    const handleDragOver = (e) => { if (isSubmitted || droppedTerm) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setIsOver(true); }; // Prevent drop if disabled or already has term
    const handleDragLeave = () => { if (isSubmitted) return; setIsOver(false); };
    const handleDrop = (e) => { if (isSubmitted || droppedTerm) return; e.preventDefault(); setIsOver(false); try { const data = JSON.parse(e.dataTransfer.getData('text/plain')); if (data.questionId === questionId) { onDrop(definition, data.term); } } catch (error) { console.error("Error parsing dropped data:", error); } };

    let zoneClass = 'border border-gray-300 dark:border-gray-600'; 
    let termClass = 'text-sm'; // Base class for term text, specific BG/Border below

    // Apply feedback styling
    if (feedback) {
        if (feedback.isCorrect) {
            zoneClass = 'border border-green-500 dark:border-green-700 bg-green-50 dark:bg-green-900';
            termClass += ' bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-600 text-green-800 dark:text-green-100';
        } else {
            zoneClass = 'border border-red-500 dark:border-red-700 bg-red-50 dark:bg-red-900';
            termClass += ' bg-red-100 dark:bg-red-800 border-red-300 dark:border-red-600 text-red-800 dark:text-red-100';
        }
    } else if (isSubmitted) { // General disabled appearance
        zoneClass = 'border border-gray-300 dark:border-gray-500 bg-gray-50 dark:bg-gray-700 opacity-70';
        if (droppedTerm) {
            termClass += ' bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300';
        }
    } else if (isOver) { // Active drop target styling
        zoneClass = 'border-2 border-dashed border-blue-500 dark:border-blue-700 bg-blue-50 dark:bg-blue-900';
    } else if (droppedTerm) { // Has a term, not submitted/checked yet
        zoneClass = 'border border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-700';
        termClass += ' bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-200'; // Default term appearance
    } else { // Empty, ready to receive drop
        zoneClass = 'border border-dashed border-gray-400 dark:border-gray-500';
    }

    return (
        <div 
            onDragOver={handleDragOver} 
            onDragLeave={handleDragLeave} 
            onDrop={handleDrop} 
            className={`p-3 rounded-md min-h-[60px] flex items-center justify-between space-x-2 transition-colors duration-200 drop-zone ${zoneClass}`} 
            data-definition={definition}
        >
            <span className="text-gray-800 dark:text-gray-200 flex-grow">{definition}</span>
            {droppedTerm ? (
                <div className={`p-2 border rounded-md ${termClass}`}> 
                    {droppedTerm}
                </div>
            ) : (
                !isSubmitted && <span className="text-gray-400 dark:text-gray-500 italic text-sm placeholder-text">(Arrastra aquí)</span>
            )}
        </div>
    );
};

export default DropZoneDefinition;
