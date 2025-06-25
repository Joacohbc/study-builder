# Study Builder - Interactive Quiz and Flashcard Creator

A web application built with React and Vite to create, manage, and use interactive quizzes and flashcards.

[🇪🇸 Versión en Español](README_es.md)

## Features

*   **Multiple Content Types**: 
    * **Quizzes**: Single-choice, multiple-choice, matching questions, and fill-in-the-blanks.
    * **Flashcards**: Simple front/back card format for memorization exercises.
    * **Image Support**: Both quizzes and flashcards can include base64-encoded images.
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
    "back": "Paris",
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..." 
}
```

Note: The `image` field is optional and should contain a base64-encoded image string.

### Quiz Question Formats

*   **Single Choice**: `{ id, type: 'single', question, options, correctAnswer, image? }`
*   **Multiple Choice**: `{ id, type: 'multiple', question, options, correctAnswers: [], image? }`
*   **Matching**: `{ id, type: 'matching', question, terms: [], definitions: [], correctMatches: {}, image? }`
*   **Fill-in-the-Blanks**: `{ id, type: 'fill-in-the-blanks', question, blanks: {} }`

#### Image Support for Questions and Flashcards

Both quiz questions and flashcards support optional images through the `image` field:

- **Format**: Base64-encoded string with or without data URL prefix
- **Accepted formats**: `data:image/jpeg;base64,...` or just the base64 string
- **Supported image types**: JPEG, PNG, GIF, WebP, SVG
- **Recommended size**: Keep images under 2MB for optimal performance

**Example with image**:
```json
{
    "id": "q_visual_1",
    "type": "single",
    "question": "What shape is shown in the image?",
    "options": ["Circle", "Square", "Triangle", "Rectangle"],
    "correctAnswer": "Circle",
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
}
```
