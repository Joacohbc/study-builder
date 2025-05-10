import React, { useState } from 'react';
import { AI_PROMPT, HELP_TAB_CONTENT } from '../constants/helpTabConstants';
import { copyToClipboard } from '../utils/clipboardManager';

// Help Tab Component: Displays static help content using JSX and adds Copy Prompt button
const HelpTab = () => {
    // Define styles for code blocks and inline code
    const codeBlockStyle = "bg-gray-100 p-3 rounded-md overflow-x-auto my-2 font-mono text-sm whitespace-pre-wrap break-words";
    const inlineCodeStyle = "bg-gray-200 text-sm px-1 py-0.5 rounded font-mono";
    // State for copy confirmation message
    const [copySuccess, setCopySuccess] = useState('');

    // The prompt to be copied
    const aiPrompt = AI_PROMPT;

    // Function to copy the prompt to clipboard
    const handleCopyPrompt = async () => {
        const success = await copyToClipboard(aiPrompt);
        if (success) {
            // Success feedback
            setCopySuccess(HELP_TAB_CONTENT.copySuccessMessage);
            setTimeout(() => setCopySuccess(''), 3000); // Clear message after 3 seconds
        } else {
            // Error feedback
            setCopySuccess(HELP_TAB_CONTENT.copyErrorMessage);
            setTimeout(() => setCopySuccess(''), 3000);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">{HELP_TAB_CONTENT.title}</h2>

            {/* Button to copy the AI prompt */}
            <div className="mb-6 text-center">
                <button
                    onClick={handleCopyPrompt}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-5 rounded-lg shadow-sm transition duration-150"
                >
                    {HELP_TAB_CONTENT.copyPromptButton}
                </button>
                {/* Display copy success/error message */}
                {copySuccess && (
                    <p className={`mt-2 text-sm ${copySuccess.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                        {copySuccess}
                    </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    {HELP_TAB_CONTENT.copyPromptSubText}
                </p>
            </div>

            {/* Static help content */}
            <div id="explanation-content" className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none space-y-3 border-t pt-6">
                {/* Updated title */}
                <h2 className="text-xl md:text-2xl font-semibold mt-4 mb-2">{HELP_TAB_CONTENT.studyBuilderTitle}</h2>
                <p className="mb-4">
                    {HELP_TAB_CONTENT.studyBuilderDescription}
                </p>

                <h3 className="text-lg md:text-xl font-semibold mt-3 mb-1">{HELP_TAB_CONTENT.featuresTitle}</h3>
                <ul className="list-disc list-inside space-y-1">
                    {HELP_TAB_CONTENT.featuresList.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>

                <h3 className="text-lg md:text-xl font-semibold mt-3 mb-1">{HELP_TAB_CONTENT.howToUseTitle}</h3>
                <ol className="list-decimal list-inside space-y-1">
                    {HELP_TAB_CONTENT.howToUseSteps.map((step, index) => (
                        <li key={index}>
                            <strong>{step.title}</strong>: {step.description}
                            {step.subSteps && (
                                <ul className="list-disc list-inside ml-4 my-1 space-y-1">
                                    {step.subSteps.map((subStep, subIndex) => (
                                        <li key={subIndex}>{subStep}</li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ol>

                <h3 className="text-lg md:text-xl font-semibold mt-3 mb-1">{HELP_TAB_CONTENT.jsonFormatTitle}</h3>
                <p>
                    {HELP_TAB_CONTENT.jsonFormatDescription.replace(/<code className={inlineCodeStyle}>id<\/code>/g, () => `<code class="${inlineCodeStyle}">id</code>`)}
                </p>


                {/* Add Flashcard Format Section */}
                <h4 className="text-md md:text-lg font-semibold mt-3 mb-1">{HELP_TAB_CONTENT.flashcardFormatTitle}</h4>
                <ul className="list-disc list-inside space-y-1">
                    {HELP_TAB_CONTENT.flashcardFormatList.map((item, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: item.replace(/<code className={inlineCodeStyle}>(.*?)<\/code>/g, `<code class="${inlineCodeStyle}">$1</code>`) }}></li>
                    ))}
                </ul>
                {/* Flashcard JSON example */}
                <pre className={codeBlockStyle}><code>{HELP_TAB_CONTENT.flashcardExample}</code></pre>

                <h4 className="text-md md:text-lg font-semibold mt-3 mb-1">{HELP_TAB_CONTENT.quizQuestionFormatTitle}</h4>
                <ul className="list-disc list-inside space-y-1">
                    {HELP_TAB_CONTENT.quizQuestionFormatList.map((item, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: item.replace(/<code className={inlineCodeStyle}>(.*?)<\/code>/g, `<code class="${inlineCodeStyle}">$1</code>`) }}></li>
                    ))}
                </ul>

                <h4 className="text-md md:text-lg font-semibold mt-2 mb-1">{HELP_TAB_CONTENT.singleTypeTitle}</h4>
                <ul className="list-disc list-inside space-y-1">
                    {HELP_TAB_CONTENT.singleTypeList.map((item, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: item.replace(/<code className={inlineCodeStyle}>(.*?)<\/code>/g, `<code class="${inlineCodeStyle}">$1</code>`) }}></li>
                    ))}
                </ul>
                {/* Correctly formatted JSON example */}
                <pre className={codeBlockStyle}><code>{HELP_TAB_CONTENT.singleTypeExample}</code></pre>

                <h4 className="text-md md:text-lg font-semibold mt-2 mb-1">{HELP_TAB_CONTENT.multipleTypeTitle}</h4>
                <ul className="list-disc list-inside space-y-1">
                    {HELP_TAB_CONTENT.multipleTypeList.map((item, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: item.replace(/<code className={inlineCodeStyle}>(.*?)<\/code>/g, `<code class="${inlineCodeStyle}">$1</code>`) }}></li>
                    ))}
                </ul>
                {/* Correctly formatted JSON example */}
                <pre className={codeBlockStyle}><code>{HELP_TAB_CONTENT.multipleTypeExample}</code></pre>

                <h4 className="text-md md:text-lg font-semibold mt-2 mb-1">{HELP_TAB_CONTENT.matchingTypeTitle}</h4>
                <ul className="list-disc list-inside space-y-1">
                    {HELP_TAB_CONTENT.matchingTypeList.map((item, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: item.replace(/<code className={inlineCodeStyle}>(.*?)<\/code>/g, `<code class="${inlineCodeStyle}">$1</code>`) }}></li>
                    ))}
                </ul>
                {/* Correctly formatted JSON example */}
                <pre className={codeBlockStyle}><code>{HELP_TAB_CONTENT.matchingTypeExample}</code></pre>

                {/* --- New Fill-in-the-Blanks Type --- */}
                <h4 className="text-md md:text-lg font-semibold mt-2 mb-1">{HELP_TAB_CONTENT.fillInTheBlanksTitle}</h4>
                <ul className="list-disc list-inside space-y-1">
                    {HELP_TAB_CONTENT.fillInTheBlanksList.map((item, index) => (
                         <li key={index} dangerouslySetInnerHTML={{ __html: item.replace(/<code className={inlineCodeStyle}>(.*?)<\/code>/g, `<code class="${inlineCodeStyle}">$1</code>`) }}></li>
                    ))}
                    <ul className="list-disc list-inside ml-4 my-1 space-y-1">
                        {HELP_TAB_CONTENT.fillInTheBlanksSubList.map((item, index) => (
                           <li key={index} dangerouslySetInnerHTML={{ __html: item.replace(/<code className={inlineCodeStyle}>(.*?)<\/code>/g, `<code class="${inlineCodeStyle}">$1</code>`) }}></li>
                        ))}
                    </ul>
                </ul>
                <pre className={codeBlockStyle}><code>{HELP_TAB_CONTENT.fillInTheBlanksExample}</code></pre>
            </div>
        </div>
    );
};

export default HelpTab;
