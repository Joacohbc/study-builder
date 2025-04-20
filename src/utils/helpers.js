// Function to shuffle array elements (Fisher-Yates shuffle)
export const shuffleArray = (array) => {
    if (!Array.isArray(array)) return []; // Return empty array if input is not an array
    const shuffled = [...array]; // Create a copy
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
