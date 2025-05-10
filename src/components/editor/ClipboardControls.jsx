// src/components/editor/ClipboardControls.jsx
import React from 'react';
import CopyIcon from '../../icons/CopyIcon';
import PasteIcon from '../../icons/PasteIcon';

const ClipboardControls = ({
    onCopyToClipboard,
    onPasteFromClipboard,
    clipboardMessage,
    isLoading // To disable buttons during an operation if needed (optional)
}) => {
    return (
        <div className="flex flex-wrap gap-2 items-center">
            <button
                onClick={onCopyToClipboard}
                className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded-md text-sm transition duration-150"
                title="Copiar todo el JSON al portapapeles"
                disabled={isLoading}
            >
                <CopyIcon /> Copiar JSON
            </button>
            <button
                onClick={onPasteFromClipboard}
                className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded-md text-sm transition duration-150"
                title="Pegar JSON desde el portapapeles"
                disabled={isLoading}
            >
                <PasteIcon /> Pegar JSON
            </button>
            
            {clipboardMessage && clipboardMessage.message && (
                <span className={`inline-flex items-center text-xs py-1 px-2 rounded ${
                    clipboardMessage.type === 'success' ? 'bg-green-100 text-green-800' : 
                    clipboardMessage.type === 'error' ? 'bg-red-100 text-red-800' : 
                    'bg-blue-100 text-blue-700' // Default for info or other types
                }`}>
                    {clipboardMessage.message}
                </span>
            )}
        </div>
    );
};

export default ClipboardControls;
