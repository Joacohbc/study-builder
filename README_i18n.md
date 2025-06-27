# Study Builder - Interactive Quiz and Flashcard Creator (Internationalized)

A web application built with React and Vite to create, manage, and use interactive quizzes and flashcards. Now with **full internationalization support** (English/Spanish).

[🇪🇸 Versión en Español](README_es.md)

## 🌐 New Language Features

### Language Support
- **Default Language**: English
- **Secondary Language**: Spanish (Español)
- **Dynamic Language Switching**: Use the language selector in the top-right corner
- **Persistent Settings**: Language preference is saved in browser localStorage

### How to Switch Languages
1. Look for the 🌐 language selector button in the top-right corner
2. Click to toggle between English ↔ Spanish
3. The entire interface will update immediately
4. Your language preference is automatically saved

## Features

*   **Multiple Content Types**:
    *   **Quizzes**: Supports single choice, multiple choice, matching, and fill-in-the-blank questions.
    *   **Flashcards**: Simple front/back card format for memorization exercises.
*   **Built-in Editor**: Create and modify quiz and flashcard sets directly in the app.
*   **Local Storage**: Save your sets in the browser's local storage.
*   **Interactive Experience**:
    *   **Quizzes**: Test your knowledge with randomized questions and instant feedback.
    *   **Flashcards**: Flip through cards and navigate through shuffled decks.
*   **Import/Export**: Backup and restore your data using JSON format.
*   **Internationalization**: Complete English/Spanish interface support.
*   **Responsive Design**: Works on desktop and mobile devices.

## Tech Stack

*   React 19
*   Vite
*   JavaScript
*   Tailwind CSS
*   React Router DOM
*   react-i18next (internationalization)
*   i18next-browser-languagedetector

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

4.  **Build for production:**
    ```bash
    npm run build
    ```

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
4.  **Help Tab**: Provides guidance on using the app and detailed JSON formats.

## Language Configuration

### For Developers

The internationalization system uses `react-i18next`. Key files:

- `src/i18n/i18n.js` - Main i18n configuration
- `src/i18n/locales/en.json` - English translations
- `src/i18n/locales/es.json` - Spanish translations
- `src/components/common/LanguageSelector.jsx` - Language switcher component

### Adding New Languages

1. Create a new translation file in `src/i18n/locales/[language-code].json`
2. Add the language to the resources object in `src/i18n/i18n.js`
3. Update the LanguageSelector component to include the new language

### Translation Keys Structure

```json
{
  "navigation": { "quiz": "Quiz", "flashcards": "Flashcards", ... },
  "common": { "loading": "Loading...", "save": "Save", ... },
  "editor": { "title": "Editor", "saveChanges": "Save Changes", ... },
  "quiz": { "title": "Quiz", "submitAnswers": "Submit Answers", ... },
  "flashcards": { "title": "Flashcards", "flip": "Flip", ... },
  "import": { "title": "Import", ... },
  "export": { "title": "Export", ... },
  "help": { "title": "Help", ... },
  "language": { "current": "English", "switchTo": "Español" }
}
```

## Data Structure

The application supports two main content types with the following structures:

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
*   **Fill-in-the-blanks**: `{ id, type: 'fill-in-the-blanks', question, blanks: {} }`

See the Help tab in the application for detailed format examples and validation rules.

## Contributing

### Translation Contributions
We welcome translations into additional languages! To contribute:

1. Fork the repository
2. Create translation files following the existing structure
3. Test your translations thoroughly
4. Submit a pull request

### Code Contributions
1. Follow the existing code style
2. Ensure all new UI text uses translation keys
3. Test in both English and Spanish
4. Update documentation if necessary

## Deployment

The app is configured for GitHub Pages deployment:

```bash
npm run deploy
```

This builds the project and pushes to the `gh-pages` branch.

## Browser Support

- Modern browsers with ES6+ support
- Local storage support required
- Responsive design works on mobile and desktop

---

**Note**: This application stores all data locally in your browser. Export your data regularly to avoid loss when clearing browser data.
