import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Wrench, BookOpen, Zap } from 'lucide-react';

interface PillarCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  bullets: string[];
  accentClass: string;
  borderClass: string;
  delay: number;
}

const PillarCard: React.FC<PillarCardProps> = ({ icon, title, subtitle, bullets, accentClass, borderClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    className={`flex flex-col gap-4 p-6 rounded-2xl bg-slate-800/60 border ${borderClass} backdrop-blur-sm`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accentClass}`}>
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    </div>
    <ul className="space-y-1.5">
      {bullets.map((b, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
          <span className={`mt-0.5 text-xs ${accentClass.replace('bg-', 'text-').replace('/20', '-400')}`}>▸</span>
          {b}
        </li>
      ))}
    </ul>
  </motion.div>
);

const PillarsSection: React.FC = () => {
  const { t } = useTranslation('landing');

  const toolsBullets = t('pillars.tools.bullets', { returnObjects: true }) as string[];
  const wordboxBullets = t('pillars.wordbox.bullets', { returnObjects: true }) as string[];
  const buildlinkBullets = t('pillars.buildlink.bullets', { returnObjects: true }) as string[];

  return (
    <section className="px-6 py-24 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PillarCard
          icon={<Wrench size={22} className="text-purple-400" />}
          title={t('pillars.tools.title')}
          subtitle={t('pillars.tools.subtitle')}
          bullets={toolsBullets}
          accentClass="bg-purple-500/20"
          borderClass="border-purple-500/30"
          delay={0}
        />
        <PillarCard
          icon={<BookOpen size={22} className="text-green-400" />}
          title={t('pillars.wordbox.title')}
          subtitle={t('pillars.wordbox.subtitle')}
          bullets={wordboxBullets}
          accentClass="bg-green-500/20"
          borderClass="border-green-500/30"
          delay={0.1}
        />
        <PillarCard
          icon={<Zap size={22} className="text-teal-400" />}
          title={t('pillars.buildlink.title')}
          subtitle={t('pillars.buildlink.subtitle')}
          bullets={buildlinkBullets}
          accentClass="bg-teal-500/20"
          borderClass="border-teal-500/30"
          delay={0.2}
        />
      </div>
    </section>
  );
};

export default PillarsSection;
