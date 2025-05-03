import React from 'react';

// DraggableTerm Component
const DraggableTerm = ({ term, questionId, isSubmitted }) => { // isSubmitted controls draggable state
    const handleDragStart = (e) => {
        if (isSubmitted) {
            e.preventDefault();
            return;
        } // Prevent drag if disabled
        e.dataTransfer.setData('text/plain', JSON.stringify({ term, questionId }));
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('opacity-50', 'cursor-grabbing');
    };

    const handleDragEnd = (e) => {
        if (isSubmitted) return;
        // Check if currentTarget exists before removing class
        if (e.currentTarget) {
            e.currentTarget.classList.remove('opacity-50', 'cursor-grabbing');
        }
    };

    return (
        <div
            draggable={!isSubmitted} // Use isSubmitted to control draggable attribute
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`p-3 bg-blue-100 border border-blue-300 rounded-md ${isSubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-grab draggable'} transition-opacity duration-200`}
        >
            {term}
        </div>
    );
};

export default DraggableTerm;
