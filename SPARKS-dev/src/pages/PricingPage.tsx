import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import LandingNav from '../components/landing/LandingNav';
import SparkleBackground from '../components/common/SparkleBackground';
import LandingFooter from '../components/landing/LandingFooter';
import BillingToggle from '../components/pricing/BillingToggle';
import TierCard from '../components/pricing/TierCard';
import FeatureTable from '../components/pricing/FeatureTable';
import FaqAccordion from '../components/pricing/FaqAccordion';

const PricingPage: React.FC = () => {
  const { t } = useTranslation('pricing');
  const [annual, setAnnual] = useState(true);

  useEffect(() => {
    document.documentElement.style.overflowY = 'auto';
    document.body.style.overflowY = 'auto';
    return () => {
      document.documentElement.style.overflowY = '';
      document.body.style.overflowY = '';
    };
  }, []);

  const freeTier = t('tiers.free', { returnObjects: true }) as {
    name: string; price: string; period: string; cta: string; features: string[];
  };
  const proTier = t('tiers.pro', { returnObjects: true }) as {
    name: string; badge: string; priceMonthly: string; priceAnnual: string;
    periodMonthly: string; periodAnnual: string; annualTotal: string; cta: string; features: string[];
  };
  const schoolTier = t('tiers.school', { returnObjects: true }) as {
    name: string; badge: string; description: string; cta: string;
  };

  return (
    <div className="min-h-screen bg-[#1e3875] text-white">
      <SparkleBackground />
      <LandingNav />

      <main className="relative z-10 pt-24 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center px-4 md:px-6 mb-10 md:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-400 via-yellow-300 to-teal-300 bg-clip-text text-transparent leading-tight pb-1">
            {t('header.title')}
          </h1>
          <p className="mt-3 text-base md:text-lg text-slate-300 font-medium">{t('header.subtitle')}</p>
        </motion.div>

        {/* Billing toggle */}
        <div className="mb-10">
          <BillingToggle annual={annual} onChange={setAnnual} />
        </div>

        {/* Tier cards */}
        <section className="max-w-5xl mx-auto px-4 md:px-6 pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <TierCard
            type="free"
            name={freeTier.name}
            price={freeTier.price}
            period={freeTier.period}
            features={freeTier.features}
            cta={freeTier.cta}
            ctaTo="/login"
          />
          <TierCard
            type="pro"
            name={proTier.name}
            badge={proTier.badge}
            priceMonthly={proTier.priceMonthly}
            priceAnnual={proTier.priceAnnual}
            periodMonthly={proTier.periodMonthly}
            periodAnnual={proTier.periodAnnual}
            annualTotal={proTier.annualTotal}
            features={proTier.features}
            cta={proTier.cta}
            ctaTo="/login"
            annual={annual}
          />
          <TierCard
            type="school"
            name={schoolTier.name}
            badge={schoolTier.badge}
            description={schoolTier.description}
            cta={schoolTier.cta}
          />
        </section>

        {/* Feature comparison table */}
        <FeatureTable />

        {/* FAQ */}
        <FaqAccordion />

        {/* Final CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto px-4 md:px-6 py-12 md:py-16 text-center"
        >
          <div className="rounded-2xl border-2 border-dashed border-orange-400/60 p-6 md:p-10 bg-white/10 backdrop-blur-md hover:border-orange-400 hover:bg-white/15 hover:shadow-[0_0_40px_rgba(249,115,22,0.25)] hover:-translate-y-1 transition-all duration-300 group">
            <h2 className="text-2xl md:text-3xl font-black text-orange-400 pb-1 group-hover:text-orange-300 transition-colors duration-300">{t('cta.title')}</h2>
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto text-center rounded-full font-black text-white uppercase tracking-wider px-8 py-3 text-sm bg-[#2885FF] border-t-4 border-l-2 border-r-2 border-b-0 border-[#8DC3FF] shadow-[0_6px_0_#004E98,0_10px_0_rgba(0,0,0,0.2)] hover:brightness-125 hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all duration-150 min-h-[44px] flex items-center justify-center"
              >
                {t('cta.startFree')}
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto text-center rounded-full font-black text-white uppercase tracking-wider px-8 py-3 text-sm bg-[#F55926] border-t-4 border-l-2 border-r-2 border-b-0 border-[#FFAB91] shadow-[0_6px_0_#BF360C,0_10px_0_rgba(0,0,0,0.2)] hover:brightness-125 hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all duration-150 min-h-[44px] flex items-center justify-center"
              >
                {t('cta.goPro')}
              </Link>
            </div>
          </div>
        </motion.section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default PricingPage;
