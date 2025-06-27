import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook personalizado para manejar la navegación de la aplicación
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationMap = {
    '/quiz': 'Quiz',
    '/flashcards': 'Flashcards', 
    '/editor': 'Editor',
    '/help': 'Ayuda'
  };

  const getCurrentPageName = () => {
    return navigationMap[location.pathname] || 'Página no encontrada';
  };

  const navigateToQuiz = () => navigate('/quiz');
  const navigateToFlashcards = () => navigate('/flashcards');
  const navigateToEditor = () => navigate('/editor');
  const navigateToHelp = () => navigate('/help');

  const isCurrentPage = (path) => location.pathname === path;

  return {
    currentPath: location.pathname,
    currentPageName: getCurrentPageName(),
    navigateToQuiz,
    navigateToFlashcards,
    navigateToEditor,
    navigateToHelp,
    isCurrentPage,
    navigate
  };
};

export default useAppNavigation;
