// --- Constants ---
export const DEFAULT_SET_NAME = "Set de Ejemplo"; // Renamed default set
export const LOCAL_STORAGE_SETS_KEY = 'quizSetsReactGeneric'; // Use a new key for the generic version
export const LOCAL_STORAGE_ACTIVE_SET_KEY = 'activeQuizSetNameReactGeneric'; // Use a new key for the generic version

// --- Default Quiz Data (Fallback - Generic Examples) ---
// This data is used if localStorage is empty or for reset
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
    }
];
