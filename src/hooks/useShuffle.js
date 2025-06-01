import { useCallback } from 'react';
import { shuffleArray } from '../utils/helpers';

/**
 * Custom hook to manage shuffle functionality for any data array
 * @param {Array} originalData - The original data array
 * @param {Array} processedData - The current processed data array
 * @returns {Object} - Shuffle state and controls
 */
export const useShuffle = (originalData, processedData) => {
    // Check if current data is in original order
    const isInOriginalOrder = useCallback(() => {
        if (!originalData || !processedData || originalData.length !== processedData.length) {
            return true;
        }
        
        // Compare IDs or the objects themselves to determine if order is original
        return originalData.every((item, index) => {
            const originalId = item.id || item;
            const processedId = processedData[index]?.id || processedData[index];
            return originalId === processedId;
        });
    }, [originalData, processedData]);

    // Shuffle the data - returns shuffled array
    const shuffle = useCallback(() => {
        if (originalData && originalData.length > 1) {
            return shuffleArray([...originalData]);
        }
        return originalData || [];
    }, [originalData]);

    // Reset to original order - returns original array
    const resetOrder = useCallback(() => {
        return [...(originalData || [])];
    }, [originalData]);

    return {
        isInOriginalOrder: isInOriginalOrder(),
        shuffle,
        resetOrder
    };
};
