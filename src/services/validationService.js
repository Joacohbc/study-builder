// src/services/ValidationService.js

/**
 * Validates common fields for all items (id uniqueness).
 * @param {object} item - The item to validate.
 * @param {number} index - The index of the item in the array.
 * @param {Set} ids - Set of existing IDs to check for duplicates.
 * @throws {Error} If validation fails.
 */
const validateCommonFields = (item, index, ids) => {
    if (!item || typeof item !== 'object') {
        throw new Error(`Item en índice ${index} no es un objeto.`);
    }
    if (!item.id || typeof item.id !== 'string' || item.id.trim() === '') {
        throw new Error(`Item en índice ${index} necesita un 'id' (string) no vacío.`);
    }
    if (ids.has(item.id)) {
        throw new Error(`ID duplicado encontrado: '${item.id}'. Los IDs deben ser únicos dentro del set.`);
    }
    ids.add(item.id);
};

/**
 * Validates the optional image field.
 * @param {object} item - The item to validate.
 * @throws {Error} If validation fails.
 */
const validateImage = (item) => {
    if (item.image !== undefined) {
        if (typeof item.image !== 'string' || item.image.trim() === '') {
            throw new Error(`Pregunta '${item.id}': Si se proporciona 'image', debe ser un string base64 no vacío.`);
        }
        const base64Pattern = /^(?:data:image\/[a-zA-Z]*;base64,)?[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Pattern.test(item.image)) {
            throw new Error(`Pregunta '${item.id}': 'image' debe ser una cadena base64 válida o incluir el prefijo data:image.`);
        }
    }
};

/**
 * Validates 'single' choice questions.
 * @param {object} item - The quiz item.
 * @throws {Error} If validation fails.
 */
const validateSingleChoice = (item) => {
    if (!Array.isArray(item.options) || item.options.length < 2) {
        throw new Error(`Pregunta 'single' '${item.id}' necesita un array 'options' con al menos 2 strings.`);
    }
    
    if (typeof item.correctAnswer !== 'string' || !item.options.includes(item.correctAnswer)) {
        throw new Error(`Pregunta 'single' '${item.id}' necesita un 'correctAnswer' (string) que esté presente en 'options'.`);
    }
};

/**
 * Validates 'multiple' choice questions.
 * @param {object} item - The quiz item.
 * @throws {Error} If validation fails.
 */
const validateMultipleChoice = (item) => {
    if (!Array.isArray(item.options) || item.options.length < 2) {
        throw new Error(`Pregunta 'multiple' '${item.id}' necesita un array 'options' con al menos 2 strings.`);
    }
    if (!Array.isArray(item.correctAnswers) || item.correctAnswers.length < 1) {
        throw new Error(`Pregunta 'multiple' '${item.id}' necesita un array 'correctAnswers' con al menos 1 string.`);
    }
    item.correctAnswers.forEach(ans => {
        if (typeof ans !== 'string' || !item.options.includes(ans)) {
            throw new Error(`En pregunta 'multiple' '${item.id}', cada 'correctAnswer' debe ser un string presente en 'options'.`);
        }
    });
};

/**
 * Validates 'matching' questions.
 * @param {object} item - The quiz item.
 * @throws {Error} If validation fails.
 */
const validateMatching = (item) => {
    if (!Array.isArray(item.terms) || item.terms.length < 1) {
        throw new Error(`Pregunta 'matching' '${item.id}' necesita un array 'terms' con al menos 1 string.`);
    }
    if (!Array.isArray(item.definitions) || item.definitions.length < 1) {
        throw new Error(`Pregunta 'matching' '${item.id}' necesita un array 'definitions' con al menos 1 string.`);
    }
    if (!item.correctMatches || typeof item.correctMatches !== 'object') {
        throw new Error(`Pregunta 'matching' '${item.id}' necesita un objeto 'correctMatches'.`);
    }

    let allTermsReferenced = new Set();
    let allDefinitionsReferenced = new Set(); // eslint-disable-line no-unused-vars

    Object.entries(item.correctMatches).forEach(([key, value]) => {
        if (item.terms.includes(key)) {
            // Format 1: key is a term -> value is a definition
            if (typeof value !== 'string' || !item.definitions.includes(value)) {
                throw new Error(`En pregunta 'matching' '${item.id}', si la clave '${key}' es un término, el valor debe ser una definición válida.`);
            }
            allTermsReferenced.add(key);
            allDefinitionsReferenced.add(value);
        } else if (item.definitions.includes(key)) {
            // Format 2: key is a definition -> value is term(s)
            if (Array.isArray(value)) {
                value.forEach(term => {
                    if (typeof term !== 'string' || !item.terms.includes(term)) {
                        throw new Error(`En pregunta 'matching' '${item.id}', si la clave '${key}' es una definición, cada término en el array debe ser válido.`);
                    }
                    allTermsReferenced.add(term);
                });
            } else if (typeof value === 'string') {
                if (!item.terms.includes(value)) {
                    throw new Error(`En pregunta 'matching' '${item.id}', si la clave '${key}' es una definición, el valor '${value}' debe ser un término válido.`);
                }
                allTermsReferenced.add(value);
            } else {
                throw new Error(`En pregunta 'matching' '${item.id}', el valor para la definición '${key}' debe ser un string o array de strings.`);
            }
            allDefinitionsReferenced.add(key);
        } else {
            throw new Error(`En pregunta 'matching' '${item.id}', la clave '${key}' no existe ni en 'terms' ni en 'definitions'.`);
        }
    });

    // Ensure all terms are referenced in correctMatches
    item.terms.forEach(term => {
        if (!allTermsReferenced.has(term)) {
            throw new Error(`En pregunta 'matching' '${item.id}', el término '${term}' no está referenciado en 'correctMatches'.`);
        }
    });
};

/**
 * Validates 'fill-in-the-blanks' questions.
 * @param {object} item - The quiz item.
 * @throws {Error} If validation fails.
 */
const validateFillInTheBlanks = (item) => {
    if (!item.blanks || typeof item.blanks !== 'object') {
        throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}' necesita un objeto 'blanks'.`);
    }
    const hasPlaceholders = /\[[a-zA-Z0-9_]+\]/.test(item.question);
    const hasBlankEntries = Object.keys(item.blanks).length > 0;

    if (hasPlaceholders && !hasBlankEntries) {
        throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}' tiene placeholders en 'question' pero el objeto 'blanks' está vacío.`);
    }
    if (!hasPlaceholders && hasBlankEntries) {
        throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}' tiene entradas en 'blanks' pero no hay placeholders [...] en 'question'.`);
    }
    if (!hasPlaceholders && !hasBlankEntries) return;

    const placeholderMatches = [...item.question.matchAll(/\[([a-zA-Z0-9_]+)\]/g)];
    const placeholderIdsInQuestion = new Set(placeholderMatches.map(match => match[1]));
    const blankKeys = new Set(Object.keys(item.blanks));

    if (placeholderIdsInQuestion.size !== blankKeys.size) {
        throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}': Discrepancia entre placeholders [ID] en 'question' (${placeholderIdsInQuestion.size}) y entradas en 'blanks' (${blankKeys.size}). Deben coincidir.`);
    }

    for (const idInQ of placeholderIdsInQuestion) {
        if (!blankKeys.has(idInQ)) {
            throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}': El placeholder [${idInQ}] existe en 'question' pero no hay entrada para él en 'blanks'.`);
        }
    }

    Object.entries(item.blanks).forEach(([blankId, blankData]) => {
        if (!placeholderIdsInQuestion.has(blankId)) {
            throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}': El ID de blank '${blankId}' existe en 'blanks' pero no como placeholder [${blankId}] en 'question'.`);
        }
        if (!blankData || typeof blankData !== 'object') {
            throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}': La entrada para '${blankId}' en 'blanks' debe ser un objeto.`);
        }
        if (!Array.isArray(blankData.options) || blankData.options.length < 2) {
            throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}', blank '${blankId}': necesita un array 'options' con al menos 2 strings.`);
        }
        if (typeof blankData.correctAnswer !== 'string' || !blankData.options.includes(blankData.correctAnswer)) {
            throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}', blank '${blankId}': necesita un 'correctAnswer' (string) que esté presente en sus 'options'.`);
        }
    });
};

/**
 * Dispatches validation for quiz questions based on their type.
 * @param {object} item - The quiz item.
 * @throws {Error} If validation fails.
 */
const validateQuizItem = (item) => {
    if (!item.type || typeof item.type !== 'string') {
        throw new Error(`Pregunta '${item.id}' necesita un 'type' (string).`);
    }
    if (!item.question || typeof item.question !== 'string') {
        throw new Error(`Pregunta '${item.id}' necesita una 'question' (string).`);
    }

    validateImage(item);

    switch (item.type) {
        case 'single':
            validateSingleChoice(item);
            break;
        case 'multiple':
            validateMultipleChoice(item);
            break;
        case 'matching':
            validateMatching(item);
            break;
        case 'fill-in-the-blanks':
            validateFillInTheBlanks(item);
            break;
        default:
            throw new Error(`Tipo de pregunta desconocido '${item.type}' para la pregunta '${item.id}'. Tipos válidos: 'single', 'multiple', 'matching', 'fill-in-the-blanks'.`);
    }
};

/**
 * Validates flashcard items.
 * @param {object} item - The flashcard item.
 * @throws {Error} If validation fails.
 */
const validateFlashcardItem = (item) => {
    if (!item.front || typeof item.front !== 'string' || item.front.trim() === '') {
        throw new Error(`Flashcard '${item.id}' necesita una propiedad 'front' (string) no vacía.`);
    }
    if (!item.back || typeof item.back !== 'string' || item.back.trim() === '') {
        throw new Error(`Flashcard '${item.id}' necesita una propiedad 'back' (string) no vacía.`);
    }

    validateImage(item); // Reusing image validation as flashcards also have optional images

    const allowedKeys = ['id', 'front', 'back', 'image'];
    Object.keys(item).forEach(key => {
        if (!allowedKeys.includes(key)) {
            console.warn(`Flashcard '${item.id}' tiene una propiedad inesperada: '${key}'. Será ignorada o puedes eliminarla.`);
        }
    });
};

/**
 * Parses and validates a JSON string representing a set of questions or flashcards.
 *
 * @param {string} jsonString - The JSON string to parse and validate.
 * @param {string} setType - The type of set being validated ('quiz', 'flashcard', etc.).
 * @returns {object|null} The parsed data if valid, or null if invalid.
 * @throws {Error} If validation fails, an error with a descriptive message is thrown.
 */
export const parseAndValidateSetData = (jsonString, setType) => {
    const parsedData = JSON.parse(jsonString);
    if (!Array.isArray(parsedData)) {
        throw new Error("El formato debe ser un array JSON: [...]");
    }
    const ids = new Set(); // Keep track of IDs to ensure uniqueness

    parsedData.forEach((item, index) => {
        validateCommonFields(item, index, ids);

        if (setType === 'quiz') {
            validateQuizItem(item);
        } else if (setType === 'flashcard') {
            validateFlashcardItem(item);
        } else {
            throw new Error(`Tipo de set desconocido en validación: '${setType}'`);
        }
    });

    return parsedData;
};
