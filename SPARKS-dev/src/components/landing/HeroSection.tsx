import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
  const { t } = useTranslation('landing');
  const { t: tc } = useTranslation('common');

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 py-24 text-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-500/5 blur-3xl" />
        <div className="absolute top-2/3 left-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/5 blur-3xl" />
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl"
      >
        {t('hero.headline')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
        className="relative mt-6 text-lg text-slate-400 max-w-2xl leading-relaxed"
      >
        {t('hero.subheadline')}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.35, type: 'spring', stiffness: 200 }}
        className="relative mt-10 flex flex-col sm:flex-row items-center gap-4"
      >
        <Link
          to="/login"
          className="rounded-full font-black text-white uppercase tracking-wider px-8 py-3 text-sm bg-[#F55926] border-t-4 border-l-2 border-r-2 border-b-0 border-[#FFAB91] shadow-[0_6px_0_#BF360C,0_10px_0_rgba(0,0,0,0.2)] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all"
        >
          {tc('nav.startFree')}
        </Link>
        <Link
          to="/pricing"
          className="rounded-full font-black text-white uppercase tracking-wider px-8 py-3 text-sm bg-[#2885FF] border-t-4 border-l-2 border-r-2 border-b-0 border-[#8DC3FF] shadow-[0_6px_0_#004E98,0_10px_0_rgba(0,0,0,0.2)] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all"
        >
          {tc('nav.seePricing')}
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative mt-5 text-sm text-slate-500"
      >
        {t('hero.trustLine')}
      </motion.p>
    </section>
  );
};

export default HeroSection;
