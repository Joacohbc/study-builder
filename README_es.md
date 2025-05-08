# Study Builder - Creador de Cuestionarios Interactivos y Flashcards

Una aplicación web creada con React y Vite para crear, gestionar y realizar cuestionarios interactivos y flashcards.

[🇬🇧 English Version](README.md)

## Características

*   **Múltiples Tipos de Contenido**:
    *   **Cuestionarios**: Soporta preguntas de opción única, opción múltiple, de emparejamiento y de rellenar espacios en blanco.
    *   **Flashcards**: Formato simple de tarjeta anverso/reverso para ejercicios de memorización.
*   **Editor Integrado**: Crea y modifica conjuntos de cuestionarios y flashcards directamente en la aplicación.
*   **Almacenamiento Local**: Guarda tus conjuntos en el almacenamiento local del navegador.
*   **Experiencia Interactiva**:
    *   **Cuestionarios**: Pon a prueba tus conocimientos con preguntas aleatorias y retroalimentación instantánea.
    *   **Flashcards**: Voltea las tarjetas y navega a través de mazos de tarjetas barajadas.
*   **Localización**: Interfaz predeterminada en inglés, con soporte para el idioma español disponible.

## Tecnologías Utilizadas

*   React
*   Vite
*   JavaScript
*   Tailwind CSS (o CSS estándar, dependiendo de `index.css`)

## Cómo Empezar

1.  **Clona el repositorio:**
    ```bash
    git clone <url-del-repositorio>
    cd study-builder
    ```
2.  **Instala las dependencias:**
    ```bash
    npm install
    ```
3.  **Ejecuta el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    Esto iniciará la aplicación, típicamente disponible en `http://localhost:5173`.

## Cómo Usar

1.  **Pestaña Editor**:
    *   Selecciona si deseas editar cuestionarios o flashcards usando los botones de opción.
    *   Selecciona un conjunto existente del menú desplegable o crea uno nuevo.
    *   Añade, edita o elimina contenido usando el editor JSON.
    *   Guarda tus cambios.
2.  **Pestaña Cuestionario**:
    *   Elige un conjunto de cuestionarios para realizar.
    *   Responde las preguntas.
    *   Envía para ver tu puntuación y retroalimentación.
3.  **Pestaña Flashcards**:
    *   Revisa el anverso y reverso de las tarjetas en el conjunto actual.
    *   Voltea las tarjetas para revelar las respuestas.
    *   Navega por el mazo con los botones de anterior/siguiente.
4.  **Pestaña Ayuda**: Proporciona orientación sobre el uso de la aplicación y formatos JSON detallados.

## Estructura de Datos

La aplicación soporta dos tipos principales de contenido con las siguientes estructuras:

### Formato de Flashcard
```json
{
    "id": "fc_example",
    "front": "Capital de Francia",
    "back": "París"
}
```

### Formatos de Preguntas de Cuestionario

*   **Opción Única**: `{ id, type: 'single', question, options, correctAnswer }`
*   **Opción Múltiple**: `{ id, type: 'multiple', question, options, correctAnswers: [] }`
*   **Emparejamiento**: `{ id, type: 'matching', question, terms: [], definitions: [], correctMatches: {} }`
*   **Rellenar espacios en blanco**: `{ id, type: 'fill-in-the-blanks', question, blanks: {} }`

Consulta la pestaña Ayuda en la aplicación para ver ejemplos de formato detallados y reglas de validación.
