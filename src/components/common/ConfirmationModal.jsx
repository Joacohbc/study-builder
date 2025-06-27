import React from 'react';
import { useTranslation } from 'react-i18next';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText,
  cancelText,
  type = "default" // default, danger, warning, success
}) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  // Use translation fallbacks if no custom text provided
  const modalTitle = title || t('confirmModal.title');
  const modalMessage = message || t('confirmModal.message');
  const modalConfirmText = confirmText || t('common.confirm');
  const modalCancelText = cancelText || t('common.cancel');

  const getButtonColors = () => {
    switch (type) {
      case 'danger':
        return {
          confirm: 'bg-red-500 hover:bg-red-600 focus:ring-red-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
          cancel: 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
        };
      case 'warning':
        return {
          confirm: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
          cancel: 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
        };
      case 'success':
        return {
          confirm: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
          cancel: 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
        };
      default:
        return {
          confirm: 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
          cancel: 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
        };
    }
  };

  const buttonColors = getButtonColors();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter') {
      onConfirm();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-fade-in border border-gray-100">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {modalTitle}
            </h3>
          </div>
          
          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-600 leading-relaxed">
              {modalMessage}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonColors.cancel}`}
            >
              {modalCancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-5 py-2.5 rounded-lg font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonColors.confirm}`}
              autoFocus
            >
              {modalConfirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
