import React, { useState } from 'react';

const FileDropZone = ({ 
  onFileSelect, 
  acceptedTypes = '.json,application/json',
  maxSizeText = 'máximo 10MB',
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  // Manejar archivos arrastrados
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => file.type === 'application/json' || file.name.endsWith('.json'));
    
    if (jsonFile) {
      onFileSelect(jsonFile);
    } else {
      throw new Error('Por favor, arrastra un archivo JSON válido');
    }
  };

  // Manejar selección de archivo
  const handleFileInputSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
        isDragOver
          ? 'border-indigo-500 bg-indigo-50 transform scale-105'
          : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
      } ${className}`}
    >
      <div className="space-y-4">
        <div className="mx-auto flex items-center justify-center">
          <svg className={`h-12 w-12 transition-colors ${isDragOver ? 'text-indigo-500' : 'text-gray-400'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="space-y-2">
          <p className={`text-sm transition-colors ${isDragOver ? 'text-indigo-600 font-medium' : 'text-gray-600'}`}>
            {isDragOver ? '¡Suelta el archivo aquí!' : 'Arrastra y suelta un archivo JSON aquí'}
          </p>
          <p className="text-xs text-gray-500">
            o{' '}
            <label className="text-indigo-600 hover:text-indigo-500 cursor-pointer font-medium">
              selecciona un archivo
              <input
                type="file"
                accept={acceptedTypes}
                onChange={handleFileInputSelect}
                className="hidden"
              />
            </label>
          </p>
          <p className="text-xs text-gray-400">
            Solo archivos JSON ({maxSizeText})
          </p>
        </div>
      </div>
      
      {/* Overlay for drag state */}
      {isDragOver && (
        <div className="absolute inset-0 border-2 border-dashed border-indigo-500 rounded-lg bg-indigo-50 bg-opacity-50" />
      )}
    </div>
  );
};

export default FileDropZone;
