import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const FreeVsProTeaser: React.FC = () => {
  const { t } = useTranslation('landing');

  return (
    <section className="px-6 py-16 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl overflow-hidden border border-slate-700"
      >
        <div className="p-8 bg-slate-800/60">
          <h3 className="text-lg font-bold text-slate-300 mb-3">{t('teaser.freeTitle')}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{t('teaser.freeFeatures')}</p>
        </div>
        <div className="p-8 bg-orange-500/10 border-l border-orange-500/30">
          <h3 className="text-lg font-bold text-orange-400 mb-3">{t('teaser.proTitle')}</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{t('teaser.proFeatures')}</p>
        </div>
      </motion.div>
      <div className="mt-6 text-center">
        <Link
          to="/pricing"
          className="text-sm text-teal-400 hover:text-teal-300 font-medium transition-colors"
        >
          {t('teaser.cta')}
        </Link>
      </div>
    </section>
  );
};

export default FreeVsProTeaser;
