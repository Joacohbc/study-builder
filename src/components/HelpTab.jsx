import React, { useState } from 'react';

// Help Tab Component: Displays static help content using JSX and adds Copy Prompt button
const HelpTab = () => {
    // Define styles for code blocks and inline code
    const codeBlockStyle = "bg-gray-100 p-3 rounded-md overflow-x-auto my-2 font-mono text-sm whitespace-pre-wrap break-words";
    const inlineCodeStyle = "bg-gray-200 text-sm px-1 py-0.5 rounded font-mono";
    // State for copy confirmation message
    const [copySuccess, setCopySuccess] = useState('');

    // The prompt to be copied
    const aiPrompt = `Eres una IA asistente diseñada para crear preguntas de cuestionario interactivas a partir de un texto o documento proporcionado. Tu objetivo es generar un array JSON de objetos de pregunta que se ajuste al siguiente formato y tipos:

**Formato General del Array JSON:**
[
  { /* Pregunta 1 */ },
  { /* Pregunta 2 */ },
  ...
]

**Formatos de Objeto de Pregunta:**

1.  **Opción Única (\`single\`):**
    * \`id\`: String único (ej: "q_single_1").
    * \`type\`: "single".
    * \`question\`: String con la pregunta.
    * \`options\`: Array de strings con las posibles respuestas (incluye la correcta). Debe haber al menos 2 opciones. Crea distractores plausibles pero incorrectos.
    * \`correctAnswer\`: String que coincide exactamente con la respuesta correcta dentro del array \`options\`.

    *Ejemplo:*
    \`\`\`json
    {
      "id": "q_single_example",
      "type": "single",
      "question": "¿Cuál es la función principal del componente X?",
      "options": ["Almacenar datos", "Procesar entrada", "Mostrar info", "Gestionar red"],
      "correctAnswer": "Procesar entrada"
    }
    \`\`\`

2.  **Opción Múltiple (\`multiple\`):**
    * \`id\`: String único (ej: "q_multi_1").
    * \`type\`: "multiple".
    * \`question\`: String con la pregunta (indicar selección múltiple).
    * \`options\`: Array de strings con posibles respuestas (incluye correctas). Al menos 3 opciones.
    * \`correctAnswers\`: Array de strings que coinciden con *todas* las respuestas correctas en \`options\`.

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

3.  **Unir Conceptos (\`matching\`):**
    * \`id\`: String único (ej: "q_match_1").
    * \`type\`: "matching".
    * \`question\`: String con la instrucción (ej: "Une cada término con su definición:").
    * \`terms\`: Array de strings (términos clave).
    * \`definitions\`: Array de strings (definiciones). Mismo número que términos.
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

4.  **Rellenar Huecos (\`fill-in-the-blanks\`):**
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

**Instrucciones para Generar Preguntas:**

1.  **Analiza el Texto:** Lee cuidadosamente el documento/texto proporcionado.
2.  **Identifica Contenido Clave:** Busca definiciones, conceptos, comparaciones, listas, procesos, hechos clave, frases importantes donde se puedan ocultar términos clave.
3.  **Crea Preguntas Variadas:** Intenta generar una mezcla de los cuatro tipos de preguntas (\`single\`, \`multiple\`, \`matching\`, \`fill-in-the-blanks\`) si el contenido lo permite. Para 'fill-in-the-blanks', busca frases donde 1-3 términos clave puedan ser reemplazados por huecos.
4.  **Formula Preguntas/Textos Claros:** Asegúrate de que sean directos y fáciles de entender. Para 'fill-in-the-blanks', usa placeholders claros como \`[KEY_TERM]\`.
5.  **Crea Distractores (Opciones Incorrectas):** Para 'single', 'multiple' y 'fill-in-the-blanks', las opciones incorrectas deben ser relevantes pero erróneas según el texto fuente.
6.  **Asegura la Precisión:** Verifica que las respuestas correctas se basen directamente en la información del texto fuente.
7.  **Genera IDs Únicos:** Asigna un \`id\` único y descriptivo a cada pregunta (ej: "gen_q_1").
8.  **Output:** Proporciona únicamente el array JSON resultante, sin texto adicional antes o después.

**Texto Fuente:**
[Aquí pega el texto o documento a partir del cual generar las preguntas]`;

    // Function to copy the prompt to clipboard
    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(aiPrompt).then(() => {
            // Success feedback
            setCopySuccess('¡Prompt copiado al portapapeles!');
            setTimeout(() => setCopySuccess(''), 3000); // Clear message after 3 seconds
        }, (err) => {
            // Error feedback
            setCopySuccess('Error al copiar el prompt.');
            console.error('Error al copiar al portapapeles: ', err);
            setTimeout(() => setCopySuccess(''), 3000);
        });
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Ayuda / README</h2>

            {/* Button to copy the AI prompt */}
            <div className="mb-6 text-center">
                <button
                    onClick={handleCopyPrompt}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-5 rounded-lg shadow-sm transition duration-150"
                >
                    Copiar Prompt para IA Generadora de Preguntas
                </button>
                {/* Display copy success/error message */}
                {copySuccess && (
                    <p className={`mt-2 text-sm ${copySuccess.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                        {copySuccess}
                    </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    Usa este prompt con una IA (como Gemini, ChatGPT, etc.) para generar preguntas en el formato JSON correcto a partir de tus propios textos o documentos.
                </p>
            </div>

            {/* Static help content */}
            <div id="explanation-content" className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none space-y-3 border-t pt-6">
                {/* Updated title */}
                <h2 className="text-xl md:text-2xl font-semibold mt-4 mb-2">Cuestionario Interactivo (React)</h2>
                {/* Updated description */}
                <p>Esta es una aplicación React para crear y realizar cuestionarios interactivos. Permite gestionar múltiples conjuntos (sets) de preguntas, además de las funcionalidades originales.</p>

                <h3 className="text-lg md:text-xl font-semibold mt-3 mb-1">Características</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li>Gestión de Sets: Guardar, cargar y eliminar diferentes conjuntos de preguntas.</li>
                    <li>Preguntas de opción única, múltiple, unir conceptos (arrastrar y soltar) y rellenar huecos (dropdowns).</li> {/* Updated */}
                    <li>Barajado aleatorio de preguntas y opciones/términos al cargar y reintentar (dentro del set activo).</li>
                    <li>Retroalimentación instantánea al enviar.</li>
                    <li>Puntuación final.</li>
                    <li>Edición de Preguntas (JSON) del set activo.</li>
                    <li>Ayuda Integrada con prompt para IA.</li> {/* Updated */}
                </ul>

                <h3 className="text-lg md:text-xl font-semibold mt-3 mb-1">Cómo Usar</h3>
                <ol className="list-decimal list-inside space-y-1">
                    <li><strong>Navegar por Pestañas</strong>: Usa los botones ("Cuestionario", "Editor de Sets", "Ayuda / README").</li>
                    <li><strong>Gestionar Sets (en "Editor de Sets")</strong>:
                        <ul className="list-disc list-inside ml-4 my-1 space-y-1">
                           <li>Usa el dropdown y el botón "Cargar Set Seleccionado" para elegir qué conjunto de preguntas usar en el cuestionario y editar.</li>
                           <li>Usa el botón "Eliminar Set Seleccionado" para borrar un set (excepto el predeterminado).</li>
                           <li>Usa el botón "Restablecer 'Preguntas de Ejemplo'" para volver a la versión original de ese set específico.</li> {/* Updated default name */}
                        </ul>
                    </li>
                     <li><strong>Editar Preguntas (en "Editor de Sets")</strong>:
                        <ul className="list-disc list-inside ml-4 my-1 space-y-1">
                           <li>El textarea muestra el JSON del set actualmente cargado.</li>
                           <li>Modifica el JSON. <strong>¡Cuidado con la sintaxis y los IDs únicos!</strong></li>
                           <li>Usa "Guardar Cambios" para actualizar el set actual (no funciona con el set predeterminado).</li>
                           <li>Introduce un nombre y usa "Guardar Como Nuevo Set" para crear un nuevo conjunto con el contenido del editor. Este nuevo set se volverá el activo.</li>
                        </ul>
                    </li>
                    <li><strong>Responder (en "Cuestionario")</strong>: Responde las preguntas del set activo. Arrastra términos a definiciones para unir. Selecciona opciones en los desplegables para rellenar huecos. Haz clic en "Enviar Respuestas".</li> {/* Updated */}
                    <li><strong>Ver Resultados</strong>: Se mostrará puntuación y retroalimentación para el set activo.</li>
                    <li><strong>Reintentar</strong>: Usa "Intentar de Nuevo" para reiniciar el cuestionario *con el mismo set activo* (se baraja de nuevo).</li>

                </ol>

                <h3 className="text-lg md:text-xl font-semibold mt-3 mb-1">Formato JSON de Preguntas (React)</h3>
                <p>Cada set es un array de objetos JSON. Cada objeto (pregunta) <strong>debe tener una clave <code className={inlineCodeStyle}>id</code> única dentro de ese set</strong>.</p>
                 <ul className="list-disc list-inside space-y-1">
                    <li><code className={inlineCodeStyle}>id</code>: Identificador único para la pregunta (string, ej: "q1").</li>
                    <li><code className={inlineCodeStyle}>type</code>: 'single', 'multiple', 'matching', 'fill-in-the-blanks'.</li> {/* Updated */}
                    <li><code className={inlineCodeStyle}>question</code>: Texto de la pregunta o la frase con huecos (string).</li>
                </ul>

                <h4 className="text-md md:text-lg font-semibold mt-2 mb-1">Tipo 'single'</h4>
                <ul className="list-disc list-inside space-y-1">
                    <li><code className={inlineCodeStyle}>options</code>: Array de strings (respuestas).</li>
                    <li><code className={inlineCodeStyle}>correctAnswer</code>: String de la respuesta correcta.</li>
                </ul>
                {/* Correctly formatted JSON example */}
                <pre className={codeBlockStyle}><code>{
`{
    "id": "q_single_example",
    "type": "single",
    "question": "¿Pregunta?",
    "options": [
        "Opción A",
        "Correcta"
    ],
    "correctAnswer": "Correcta"
}`
                }</code></pre>

                <h4 className="text-md md:text-lg font-semibold mt-2 mb-1">Tipo 'multiple'</h4>
                <ul className="list-disc list-inside space-y-1">
                    <li><code className={inlineCodeStyle}>options</code>: Array de strings (respuestas).</li>
                    <li><code className={inlineCodeStyle}>correctAnswers</code>: Array de strings con las respuestas correctas.</li>
                </ul>
                {/* Correctly formatted JSON example */}
                <pre className={codeBlockStyle}><code>{
`{
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
}`
                }</code></pre>

                <h4 className="text-md md:text-lg font-semibold mt-2 mb-1">Tipo 'matching'</h4>
                <ul className="list-disc list-inside space-y-1">
                    <li><code className={inlineCodeStyle}>terms</code>: Array de strings (términos a arrastrar).</li>
                    <li><code className={inlineCodeStyle}>definitions</code>: Array de strings (definiciones/zonas de soltar).</li>
                    <li><code className={inlineCodeStyle}>correctMatches</code>: Objeto {'{'} término: definición_correcta {'}'}.</li>
                </ul>
                {/* Correctly formatted JSON example */}
                <pre className={codeBlockStyle}><code>{
`{
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
}`
                }</code></pre>

                {/* --- New Fill-in-the-Blanks Type --- */}
                <h4 className="text-md md:text-lg font-semibold mt-2 mb-1">Tipo 'fill-in-the-blanks'</h4>
                <ul className="list-disc list-inside space-y-1">
                    <li><code className={inlineCodeStyle}>question</code>: String con el texto y placeholders como <code className={inlineCodeStyle}>[BLANK_ID]</code>.</li>
                    <li><code className={inlineCodeStyle}>blanks</code>: Objeto donde cada clave es un <code className={inlineCodeStyle}>BLANK_ID</code> (sin corchetes) del texto.</li>
                    <li>Cada valor en <code className={inlineCodeStyle}>blanks</code> es un objeto con:
                        <ul className="list-disc list-inside ml-4 my-1 space-y-1">
                            <li><code className={inlineCodeStyle}>options</code>: Array de strings (opciones para ese hueco).</li>
                            <li><code className={inlineCodeStyle}>correctAnswer</code>: String de la respuesta correcta para ese hueco.</li>
                        </ul>
                    </li>
                </ul>
                <pre className={codeBlockStyle}><code>{
`{
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
}`
                }</code></pre>
            </div>
        </div>
    );
};

export default HelpTab;
