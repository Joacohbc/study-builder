import React, { useState } from 'react';
import { formatBase64Image, isValidBase64Image } from '@/utils/imageUtils';

// QuestionImage Component - Handles display of base64 images in questions
const QuestionImage = ({ imageData, altText = "Question image", className = "" }) => {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // If no image data, don't render anything
    if (!imageData) {
        return null;
    }

    // Validate image data
    if (!isValidBase64Image(imageData)) {
        return (
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-center text-yellow-700">
                <svg className="w-8 h-8 mx-auto mb-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm">Formato de imagen inválido</p>
            </div>
        );
    }

    // Handle image load error
    const handleImageError = () => {
        setImageError(true);
        setIsLoading(false);
    };

    // Handle image load success
    const handleImageLoad = () => {
        setIsLoading(false);
    };

    // Validate and format base64 string
    const getImageSrc = () => {
        return formatBase64Image(imageData);
    };

    const defaultClasses = "max-w-full h-auto rounded-lg shadow-sm border border-gray-200";
    const combinedClasses = `${defaultClasses} ${className}`.trim();

    if (imageError) {
        return (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Error al cargar la imagen</p>
            </div>
        );
    }

    return (
        <div className="question-image-container mb-4">
            {isLoading && (
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-8 text-center">
                    <div className="animate-pulse">
                        <div className="bg-gray-300 h-32 rounded-lg mb-2"></div>
                        <p className="text-sm text-gray-500">Cargando imagen...</p>
                    </div>
                </div>
            )}
            <img
                src={getImageSrc()}
                alt={altText}
                className={combinedClasses}
                onError={handleImageError}
                onLoad={handleImageLoad}
                style={{ display: isLoading ? 'none' : 'block' }}
            />
        </div>
    );
};

export default QuestionImage;
