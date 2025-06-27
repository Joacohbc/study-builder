// src/components/editor/ClipboardControls.jsx
import React from 'react';
import CopyIcon from '@/icons/CopyIcon';
import PasteIcon from '@/icons/PasteIcon';

/**
 * ClipboardControls - Componente reutilizable para operaciones de portapapeles
 * 
 * @param {Function} onCopyToClipboard - Función callback para el botón de copiar
 * @param {Function} onPasteFromClipboard - Función callback para el botón de pegar
 * @param {Object} clipboardMessage - Objeto con mensaje y tipo para mostrar feedback
 * @param {boolean} isLoading - Indica si las operaciones están en progreso
 * @param {boolean} showCopy - Controla si mostrar el botón de copiar (default: true)
 * @param {boolean} showPaste - Controla si mostrar el botón de pegar (default: true)
 * @param {string} copyLabel - Etiqueta personalizable para el botón de copiar
 * @param {string} pasteLabel - Etiqueta personalizable para el botón de pegar
 * @param {string} copyTitle - Tooltip para el botón de copiar
 * @param {string} pasteTitle - Tooltip para el botón de pegar
 * @param {string} buttonSize - Tamaño de los botones: "xs", "sm", "md", "lg"
 * @param {string} variant - Variante de estilo: "primary", "secondary", "outline"
 */
const ClipboardControls = ({
    onCopyToClipboard,
    onPasteFromClipboard,
    clipboardMessage,
    isLoading = false, // To disable buttons during an operation if needed (optional)
    showCopy = true, // Control whether to show copy button
    showPaste = true, // Control whether to show paste button
    copyLabel = "Copiar JSON", // Customizable copy button label
    pasteLabel = "Pegar JSON", // Customizable paste button label
    copyTitle = "Copiar todo el JSON al portapapeles", // Customizable copy button title
    pasteTitle = "Pegar JSON desde el portapapeles", // Customizable paste button title
    buttonSize = "sm", // "xs", "sm", "md", "lg"
    variant = "secondary" // "primary", "secondary", "outline"
}) => {
    // Button size classes
    const sizeClasses = {
        xs: "py-1 px-2 text-xs",
        sm: "py-1 px-3 text-sm", 
        md: "py-2 px-4 text-sm",
        lg: "py-3 px-6 text-base"
    };

    // Button variant classes
    const variantClasses = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500",
        secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500",
        outline: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-indigo-500"
    };

    const buttonClasses = `flex items-center gap-1 ${variantClasses[variant]} ${sizeClasses[buttonSize]} font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`;

    return (
        <div className="flex flex-wrap gap-2 items-center">
            {showCopy && onCopyToClipboard && (
                <button
                    onClick={onCopyToClipboard}
                    className={buttonClasses}
                    title={copyTitle}
                    disabled={isLoading}
                >
                    <CopyIcon /> {copyLabel}
                </button>
            )}
            
            {showPaste && onPasteFromClipboard && (
                <button
                    onClick={onPasteFromClipboard}
                    className={buttonClasses}
                    title={pasteTitle}
                    disabled={isLoading}
                >
                    <PasteIcon /> {pasteLabel}
                </button>
            )}
            
            {clipboardMessage && clipboardMessage.message && (
                <span className={`inline-flex items-center text-xs py-1 px-2 rounded transition-all duration-200 ${
                    clipboardMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 
                    clipboardMessage.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 
                    'bg-blue-100 text-blue-700 border border-blue-200' // Default for info or other types
                }`}>
                    {clipboardMessage.message}
                </span>
            )}
        </div>
    );
};

export default ClipboardControls;
