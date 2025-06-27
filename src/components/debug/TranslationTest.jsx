import React from 'react';
import { useTranslation } from 'react-i18next';

const TranslationTest = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="p-4 border rounded-lg bg-yellow-100 m-4">
      <h3 className="font-bold text-lg mb-2">Translation Test</h3>
      <p><strong>Current language:</strong> {i18n.language}</p>
      <p><strong>Navigation Quiz:</strong> {t('navigation.quiz')}</p>
      <p><strong>Common Loading:</strong> {t('common.loading')}</p>
      <p><strong>Editor Title:</strong> {t('editor.title')}</p>
      <button 
        onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en')}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Toggle Language
      </button>
    </div>
  );
};

export default TranslationTest;
