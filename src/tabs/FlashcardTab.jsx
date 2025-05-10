import React, { useState, useEffect } from 'react'; // Add React import
import { useStudySets } from '../contexts/useStudySets';
import EmptyFlashcardIcon from '../icons/EmptyFlashcardIcon';
import SingleFlashcardView from '../components/flashcards/SingleFlashcardView';
import GridFlashcardView from '../components/flashcards/GridFlashcardView';
import { shuffleArray } from '../utils/helpers'; // Import shuffleArray
import EmptyFlashcardState from '../components/flashcards/EmptyFlashcardState'; // Import the new component

// FlashcardTab Component: Displays flashcards and handles navigation
const FlashcardTab = () => {
    const { activeFlashcardData, activeFlashcardSetName } = useStudySets();

    const [shuffledData, setShuffledData] = useState([]);
    const [isShuffling, setIsShuffling] = useState(false);
    const [isShuffleEnabled, setIsShuffleEnabled] = useState(true);
    const [viewMode, setViewMode] = useState('single'); // 'single' or 'grid'

    useEffect(() => {
        if (activeFlashcardData && activeFlashcardData.length > 0) {
            if (isShuffleEnabled) {
                setShuffledData(shuffleArray(activeFlashcardData));
            } else {
                setShuffledData([...activeFlashcardData]); // Use original order
            }
        } else {
            setShuffledData([]); // Clear if no data
        }
    }, [activeFlashcardData, isShuffleEnabled]);

    const handleReshuffle = () => {
        if (!activeFlashcardData || activeFlashcardData.length <= 1 || !isShuffleEnabled) return;
        
        setIsShuffling(true);
        
        setTimeout(() => {
            setShuffledData(shuffleArray(activeFlashcardData));
            setIsShuffling(false);
        }, 500);
    };

    if (!activeFlashcardData || activeFlashcardData.length === 0) {
        return (
            <EmptyFlashcardState activeFlashcardSetName={activeFlashcardSetName} />
        );
    }

    return (
        <div className="flex flex-col items-center space-y-6 animate-fade-in">
            {/* View Mode Toggle */}
            <div className="flex justify-center space-x-2 mb-4">
                <button
                    onClick={() => setViewMode('single')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                        viewMode === 'single' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Ver Una
                </button>
                <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                        viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Ver Todas
                </button>
            </div>

            <div className="flex items-center justify-center space-x-2 w-full max-w-md">
                <label htmlFor="shuffle-toggle" className="text-sm text-gray-600">
                    Barajar tarjetas:
                </label>
                <button
                    id="shuffle-toggle"
                    onClick={() => setIsShuffleEnabled(!isShuffleEnabled)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isShuffleEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    aria-pressed={isShuffleEnabled}
                >
                    <span className="sr-only">Activar o desactivar barajado</span>
                    <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isShuffleEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </button>
            </div>

            {viewMode === 'single' ? (
                <SingleFlashcardView
                    shuffledData={shuffledData}
                    isShuffling={isShuffling}
                    isShuffleEnabled={isShuffleEnabled}
                    handleReshuffle={handleReshuffle}
                    activeFlashcardSetName={activeFlashcardSetName}
                />
            ) : (
                <GridFlashcardView
                    flashcards={shuffledData}
                    activeFlashcardSetName={activeFlashcardSetName}
                />
            )}
        </div>
    );
};

export default FlashcardTab;
