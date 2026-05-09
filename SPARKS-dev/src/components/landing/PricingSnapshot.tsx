import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const PricingSnapshot: React.FC = () => {
  const { t } = useTranslation('pricing');
  const [annual, setAnnual] = useState(true);

  return (
    <section className="px-6 py-20 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Toggle */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="flex items-center p-1.5 rounded-full bg-slate-800 border border-slate-700">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-1.5 rounded-full text-sm font-black uppercase tracking-wide transition-all ${!annual ? 'bg-[#F55926] text-white border-t-4 border-l-2 border-r-2 border-b-0 border-[#FFAB91] shadow-[0_4px_0_#BF360C]' : 'text-slate-400 hover:text-white border-t-4 border-transparent'}`}
            >
              {t('billing.monthly')}
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-1.5 rounded-full text-sm font-black uppercase tracking-wide transition-all ${annual ? 'bg-[#F55926] text-white border-t-4 border-l-2 border-r-2 border-b-0 border-[#FFAB91] shadow-[0_4px_0_#BF360C]' : 'text-slate-400 hover:text-white border-t-4 border-transparent'}`}
            >
              {t('billing.annual')}
            </button>
          </div>
          <div className="h-6 flex items-center">
            {annual && (
              <span className="px-4 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-black">{t('billing.annualSavings')}</span>
            )}
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Free */}
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">{t('tiers.free.name')}</h3>
              <p className="text-3xl font-bold text-slate-300 mt-2">{t('tiers.free.price')} <span className="text-base font-normal text-slate-500">{t('tiers.free.period')}</span></p>
            </div>
            <ul className="space-y-2 text-sm text-slate-400 flex-1">
              {(t('tiers.free.features', { returnObjects: true }) as string[]).slice(0, 4).map((f, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-slate-600 mt-0.5">•</span>{f}</li>
              ))}
            </ul>
            <Link to="/login" className="block text-center py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-colors">
              {t('tiers.free.cta')}
            </Link>
          </div>

          {/* Pro */}
          <div className="p-6 rounded-2xl bg-slate-800/60 border-2 border-orange-500 flex flex-col gap-4 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-orange-500 text-white text-xs font-bold">
              {t('tiers.pro.badge')}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{t('tiers.pro.name')}</h3>
              <p className="text-3xl font-bold text-orange-400 mt-2">
                {annual ? t('tiers.pro.priceAnnual') : t('tiers.pro.priceMonthly')}
                <span className="text-base font-normal text-slate-400 ml-1">
                  {annual ? t('tiers.pro.periodAnnual') : t('tiers.pro.periodMonthly')}
                </span>
              </p>
              {annual && <p className="text-xs text-slate-500 mt-1">{t('tiers.pro.annualTotal')}</p>}
            </div>
            <ul className="space-y-2 text-sm text-slate-300 flex-1">
              {(t('tiers.pro.features', { returnObjects: true }) as string[]).slice(0, 4).map((f, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span>{f}</li>
              ))}
            </ul>
            <Link to="/pricing" className="block text-center py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors shadow-lg shadow-orange-500/20">
              {t('tiers.pro.cta')}
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          {t('tiers.school.badge')} · {t('tiers.school.name')} plan · <a href="mailto:hello@sparks.app" className="hover:text-slate-400 transition-colors">Contact us</a>
        </p>
      </motion.div>
    </section>
  );
};

export default PricingSnapshot;
