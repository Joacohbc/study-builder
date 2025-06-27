# Sistema de Enrutamiento con React Router

## Descripción

Se ha implementado un sistema de enrutamiento declarativo usando React Router para mejorar la navegación y la experiencia de usuario en Study Builder.

## Estructura de Rutas

### Rutas Principales

- **`/`** - Redirige automáticamente a `/quiz`
- **`/quiz`** - Página de cuestionarios
- **`/flashcards`** - Página de flashcards
- **`/editor`** - Página del editor de sets (con selector de tipo)
- **`/help`** - Página de ayuda
- **`/*`** - Cualquier ruta no encontrada redirige a `/quiz`

## Archivos Principales

### `src/routes/AppRoutes.jsx`
Configuración declarativa de todas las rutas de la aplicación.

```jsx
<Routes>
  <Route path="/" element={<Navigate to="/quiz" replace />} />
  <Route path="/quiz" element={<QuizTab />} />
  <Route path="/flashcards" element={<FlashcardTab />} />
  <Route path="/editor" element={<EditorPage />} />
  <Route path="/help" element={<HelpTab />} />
  <Route path="*" element={<Navigate to="/quiz" replace />} />
</Routes>
```

### `src/components/common/Navigation.jsx`
Componente de navegación que utiliza `NavLink` de React Router para mostrar la página activa.

### `src/layout/AppLayout.jsx`
Layout principal que envuelve toda la aplicación y contiene:
- Navegación principal
- Contenido de las rutas
- Botones de navegación flotantes
- Estilos y diseño general

### `src/pages/EditorPage.jsx`
Página del editor que combina:
- Selector de tipo de contenido (Quiz/Flashcards)
- Componente EditorTab

### `src/hooks/useAppNavigation.js`
Hook personalizado para manejar la navegación programática:

```jsx
const { 
  currentPath, 
  currentPageName, 
  navigateToQuiz, 
  navigateToEditor,
  isCurrentPage 
} = useAppNavigation();
```

## Características

### 1. Navegación Declarativa
- Todas las rutas están definidas en un solo lugar
- Fácil de mantener y expandir
- Rutas automáticas de fallback

### 2. Diseño Consistente
- Mantiene el diseño original de la aplicación
- Animaciones y transiciones preservadas
- Estilos responsivos

### 3. Estado Persistente
- El contexto de la aplicación se mantiene entre páginas
- Los datos no se pierden al navegar

### 4. Navegación Inteligente
- Botones de scroll adaptativos según la página actual
- URLs amigables y compartibles
- Navegación con historial del navegador

### 5. Funcionalidades Específicas por Página
- En `/quiz`: Botones para navegar entre preguntas respondidas
- En otras páginas: Navegación normal de scroll
- Botón especial para primera pregunta sin responder (solo en quiz)

## Ventajas del Nuevo Sistema

1. **URLs Compartibles**: Cada sección tiene su propia URL
2. **Navegación del Navegador**: Botones atrás/adelante funcionan correctamente
3. **Código Más Limpio**: Separación clara de responsabilidades
4. **Escalabilidad**: Fácil agregar nuevas páginas/rutas
5. **SEO Friendly**: URLs descriptivas para cada sección
6. **Mantenibilidad**: Estructura organizada y predecible

## Uso

### Navegación Programática
```jsx
import { useAppNavigation } from '../hooks/useAppNavigation';

const MyComponent = () => {
  const { navigateToEditor, isCurrentPage } = useAppNavigation();
  
  const handleEditClick = () => {
    navigateToEditor();
  };
  
  return (
    <button 
      onClick={handleEditClick}
      disabled={isCurrentPage('/editor')}
    >
      Ir al Editor
    </button>
  );
};
```

### Navegación Declarativa
```jsx
import { NavLink } from 'react-router-dom';

<NavLink 
  to="/quiz" 
  className={({ isActive }) => isActive ? 'active' : ''}
>
  Quiz
</NavLink>
```

## Migración

El sistema anterior basado en estado local (`activeUITab`) ha sido reemplazado por React Router, manteniendo toda la funcionalidad existente pero con mejor organización y características adicionales.
