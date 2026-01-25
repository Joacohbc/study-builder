import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EditIcon from '@/icons/EditIcon';
import ImportExportIcon from '@/icons/ImportExportIcon';
import HelpIcon from '@/icons/HelpIcon';
import ArrowDownIcon from '@/icons/ArrowDownIcon';

/**
 * Componente dropdown que agrupa las tabs de herramientas para móvil
 */
const ToolsDropdown = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determinar si estamos en una ruta de herramientas
  const isToolsRoute = items.some(item => item.path === location.pathname);
  
  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Manejar navegación con teclado
  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
      {/* Botón principal */}
      <button
        onClick={toggleDropdown}
        className={`flex items-center py-3 px-3 sm:px-4 text-sm cursor-pointer font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50 border-b-2 mr-1 ${
          isToolsRoute
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-gray-500 hover:text-indigo-500 hover:border-indigo-300'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="mr-2 opacity-75">
          <EditIcon className="w-5 h-5" />
        </span>
        <span className="hidden sm:inline">Herramientas</span>
        <span className="sm:hidden">Tools</span>
        <span className={`ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ArrowDownIcon className="w-4 h-4" />
        </span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 sm:w-52 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden min-w-max">
          {items.map(({ path, icon: Icon, label, id }) => (
            <button
              key={id}
              onClick={() => handleNavigation(path)}
              className={`w-full flex items-center px-4 py-3 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                location.pathname === path 
                  ? 'bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600' 
                  : 'text-gray-700'
              }`}
            >
              <span className="mr-3 opacity-75">
                <Icon className="w-5 h-5" />
              </span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToolsDropdown;
