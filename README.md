# Study Builder - Interactive Quiz Creator

A web application built with React and Vite to create, manage, and take interactive quizzes.

[🇪🇸 Versión en Español](README_es.md)

## Features

*   **Multiple Question Types**: Supports single-choice, multiple-choice, and matching questions.
*   **Quiz Editor**: Create and modify quiz sets directly in the application.
*   **Local Storage**: Saves your quiz sets in the browser's local storage.
*   **Interactive Quiz Taker**: Test your knowledge with the created quizzes, featuring randomized questions and instant feedback.
*   **Localization**: Default interface in English, with Spanish language support available.

## Tech Stack

*   React
*   Vite
*   JavaScript
*   Tailwind CSS (or standard CSS, depending on `index.css`)

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
    *   Select an existing quiz set from the dropdown or create a new one.
    *   Add, edit, or delete questions (single choice, multiple choice, matching).
    *   Save your changes.
2.  **Quiz Tab**:
    *   Choose a quiz set to take.
    *   Answer the questions.
    *   Submit to see your score and feedback.
3.  **Help Tab**: Provides guidance on using the application.

## Quiz Data Structure

Quiz data is stored as an array of question objects. See `src/constants.js` for the default structure and examples:

*   **Single Choice**: `{ id, type: 'single', question, options, correctAnswer }`
*   **Multiple Choice**: `{ id, type: 'multiple', question, options, correctAnswers: [] }`
*   **Matching**: `{ id, type: 'matching', question, terms: [], definitions: [], correctMatches: {} }`
