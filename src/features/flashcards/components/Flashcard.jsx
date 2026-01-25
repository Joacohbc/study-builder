import { useEffect, useRef } from 'react';
import '@/features/flashcards/components/Flashcard.css';
import QuestionImage from '@/components/ui/QuestionImage';

const Flashcard = ({ card, isFlipped, onFlip, index }) => {
    const frontContentRef = useRef(null);
    const backContentRef = useRef(null);

    const INITIAL_FRONT_FONT_SIZE_REM = 1.5;
    const INITIAL_BACK_FONT_SIZE_REM = 1;
    const MIN_FONT_SIZE_PX = 10; // Minimum font size in pixels

    const adjustFontSize = (element, text, initialRemSize) => {
        if (!element || !text) {
            return;
        }

        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        let currentFontSizePx = initialRemSize * rootFontSize;
        
        // Apply initial/max size to start
        element.style.fontSize = `${currentFontSizePx}px`;

        // RAF to ensure dimensions are calculated after initial style application
        requestAnimationFrame(() => {
            // Reset to initial size before adjustment for each call,
            // in case text/container changed to allow larger font.
            element.style.fontSize = `${initialRemSize * rootFontSize}px`;
            currentFontSizePx = initialRemSize * rootFontSize;

            const maxIterations = 30; 
            let iterations = 0;

            while (
                (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) &&
                currentFontSizePx > MIN_FONT_SIZE_PX &&
                iterations < maxIterations
            ) {
                currentFontSizePx -= 1; 
                element.style.fontSize = `${currentFontSizePx}px`;
                iterations++;
            }
        });
    };

    useEffect(() => {
        if (frontContentRef.current && card.front) {
            adjustFontSize(frontContentRef.current, card.front, INITIAL_FRONT_FONT_SIZE_REM);
        }
    }, [card.front, INITIAL_FRONT_FONT_SIZE_REM]);

    useEffect(() => {
        if (backContentRef.current && card.back) {
            adjustFontSize(backContentRef.current, card.back, INITIAL_BACK_FONT_SIZE_REM);
        }
    }, [card.back, INITIAL_BACK_FONT_SIZE_REM]);

    useEffect(() => {
        const frontEl = frontContentRef.current;
        const backEl = backContentRef.current;

        if (!frontEl && !backEl) return;

        const observer = new ResizeObserver(() => {
            if (frontEl && card.front) {
                adjustFontSize(frontEl, card.front, INITIAL_FRONT_FONT_SIZE_REM);
            }
            if (backEl && card.back) {
                adjustFontSize(backEl, card.back, INITIAL_BACK_FONT_SIZE_REM);
            }
        });

        // Observe the content elements themselves. If their size changes due to parent resizing, this will trigger.
        if (frontEl) observer.observe(frontEl);
        if (backEl) observer.observe(backEl);
        
        return () => {
            if (frontEl) observer.unobserve(frontEl);
            if (backEl) observer.unobserve(backEl);
            observer.disconnect();
        };
    }, [card.front, card.back, INITIAL_FRONT_FONT_SIZE_REM, INITIAL_BACK_FONT_SIZE_REM]);

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
                    
                    {/* Front Image */}
                    {card.image && (
                        <div className="flashcard-image-container mb-3">
                            <QuestionImage 
                                imageData={card.image} 
                                altText={`Imagen para: ${card.front}`}
                                className="max-h-32 object-contain mx-auto"
                            />
                        </div>
                    )}
                    
                    <div 
                        ref={frontContentRef} 
                        className="flashcard-content"
                    >
                        {card.front}
                    </div>
                    <div className="absolute bottom-4 text-xs text-gray-400">
                        Clic para ver la definición
                    </div>
                </div>

                {/* Back Side */}
                <div className="flashcard-back backface-hidden">
                    <div className="flashcard-badge">Definición</div>
                    
                    {/* Back Image (optional - you can also show the same image on both sides) */}
                    {card.image && (
                        <div className="flashcard-image-container mb-3">
                            <QuestionImage 
                                imageData={card.image} 
                                altText={`Imagen para: ${card.front}`}
                                className="max-h-32 object-contain mx-auto"
                            />
                        </div>
                    )}
                    
                    <div 
                        ref={backContentRef} 
                        className="flashcard-content"
                    >
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
