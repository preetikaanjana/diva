import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-switcher-container">
      <div className="language-switcher-pill">
        <button
          type="button"
          className={`lang-btn ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
          aria-label="Switch to English"
        >
          English
        </button>
        <button
          type="button"
          className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
          onClick={() => setLanguage('hi')}
          aria-label="Switch to Hindi"
        >
          हिंदी
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
