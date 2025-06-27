import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente de desarrollo para mostrar información de la ruta actual
 * Solo se muestra en modo desarrollo
 */
const RouteDebugger = () => {
  const location = useLocation();
  
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-50 font-mono">
      <div>Ruta: {location.pathname}</div>
      {location.search && <div>Query: {location.search}</div>}
      {location.hash && <div>Hash: {location.hash}</div>}
    </div>
  );
};

export default RouteDebugger;
