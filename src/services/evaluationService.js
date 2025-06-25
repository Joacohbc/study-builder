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
            let correctMatchCount = 0; 
            let answeredMatchCount = 0;
            
            questionFeedback.definitionFeedback = {}; 
            questionFeedback.unplacedTerms = [...(qData.terms || [])];
            
            // Helper function to check if a term-definition pair is correct
            const isCorrectMatch = (term, definition) => {
                // Check if correctMatches uses the format { term: definition }
                if (correctMatches[term] === definition) {
                    return true;
                }
                // Check if correctMatches uses the format { definition: [term1, term2] } or { definition: term }
                const correctForDefinition = correctMatches[definition];
                if (Array.isArray(correctForDefinition)) {
                    return correctForDefinition.includes(term);
                } else if (correctForDefinition) {
                    return correctForDefinition === term;
                }
                return false;
            };
            
            (qData.definitions || []).forEach(definition => {
                const droppedTerms = userMatches[definition] || null;
                
                // Convert single term to array for consistent processing
                const droppedTermsArray = droppedTerms ? (Array.isArray(droppedTerms) ? droppedTerms : [droppedTerms]) : [];
                
                // Find all correct terms for this definition
                let correctTermsForDefinition = [];
                if (correctMatches[definition]) {
                    // Format: { definition: [term1, term2] } or { definition: term }
                    correctTermsForDefinition = Array.isArray(correctMatches[definition]) 
                        ? correctMatches[definition] 
                        : [correctMatches[definition]];
                } else {
                    // Format: { term: definition } - find all terms that match this definition
                    correctTermsForDefinition = Object.keys(correctMatches).filter(term => correctMatches[term] === definition);
                }
                
                let definitionCorrectCount = 0;
                let definitionAnsweredCount = 0;
                
                if (droppedTermsArray.length > 0) {
                    definitionAnsweredCount = droppedTermsArray.length;
                    answeredMatchCount += definitionAnsweredCount;
                    
                    droppedTermsArray.forEach(droppedTerm => {
                        if (isCorrectMatch(droppedTerm, definition)) {
                            definitionCorrectCount++;
                            correctMatchCount++;
                        }
                        // Remove from unplaced terms
                        questionFeedback.unplacedTerms = questionFeedback.unplacedTerms.filter(t => t !== droppedTerm);
                    });
                    
                    // Definition is correct if all dropped terms are correct AND all required terms are present
                    const isDefinitionCorrect = definitionCorrectCount === droppedTermsArray.length && 
                                              droppedTermsArray.length >= correctTermsForDefinition.length &&
                                              correctTermsForDefinition.every(correctTerm => droppedTermsArray.includes(correctTerm));
                    
                    questionFeedback.definitionFeedback[definition] = { 
                        userTerms: droppedTermsArray, 
                        correctTerms: correctTermsForDefinition, 
                        isCorrect: isDefinitionCorrect 
                    };
                } else {
                    questionFeedback.definitionFeedback[definition] = { 
                        userTerms: [], 
                        correctTerms: correctTermsForDefinition, 
                        isCorrect: false 
                    };
                }
            });
            
            questionFeedback.isAnswered = answeredMatchCount > 0 || questionFeedback.unplacedTerms.length < totalTerms;
            
            // Calculate if the entire question is correct
            // All terms must be placed correctly and no terms should be unplaced
            const allTermsPlaced = questionFeedback.unplacedTerms.length === 0;
            const allDefinitionsCorrect = (qData.definitions || []).every(def => 
                questionFeedback.definitionFeedback[def]?.isCorrect === true
            );
            
            isCorrect = totalTerms > 0 && allTermsPlaced && allDefinitionsCorrect;
            questionFeedback.correctMatchesCount = correctMatchCount; 
            questionFeedback.totalMatches = totalTerms;
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
