import { useState } from 'react';

// DropZoneDefinition Component
const DropZoneDefinition = ({ definition, questionId, droppedTerms = [], onDrop, isSubmitted, feedback }) => { // Changed droppedTerm to droppedTerms array
    const [isOver, setIsOver] = useState(false);
    const hasTerms = droppedTerms.length > 0;
    
    const handleDragOver = (e) => { 
        if (isSubmitted) return; 
        e.preventDefault(); 
        e.dataTransfer.dropEffect = 'move'; 
        setIsOver(true); 
    }; 
    
    const handleDragLeave = () => { 
        if (isSubmitted) return; 
        setIsOver(false); 
    };
    
    const handleDrop = (e) => { 
        if (isSubmitted) return; 
        e.preventDefault(); 
        setIsOver(false); 
        try { 
            const data = JSON.parse(e.dataTransfer.getData('text/plain')); 
            if (data.questionId === questionId) { 
                onDrop(definition, data.term); 
            } 
        } catch (error) { 
            console.error("Error parsing dropped data:", error); 
        } 
    };

    let zoneClass = 'border border-gray-300'; 
    let termClass = '';
    
    // Apply feedback styling if feedback is provided (meaning shouldShowFeedback was true in parent)
    if (feedback) {
        if (feedback.isCorrect) { 
            zoneClass = 'border border-green-500 bg-green-50'; 
            termClass = 'bg-green-100 border-green-300'; 
        } else { 
            zoneClass = 'border border-red-500 bg-red-50'; 
            termClass = 'bg-red-100 border-red-300'; 
        }
    } else if (isSubmitted) { // If disabled but no specific feedback (e.g., not answered)
        zoneClass = 'border border-gray-300 bg-gray-50 opacity-70'; // General disabled appearance
        if (hasTerms) termClass = 'bg-gray-200 border-gray-300';
    } else if (isOver) { // Active drop target styling
        zoneClass = 'border-2 border-dashed border-blue-500 bg-blue-50';
    } else if (hasTerms) { // Has terms, not submitted/checked yet
        zoneClass = 'border border-gray-400 bg-gray-100';
    } else { // Empty, ready to receive drop
        zoneClass = 'border border-dashed border-gray-400';
    }

    return (
        <div 
            onDragOver={handleDragOver} 
            onDragLeave={handleDragLeave} 
            onDrop={handleDrop} 
            className={`p-3 rounded-md min-h-[60px] flex flex-col space-y-2 transition-colors duration-200 drop-zone ${zoneClass}`} 
            data-definition={definition}
        > 
            <span className="text-gray-800 font-medium">{definition}</span> 
            {hasTerms ? (
                <div className="flex flex-wrap gap-2">
                    {droppedTerms.map((term, index) => (
                        <div key={`${term}-${index}`} className={`p-2 border rounded-md text-sm ${termClass}`}>
                            {term}
                        </div>
                    ))}
                </div>
            ) : (
                !isSubmitted && <span className="text-gray-400 italic text-sm placeholder-text">(Arrastra aquí)</span>
            )}
        </div>
    );
};

export default DropZoneDefinition;
