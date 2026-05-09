import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SECTION_ROWS: Record<string, string[]> = {
  toolsGames: ['freeTools', 'adTools', 'scoreboardThemes', 'saving'],
  wordBox: ['freeCategories', 'adCategories', 'customSets', 'songLibrary'],
  buildLink: ['sparks', 'adSparks', 'history', 'pdfExport'],
  general: ['ads'],
};

const FeatureTable: React.FC = () => {
  const { t } = useTranslation('pricing');
  const [open, setOpen] = useState(false);
  const rows = t('featureTable.rows', { returnObjects: true }) as Record<string, { label: string; free: string; pro: string }>;
  const sections = t('featureTable.sections', { returnObjects: true }) as Record<string, string>;

  return (
    <section className="max-w-4xl mx-auto px-4 md:px-6 py-12">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 mx-auto text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
      >
        {open ? t('featureTable.collapse') : t('featureTable.expand')}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-6 rounded-2xl border border-white/25 bg-white/10 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.15)] overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 bg-white/15 px-3 md:px-4 py-3 text-xs font-black text-white uppercase tracking-wide">
                <span>Feature</span>
                <span className="text-center">Free</span>
                <span className="text-center text-orange-400">Pro ⭐</span>
              </div>

              {Object.entries(SECTION_ROWS).map(([sectionKey, rowKeys]) => (
                <div key={sectionKey}>
                  <div className="px-4 py-2 bg-white/10 text-xs font-black text-white/70 uppercase tracking-wider border-t border-white/10">
                    {sections[sectionKey]}
                  </div>
                  {rowKeys.map((rowKey, i) => {
                    const row = rows[rowKey];
                    if (!row) return null;
                    return (
                      <div
                        key={rowKey}
                        className={`grid grid-cols-3 px-3 md:px-4 py-3 text-xs md:text-sm border-t border-white/10 hover:bg-white/10 transition-colors duration-150 ${i % 2 === 0 ? 'bg-white/5' : ''}`}
                      >
                        <span className="text-white font-medium leading-tight">{row.label}</span>
                        <span className="text-center text-blue-200 leading-tight">{row.free}</span>
                        <span className="text-center text-orange-300 font-semibold leading-tight">{row.pro}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FeatureTable;
