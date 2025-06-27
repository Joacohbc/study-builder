import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
      title={t('language.switch')}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">🌐</span>
        <span>{t('language.switchTo')}</span>
      </div>
    </button>
  );
};

export default LanguageSelector;
