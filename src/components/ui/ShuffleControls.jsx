import React from 'react';
import ShuffleIcon from '@/icons/ShuffleIcon';
import ResetIcon from '@/icons/ResetIcon';

/**
 * Reusable ShuffleControls component for handling shuffle and reset order functionality
 * @param {Object} props
 * @param {Function} props.onShuffle - Callback function for shuffle action
 * @param {Function} props.onResetOrder - Callback function for reset order action
 * @param {boolean} props.isInOriginalOrder - Whether the items are in original order
 * @param {string} props.shuffleLabel - Label for shuffle button (default: "Barajar")
 * @param {string} props.resetLabel - Label for reset button (default: "Orden original")
 * @param {string} props.className - Additional CSS classes for the container
 * @param {boolean} props.disabled - Whether controls should be disabled
 */
const ShuffleControls = ({
    onShuffle,
    onResetOrder,
    isInOriginalOrder,
    shuffleLabel = "Barajar",
    resetLabel = "Orden original",
    className = "",
    disabled = false
}) => {
    return (
        <div className={`flex items-center justify-center space-x-4 my-4 ${className}`}>
            <button
                onClick={onShuffle}
                disabled={disabled}
                className={`inline-flex gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                <ShuffleIcon />
                {shuffleLabel}
            </button>
            {!isInOriginalOrder && (
                <button
                    onClick={onResetOrder}
                    disabled={disabled}
                    className={`inline-flex gap-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 ${
                        disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    <ResetIcon />
                    {resetLabel}
                </button>
            )}
        </div>
    );
};

export default ShuffleControls;
