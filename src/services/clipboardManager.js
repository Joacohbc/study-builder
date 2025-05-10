// src/utils/clipboardManager.js

/**
 * Copies the given text to the clipboard.
 * @param {string} text - The text to copy.
 * @returns {Promise<boolean>} - True if successful, false otherwise.
 */
export const copyToClipboard = async (text) => {
    if (!navigator.clipboard) {
        console.error('Clipboard API not available');
        return false;
    }
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
};

/**
 * Reads text from the clipboard.
 * @returns {Promise<string|null>} - The text from the clipboard, or null if an error occurs or API is not available.
 */
export const readFromClipboard = async () => {
    if (!navigator.clipboard) {
        console.error('Clipboard API not available');
        return null;
    }
    try {
        const text = await navigator.clipboard.readText();
        return text;
    } catch (err) {
        console.error('Failed to read from clipboard: ', err);
        return null;
    }
};
