// Helper function to evaluate a single question based on its type and user answer
export const evaluateSingleQuestion = (qData, userAnswer) => {
    if (!qData || !qData.id) return { isCorrect: false, error: "Invalid question data." };

    let isCorrect = false;
    let questionFeedback = { isAnswered: false }; // Initialize feedback object

    try {
        if (qData.type === 'single') {
            questionFeedback.isAnswered = userAnswer !== undefined && userAnswer !== null && userAnswer !== '';
            isCorrect = questionFeedback.isAnswered && userAnswer === qData.correctAnswer;
            questionFeedback.correctAnswer = qData.correctAnswer;
            questionFeedback.userAnswer = userAnswer;
        } else if (qData.type === 'multiple') {
            const correctAnswers = qData.correctAnswers || [];
            const selectedAnswers = Array.isArray(userAnswer) ? userAnswer : [];
            questionFeedback.isAnswered = selectedAnswers.length > 0;
            isCorrect = questionFeedback.isAnswered && selectedAnswers.length === correctAnswers.length && correctAnswers.every(answer => selectedAnswers.includes(answer));
            questionFeedback.correctAnswers = correctAnswers;
            questionFeedback.userAnswers = selectedAnswers;
        } else if (qData.type === 'matching') {
            const userMatches = typeof userAnswer === 'object' && userAnswer !== null ? userAnswer : {};
            const correctMatches = qData.correctMatches || {};
            const totalTerms = qData.terms?.length || 0;
            let correctMatchCount = 0; let answeredMatchCount = 0;
            questionFeedback.definitionFeedback = {}; questionFeedback.unplacedTerms = [...(qData.terms || [])];
            (qData.definitions || []).forEach(definition => {
                const droppedTerm = userMatches[definition] || null;
                // Find the correct term for this definition
                const correctTerm = Object.keys(correctMatches).find(termKey => correctMatches[termKey] === definition) || null;
                if (droppedTerm) {
                    answeredMatchCount++;
                    // Check if the dropped term correctly matches this definition
                    const isMatchCorrect = correctMatches[droppedTerm] === definition;
                    if (isMatchCorrect) { correctMatchCount++; }
                    questionFeedback.definitionFeedback[definition] = { userTerm: droppedTerm, correctTerm: correctTerm, isCorrect: isMatchCorrect };
                    questionFeedback.unplacedTerms = questionFeedback.unplacedTerms.filter(t => t !== droppedTerm);
                } else {
                    questionFeedback.definitionFeedback[definition] = { userTerm: null, correctTerm: correctTerm, isCorrect: false };
                }
            });
            questionFeedback.isAnswered = answeredMatchCount > 0 || questionFeedback.unplacedTerms.length < totalTerms;
            isCorrect = totalTerms > 0 && correctMatchCount === totalTerms && questionFeedback.unplacedTerms.length === 0;
            questionFeedback.correctMatchesCount = correctMatchCount; questionFeedback.totalMatches = totalTerms;
        } else if (qData.type === 'fill-in-the-blanks') {
            const userBlanks = typeof userAnswer === 'object' && userAnswer !== null ? userAnswer : {};
            const correctBlanks = qData.blanks || {};
            const blankIds = Object.keys(correctBlanks);
            let correctBlanksCount = 0;
            let answeredBlanksCount = 0;
            questionFeedback.blankFeedback = {}; // Store feedback per blank

            blankIds.forEach(blankId => {
                const userAnswerForBlank = userBlanks[blankId] || null;
                const correctAnswerForBlank = correctBlanks[blankId]?.correctAnswer;
                const isBlankAnswered = userAnswerForBlank !== null && userAnswerForBlank !== "";
                const isBlankCorrect = isBlankAnswered && userAnswerForBlank === correctAnswerForBlank;

                if (isBlankAnswered) {
                    answeredBlanksCount++;
                }
                if (isBlankCorrect) {
                    correctBlanksCount++;
                }
                questionFeedback.blankFeedback[blankId] = {
                    userAnswer: userAnswerForBlank,
                    correctAnswer: correctAnswerForBlank,
                    isCorrect: isBlankCorrect
                };
            });

            questionFeedback.isAnswered = answeredBlanksCount > 0;
            // Considered correct only if all blanks are answered correctly
            isCorrect = blankIds.length > 0 && correctBlanksCount === blankIds.length;
            questionFeedback.correctBlanksCount = correctBlanksCount;
            questionFeedback.totalBlanks = blankIds.length;
        }

        questionFeedback.isCorrect = isCorrect;

    } catch (error) {
        console.error(`Error evaluating question ${qData.id}:`, error, qData);
        questionFeedback.error = "Error al evaluar esta pregunta.";
        questionFeedback.isCorrect = false;
    }
    return questionFeedback;
};
