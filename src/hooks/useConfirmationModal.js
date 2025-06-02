import { useState, useCallback } from 'react';

export const useConfirmationModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'default',
    onConfirm: null,
    onCancel: null
  });

  const showConfirmation = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title || 'Confirmar acción',
        message: options.message || '¿Estás seguro de que quieres continuar?',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
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
  }, []);

  const hideModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Métodos de conveniencia para diferentes tipos de confirmación
  const confirmDanger = useCallback((options = {}) => {
    return showConfirmation({
      ...options,
      type: 'danger',
      title: options.title || 'Acción peligrosa',
      confirmText: options.confirmText || 'Eliminar'
    });
  }, [showConfirmation]);

  const confirmWarning = useCallback((options = {}) => {
    return showConfirmation({
      ...options,
      type: 'warning',
      title: options.title || 'Advertencia'
    });
  }, [showConfirmation]);

  const confirmSuccess = useCallback((options = {}) => {
    return showConfirmation({
      ...options,
      type: 'success',
      title: options.title || 'Confirmar acción'
    });
  }, [showConfirmation]);

  return {
    modalState,
    showConfirmation,
    confirmDanger,
    confirmWarning,
    confirmSuccess,
    hideModal
  };
};
