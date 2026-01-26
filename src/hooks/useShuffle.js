import { shuffleArray } from '@/utils/helpers';

/**
 * Custom hook to manage shuffle functionality for any data array
 * @param {Array} originalData - The original data array
 * @param {Array} processedData - The current processed data array
 * @returns {Object} - Shuffle state and controls
 */
export const useShuffle = (originalData, processedData) => {
    // Check if current data is in original order
    const isInOriginalOrder = () => {
        if (!originalData || !processedData || originalData.length !== processedData.length) {
            return true;
        }
        
        // Compare IDs or the objects themselves to determine if order is original
        return originalData.every((item, index) => {
            const originalId = item.id || item;
            const processedId = processedData[index]?.id || processedData[index];
            return originalId === processedId;
        });
    };

    // Shuffle the data - returns shuffled array
    const shuffle = () => {
        if (originalData && originalData.length > 1) {
            return shuffleArray([...originalData]);
        }
        return originalData || [];
    };

    // Reset to original order - returns original array
    const resetOrder = () => {
        return [...(originalData || [])];
    };

    return {
        isInOriginalOrder: isInOriginalOrder(),
        shuffle,
        resetOrder
    };
};
