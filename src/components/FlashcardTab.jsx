
import React, { useState, useEffect } from 'react';
import Flashcard from './Flashcard'; // Import the single flashcard component

const FlashcardTab = ({ flashcardData, activeSetName }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [shuffledData, setShuffledData] = useState([]);

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
        setIsFlipped(false); // Show front of next card
        setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledData.length);
    };

    const handlePrev = () => {
        setIsFlipped(false); // Show front of prev card
        setCurrentIndex((prevIndex) => (prevIndex - 1 + shuffledData.length) % shuffledData.length);
    };

    if (!shuffledData || shuffledData.length === 0) {
        return (
            <div className="text-center text-gray-500 p-8">
                <p>No hay flashcards en el set activo "{activeSetName}".</p>
                <p>Puedes añadir flashcards en la pestaña "Editor de Sets".</p>
            </div>
        );
    }

    const currentCard = shuffledData[currentIndex];

    return (
        <div className="flex flex-col items-center space-y-6">
            <h2 className="text-xl font-semibold text-gray-700">Flashcards: {activeSetName}</h2>

            {/* Flashcard Display Area */}
            <div className="w-full max-w-md">
                {currentCard && (
                    <Flashcard
                        card={currentCard}
                        isFlipped={isFlipped}
                        onFlip={handleFlip}
                    />
                )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between w-full max-w-md">
                <button
                    onClick={handlePrev}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l transition duration-150"
                >
                    Anterior
                </button>
                <span className="text-gray-600 text-sm">
                    Tarjeta {currentIndex + 1} de {shuffledData.length}
                </span>
                <button
                    onClick={handleNext}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r transition duration-150"
                >
                    Siguiente
                </button>
            </div>

            {/* Flip Button (alternative/mobile friendly) */}
            <button
                onClick={handleFlip}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition duration-150"
            >
                {isFlipped ? 'Mostrar Frente' : 'Mostrar Dorso'}
            </button>
        </div>
    );
};

export default FlashcardTab;
