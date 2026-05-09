import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('ja') ? 'ja' : 'en';

  const toggle = (lang: 'en' | 'ja') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('sparks_language', lang);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={() => toggle('en')}
        className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
          current === 'en'
            ? 'bg-orange-500 text-white'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        EN
      </button>
      <span className="text-slate-600 text-xs">|</span>
      <button
        onClick={() => toggle('ja')}
        className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
          current === 'ja'
            ? 'bg-orange-500 text-white'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        JA
      </button>
    </div>
  );
};

export default LanguageToggle;
