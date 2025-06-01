/**
 * Utility functions for calculating quiz progress
 */

/**
 * Calculates the completion percentage from quiz progress data
 * @param {object} progressData - The saved progress data with answers and questionOrder
 * @returns {number} - The completion percentage (0-100)
 */
export const calculateProgressPercentage = (progressData) => {
    if (!progressData || !progressData.questionOrder || !progressData.answers) {
        return 0;
    }

    const { questionOrder, answers } = progressData;
    
    if (questionOrder.length === 0) {
        return 0;
    }

    // Count answered questions using the same logic as QuizTab
    const answeredQuestions = questionOrder.filter(q => 
        q.id && (
            answers[q.id] !== undefined && 
            answers[q.id] !== null && 
            (typeof answers[q.id] !== 'object' || 
            Object.keys(answers[q.id]).length > 0)
        )
    );

    return Math.round((answeredQuestions.length / questionOrder.length) * 100);
};
