import { useTranslation } from 'react-i18next';

// Hook to get translated help content
export const useHelpContent = () => {
  const { t } = useTranslation();

  const AI_PROMPT = `You are an AI assistant designed to create interactive quiz questions and/or flashcards from a provided text or document. Your goal is to generate two separate JSON arrays: one for flashcards and another for quiz questions.

**General Response Format:**
You must provide two separate JSON arrays with the following format:

**Flashcard Array:**
[
  { /* Flashcard 1 */ },
  { /* Flashcard 2 */ },
  ...
]

**Quiz Question Array:**
[
  { /* Question 1 */ },
  { /* Question 2 */ },
  ...
]

**Object Formats:**

1.  **Flashcard:**
    * \`id\`: Unique string (e.g. "fc_1").
    * \`front\`: String with the front content of the card (question, term or concept).
    * \`back\`: String with the back content of the card (answer, definition or explanation).
    * \`image\` (optional): String with image in base64 format or data URL. Will be displayed on both sides of the card.

    *Example:*
    \`\`\`json
    {
      "id": "fc_example",
      "front": "What is React?",
      "back": "A JavaScript library for building user interfaces"
    }
    \`\`\`

    *Example with image:*
    \`\`\`json
    {
      "id": "fc_with_image",
      "front": "What geometric shape is this?",
      "back": "Circle",
      "image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9ImJsdWUiLz48L3N2Zz4="
    }
    \`\`\`

2.  **Single Choice (\`single\`):**
    * \`id\`: Unique string (e.g. "q_single_1").
    * \`type\`: "single".
    * \`question\`: String with the question.
    * \`options\`: Array of strings with possible answers (includes the correct one). Must have at least 2 options. Create plausible but incorrect distractors.
    * \`correctAnswer\`: String that exactly matches the correct answer within the \`options\` array.
    * \`image\` (optional): String with image in base64 format or data URL.

    *Example:*
    \`\`\`json
    {
      "id": "q_single_example",
      "type": "single",
      "question": "What is the main function of component X?",
      "options": ["Store data", "Process input", "Display info", "Manage network"],
      "correctAnswer": "Process input"
    }
    \`\`\`

    *Example with image:*
    \`\`\`json
    {
      "id": "q_single_with_image",
      "type": "single", 
      "question": "What geometric shape is shown in the image?",
      "options": ["Circle", "Square", "Triangle", "Rectangle"],
      "correctAnswer": "Circle",
      "image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9ImJsdWUiLz48L3N2Zz4="
    }
    \`\`\`

3.  **Multiple Choice (\`multiple\`):**
    * \`id\`: Unique string (e.g. "q_multi_1").
    * \`type\`: "multiple".
    * \`question\`: String with the question (indicate multiple selection).
    * \`options\`: Array of strings with possible answers (includes correct ones). At least 3 options.
    * \`correctAnswers\`: Array of strings that match *all* correct answers in \`options\`.
    * \`image\` (optional): String with image in base64 format or data URL.

    *Example:*
    \`\`\`json
    {
      "id": "q_multi_example",
      "type": "multiple",
      "question": "What are benefits of approach Y? (Select all)",
      "options": ["Speed", "Cost", "Complexity", "Scalability"],
      "correctAnswers": ["Speed", "Scalability"]
    }
    \`\`\`

4.  **Match Concepts (\`matching\`):**
    * \`id\`: Unique string (e.g. "q_match_1").
    * \`type\`: "matching".
    * \`question\`: String with the instruction (e.g. "Match each term with its definition:").
    * \`terms\`: Array of strings (key terms).
    * \`definitions\`: Array of strings (definitions). Same number as terms.
    * \`image\` (optional): String with image in base64 format or data URL.
    * \`correctMatches\`: Object { term: correct_definition }. Each term/definition must be unique here.

    *Example:*
    \`\`\`json
    {
      "id": "q_match_example",
      "type": "matching",
      "question": "Match component and description:",
      "terms": ["CPU", "RAM", "Hard Drive"],
      "definitions": ["Volatile memory", "Processor", "Persistent storage"],
      "correctMatches": { "CPU": "Processor", "RAM": "Volatile memory", "Hard Drive": "Persistent storage" }
    }
    \`\`\`

5.  **Fill in the Blanks (\`fill-in-the-blanks\`):**
    * \`id\`: Unique string (e.g. "q_fill_1").
    * \`type\`: "fill-in-the-blanks".
    * \`question\`: String with text containing placeholders like \`[BLANK_ID]\`. The \`BLANK_ID\` must be uppercase strings with letters, numbers and underscores (e.g. \`[TERM_1]\`, \`[DEFINITION_A]\`).
    * \`blanks\`: Object where each key is a \`BLANK_ID\` (without brackets) that appears in \`question\`. The value for each key is an object with:
        * \`options\`: Array of strings with possible answers for that blank (includes the correct one). At least 2 options. Create plausible distractors.
        * \`correctAnswer\`: String that exactly matches the correct answer for that blank within its \`options\` array.

    *Example:*
    \`\`\`json
    {
      "id": "q_fill_example",
      "type": "fill-in-the-blanks",
      "question": "The [LANG] language is interpreted, while [COMP_LANG] is compiled. Both use [DATA_FORMAT] for data exchange.",
      "blanks": {
        "LANG": {
          "options": ["Python", "C++", "Java"],
          "correctAnswer": "Python"
        },
        "COMP_LANG": {
          "options": ["JavaScript", "C++", "Ruby"],
          "correctAnswer": "C++"
        },
        "DATA_FORMAT": {
          "options": ["XML", "JSON", "YAML"],
          "correctAnswer": "JSON"
        }
      }
    }
    \`\`\`

**Instructions for Generating Content:**

1.  **Analyze Text:** Carefully read the provided document/text.
2.  **Identify Key Content:** Look for definitions, concepts, comparisons, lists, processes, key facts, important phrases.
3.  **Generate Appropriate Format:**
    * For **flashcards**: Identify concept/definition pairs or question/answer pairs.
    * For **quizzes**: Create a mix of the four question types if the content allows.
4.  **Formulate Clear Content:** Ensure everything is direct and easy to understand.
5.  **Ensure Accuracy:** Verify that all information is based directly on the source text.
6.  **Generate Unique IDs:** Assign a unique and descriptive \`id\` to each element (e.g. "fc_1", "q_1", etc.).
7.  **Output:** Provide TWO separate JSON arrays:
    * **First:** Array of flashcards (can be empty if you don't generate flashcards)
    * **Second:** Array of quiz questions (can be empty if you don't generate questions)
    * Do not include additional text before or after the arrays.

    * Response format:
    \`\`\`
    QUESTIONS:
    [array of questions here]
    \`\`\`

    \`\`\`
    FLASHCARDS:
    [array of flashcards here]
    \`\`\`

**Source Text:**
[Paste here the text or document from which to generate content]`;

  const HELP_TAB_CONTENT = {
    title: t('help.title'),
    copyPromptButton: t('help.copyPromptButton'),
    copySuccessMessage: t('help.copySuccessMessage'),
    copyErrorMessage: t('help.copyErrorMessage'),
    copyPromptSubText: t('help.copyPromptSubText'),
    studyBuilderTitle: t('help.studyBuilderTitle'),
    studyBuilderDescription: t('help.studyBuilderDescription'),
    featuresTitle: t('help.featuresTitle'),
    featuresList: t('help.features'),
    howToUseTitle: t('help.howToUseTitle'),
    howToUseSteps: t('help.howToUseSteps'),
    jsonFormatTitle: t('help.jsonFormatTitle'),
    jsonFormatDescription: t('help.jsonFormatDescription'),
    flashcardFormatTitle: t('help.flashcardFormatTitle'),
    flashcardFormatList: t('help.flashcardFormatList'),
    quizQuestionFormatTitle: t('help.quizQuestionFormatTitle'),
    quizQuestionFormatList: t('help.quizQuestionFormatList'),
    singleTypeTitle: t('help.singleTypeTitle'),
    singleTypeList: t('help.singleTypeList'),
    multipleTypeTitle: t('help.multipleTypeTitle'),
    multipleTypeList: t('help.multipleTypeList'),
    matchingTypeTitle: t('help.matchingTypeTitle'),
    matchingTypeList: t('help.matchingTypeList'),
    fillInTheBlanksTitle: t('help.fillInTheBlanksTitle'),
    fillInTheBlanksList: t('help.fillInTheBlanksList'),
    fillInTheBlanksSubList: t('help.fillInTheBlanksSubList'),
    imageSupportTitle: t('help.imageSupportTitle'),
    imageSupportIntro: t('help.imageSupportIntro'),
    imageSupportFormatTitle: t('help.imageSupportFormatTitle'),
    imageSupportFormatList: t('help.imageSupportFormatList'),
    imageSupportGuidelines: t('help.imageSupportGuidelines'),
    imageGuidelinesList: t('help.imageGuidelinesList'),
    // Add example strings that were previously hardcoded
    flashcardExample: `{
    "id": "fc_example",
    "front": "${t('help.flashcardFormatList.0') === 'id: Unique identifier for the flashcard (string, e.g. "fc1").' ? 'Capital of France' : 'Capital de Francia'}",
    "back": "${t('help.flashcardFormatList.0') === 'id: Unique identifier for the flashcard (string, e.g. "fc1").' ? 'Paris' : 'París'}"
}`
  };

  return { AI_PROMPT, HELP_TAB_CONTENT };
};
