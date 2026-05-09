import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LandingFooter: React.FC = () => {
  const { t } = useTranslation('landing');

  return (
    <footer className="border-t border-blue-800/40 px-4 md:px-6 py-8 md:py-10 mt-8">
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1">
          <span className="font-bold text-orange-500">SPARKS</span>
          <span className="text-xs text-slate-500 ml-1">Teacher Tools</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-300 transition-colors min-h-[44px] flex items-center">{t('footer.home')}</Link>
          <Link to="/pricing" className="hover:text-slate-300 transition-colors min-h-[44px] flex items-center">{t('footer.pricing')}</Link>
          <Link to="/login" className="hover:text-slate-300 transition-colors min-h-[44px] flex items-center">{t('footer.login')}</Link>
          <a href="mailto:hello@sparks.app" className="hover:text-slate-300 transition-colors min-h-[44px] flex items-center">{t('footer.contact')}</a>
        </nav>
        <p className="text-xs text-slate-600 text-center">{t('footer.copyright')}</p>
      </div>
    </footer>
  );
};

export default LandingFooter;
