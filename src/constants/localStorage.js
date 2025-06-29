// --- Constants ---

// Default set name for quizzes
export const DEFAULT_QUIZ_SET_NAME = 'Set de Ejemplo (Quiz)';

// Default quiz questions data
export const defaultQuizData = [
    {
        id: 'q_geo_1', type: 'single', question: '¿Cuál es la capital de Francia?',
        options: ['Londres', 'Berlín', 'París', 'Madrid'], correctAnswer: 'París'
    },
    {
        id: 'q_math_1', type: 'multiple', question: '¿Cuáles de los siguientes son números primos?',
        options: ['2', '4', '7', '9', '11'], correctAnswers: ['2', '7', '11']
    },
    {
        id: 'q_match_color_1', type: 'matching', question: 'Une el color con un objeto típico:',
        terms: ['Rojo', 'Amarillo', 'Azul', 'Verde'],
        definitions: ['El cielo en un día despejado', 'Una manzana madura', 'Un limón', 'El césped'],
        correctMatches: {'Rojo': 'Una manzana madura', 'Amarillo': 'Un limón', 'Azul': 'El cielo en un día despejado', 'Verde': 'El césped'}
    },
    {
        id: 'q_lit_1', type: 'single', question: '¿Quién escribió "Don Quijote de la Mancha"?',
        options: ['García Márquez', 'Cervantes', 'Shakespeare', 'Borges'], correctAnswer: 'Cervantes'
    },
    {
        id: 'q_sci_1', type: 'single', question: '¿Cuál es el símbolo químico del agua?',
        options: ['O2', 'CO2', 'H2O', 'NaCl'], correctAnswer: 'H2O'
    },
    // --- New Fill-in-the-Blanks Example ---
    {
        id: 'q_comp_fill_1',
        type: 'fill-in-the-blanks',
        question: 'El [COMPONENT_1] es la unidad central de procesamiento, mientras que la [MEMORY_TYPE] es la memoria volátil principal.',
        blanks: {
            "COMPONENT_1": {
                "options": ["CPU", "GPU", "SSD", "Placa Base"],
                "correctAnswer": "CPU"
            },
            "MEMORY_TYPE": {
                "options": ["RAM", "ROM", "Cache L1", "Disco Duro"],
                "correctAnswer": "RAM"
            }
        }
    },
    // --- Example with Image (Small sample base64 image) ---
    {
        id: 'q_img_example_1',
        type: 'single',
        question: '¿Qué forma geométrica se muestra en la imagen?',
        options: ['Círculo', 'Cuadrado', 'Triángulo', 'Rectángulo'],
        correctAnswer: 'Círculo',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQwIiBmaWxsPSIjM0I4MkY2IiBzdHJva2U9IiMxRTQwQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K'
    }
];

// LocalStorage keys for quizzes
export const QUIZ_SETS_KEY = 'quizSetsReactGeneric';
export const QUIZ_ACTIVE_SET_KEY = 'activeQuizSetNameReactGeneric';
export const QUIZ_PROGRESS_KEY = 'quizProgressReactGeneric'; // Key for quiz progress

// --- Flashcard Constants ---

// Default set name for flashcards
export const DEFAULT_FLASHCARD_SET_NAME = 'Set de Ejemplo (Flashcards)';

// Default flashcard data
export const defaultFlashcardData = [
    {
        id: 'fc_default_1',
        front: 'Capital de Francia',
        back: 'París'
    },
    {
        id: 'fc_default_2',
        front: 'Elemento químico con símbolo O',
        back: 'Oxígeno'
    },
    {
        id: 'fc_default_3',
        front: 'Fórmula del agua',
        back: 'H₂O'
    },
    {
        id: 'fc_img_example_1',
        front: 'Forma geométrica básica',
        back: 'Círculo',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQwIiBmaWxsPSIjRUY0NDQ0IiBzdHJva2U9IiNEQzI2MjYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K'
    }
];

// LocalStorage keys for flashcards
export const FLASHCARD_SETS_KEY = 'flashcardSetsReactGeneric';
export const FLASHCARD_ACTIVE_SET_KEY = 'activeFlashcardSetNameReactGeneric';
