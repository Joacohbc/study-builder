import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Hook personalizado para manejar la navegación de la aplicación
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navigationMap = {
    '/quiz': t('navigation.quiz'),
    '/flashcards': t('navigation.flashcards'), 
    '/editor': t('navigation.editor'),
    '/import': t('navigation.import'),
    '/export': t('navigation.export'),
    '/help': t('navigation.help')
  };

  const getCurrentPageName = () => {
    return navigationMap[location.pathname] || 'Página no encontrada';
  };

  const navigateToQuiz = () => navigate('/quiz');
  const navigateToFlashcards = () => navigate('/flashcards');
  const navigateToEditor = () => navigate('/editor');
  const navigateToImport = () => navigate('/import');
  const navigateToExport = () => navigate('/export');
  const navigateToHelp = () => navigate('/help');

  const isCurrentPage = (path) => location.pathname === path;

  return {
    currentPath: location.pathname,
    currentPageName: getCurrentPageName(),
    navigateToQuiz,
    navigateToFlashcards,
    navigateToEditor,
    navigateToImport,
    navigateToExport,
    navigateToHelp,
    isCurrentPage,
    navigate
  };
};

export default useAppNavigation;
