import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../common/LanguageToggle';

const LandingNav: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-[#1e3875]/90 backdrop-blur-md border-b border-blue-800/40">
      <Link to="/" className="flex items-center gap-1 flex-shrink-0">
        <span className="text-lg md:text-xl font-bold text-orange-500">SPARKS</span>
        <span className="hidden sm:inline text-sm font-medium text-teal-400 ml-1">Teacher Tools</span>
      </Link>

      <div className="flex items-center gap-2 md:gap-3">
        <LanguageToggle />
        <Link
          to="/login"
          className="px-3 md:px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors min-h-[44px] flex items-center"
        >
          {t('nav.login')}
        </Link>
        <Link
          to="/pricing"
          className="rounded-full font-black text-white uppercase tracking-wider px-4 md:px-5 py-1.5 text-xs bg-[#F55926] border-t-4 border-l-2 border-r-2 border-b-0 border-[#FFAB91] shadow-[0_4px_0_#BF360C] hover:brightness-110 active:translate-y-0.5 active:shadow-none transition-all min-h-[44px] flex items-center"
        >
          {t('nav.goPro')}
        </Link>
      </div>
    </nav>
  );
};

export default LandingNav;
