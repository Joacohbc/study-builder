import React from 'react';
import SingleChoiceQuestion from '@/components/questions/SingleChoiceQuestion';
import MultipleChoiceQuestion from '@/components/questions/MultipleChoiceQuestion';
import MatchingQuestion from '@/components/questions/MatchingQuestion';
import FillInTheBlanksQuestion from '@/components/questions/FillInTheBlanksQuestion';
import CheckIcon from '@/icons/CheckIcon';

const QuestionList = ({
    questions,
    answers,
    individualFeedback,
    isSubmitted,
    results,
    handleAnswerChange,
    handleMatchChange,
    handleFillInTheBlanksChange,
    handleCheckSingleQuestion
}) => {
    return (
        <div id="quiz-container" className="space-y-8">
            {questions.map((qData, index) => {
                if (!qData || !qData.id) return (
                    <p key={`error-${index}`} className="text-red-500">Error: Datos de pregunta inválidos.</p>
                );

                const isIndividuallyChecked = !!individualFeedback[qData.id];
                const questionFeedback = individualFeedback[qData.id] || (isSubmitted ? results?.feedback?.[qData.id] : null);
                const isDisabled = isSubmitted || isIndividuallyChecked;

                // Determine if question is answered
                // Check if there's an actual answer provided by the user
                let hasUserAnswer = false;
                const userAnswer = answers[qData.id];
                
                if (qData.type === 'single') {
                    hasUserAnswer = userAnswer !== undefined && userAnswer !== null && userAnswer !== '';
                } else if (qData.type === 'multiple') {
                    hasUserAnswer = Array.isArray(userAnswer) && userAnswer.length > 0;
                } else if (qData.type === 'matching') {
                    hasUserAnswer = userAnswer && typeof userAnswer === 'object' && Object.keys(userAnswer).length > 0;
                } else if (qData.type === 'fill-in-the-blanks') {
                    hasUserAnswer = userAnswer && typeof userAnswer === 'object' && 
                        Object.values(userAnswer).some(val => val !== undefined && val !== null && val !== '');
                }

                const isAnswered = hasUserAnswer || (questionFeedback?.isAnswered || false);

                let questionStatus = '';
                let statusBgClass = 'bg-white';
                let statusBorderClass = 'border-gray-200';

                if (questionFeedback) {
                    if (questionFeedback.isCorrect) {
                        questionStatus = 'Correcta';
                        statusBgClass = 'bg-green-50';
                        statusBorderClass = 'border-green-200';
                    } else if (questionFeedback.isAnswered) {
                        questionStatus = 'Incorrecta';
                        statusBgClass = 'bg-red-50';
                        statusBorderClass = 'border-red-200';
                    } else {
                        questionStatus = 'Sin responder';
                        statusBgClass = 'bg-yellow-50';
                        statusBorderClass = 'border-yellow-200';
                    }
                }

                return (
                    <div
                        key={qData.id}
                        className={`p-6 rounded-xl shadow-sm border transition-all duration-300 ${statusBgClass} ${statusBorderClass} hover:shadow-md`}
                        data-question-index={index}
                        data-answered={isAnswered}
                    >
                        <div className="flex flex-wrap justify-between items-start mb-4">
                            <div className="flex items-center mb-2 md:mb-0">
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 font-medium text-sm mr-3">
                                    {index + 1}
                                </span>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {qData.type === 'fill-in-the-blanks' ? "Completa la frase:" : qData.question}
                                </h3>
                            </div>
                            {questionStatus && (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${questionFeedback?.isCorrect ? 'bg-green-100 text-green-800' :
                                    questionFeedback?.isAnswered ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'}`}>
                                    {questionStatus}
                                </span>
                            )}
                        </div>
                        <div className="options-container mt-4">
                            {qData.type === 'single' && (
                                <SingleChoiceQuestion
                                    questionData={qData}
                                    questionIndex={index}
                                    selectedAnswer={answers[qData.id] || ''}
                                    onChange={handleAnswerChange}
                                    isSubmitted={isDisabled}
                                    feedback={questionFeedback}
                                    isIndividuallyChecked={isIndividuallyChecked}
                                />
                            )}
                            {qData.type === 'multiple' && (
                                <MultipleChoiceQuestion
                                    questionData={qData}
                                    questionIndex={index}
                                    selectedAnswers={answers[qData.id] || []}
                                    onChange={handleAnswerChange}
                                    isSubmitted={isDisabled}
                                    feedback={questionFeedback}
                                    isIndividuallyChecked={isIndividuallyChecked}
                                />
                            )}
                            {qData.type === 'matching' && (
                                <MatchingQuestion
                                    questionData={qData}
                                    questionIndex={index}
                                    matches={answers[qData.id] || {}}
                                    onMatchChange={handleMatchChange}
                                    isSubmitted={isDisabled}
                                    feedback={questionFeedback}
                                    isIndividuallyChecked={isIndividuallyChecked}
                                />
                            )}
                            {qData.type === 'fill-in-the-blanks' && (
                                <FillInTheBlanksQuestion
                                    questionData={qData}
                                    questionIndex={index}
                                    selectedAnswers={answers[qData.id] || {}}
                                    onChange={handleFillInTheBlanksChange}
                                    isSubmitted={isDisabled}
                                    feedback={questionFeedback}
                                    isIndividuallyChecked={isIndividuallyChecked}
                                />
                            )}
                        </div>
                        {(isSubmitted || isIndividuallyChecked) && questionFeedback?.error && (
                            <p className="mt-3 text-sm text-red-600 font-medium">{questionFeedback.error}</p>
                        )}
                        {!isSubmitted && (
                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={() => handleCheckSingleQuestion(qData.id)}
                                    disabled={isIndividuallyChecked}
                                    className={`flex items-center px-4 py-2 text-sm rounded-lg shadow-sm transition duration-200
                                        ${isIndividuallyChecked
                                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                        }`}
                                >
                                    <CheckIcon className="mr-1" />
                                    {isIndividuallyChecked ? 'Respuesta Revisada' : 'Revisar Respuesta'}
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default QuestionList;