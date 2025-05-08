import React, { useState, useEffect } from 'react';
import Flashcard from './Flashcard';
import ArrowLeftIcon from './icons/ArrowLeftIcon'; // Corrected import
import ArrowRightIcon from './icons/ArrowRightIcon'; // Corrected import
import FlipIcon from './icons/FlipIcon'; // Corrected import
import ShuffleIcon from './icons/ShuffleIcon'; // Corrected import
import EmptyFlashcardIcon from './icons/EmptyFlashcardIcon'; // Corrected import

// FlashcardTab Component: Displays flashcards and handles navigation
const FlashcardTab = ({ flashcardData, activeSetName }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [shuffledData, setShuffledData] = useState([]);
    const [isShuffling, setIsShuffling] = useState(false);

    // Shuffle cards when data changes or component mounts
    useEffect(() => {
        if (flashcardData && flashcardData.length > 0) {
            // Simple Fisher-Yates shuffle
            const shuffled = [...flashcardData];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            setShuffledData(shuffled);
            setCurrentIndex(0); // Reset index
            setIsFlipped(false); // Reset flip state
        } else {
            setShuffledData([]); // Clear if no data
        }
    }, [flashcardData]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleNext = () => {
        if (shuffledData.length <= 1) return;
        
        setIsFlipped(false); // Show front of next card
        setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledData.length);
    };

    const handlePrev = () => {
        if (shuffledData.length <= 1) return;
        
        setIsFlipped(false); // Show front of prev card
        setCurrentIndex((prevIndex) => (prevIndex - 1 + shuffledData.length) % shuffledData.length);
    };

    const handleReshuffle = () => {
        if (shuffledData.length <= 1) return;
        
        // Visual indication of shuffling
        setIsShuffling(true);
        
        setTimeout(() => {
            // Simple Fisher-Yates shuffle
            const shuffled = [...shuffledData];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            setShuffledData(shuffled);
            setCurrentIndex(0);
            setIsFlipped(false);
            setIsShuffling(false);
        }, 500);
    };

    if (!shuffledData || shuffledData.length === 0) {
        return (
            <div className="bg-gray-50 p-8 rounded-xl shadow-inner text-center">
                {/* Icon for empty state */}
                <div className="text-gray-400 flex justify-center mb-4">
                    <EmptyFlashcardIcon />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-4">Sin Flashcards</h3>
                <p className="text-gray-600 mb-2">No hay flashcards en el set activo "{activeSetName}".</p>
                <p className="text-gray-600 mb-6">Puedes añadir flashcards en la pestaña "Editor de Sets".</p>
                
                <div className="flex justify-center">
                    <button 
                        onClick={() => {
                            const tabButton = document.querySelector('button[class*="border-indigo-600"]');
                            if (tabButton) tabButton.click();
                        }}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 font-medium rounded-lg hover:bg-indigo-200 transition-colors duration-200"
                    >
                        Ir al Editor
                    </button>
                </div>
            </div>
        );
    }

    const currentCard = shuffledData[currentIndex];
    const progressPercentage = ((currentIndex + 1) / shuffledData.length) * 100;

    return (
        <div className="flex flex-col items-center space-y-6 animate-fade-in">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                <span className="text-gray-700">Flashcards:</span> {activeSetName}
            </h2>

            {/* Flashcard Progress Bar */}
            <div className="flashcard-progress">
                <span className="font-medium">{currentIndex + 1}/{shuffledData.length}</span>
                <div className="flashcard-progress-bar">
                    <div 
                        className="flashcard-progress-fill" 
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <span className="text-xs">{Math.round(progressPercentage)}%</span>
            </div>

            {/* Flashcard Display Area */}
            <div className={`w-full ${isShuffling ? 'animate-pulse' : ''}`}>
                {currentCard && (
                    <Flashcard
                        card={currentCard}
                        isFlipped={isFlipped}
                        onFlip={handleFlip}
                        index={currentIndex}
                    />
                )}
            </div>

            {/* Controls */}
            <div className="flashcard-controls">
                <button
                    onClick={handlePrev}
                    disabled={shuffledData.length <= 1}
                    className={`flashcard-control-btn ${shuffledData.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Tarjeta anterior"
                >
                    <ArrowLeftIcon />
                </button>
                
                <button
                    onClick={handleFlip}
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
                    onClick={handleNext}
                    disabled={shuffledData.length <= 1}
                    className={`flashcard-control-btn ${shuffledData.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Siguiente tarjeta"
                >
                    <ArrowRightIcon />
                </button>
            </div>
            
            {/* Instructions */}
            <p className="text-sm text-center text-gray-500 max-w-md">
                Haz clic en la tarjeta para voltearla, o usa los botones para navegar entre tarjetas.
                <br />El botón central permite barajar las tarjetas nuevamente.
            </p>
        </div>
    );
};

export default FlashcardTab;
