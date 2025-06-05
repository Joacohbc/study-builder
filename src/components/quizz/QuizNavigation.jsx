import React, { useState, useEffect, useRef, useCallback } from 'react';
import ArrowLeftIcon from '../../icons/ArrowLeftIcon';
import ArrowRightIcon from '../../icons/ArrowRightIcon';

const QuizNavigation = ({
    currentQuestionIndex,
    totalQuestions,
    onNext,
    onPrevious,
    onGoToFirst,
    onGoToLast
}) => {
    const [isHoldingPrevious, setIsHoldingPrevious] = useState(false);
    const [isHoldingNext, setIsHoldingNext] = useState(false);
    const holdTimeoutRef = useRef(null);
    const holdIntervalRef = useRef(null);

    const accelerationFactor = 200; // ms, speed of navigation when holding
    const initialHoldDelay = 500; // ms, time to wait before starting accelerated navigation

    // Cleanup timers when component unmounts or when hold state changes
    useEffect(() => {
        return () => {
            clearTimeout(holdTimeoutRef.current);
            clearInterval(holdIntervalRef.current);
        };
    }, []);

    useEffect(() => {
        if (!isHoldingPrevious) {
            clearTimeout(holdTimeoutRef.current);
            clearInterval(holdIntervalRef.current);
        } else {
            holdTimeoutRef.current = setTimeout(() => {
                holdIntervalRef.current = setInterval(() => {
                    onPrevious();
                }, accelerationFactor);
            }, initialHoldDelay);
        }
        return () => {
            clearTimeout(holdTimeoutRef.current);
            clearInterval(holdIntervalRef.current);
        };
    }, [isHoldingPrevious, onPrevious]);

    useEffect(() => {
        if (!isHoldingNext) {
            clearTimeout(holdTimeoutRef.current);
            clearInterval(holdIntervalRef.current);
        } else {
            holdTimeoutRef.current = setTimeout(() => {
                holdIntervalRef.current = setInterval(() => {
                    onNext();
                }, accelerationFactor);
            }, initialHoldDelay);
        }
        return () => {
            clearTimeout(holdTimeoutRef.current);
            clearInterval(holdIntervalRef.current);
        };
    }, [isHoldingNext, onNext]);


    const handlePreviousMouseDown = () => {
        setIsHoldingPrevious(true);
    };

    const handleNextMouseDown = () => {
        setIsHoldingNext(true);
    };

    const handleMouseUp = () => {
        setIsHoldingPrevious(false);
        setIsHoldingNext(false);
        clearTimeout(holdTimeoutRef.current);
        clearInterval(holdIntervalRef.current);
    };

    // Use onMouseLeave as a safety, in case the user moves the mouse out while holding
    const handleMouseLeave = () => {
        if (isHoldingPrevious || isHoldingNext) {
            setIsHoldingPrevious(false);
            setIsHoldingNext(false);
            clearTimeout(holdTimeoutRef.current);
            clearInterval(holdIntervalRef.current);
        }
    };

    const handlePreviousClick = useCallback(() => {
        if (isHoldingPrevious) return; // Prevent single click if hold was just released
        onPrevious();
    }, [onPrevious, isHoldingPrevious]);

    const handleNextClick = useCallback(() => {
        if (isHoldingNext) return; // Prevent single click if hold was just released
        onNext();
    }, [onNext, isHoldingNext]);

    const handlePreviousDoubleClick = useCallback(() => {
        onGoToFirst();
    }, [onGoToFirst]);

    const handleNextDoubleClick = useCallback(() => {
        onGoToLast();
    }, [onGoToLast]);

    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    if (totalQuestions === 0) {
        return null; // Don't render navigation if there are no questions
    }

    return (
        <div className="flex items-center justify-between my-6 px-2">
            <button
                onClick={handlePreviousClick}
                onDoubleClick={handlePreviousDoubleClick}
                onMouseDown={handlePreviousMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                disabled={isFirstQuestion && !isHoldingPrevious}
                className={`inline-flex items-center justify-center p-3 rounded-full transition-colors duration-150
                            ${isFirstQuestion && !isHoldingPrevious
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75'
                            }`}
                aria-label="Previous Question"
            >
                <ArrowLeftIcon />
            </button>

            <span className="text-sm font-medium text-gray-700">
                Pregunta {currentQuestionIndex + 1} de {totalQuestions}
            </span>

            <button
                onClick={handleNextClick}
                onDoubleClick={handleNextDoubleClick}
                onMouseDown={handleNextMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                disabled={isLastQuestion && !isHoldingNext}
                className={`inline-flex items-center justify-center p-3 rounded-full transition-colors duration-150
                            ${isLastQuestion && !isHoldingNext
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75'
                            }`}
                aria-label="Next Question"
            >
                <ArrowRightIcon />
            </button>
        </div>
    );
};

export default QuizNavigation;
