import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useConfirmationModal = () => {
  const { t } = useTranslation();
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    type: 'default',
    onConfirm: null,
    onCancel: null
  });

  const showConfirmation = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title || t('confirmModal.title'),
        message: options.message || t('confirmModal.message'),
        confirmText: options.confirmText || t('common.confirm'),
        cancelText: options.cancelText || t('common.cancel'),
        type: options.type || 'default',
        onConfirm: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, [t]);

  const hideModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Métodos de conveniencia para diferentes tipos de confirmación
  const confirmDanger = useCallback((options = {}) => {
    return showConfirmation({
      ...options,
      type: 'danger',
      title: options.title || t('editor.dangerousAction'),
      confirmText: options.confirmText || t('common.delete')
    });
  }, [showConfirmation, t]);

  const confirmWarning = useCallback((options = {}) => {
    return showConfirmation({
      ...options,
      type: 'warning',
      title: options.title || t('common.warning')
    });
  }, [showConfirmation, t]);

  const confirmSuccess = useCallback((options = {}) => {
    return showConfirmation({
      ...options,
      type: 'success',
      title: options.title || t('editor.confirmAction')
    });
  }, [showConfirmation, t]);

  return {
    modalState,
    showConfirmation,
    confirmDanger,
    confirmWarning,
    confirmSuccess,
    hideModal
  };
};
