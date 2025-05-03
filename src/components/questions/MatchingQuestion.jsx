import React, { useState, useEffect, useCallback } from 'react';
import { shuffleArray } from '../../utils/helpers';
import DraggableTerm from '../dnd/DraggableTerm';
import DropZoneDefinition from '../dnd/DropZoneDefinition';

// MatchingQuestion Component
const MatchingQuestion = ({ questionData, questionIndex, matches = {}, onMatchChange, isSubmitted, feedback, isIndividuallyChecked }) => { // Added isIndividuallyChecked
    const [availableTerms, setAvailableTerms] = useState([]);
    const [shuffledDefinitions, setShuffledDefinitions] = useState([]);

    // Initialize terms and definitions
    useEffect(() => {
        const initialAvailable = (questionData.terms || []).filter(term => !Object.values(matches).includes(term));
        setAvailableTerms(shuffleArray(initialAvailable));
        setShuffledDefinitions(shuffleArray(questionData.definitions || []));
    }, [questionData.terms, questionData.definitions, matches]); // Rerun when question data or matches change initially

    // Update available terms when matches change (e.g., term dropped or returned)
    useEffect(() => {
        const termsInUse = Object.values(matches);
        const updatedAvailable = (questionData.terms || []).filter(term => !termsInUse.includes(term));
        // Only update if the available terms actually changed to avoid infinite loops with shuffle
        if (JSON.stringify(shuffleArray(updatedAvailable)) !== JSON.stringify(availableTerms)) {
            setAvailableTerms(shuffleArray(updatedAvailable));
        }
    }, [matches, questionData.terms, availableTerms]); // Added availableTerms dependency

    const handleDrop = useCallback((definition, term) => {
        if (isSubmitted) return;
        onMatchChange(questionData.id, definition, term);
    }, [isSubmitted, onMatchChange, questionData.id]); // isSubmitted controls disabled state

    const returnTermToAvailable = useCallback((term) => {
        if (isSubmitted || !term) return;
        const definitionToRemoveMatch = Object.keys(matches).find(def => matches[def] === term);
        if (definitionToRemoveMatch) {
            onMatchChange(questionData.id, definitionToRemoveMatch, null); // This will trigger the useEffect above to update availableTerms
        } else {
            // Fallback: If somehow the term wasn't in matches but should be returned
            if (!availableTerms.includes(term)) {
                setAvailableTerms(prev => shuffleArray([...prev, term]));
            }
        }
    }, [isSubmitted, matches, onMatchChange, questionData.id, availableTerms]); // Added dependencies

    const shouldShowFeedback = (isSubmitted || isIndividuallyChecked) && feedback; // Show feedback if globally submitted OR individually checked AND feedback exists

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Available Terms Section */}
            <div className="space-y-3">
                <h4 className="font-medium text-gray-600 mb-2">Términos (Arrastra desde aquí)</h4>
                {availableTerms.length === 0 && !isSubmitted && (
                    <p className="text-sm text-gray-500 italic">Todos los términos han sido usados.</p>
                )}
                {availableTerms.map(term => (
                    <DraggableTerm
                        key={term}
                        term={term}
                        questionId={questionData.id}
                        isSubmitted={isSubmitted} // Pass isSubmitted for disabling drag
                    />
                ))}
                {/* Feedback for unplaced terms */}
                {shouldShowFeedback && feedback?.unplacedTerms?.length > 0 && (
                    <div className="mt-4 p-2 border border-red-300 bg-red-50 rounded">
                        <p className="text-sm font-semibold text-red-700">Términos no colocados:</p>
                        <ul className="list-disc list-inside text-sm text-red-600">
                            {feedback.unplacedTerms.map(term => <li key={term}>{term}</li>)}
                        </ul>
                    </div>
                )}
            </div>

            {/* Definitions Drop Zone Section */}
            <div className="space-y-3">
                <h4 className="font-medium text-gray-600 mb-2">Definiciones (Suelta aquí)</h4>
                {shuffledDefinitions.map(definition => {
                    const droppedTerm = matches[definition] || null;
                    const definitionFeedback = shouldShowFeedback ? (feedback?.definitionFeedback?.[definition] ?? null) : null;
                    return (
                        <div key={definition} className="relative group">
                            <DropZoneDefinition
                                definition={definition}
                                questionId={questionData.id}
                                droppedTerm={droppedTerm}
                                onDrop={handleDrop}
                                isSubmitted={isSubmitted} // Pass isSubmitted for disabling drop
                                feedback={definitionFeedback} // Pass feedback for styling
                            />
                            {/* Return Term Button */}
                            {droppedTerm && !isSubmitted && ( // Show return button only if not disabled
                                <button
                                    type="button" // Added type="button"
                                    onClick={() => returnTermToAvailable(droppedTerm)}
                                    className="absolute top-1 right-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full leading-none opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                    aria-label={`Devolver ${droppedTerm}`}
                                    title={`Devolver ${droppedTerm} a la lista`}
                                >
                                    ✕
                                </button>
                            )}
                            {/* Feedback Hint for Incorrect Match */}
                            {shouldShowFeedback && definitionFeedback && !definitionFeedback.isCorrect && (
                                <p className="text-xs text-red-600 mt-1">
                                    Correcto: "{definitionFeedback.correctTerm || 'N/A'}"
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MatchingQuestion;
