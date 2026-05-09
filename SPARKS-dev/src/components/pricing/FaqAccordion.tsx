import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqItem {
  q: string;
  a: string;
}

const FaqAccordion: React.FC = () => {
  const { t } = useTranslation('pricing');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const questions = t('faq.questions', { returnObjects: true }) as FaqItem[];

  const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i));

  return (
    <section className="max-w-3xl mx-auto px-4 md:px-6 py-12">
      <h2 className="text-2xl font-bold text-white text-center mb-8">{t('faq.title')}</h2>
      <div className="space-y-3">
        {questions.map((item, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/25 bg-white/10 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.15)] overflow-hidden hover:-translate-y-0.5 hover:bg-white/18 hover:border-white/40 transition-all duration-150"
          >
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-bold text-white hover:bg-white/10 transition-colors"
            >
              {item.q}
              <motion.span
                animate={{ rotate: openIndex === i ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="ml-4 flex-shrink-0 text-blue-300"
              >
                <ChevronDown size={16} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {openIndex === i && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 text-sm text-white/80 leading-relaxed border-t border-white/15 pt-3">
                    {item.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FaqAccordion;
