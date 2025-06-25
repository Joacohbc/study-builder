export const AI_PROMPT = `Eres una IA asistente diseñada para crear preguntas de cuestionario interactivas y/o flashcards a partir de un texto o documento proporcionado. Tu objetivo es generar dos arrays JSON separados: uno para flashcards y otro para preguntas de cuestionario.

**Formato General de la Respuesta:**
Debes proporcionar dos arrays JSON separados con el siguiente formato:

**Array de Flashcards:**
[
  { /* Flashcard 1 */ },
  { /* Flashcard 2 */ },
  ...
]

**Array de Preguntas de Cuestionario:**
[
  { /* Pregunta 1 */ },
  { /* Pregunta 2 */ },
  ...
]

**Formatos de Objeto:**

1.  **Flashcard:**
    * \`id\`: String único (ej: "fc_1").
    * \`front\`: String con el contenido del frente de la tarjeta (pregunta, término o concepto).
    * \`back\`: String con el contenido del dorso de la tarjeta (respuesta, definición o explicación).
    * \`image\` (opcional): String con imagen en formato base64 o data URL. Se mostrará en ambos lados de la tarjeta.

    *Ejemplo:*
    \`\`\`json
    {
      "id": "fc_example",
      "front": "¿Qué es React?",
      "back": "Una biblioteca de JavaScript para construir interfaces de usuario"
    }
    \`\`\`

    *Ejemplo con imagen:*
    \`\`\`json
    {
      "id": "fc_with_image",
      "front": "¿Qué forma geométrica es esta?",
      "back": "Círculo",
      "image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9ImJsdWUiLz48L3N2Zz4="
    }
    \`\`\`

2.  **Opción Única (\`single\`):**
    * \`id\`: String único (ej: "q_single_1").
    * \`type\`: "single".
    * \`question\`: String con la pregunta.
    * \`options\`: Array de strings con las posibles respuestas (incluye la correcta). Debe haber al menos 2 opciones. Crea distractores plausibles pero incorrectos.
    * \`correctAnswer\`: String que coincide exactamente con la respuesta correcta dentro del array \`options\`.
    * \`image\` (opcional): String con imagen en formato base64 o data URL.

    *Ejemplo:*
    \`\`\`json
    {
      "id": "q_single_example",
      "type": "single",
      "question": "¿Cuál es la función principal del componente X?",
      "options": ["Almacenar datos", "Procesar entrada", "Mostrar info", "Gestionar red"],
      "correctAnswer": "Procesar entrada"
    }\`\`\`

    *Ejemplo con imagen:*
    \`\`\`json
    {
      "id": "q_single_with_image",
      "type": "single", 
      "question": "¿Qué forma geométrica se muestra en la imagen?",
      "options": ["Círculo", "Cuadrado", "Triángulo", "Rectángulo"],
      "correctAnswer": "Círculo",
      "image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9ImJsdWUiLz48L3N2Zz4="
    }
    \`\`\`

3.  **Opción Múltiple (\`multiple\`):**
    * \`id\`: String único (ej: "q_multi_1").
    * \`type\`: "multiple".
    * \`question\`: String con la pregunta (indicar selección múltiple).
    * \`options\`: Array de strings con posibles respuestas (incluye correctas). Al menos 3 opciones.
    * \`correctAnswers\`: Array de strings que coinciden con *todas* las respuestas correctas en \`options\`.
    * \`image\` (opcional): String con imagen en formato base64 o data URL.

    *Ejemplo:*
    \`\`\`json
    {
      "id": "q_multi_example",
      "type": "multiple",
      "question": "¿Cuáles son beneficios del enfoque Y? (Selecciona todas)",
      "options": ["Velocidad", "Costo", "Complejidad", "Escalabilidad"],
      "correctAnswers": ["Velocidad", "Escalabilidad"]
    }
    \`\`\`

4.  **Unir Conceptos (\`matching\`):**
    * \`id\`: String único (ej: "q_match_1").
    * \`type\`: "matching".
    * \`question\`: String con la instrucción (ej: "Une cada término con su definición:").
    * \`terms\`: Array de strings (términos clave).
    * \`definitions\`: Array de strings (definiciones). Mismo número que términos.
    * \`image\` (opcional): String con imagen en formato base64 o data URL.
    * \`correctMatches\`: Objeto { término: definición_correcta }. Cada término/definición debe ser único aquí.

    *Ejemplo:*
    \`\`\`json
    {
      "id": "q_match_example",
      "type": "matching",
      "question": "Une componente y descripción:",
      "terms": ["CPU", "RAM", "Disco Duro"],
      "definitions": ["Memoria volátil", "Procesador", "Almacenamiento persistente"],
      "correctMatches": { "CPU": "Procesador", "RAM": "Memoria volátil", "Disco Duro": "Almacenamiento persistente" }
    }
    \`\`\`

5.  **Rellenar Huecos (\`fill-in-the-blanks\`):**
    * \`id\`: String único (ej: "q_fill_1").
    * \`type\`: "fill-in-the-blanks".
    * \`question\`: String con el texto que contiene placeholders como \`[BLANK_ID]\`. Los \`BLANK_ID\` deben ser strings en mayúsculas con letras, números y guiones bajos (ej: \`[TERM_1]\`, \`[DEFINITION_A]\`).
    * \`blanks\`: Objeto donde cada clave es un \`BLANK_ID\` (sin corchetes) que aparece en \`question\`. El valor para cada clave es un objeto con:
        * \`options\`: Array de strings con las posibles respuestas para ese hueco (incluye la correcta). Al menos 2 opciones. Crea distractores plausibles.
        * \`correctAnswer\`: String que coincide exactamente con la respuesta correcta para ese hueco dentro de su array \`options\`.

    *Ejemplo:*
    \`\`\`json
    {
      "id": "q_fill_example",
      "type": "fill-in-the-blanks",
      "question": "El lenguaje [LANG] es interpretado, mientras que [COMP_LANG] es compilado. Ambos usan [DATA_FORMAT] para intercambio de datos.",
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

**Instrucciones para Generar Contenido:**

1.  **Analiza el Texto:** Lee cuidadosamente el documento/texto proporcionado.
2.  **Identifica Contenido Clave:** Busca definiciones, conceptos, comparaciones, listas, procesos, hechos clave, frases importantes.
3.  **Genera el Formato Apropiado:**
    * Para **flashcards**: Identifica pares de conceptos/definiciones o preguntas/respuestas.
    * Para **cuestionarios**: Crea una mezcla de los cuatro tipos de preguntas si el contenido lo permite.
4.  **Formula Contenido Claro:** Asegúrate de que todo sea directo y fácil de entender.
5.  **Asegura la Precisión:** Verifica que toda la información se base directamente en el texto fuente.
6.  **Genera IDs Únicos:** Asigna un \`id\` único y descriptivo a cada elemento (ej: "fc_1", "q_1", etc.).
7.  **Output:** Proporciona DOS arrays JSON separados:
    * **Primero:** Array de flashcards (puede estar vacío si no generas flashcards)
    * **Segundo:** Array de preguntas de cuestionario (puede estar vacío si no generas preguntas)
    * No incluyas texto adicional antes o después de los arrays.
    * Formato de respuesta:
    \`\`\`
    PREGUNTAS:
    [array de preguntas aquí]
    \`\`\`

    \`\`\`
    FLASHCARDS:
    [array de flashcards aquí]
    \`\`\`

**Texto Fuente:**
[Aquí pega el texto o documento a partir del cual generar el contenido]`;

export const HELP_TAB_CONTENT = {
    title: "Ayuda / README",
    copyPromptButton: "Copiar Prompt para IA Generadora de Preguntas",
    copySuccessMessage: "¡Prompt copiado al portapapeles!",
    copyErrorMessage: "Error al copiar el prompt.",
    copyPromptSubText: "Usa este prompt con una IA (como Gemini, ChatGPT, etc.) para generar preguntas en el formato JSON correcto a partir de tus propios textos o documentos.",
    studyBuilderTitle: "Study Builder",
    studyBuilderDescription: "Esta aplicación está diseñada para ayudarte a estudiar diferentes materias mediante cuestionarios interactivos y flashcards.",
    featuresTitle: "Características",
    featuresList: [
        "Gestión de Sets: Guardar, cargar y eliminar diferentes conjuntos de preguntas o flashcards.",
        "Preguntas de opción única, múltiple, unir conceptos (arrastrar y soltar) y rellenar huecos (dropdowns).",
        "Flashcards con frente/dorso y navegación intuitiva.",
        "Barajado aleatorio de preguntas y opciones/términos al cargar y reintentar (dentro del set activo).",
        "Retroalimentación instantánea al enviar.",
        "Puntuación final.",
        "Edición de Preguntas y Flashcards (JSON) del set activo.",
        "Ayuda Integrada con prompt para IA."
    ],
    howToUseTitle: "Cómo Usar",
    howToUseSteps: [
        {
            title: "Navegar por Pestañas",
            description: "Usa los botones (\"Cuestionario\", \"Flashcards\", \"Editor de Sets\", \"Ayuda / README\")."
        },
        {
            title: "Gestionar Sets (en \"Editor de Sets\")",
            subSteps: [
                "Usa el dropdown y el botón \"Cargar Set Seleccionado\" para elegir qué conjunto de preguntas usar en el cuestionario y editar.",
                "Usa el botón \"Eliminar Set Seleccionado\" para borrar un set (excepto el predeterminado).",
                "Usa el botón \"Restablecer 'Preguntas de Ejemplo'\" para volver a la versión original de ese set específico."
            ]
        },
        {
            title: "Editar Preguntas (en \"Editor de Sets\")",
            subSteps: [
                "El textarea muestra el JSON del set actualmente cargado.",
                "Modifica el JSON. ¡Cuidado con la sintaxis y los IDs únicos!",
                "Usa \"Guardar Cambios\" para actualizar el set actual (no funciona con el set predeterminado).",
                "Introduce un nombre y usa \"Guardar Como Nuevo Set\" para crear un nuevo conjunto con el contenido del editor. Este nuevo set se volverá el activo."
            ]
        },
        {
            title: "Responder (en \"Cuestionario\")",
            description: "Responde las preguntas del set activo. Arrastra términos a definiciones para unir. Selecciona opciones en los desplegables para rellenar huecos. Haz clic en \"Enviar Respuestas\"."
        },
        {
            title: "Ver Resultados",
            description: "Se mostrará puntuación y retroalimentación para el set activo."
        },
        {
            title: "Reintentar",
            description: "Usa \"Intentar de Nuevo\" para reiniciar el cuestionario *con el mismo set activo* (se baraja de nuevo)."
        }
    ],
    jsonFormatTitle: "Formato JSON de Preguntas y Flashcards",
    jsonFormatDescription: "Cada set es un array de objetos JSON. Cada objeto debe tener una clave id única dentro de ese set.",
    flashcardFormatTitle: "Formato de Flashcard",
    flashcardFormatList: [
        "id: Identificador único para la flashcard (string, ej: \"fc1\").",
        "front: Contenido del frente de la tarjeta (pregunta, término o concepto).",
        "back: Contenido del dorso de la tarjeta (respuesta, definición o explicación).",
        "image (opcional): Imagen en formato base64 o data URL."
    ],
    flashcardExample: `{
    "id": "fc_example",
    "front": "Capital de Francia",
    "back": "París"
}`,
    quizQuestionFormatTitle: "Formato de Preguntas de Cuestionario",
    quizQuestionFormatList: [
        "id: Identificador único para la pregunta (string, ej: \"q1\").",
        "type: 'single', 'multiple', 'matching', 'fill-in-the-blanks'.",
        "question: Texto de la pregunta o la frase con huecos (string)."
    ],
    singleTypeTitle: "Tipo 'single'",
    singleTypeList: [
        "options: Array de strings (respuestas).",
        "correctAnswer: String de la respuesta correcta."
    ],
    singleTypeExample: `{
    "id": "q_single_example",
    "type": "single",
    "question": "¿Pregunta?",
    "options": [
        "Opción A",
        "Correcta"
    ],
    "correctAnswer": "Correcta"
}`,
    multipleTypeTitle: "Tipo 'multiple'",
    multipleTypeList: [
        "options: Array de strings (respuestas).",
        "correctAnswers: Array de strings con las respuestas correctas."
    ],
    multipleTypeExample: `{
    "id": "q_multi_example",
    "type": "multiple",
    "question": "¿Pregunta múltiple?",
    "options": [
        "Correcta 1",
        "Opción B",
        "Correcta 2"
    ],
    "correctAnswers": [
        "Correcta 1",
        "Correcta 2"
    ]
}`,
    matchingTypeTitle: "Tipo 'matching'",
    matchingTypeList: [
        "terms: Array de strings (términos a arrastrar).",
        "definitions: Array de strings (definiciones/zonas de soltar).",
        "correctMatches: Objeto { término: definición_correcta }."
    ],
    matchingTypeExample: `{
    "id": "q_match_example",
    "type": "matching",
    "question": "Une conceptos",
    "terms": [
        "Término A",
        "Término B"
    ],
    "definitions": [
        "Definición A",
        "Definición B"
    ],
    "correctMatches": {
        "Término A": "Definición A",
        "Término B": "Definición B"
    }
}`,
    fillInTheBlanksTitle: "Tipo 'fill-in-the-blanks'",
    fillInTheBlanksList: [
        "question: String con el texto y placeholders como [BLANK_ID].",
        "blanks: Objeto donde cada clave es un BLANK_ID (sin corchetes) del texto.",
        "Cada valor en blanks es un objeto con:",
    ],
    fillInTheBlanksSubList: [
        "options: Array de strings (opciones para ese hueco).",
        "correctAnswer: String de la respuesta correcta para ese hueco."
    ],
    fillInTheBlanksExample: `{
    "id": "q_fill_example",
    "type": "fill-in-the-blanks",
    "question": "React usa un [DOM_TYPE] virtual, y las props fluyen hacia [DIRECTION].",
    "blanks": {
        "DOM_TYPE": {
            "options": ["Shadow", "Virtual", "Light"],
            "correctAnswer": "Virtual"
        },
        "DIRECTION": {
            "options": ["arriba", "abajo", "los lados"],
            "correctAnswer": "abajo"
        }
    }
}`,
    
    // Image Support Section
    imageSupportTitle: "📷 Soporte de Imágenes",
    imageSupportIntro: "Tanto las preguntas de cuestionario como las flashcards pueden incluir imágenes mediante el campo opcional 'image'.",
    imageSupportFormatTitle: "Formato de Imagen:",
    imageSupportFormatList: [
        "Formato: String con imagen codificada en base64",
        "Con prefijo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgAB...'",
        "Sin prefijo: '/9j/4AAQSkZJRgABAQEAYABgAAD...' (se añadirá automáticamente)",
        "Tipos soportados: JPEG, PNG, GIF, WebP, SVG"
    ],
    imageSupportGuidelines: "Recomendaciones:",
    imageGuidelinesList: [
        "Mantén las imágenes por debajo de 2MB para un rendimiento óptimo",
        "Usa imágenes relevantes que complementen el contenido educativo",
        "Considera la accesibilidad: las imágenes se mostrarán con texto alternativo",
        "Las imágenes se redimensionan automáticamente para ajustarse al contenedor"
    ],
    imageSupportExample: `{
    "id": "q_with_image",
    "type": "single",
    "question": "¿Qué animal se muestra en la imagen?",
    "options": ["Perro", "Gato", "Pájaro", "Pez"],
    "correctAnswer": "Gato",
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
}`
};
