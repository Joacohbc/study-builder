# Study Builder - Creador de Cuestionarios Interactivos

Una aplicación web creada con React y Vite para crear, gestionar y realizar cuestionarios interactivos.

[🇬🇧 English Version](README.md)

## Características

*   **Múltiples Tipos de Preguntas**: Soporta preguntas de opción única, opción múltiple y de emparejamiento.
*   **Editor de Cuestionarios**: Crea y modifica conjuntos de cuestionarios directamente en la aplicación.
*   **Almacenamiento Local**: Guarda tus conjuntos de cuestionarios en el almacenamiento local del navegador.
*   **Realización Interactiva de Cuestionarios**: Pon a prueba tus conocimientos con los cuestionarios creados, con preguntas aleatorias y retroalimentación instantánea.
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
    *   Selecciona un conjunto de cuestionarios existente del menú desplegable o crea uno nuevo.
    *   Añade, edita o elimina preguntas (opción única, opción múltiple, emparejamiento).
    *   Guarda tus cambios.
2.  **Pestaña Cuestionario**:
    *   Elige un conjunto de cuestionarios para realizar.
    *   Responde las preguntas.
    *   Envía para ver tu puntuación y retroalimentación.
3.  **Pestaña Ayuda**: Proporciona orientación sobre el uso de la aplicación.

## Estructura de Datos del Cuestionario

Los datos del cuestionario se almacenan como un array de objetos de pregunta. Consulta `src/constants.js` para ver la estructura predeterminada y ejemplos:

*   **Opción Única**: `{ id, type: 'single', question, options, correctAnswer }`
*   **Opción Múltiple**: `{ id, type: 'multiple', question, options, correctAnswers: [] }`
*   **Emparejamiento**: `{ id, type: 'matching', question, terms: [], definitions: [], correctMatches: {} }`
