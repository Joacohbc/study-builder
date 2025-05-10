import React, { useState, useEffect } from 'react'; // Add React import
import { useStudySets } from '../contexts/useStudySets';
import EmptyFlashcardIcon from './icons/EmptyFlashcardIcon';
import SingleFlashcardView from './SingleFlashcardView';
import GridFlashcardView from './GridFlashcardView';
import { shuffleArray } from '../utils/helpers'; // Import shuffleArray

// FlashcardTab Component: Displays flashcards and handles navigation
const FlashcardTab = () => {
    const { activeFlashcardData, activeFlashcardSetName } = useStudySets();

    const [currentIndex, setCurrentIndex] = useState(0);
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
            setCurrentIndex(0); // Reset index
        } else {
            setShuffledData([]); // Clear if no data
        }
    }, [activeFlashcardData, isShuffleEnabled]);

    const handleNext = () => {
        if (shuffledData.length <= 1) return;
        setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledData.length);
    };

    const handlePrev = () => {
        if (shuffledData.length <= 1) return;
        setCurrentIndex((prevIndex) => (prevIndex - 1 + shuffledData.length) % shuffledData.length);
    };

    const handleReshuffle = () => {
        if (shuffledData.length <= 1 || !isShuffleEnabled) return;
        
        setIsShuffling(true);
        
        setTimeout(() => {
            setShuffledData(shuffleArray(activeFlashcardData));
            setCurrentIndex(0);
            setIsShuffling(false);
        }, 500);
    };

    if (!activeFlashcardData || activeFlashcardData.length === 0) {
        return (
            <div className="bg-gray-50 p-8 rounded-xl shadow-inner text-center">
                {/* Icon for empty state */}
                <div className="text-gray-400 flex justify-center mb-4">
                    <EmptyFlashcardIcon />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-4">Sin Flashcards</h3>
                <p className="text-gray-600 mb-2">No hay flashcards en el set activo "{activeFlashcardSetName}".</p>
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

            {viewMode === 'single' ? (
                <SingleFlashcardView
                    shuffledData={shuffledData}
                    currentIndex={currentIndex}
                    isShuffling={isShuffling}
                    isShuffleEnabled={isShuffleEnabled}
                    handlePrev={handlePrev}
                    handleNext={handleNext}
                    handleReshuffle={handleReshuffle}
                    activeFlashcardSetName={activeFlashcardSetName}
                />
            ) : (
                <GridFlashcardView
                    flashcards={shuffledData}
                    activeFlashcardSetName={activeFlashcardSetName}
                />
            )}
            
            {/* Shuffle Toggle Switch - Common for both views, affects the data source */}
            <div className="flex items-center justify-center space-x-2 mt-6 pt-4 border-t border-gray-200 w-full max-w-md">
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

            <p className="text-sm text-center text-gray-500 max-w-md mt-4">
                {viewMode === 'single' 
                    ? "Haz clic en la tarjeta para voltearla, o usa los botones para navegar entre tarjetas. El botón central permite barajar las tarjetas nuevamente."
                    : "Haz clic en cualquier tarjeta para voltearla. Activa o desactiva \"Barajar tarjetas\" para cambiar el orden."}
            </p>
        </div>
    );
};

export default FlashcardTab;
