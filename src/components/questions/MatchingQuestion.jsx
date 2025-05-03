import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Import useMemo
import { shuffleArray } from '../../utils/helpers';
import DraggableTerm from '../dnd/DraggableTerm';
import DropZoneDefinition from '../dnd/DropZoneDefinition';

// MatchingQuestion Component
const MatchingQuestion = ({ questionData, matches = {}, onMatchChange, isSubmitted, feedback, isIndividuallyChecked }) => {
    // State for shuffled terms and definitions, initialized once or when questionData changes
    const [shuffledTerms, setShuffledTerms] = useState([]);
    const [shuffledDefinitions, setShuffledDefinitions] = useState([]);

    // Shuffle terms only when questionData.terms changes
    useEffect(() => {
        // Use spread operator to avoid mutating original array if passed directly
        setShuffledTerms(shuffleArray([...(questionData.terms || [])]));
    }, [questionData.terms]);

    // Shuffle definitions only when questionData.definitions changes
    useEffect(() => {
        // Use spread operator
        setShuffledDefinitions(shuffleArray([...(questionData.definitions || [])]));
    }, [questionData.definitions]);

    // Derive available terms based on shuffledTerms and current matches
    // useMemo ensures this calculation only runs when dependencies change, preventing unnecessary shuffling
    const availableTerms = useMemo(() => {
        const termsInUse = new Set(Object.values(matches)); // Use Set for efficient lookup
        return shuffledTerms.filter(term => !termsInUse.has(term));
    }, [shuffledTerms, matches]); // Depends only on the shuffled list and the current matches

    const handleDrop = useCallback((definition, term) => {
        if (isSubmitted) return;
        onMatchChange(questionData.id, definition, term);
    }, [isSubmitted, onMatchChange, questionData.id]);

    const returnTermToAvailable = useCallback((term) => {
        if (isSubmitted || !term) return;
        const definitionToRemoveMatch = Object.keys(matches).find(def => matches[def] === term);
        if (definitionToRemoveMatch) {
            // Setting match to null will trigger update in `availableTerms` via useMemo
            onMatchChange(questionData.id, definitionToRemoveMatch, null);
        }
        // No need for fallback logic to manually add back to availableTerms,
        // useMemo handles deriving the list correctly based on matches.
    }, [isSubmitted, matches, onMatchChange, questionData.id]); // Removed availableTerms dependency

    const shouldShowFeedback = (isSubmitted || isIndividuallyChecked) && feedback;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Available Terms Section */}
            <div className="space-y-3">
                <h4 className="font-medium text-gray-600 mb-2">Términos (Arrastra desde aquí)</h4>
                {/* Check if all original terms are used */}
                {availableTerms.length === 0 && (questionData.terms || []).length > 0 && !isSubmitted && Object.keys(matches).length > 0 && (
                    <p className="text-sm text-gray-500 italic">Todos los términos han sido usados.</p>
                )}
                {/* Display available terms derived from useMemo */}
                {availableTerms.map(term => (
                    <DraggableTerm
                        key={term}
                        term={term}
                        questionId={questionData.id}
                        isSubmitted={isSubmitted}
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
                {/* Use shuffledDefinitions directly */}
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
                                isSubmitted={isSubmitted}
                                feedback={definitionFeedback}
                            />
                            {/* Return Term Button */}
                            {droppedTerm && !isSubmitted && (
                                <button
                                    type="button"
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
