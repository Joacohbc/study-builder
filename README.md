# Study Builder - Interactive Quiz and Flashcard Creator

A web application built with React and Vite to create, manage, and use interactive quizzes and flashcards.

[🇪🇸 Versión en Español](README_es.md)

## Features

*   **Multiple Content Types**: 
    * **Quizzes**: Single-choice, multiple-choice, matching questions, and fill-in-the-blanks.
    * **Flashcards**: Simple front/back card format for memorization exercises.
*   **Integrated Editor**: Create and modify both quiz and flashcard sets directly in the application.
*   **Local Storage**: Saves your sets in the browser's local storage.
*   **Interactive Experience**: 
    * **Quizzes**: Test your knowledge with randomized questions and instant feedback.
    * **Flashcards**: Flip cards and navigate through shuffled card decks.
*   **Localization**: Default interface in English, with Spanish language support available.

## Tech Stack

*   React
*   Vite
*   JavaScript
*   Tailwind CSS

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd study-builder
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the application, typically available at `http://localhost:5173`.

## How to Use

1.  **Editor Tab**:
    *   Select whether you want to edit quizzes or flashcards using the radio buttons.
    *   Select an existing set from the dropdown or create a new one.
    *   Add, edit, or delete content using the JSON editor.
    *   Save your changes.
2.  **Quiz Tab**:
    *   Choose a quiz set to take.
    *   Answer the questions.
    *   Submit to see your score and feedback.
3.  **Flashcards Tab**:
    *   Review the front and back of cards in the current set.
    *   Flip cards to reveal answers.
    *   Navigate through the deck with previous/next buttons.
4.  **Help Tab**: Provides guidance on using the application and detailed JSON formats.

## Data Structure

The application supports two main types of content with the following structures:

### Flashcard Format
```json
{
    "id": "fc_example",
    "front": "Capital of France",
    "back": "Paris"
}
```

### Quiz Question Formats

*   **Single Choice**: `{ id, type: 'single', question, options, correctAnswer }`
*   **Multiple Choice**: `{ id, type: 'multiple', question, options, correctAnswers: [] }`
*   **Matching**: `{ id, type: 'matching', question, terms: [], definitions: [], correctMatches: {} }`
*   **Fill-in-the-Blanks**: `{ id, type: 'fill-in-the-blanks', question, blanks: {} }`

See the Help tab in the application for detailed format examples and validation rules.
