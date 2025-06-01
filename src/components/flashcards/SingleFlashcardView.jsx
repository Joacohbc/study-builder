import React, { useState, useEffect } from 'react';
import Flashcard from './Flashcard';
import ArrowLeftIcon from '../../icons/ArrowLeftIcon';
import ArrowRightIcon from '../../icons/ArrowRightIcon';
import FlipIcon from '../../icons/FlipIcon';
import ShuffleIcon from '../../icons/ShuffleIcon';
import ProgressBar from '../ProgressBar';

const SingleFlashcardView = ({
    shuffledData,
    isShuffling,
    handleReshuffle,
    activeFlashcardSetName,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        setCurrentIndex(0);
        setIsFlipped(false);
    }, [shuffledData]);

    useEffect(() => {
        if (shuffledData && shuffledData.length > 0) {
            setIsFlipped(false);
        }
    }, [currentIndex]);

    const currentCard = shuffledData && shuffledData.length > 0 ? shuffledData[currentIndex] : null;

    const handleLocalFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const localHandleNext = () => {
        if (!shuffledData || shuffledData.length <= 1) return;
        setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledData.length);
    };

    const localHandlePrev = () => {
        if (!shuffledData || shuffledData.length <= 1) return;
        setCurrentIndex((prevIndex) => (prevIndex - 1 + shuffledData.length) % shuffledData.length);
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
                        onFlip={handleLocalFlip}
                        index={currentIndex}
                    />
                )}
            </div>

            {/* Controls */}
            <div className="flashcard-controls">
                <button
                    onClick={localHandlePrev}
                    disabled={shuffledData.length <= 1}
                    className={`flashcard-control-btn ${shuffledData.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Tarjeta anterior"
                >
                    <ArrowLeftIcon />
                </button>

                <button
                    onClick={handleLocalFlip}
                    className="flashcard-control-btn"
                    aria-label="Voltear tarjeta"
                >
                    <FlipIcon />
                </button>

                <button
                    onClick={handleReshuffle}
                    disabled={shuffledData.length <= 1 || isShuffling}
                    className={`flashcard-control-btn ${(shuffledData.length <= 1 || isShuffling) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Barajar tarjetas"
                >
                    <ShuffleIcon />
                </button>

                <button
                    onClick={localHandleNext}
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
