import React, { useState, useEffect } from 'react'; // Added useEffect
import Flashcard from './Flashcard';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';
import FlipIcon from './icons/FlipIcon';
import ShuffleIcon from './icons/ShuffleIcon';
import ProgressBar from './ProgressBar';

const SingleFlashcardView = ({
    shuffledData,
    currentIndex,
    isShuffling,
    isShuffleEnabled,
    handlePrev,
    handleNext,
    handleReshuffle,
    activeFlashcardSetName,
}) => {
    const [isFlipped, setIsFlipped] = useState(false); // Local state for flip

    const currentCard = shuffledData[currentIndex];

    // Reset flip state when card changes
    useEffect(() => {
        setIsFlipped(false);
    }, [currentIndex, shuffledData]);

    const handleLocalFlip = () => {
        setIsFlipped(!isFlipped);
    };

    // Call parent's handlePrev and then reset flip state locally
    const onPrev = () => {
        handlePrev();
    };

    // Call parent's handleNext and then reset flip state locally
    const onNext = () => {
        handleNext();
    };

    return (
        <div className="flex flex-col items-center space-y-6 animate-fade-in  w-full">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                <span className="text-gray-700">Flashcards:</span> {activeFlashcardSetName}
            </h2>

            {/* Flashcard Progress Bar */}
            {shuffledData && shuffledData.length > 0 && (
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
                    <ProgressBar
                        current={currentIndex + 1}
                        total={shuffledData.length}
                        label={`Tarjeta ${currentIndex + 1} de ${shuffledData.length}`}
                    />
                </div>
            )}

            {/* Flashcard Display Area */}
            <div className={`w-full ${isShuffling ? 'animate-pulse' : ''}`}>
                {currentCard && (
                    <Flashcard
                        card={currentCard}
                        isFlipped={isFlipped}
                        onFlip={handleLocalFlip} // Use local flip handler
                        index={currentIndex}
                    />
                )}
            </div>

            {/* Controls */}
            <div className="flashcard-controls">
                <button
                    onClick={onPrev} // Use wrapped handler
                    disabled={shuffledData.length <= 1}
                    className={`flashcard-control-btn ${shuffledData.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Tarjeta anterior"
                >
                    <ArrowLeftIcon />
                </button>

                <button
                    onClick={handleLocalFlip} // Use local flip handler for the flip button
                    className="flashcard-control-btn"
                    aria-label="Voltear tarjeta"
                >
                    <FlipIcon />
                </button>

                <button
                    onClick={handleReshuffle}
                    disabled={shuffledData.length <= 1 || isShuffling || !isShuffleEnabled}
                    className={`flashcard-control-btn ${(shuffledData.length <= 1 || isShuffling || !isShuffleEnabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Barajar tarjetas"
                >
                    <ShuffleIcon />
                </button>

                <button
                    onClick={onNext} // Use wrapped handler
                    disabled={shuffledData.length <= 1}
                    className={`flashcard-control-btn ${shuffledData.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Siguiente tarjeta"
                >
                    <ArrowRightIcon />
                </button>
            </div>
        </div>
    );
};

export default SingleFlashcardView;
