import React, { createContext, useContext } from 'react';
import { useConfirmationModal } from '@/hooks/useConfirmationModal';
import ConfirmationModal from '@/components/common/ConfirmationModal';

const ConfirmationModalContext = createContext();

export const ConfirmationModalProvider = ({ children }) => {
  const {
    modalState,
    showConfirmation,
    confirmDanger,
    confirmWarning,
    confirmSuccess,
    hideModal
  } = useConfirmationModal();

  const contextValue = {
    showConfirmation,
    confirmDanger,
    confirmWarning,
    confirmSuccess
  };

  return (
    <ConfirmationModalContext.Provider value={contextValue}>
      {children}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={modalState.onCancel || hideModal}
        onConfirm={modalState.onConfirm || hideModal}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        type={modalState.type}
      />
    </ConfirmationModalContext.Provider>
  );
};

export const useGlobalConfirmation = () => {
  const context = useContext(ConfirmationModalContext);
  if (!context) {
    throw new Error('useGlobalConfirmation must be used within a ConfirmationModalProvider');
  }
  return context;
};
