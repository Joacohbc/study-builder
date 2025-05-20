import React from 'react';
import SingleChoiceQuestion from '../questions/SingleChoiceQuestion';
import MultipleChoiceQuestion from '../questions/MultipleChoiceQuestion';
import MatchingQuestion from '../questions/MatchingQuestion';
import FillInTheBlanksQuestion from '../questions/FillInTheBlanksQuestion';
import CheckIcon from '../../icons/CheckIcon';

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
                    <p key={`error-${index}`} className="text-red-500 dark:text-red-400">Error: Datos de pregunta inválidos.</p>
                );

                const isIndividuallyChecked = !!individualFeedback[qData.id];
                const questionFeedback = individualFeedback[qData.id] || (isSubmitted ? results?.feedback?.[qData.id] : null);
                const isDisabled = isSubmitted || isIndividuallyChecked;

                let questionStatus = '';
                let statusBgClass = 'bg-white dark:bg-gray-800';
                let statusBorderClass = 'border-gray-200 dark:border-gray-700';

                if (questionFeedback) {
                    if (questionFeedback.isCorrect) {
                        questionStatus = 'Correcta';
                        statusBgClass = 'bg-green-50 dark:bg-green-800 dark:bg-opacity-50';
                        statusBorderClass = 'border-green-200 dark:border-green-700';
                    } else if (questionFeedback.isAnswered) {
                        questionStatus = 'Incorrecta';
                        statusBgClass = 'bg-red-50 dark:bg-red-800 dark:bg-opacity-50';
                        statusBorderClass = 'border-red-200 dark:border-red-700';
                    } else {
                        questionStatus = 'Sin responder';
                        statusBgClass = 'bg-yellow-50 dark:bg-yellow-800 dark:bg-opacity-50';
                        statusBorderClass = 'border-yellow-200 dark:border-yellow-700';
                    }
                }

                return (
                    <div
                        key={qData.id}
                        className={`p-6 rounded-xl shadow-sm border transition-all duration-300 ${statusBgClass} ${statusBorderClass} hover:shadow-md dark:hover:shadow-gray-700/50`}
                        data-question-index={index}
                    >
                        <div className="flex flex-wrap justify-between items-start mb-4">
                            <div className="flex items-center mb-2 md:mb-0">
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-800 dark:bg-opacity-70 text-indigo-800 dark:text-indigo-200 font-medium text-sm mr-3">
                                    {index + 1}
                                </span>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    {qData.type === 'fill-in-the-blanks' ? "Completa la frase:" : qData.question}
                                </h3>
                            </div>
                            {questionStatus && (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${questionFeedback?.isCorrect ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:bg-opacity-60 dark:text-green-200' :
                                    questionFeedback?.isAnswered ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:bg-opacity-60 dark:text-red-200' :
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:bg-opacity-60 dark:text-yellow-200'}`}>
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
                            <p className="mt-3 text-sm text-red-600 dark:text-red-400 font-medium">{questionFeedback.error}</p>
                        )}
                        {!isSubmitted && (
                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={() => handleCheckSingleQuestion(qData.id)}
                                    disabled={isIndividuallyChecked}
                                    className={`flex items-center px-4 py-2 text-sm rounded-lg shadow-sm transition duration-200
                                        ${isIndividuallyChecked
                                            ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-800 dark:bg-opacity-50 dark:text-indigo-300 dark:hover:bg-indigo-700 dark:hover:bg-opacity-60'
                                        }`}
                                >
                                    <CheckIcon className="mr-1" /> {/* Assuming CheckIcon adapts to text color or is dark mode friendly */}
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