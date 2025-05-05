import React from 'react';
import './theme/Flashcard.css';

const Flashcard = ({ card, isFlipped, onFlip, index }) => {
    return (
        <div 
            className="flashcard-container flashcard-enter-animation"
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <div 
                className={`flashcard-inner perspective-1000 ${isFlipped ? 'flip' : ''}`} 
                onClick={onFlip}
            >
                {/* Front Side */}
                <div className="flashcard-front backface-hidden">
                    <div className="flashcard-badge">Término</div>
                    <div className="flashcard-content">
                        {card.front}
                    </div>
                    <div className="absolute bottom-4 text-xs text-gray-400">
                        Clic para ver la definición
                    </div>
                </div>

                {/* Back Side */}
                <div className="flashcard-back backface-hidden">
                    <div className="flashcard-badge">Definición</div>
                    <div className="flashcard-content">
                        {card.back}
                    </div>
                    <div className="absolute bottom-4 text-xs text-gray-400">
                        Clic para ver el término
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Flashcard;
