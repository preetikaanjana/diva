import React, { createContext, useContext, useState } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('diva_language') || 'en';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('diva_language', lang);
  };

  const t = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    if (language === 'hi') {
      return translations[text] || text;
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
