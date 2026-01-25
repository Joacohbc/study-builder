import { NavLink, useLocation } from 'react-router-dom';
import QuizIcon from '@/icons/QuizIcon';
import CardIcon from '@/icons/CardIcon';
import EditIcon from '@/icons/EditIcon';
import ImportExportIcon from '@/icons/ImportExportIcon';
import HelpIcon from '@/icons/HelpIcon';
import ToolsDropdown from './ToolsDropdown';

/**
 * Componente de navegación usando React Router
 */
const Navigation = () => {
  const location = useLocation();
  
  const studyNavItems = [
    {
      path: '/quiz',
      icon: QuizIcon,
      label: 'Quiz',
      id: 'quiz'
    },
    {
      path: '/flashcards',
      icon: CardIcon,
      label: 'Flashcards',
      id: 'flashcards'
    }
  ];

  const toolsNavItems = [
    {
      path: '/editor',
      icon: EditIcon,
      label: 'Editor de Sets',
      id: 'editor'
    },
    {
      path: '/import',
      icon: ImportExportIcon,
      label: 'Importar',
      id: 'import'
    },
    {
      path: '/export',
      icon: ImportExportIcon,
      label: 'Exportar',
      id: 'export'
    },
    {
      path: '/help',
      icon: HelpIcon,
      label: 'Ayuda',
      id: 'help'
    }
  ];

  return (
    <div className="mb-8">
      {/* Tab Navigation Area - Enhanced */}
      <div className="flex flex-wrap border-b border-gray-200 mb-6">
        {/* Desktop: Mostrar todas las tabs por separado */}
        <div className="hidden md:flex flex-wrap">
          {[...studyNavItems, ...toolsNavItems].map(({ path, icon: Icon, label, id }) => (
            <NavLink
              key={id}
              to={path}
              className={({ isActive }) =>
                `flex items-center py-3 px-4 md:px-6 text-sm md:text-base cursor-pointer font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50 border-b-2 mr-1 md:mr-2 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-indigo-500 hover:border-indigo-300'
                }`
              }
            >
              <span className="mr-2 opacity-75">
                <Icon />
              </span>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Mobile: Quiz y Flashcards siempre visibles, resto agrupado */}
        <div className="flex md:hidden flex-wrap w-full">
          {/* Quiz y Flashcards siempre visibles */}
          {studyNavItems.map(({ path, icon: Icon, label, id }) => (
            <NavLink
              key={id}
              to={path}
              className={({ isActive }) =>
                `flex items-center py-3 px-3 sm:px-4 text-sm cursor-pointer font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50 border-b-2 mr-1 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-indigo-500 hover:border-indigo-300'
                }`
              }
            >
              <span className="mr-2 opacity-75">
                <Icon className="w-5 h-5" />
              </span>
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden text-sm">
                {id === 'quiz' ? 'Quiz' : 'Cards'}
              </span>
            </NavLink>
          ))}
          
          {/* Dropdown de herramientas para móvil */}
          <ToolsDropdown items={toolsNavItems} />
        </div>
      </div>
    </div>
  );
};

export default Navigation;
