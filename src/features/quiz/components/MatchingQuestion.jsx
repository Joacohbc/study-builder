import { useState, useEffect } from 'react';
import { shuffleArray } from '@/utils/helpers';
import DraggableTerm from '@/components/ui/dnd/DraggableTerm';
import DropZoneDefinition from '@/components/ui/dnd/DropZoneDefinition';
import QuestionImage from '@/components/ui/QuestionImage';

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
    const termsInUse = new Set();
    Object.values(matches).forEach(value => {
        if (Array.isArray(value)) {
            value.forEach(term => termsInUse.add(term));
        } else if (value) {
            termsInUse.add(value);
        }
    });
    const availableTerms = shuffledTerms.filter(term => !termsInUse.has(term));

    const handleDrop = (definition, term) => {
        if (isSubmitted) return;
        
        // Get current matches for this definition
        const currentMatches = matches[definition];
        let newMatches;
        
        if (Array.isArray(currentMatches)) {
            // If already an array, add the new term if it's not already there
            if (!currentMatches.includes(term)) {
                newMatches = [...currentMatches, term];
            } else {
                return; // Term already exists in this definition
            }
        } else if (currentMatches) {
            // If there's already a single term, convert to array
            if (currentMatches !== term) {
                newMatches = [currentMatches, term];
            } else {
                return; // Same term already exists
            }
        } else {
            // First term for this definition
            newMatches = term;
        }
        
        onMatchChange(questionData.id, definition, newMatches);
    };

    const returnTermToAvailable = (term, definition) => {
        if (isSubmitted || !term) return;
        
        const currentMatches = matches[definition];
        let newMatches = null;
        
        if (Array.isArray(currentMatches)) {
            // Remove the specific term from the array
            const filteredTerms = currentMatches.filter(t => t !== term);
            if (filteredTerms.length > 1) {
                newMatches = filteredTerms;
            } else if (filteredTerms.length === 1) {
                newMatches = filteredTerms[0];
            }
            // If filteredTerms.length === 0, newMatches stays null
        } else if (currentMatches === term) {
            newMatches = null;
        }
        
        onMatchChange(questionData.id, definition, newMatches);
    };

    const shouldShowFeedback = (isSubmitted || isIndividuallyChecked) && feedback;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Question Image */}
            {questionData.image && (
                <div className="md:col-span-2">
                    <QuestionImage 
                        imageData={questionData.image} 
                        altText={`Imagen para la pregunta: ${questionData.question}`}
                        className="mb-4"
                    />
                </div>
            )}
            
            {/* Available Terms Section */}
            <div className="space-y-3">
                <h4 className="font-medium text-gray-600 mb-2">Términos (Arrastra desde aquí)</h4>
                {/* Check if all original terms are used */}
                {availableTerms.length === 0 && (questionData.terms || []).length > 0 && !isSubmitted && Object.keys(matches).length > 0 && (
                    <p className="text-sm text-gray-500 italic">Todos los términos han sido usados.</p>
                )}
                {/* Display available terms */}
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
                        <ul className="list-disc list-inside text-sm text-error">
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
                    const droppedTerms = matches[definition] || null;
                    const definitionFeedback = shouldShowFeedback ? (feedback?.definitionFeedback?.[definition] ?? null) : null;
                    
                    // Convert single term to array for consistent handling
                    const termsArray = droppedTerms ? (Array.isArray(droppedTerms) ? droppedTerms : [droppedTerms]) : [];
                    
                    return (
                        <div key={definition} className="relative group">
                            <DropZoneDefinition
                                definition={definition}
                                questionId={questionData.id}
                                droppedTerms={termsArray}
                                onDrop={handleDrop}
                                isSubmitted={isSubmitted}
                                feedback={definitionFeedback}
                            />
                            {/* Return Term Buttons */}
                            {termsArray.length > 0 && !isSubmitted && (
                                <div className="absolute top-1 right-1 flex flex-wrap gap-1">
                                    {termsArray.map((term, index) => (
                                        <button
                                            key={`${term}-${index}`}
                                            type="button"
                                            onClick={() => returnTermToAvailable(term, definition)}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full leading-none opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                            aria-label={`Devolver ${term}`}
                                            title={`Devolver ${term} a la lista`}
                                        >
                                            ✕
                                        </button>
                                    ))}
                                </div>
                            )}
                            {/* Feedback Hint for Incorrect Match */}
                            {shouldShowFeedback && definitionFeedback && !definitionFeedback.isCorrect && (
                                <p className="text-xs text-error mt-1">
                                    Correcto: {Array.isArray(definitionFeedback.correctTerms) && definitionFeedback.correctTerms.length > 0
                                        ? definitionFeedback.correctTerms.map(term => `"${term}"`).join(', ')
                                        : definitionFeedback.correctTerm ? `"${definitionFeedback.correctTerm}"` : 'N/A'
                                    }
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
