
import React, { useState } from 'react';

const Flashcard = ({ card, isFlipped, onFlip }) => {
    return (
        <div
            className={`relative w-full h-48 border rounded-lg shadow-md cursor-pointer perspective-1000 ${isFlipped ? 'flip' : ''}`}
            onClick={onFlip}
            style={{ transformStyle: 'preserve-3d', transition: 'transform 0.6s' }}
        >
            {/* Front Side */}
            <div
                className={`absolute w-full h-full backface-hidden flex items-center justify-center p-4 text-center bg-white border border-gray-300 rounded-lg ${isFlipped ? 'z-0' : 'z-10'}`}
                style={{ transform: 'rotateY(0deg)' }}
            >
                <p className="text-lg font-medium text-gray-800">{card.front}</p>
            </div>

            {/* Back Side */}
            <div
                className={`absolute w-full h-full backface-hidden flex items-center justify-center p-4 text-center bg-blue-100 border border-blue-300 rounded-lg ${isFlipped ? 'z-10' : 'z-0'}`}
                style={{ transform: 'rotateY(180deg)' }}
            >
                <p className="text-lg text-gray-800">{card.back}</p>
            </div>

            {/* Basic Styling for Flip Effect */}
            <style jsx>{`
                .perspective-1000 { perspective: 1000px; }
                .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
                .flip { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
};

export default Flashcard;
