import EmptyFlashcardIcon from '@/icons/EmptyFlashcardIcon';

const EmptyFlashcardState = ({ activeFlashcardSetName, onGoToEditor }) => {
    return (
        <div className="bg-gray-50 p-8 rounded-xl shadow-inner text-center">
            <div className="text-gray-400 flex justify-center mb-4">
                <EmptyFlashcardIcon />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-4">Sin Flashcards</h3>
            <p className="text-gray-600 mb-2">No hay flashcards en el set activo "{activeFlashcardSetName}".</p>
        </div>
    );
};

export default EmptyFlashcardState;
