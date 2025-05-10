import React, { useState } from 'react';
import Flashcard from './Flashcard';
import ShowAllIcon from './icons/ShowAllIcon'; // Importa el nuevo ícono
import HideAllIcon from './icons/HideAllIcon'; // Importa el nuevo ícono

const GridFlashcardView = ({ flashcards, activeFlashcardSetName }) => {
    const [flippedStates, setFlippedStates] = useState({});

    const handleFlip = (index) => {
        setFlippedStates(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const showAllBacks = () => {
        const newFlippedStates = {};
        flashcards.forEach((_, index) => {
            newFlippedStates[index] = true;
        });
        setFlippedStates(newFlippedStates);
    };

    const hideAllBacks = () => {
        const newFlippedStates = {};
        flashcards.forEach((_, index) => {
            newFlippedStates[index] = false;
        });
        setFlippedStates(newFlippedStates);
    };

    if (!flashcards || flashcards.length === 0) {
        return <p className="text-center text-gray-500">No hay flashcards para mostrar en la cuadrícula.</p>;
    }

    return (
        <div className="animate-fade-in flex flex-col items-center space-y-6 w-full">
            <h2 className="flex items-center justify-center gap-2 text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 mb-6">
                <span className="text-gray-700">Todas las Flashcards:</span> {activeFlashcardSetName}
            </h2>
            <div className="flex space-x-2 mb-4">
                <button
                    onClick={showAllBacks}
                    className="flashcard-control-btn"
                    title="Mostrar Todas las Respuestas"
                >
                    <ShowAllIcon />
                </button>
                <button
                    onClick={hideAllBacks}
                    className="flashcard-control-btn"
                    title="Ocultar Todas las Respuestas"
                >
                    <HideAllIcon />
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {flashcards.map((card, index) => (
                    <Flashcard
                        key={card.id || index} // Assuming cards have a unique id, otherwise use index
                        card={card}
                        isFlipped={!!flippedStates[index]}
                        onFlip={() => handleFlip(index)}
                        // index prop might not be needed here or could be the original index
                    />
                ))}
            </div>
        </div>
    );
};

export default GridFlashcardView;
