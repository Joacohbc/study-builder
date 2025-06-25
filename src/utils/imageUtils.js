// Image utilities for handling base64 images in questions and flashcards

/**
 * Validates if a string is a valid base64 image
 * @param {string} imageString - The image string to validate
 * @returns {boolean} True if valid base64 image
 */
export const isValidBase64Image = (imageString) => {
    if (!imageString || typeof imageString !== 'string') {
        return false;
    }

    // Check if it has the data URL prefix
    const dataUrlPattern = /^data:image\/(png|jpg|jpeg|gif|webp|svg\+xml);base64,/;
    if (dataUrlPattern.test(imageString)) {
        return true;
    }

    // Check if it's just base64 without prefix
    const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Pattern.test(imageString);
};

/**
 * Formats a base64 string to include the data URL prefix if missing
 * @param {string} imageString - The base64 string
 * @param {string} mimeType - The MIME type (default: image/jpeg)
 * @returns {string} Formatted data URL
 */
export const formatBase64Image = (imageString, mimeType = 'image/jpeg') => {
    if (!imageString) return '';

    // If already has data URL prefix, return as is
    if (imageString.startsWith('data:')) {
        return imageString;
    }

    // Add the data URL prefix
    return `data:${mimeType};base64,${imageString}`;
};

/**
 * Extracts the MIME type from a data URL
 * @param {string} dataUrl - The data URL
 * @returns {string} MIME type or empty string if not found
 */
export const extractMimeType = (dataUrl) => {
    if (!dataUrl || !dataUrl.startsWith('data:')) {
        return '';
    }

    const match = dataUrl.match(/^data:([^;]+);base64,/);
    return match ? match[1] : '';
};

/**
 * Converts a File object to base64 string
 * @param {File} file - The image file
 * @returns {Promise<string>} Promise that resolves to base64 string
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('No file provided'));
            return;
        }

        if (!file.type.startsWith('image/')) {
            reject(new Error('File is not an image'));
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
    });
};

/**
 * Estimates the size of a base64 image in bytes
 * @param {string} base64String - The base64 string
 * @returns {number} Estimated size in bytes
 */
export const estimateBase64Size = (base64String) => {
    if (!base64String) return 0;

    // Remove data URL prefix if present
    const base64Data = base64String.includes(',') 
        ? base64String.split(',')[1] 
        : base64String;

    // Each base64 character represents 6 bits, so 4 characters = 3 bytes
    // Remove padding characters for more accurate estimate
    const withoutPadding = base64Data.replace(/=/g, '');
    return Math.floor((withoutPadding.length * 3) / 4);
};

/**
 * Creates a simple 1x1 pixel transparent PNG as base64 for testing
 * @returns {string} Base64 data URL for a transparent pixel
 */
export const createTransparentPixel = () => {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
};

/**
 * Validates image size and provides user-friendly error messages
 * @param {string} base64String - The base64 image string
 * @param {number} maxSizeBytes - Maximum allowed size in bytes (default: 2MB)
 * @returns {object} Object with isValid boolean and message string
 */
export const validateImageSize = (base64String, maxSizeBytes = 2 * 1024 * 1024) => {
    const size = estimateBase64Size(base64String);
    
    if (size > maxSizeBytes) {
        const sizeMB = (size / (1024 * 1024)).toFixed(2);
        const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(2);
        return {
            isValid: false,
            message: `La imagen es demasiado grande (${sizeMB}MB). El tamaño máximo permitido es ${maxSizeMB}MB.`
        };
    }

    return {
        isValid: true,
        message: 'Imagen válida'
    };
};
