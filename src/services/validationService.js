// src/services/ValidationService.js

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
        if (!item || typeof item !== 'object') throw new Error(`Item en índice ${index} no es un objeto.`);

        // --- ID Validation (Common to all item types) ---
        if (!item.id || typeof item.id !== 'string' || item.id.trim() === '') throw new Error(`Item en índice ${index} necesita un 'id' (string) no vacío.`);
        if (ids.has(item.id)) throw new Error(`ID duplicado encontrado: '${item.id}'. Los IDs deben ser únicos dentro del set.`);
        ids.add(item.id);

        // --- Type-Specific Validation ---
        if (setType === 'quiz') {
            if (!item.type || typeof item.type !== 'string') throw new Error(`Pregunta '${item.id}' necesita un 'type' (string).`);
            if (!item.question || typeof item.question !== 'string') throw new Error(`Pregunta '${item.id}' necesita una 'question' (string).`);

            // --- Optional Image Validation ---
            if (item.image !== undefined) {
                if (typeof item.image !== 'string' || item.image.trim() === '') {
                    throw new Error(`Pregunta '${item.id}': Si se proporciona 'image', debe ser un string base64 no vacío.`);
                }
                // Basic base64 validation (optional - check if it looks like base64)
                const base64Pattern = /^(?:data:image\/[a-zA-Z]*;base64,)?[A-Za-z0-9+/]*={0,2}$/;
                if (!base64Pattern.test(item.image)) {
                    throw new Error(`Pregunta '${item.id}': 'image' debe ser una cadena base64 válida o incluir el prefijo data:image.`);
                }
            }

            switch (item.type) {
                case 'single':
                    if (!Array.isArray(item.options) || item.options.length < 2) throw new Error(`Pregunta 'single' '${item.id}' necesita un array 'options' con al menos 2 strings.`);
                    if (typeof item.correctAnswer !== 'string' || !item.options.includes(item.correctAnswer)) throw new Error(`Pregunta 'single' '${item.id}' necesita un 'correctAnswer' (string) que esté presente en 'options'.`);
                    break;
                case 'multiple':
                    if (!Array.isArray(item.options) || item.options.length < 2) throw new Error(`Pregunta 'multiple' '${item.id}' necesita un array 'options' con al menos 2 strings.`);
                    if (!Array.isArray(item.correctAnswers) || item.correctAnswers.length < 1) throw new Error(`Pregunta 'multiple' '${item.id}' necesita un array 'correctAnswers' con al menos 1 string.`);
                    item.correctAnswers.forEach(ans => { if (typeof ans !== 'string' || !item.options.includes(ans)) throw new Error(`En pregunta 'multiple' '${item.id}', cada 'correctAnswer' debe ser un string presente en 'options'.`); });
                    break;
                case 'matching':
                    if (!Array.isArray(item.terms) || item.terms.length < 1) throw new Error(`Pregunta 'matching' '${item.id}' necesita un array 'terms' con al menos 1 string.`);
                    if (!Array.isArray(item.definitions) || item.definitions.length < 1) throw new Error(`Pregunta 'matching' '${item.id}' necesita un array 'definitions' con al menos 1 string.`);
                    if (item.terms.length !== item.definitions.length) throw new Error(`Pregunta 'matching' '${item.id}' debe tener el mismo número de 'terms' y 'definitions'.`);
                    if (!item.correctMatches || typeof item.correctMatches !== 'object' || Object.keys(item.correctMatches).length !== item.terms.length) throw new Error(`Pregunta 'matching' '${item.id}' necesita un objeto 'correctMatches' con una entrada para cada término.`);
                    Object.entries(item.correctMatches).forEach(([term, definition]) => { if (!item.terms.includes(term) || !item.definitions.includes(definition)) throw new Error(`En pregunta 'matching' '${item.id}', cada clave/valor en 'correctMatches' debe existir en 'terms' y 'definitions' respectivamente.`); });
                    break;
                case 'fill-in-the-blanks': {
                    if (!item.blanks || typeof item.blanks !== 'object') throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}' necesita un objeto 'blanks'.`);
                    const hasPlaceholders = /\[[a-zA-Z0-9_]+\]/.test(item.question);
                    const hasBlankEntries = Object.keys(item.blanks).length > 0;

                    if (hasPlaceholders && !hasBlankEntries) throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}' tiene placeholders en 'question' pero el objeto 'blanks' está vacío.`);
                    if (!hasPlaceholders && hasBlankEntries) throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}' tiene entradas en 'blanks' pero no hay placeholders [...] en 'question'.`);
                    if (!hasPlaceholders && !hasBlankEntries) break; 

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

                    for (const blankId of blankKeys) {
                        if (!placeholderIdsInQuestion.has(blankId)) {
                            throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}': El ID de blank '${blankId}' existe en 'blanks' pero no como placeholder [${blankId}] en 'question'.`);
                        }
                    }

                    Object.entries(item.blanks).forEach(([blankId, blankData]) => {
                        if (!placeholderIdsInQuestion.has(blankId)) {
                            throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}': El ID de blank '${blankId}' existe en 'blanks' pero no como placeholder [${blankId}] en 'question'.`);
                        }
                        if (!blankData || typeof blankData !== 'object') throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}': La entrada para '${blankId}' en 'blanks' debe ser un objeto.`);
                        if (!Array.isArray(blankData.options) || blankData.options.length < 2) throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}', blank '${blankId}': necesita un array 'options' con al menos 2 strings.`);
                        if (typeof blankData.correctAnswer !== 'string' || !blankData.options.includes(blankData.correctAnswer)) throw new Error(`Pregunta 'fill-in-the-blanks' '${item.id}', blank '${blankId}': necesita un 'correctAnswer' (string) que esté presente en sus 'options'.`);
                    });
                    break;
                }
                default:
                    throw new Error(`Tipo de pregunta desconocido '${item.type}' para la pregunta '${item.id}'. Tipos válidos: 'single', 'multiple', 'matching', 'fill-in-the-blanks'.`);
            }
        }
        else if (setType === 'flashcard') {
            if (!item.front || typeof item.front !== 'string' || item.front.trim() === '') {
                throw new Error(`Flashcard '${item.id}' necesita una propiedad 'front' (string) no vacía.`);
            }
            if (!item.back || typeof item.back !== 'string' || item.back.trim() === '') {
                throw new Error(`Flashcard '${item.id}' necesita una propiedad 'back' (string) no vacía.`);
            }
            
            // --- Optional Image Validation for Flashcards ---
            if (item.image !== undefined) {
                if (typeof item.image !== 'string' || item.image.trim() === '') {
                    throw new Error(`Flashcard '${item.id}': Si se proporciona 'image', debe ser un string base64 no vacío.`);
                }
                const base64Pattern = /^(?:data:image\/[a-zA-Z]*;base64,)?[A-Za-z0-9+/]*={0,2}$/;
                if (!base64Pattern.test(item.image)) {
                    throw new Error(`Flashcard '${item.id}': 'image' debe ser una cadena base64 válida o incluir el prefijo data:image.`);
                }
            }
            
            const allowedKeys = ['id', 'front', 'back', 'image'];
            Object.keys(item).forEach(key => {
                if (!allowedKeys.includes(key)) {
                    console.warn(`Flashcard '${item.id}' tiene una propiedad inesperada: '${key}'. Será ignorada o puedes eliminarla.`);
                }
            });
        } else {
            throw new Error(`Tipo de set desconocido en validación: '${setType}'`);
        }
    });
    return parsedData;
};
