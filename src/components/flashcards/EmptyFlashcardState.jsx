import EmptyFlashcardIcon from '../../icons/EmptyFlashcardIcon';

const EmptyFlashcardState = ({ activeFlashcardSetName, onGoToEditor }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-inner text-center">
            <div className="text-gray-400 dark:text-gray-500 flex justify-center mb-4">
                <EmptyFlashcardIcon /> {/* Assuming EmptyFlashcardIcon uses currentColor or is dark mode compatible */}
            </div>
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-4">Sin Flashcards</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-2">No hay flashcards en el set activo "{activeFlashcardSetName}".</p>
        </div>
    );
};

export default EmptyFlashcardState;
