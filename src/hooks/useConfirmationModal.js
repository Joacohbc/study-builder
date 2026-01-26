import { useState } from 'react';

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

  const showConfirmation = (options = {}) => {
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
  };

  const hideModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Métodos de conveniencia para diferentes tipos de confirmación
  const confirmDanger = (options = {}) => {
    return showConfirmation({
      ...options,
      type: 'danger',
      title: options.title || 'Acción peligrosa',
      confirmText: options.confirmText || 'Eliminar'
    });
  };

  const confirmWarning = (options = {}) => {
    return showConfirmation({
      ...options,
      type: 'warning',
      title: options.title || 'Advertencia'
    });
  };

  const confirmSuccess = (options = {}) => {
    return showConfirmation({
      ...options,
      type: 'success',
      title: options.title || 'Confirmar acción'
    });
  };

  return {
    modalState,
    showConfirmation,
    confirmDanger,
    confirmWarning,
    confirmSuccess,
    hideModal
  };
};
