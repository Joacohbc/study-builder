import React, { useState, useEffect } from 'react';
import { useStudySets } from '../contexts/useStudySets';
import EmptyFlashcardIcon from '../icons/EmptyFlashcardIcon';
import SingleFlashcardView from '../components/flashcards/SingleFlashcardView';
import GridFlashcardView from '../components/flashcards/GridFlashcardView';
import { useShuffle } from '../hooks/useShuffle';
import EmptyFlashcardState from '../components/flashcards/EmptyFlashcardState';

// FlashcardTab Component: Displays flashcards and handles navigation
const FlashcardTab = () => {
    const { activeFlashcardData, activeFlashcardSetName } = useStudySets();

    const [isShuffling, setIsShuffling] = useState(false);
    const [viewMode, setViewMode] = useState('single'); // 'single' or 'grid'
    const [shuffledData, setShuffledData] = useState([]);

    // Use the shuffle hook for order detection and shuffle functions
    const { 
        isInOriginalOrder,
        shuffle: shuffleFunction,
        resetOrder: resetOrderFunction 
    } = useShuffle(activeFlashcardData, shuffledData);

    // Initialize shuffled data when activeFlashcardData changes
    useEffect(() => {
        if (activeFlashcardData) {
            setShuffledData([...activeFlashcardData]);
        } else {
            setShuffledData([]);
        }
    }, [activeFlashcardData]);

    // Wrapper functions that update the shuffled data state
    const shuffle = () => {
        const newShuffledData = shuffleFunction();
        setShuffledData(newShuffledData);
    };

    const resetOrder = () => {
        const resetData = resetOrderFunction();
        setShuffledData(resetData);
    };

    const handleReshuffle = () => {
        if (!activeFlashcardData || activeFlashcardData.length <= 1) return;
        
        setIsShuffling(true);
        
        setTimeout(() => {
            shuffle(); // Always shuffle when reshuffle is clicked
            setIsShuffling(false);
        }, 500);
    };

    const handleShuffle = () => {
        shuffle(); // Always shuffle when button is clicked
    };

    const handleResetOrder = () => {
        resetOrder(); // Reset to original order
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

            {/* Shuffle Controls */}
            <div className="flex items-center justify-center space-x-4 w-full max-w-md">
                <button
                    onClick={handleShuffle}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                    Barajar tarjetas
                </button>
                {!isInOriginalOrder && (
                    <button
                        onClick={handleResetOrder}
                        className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                        Orden original
                    </button>
                )}
            </div>

            {viewMode === 'single' ? (
                <SingleFlashcardView
                    shuffledData={shuffledData}
                    isShuffling={isShuffling}
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
