import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import NeonCard from '../neon/NeonCard';

interface FreeTierProps {
  type: 'free';
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  ctaTo: string;
}

interface ProTierProps {
  type: 'pro';
  name: string;
  badge: string;
  priceMonthly: string;
  priceAnnual: string;
  periodMonthly: string;
  periodAnnual: string;
  annualTotal: string;
  features: string[];
  cta: string;
  ctaTo: string;
  annual: boolean;
}

interface SchoolTierProps {
  type: 'school';
  name: string;
  badge: string;
  description: string;
  cta: string;
}

type TierCardProps = FreeTierProps | ProTierProps | SchoolTierProps;

const neonLink = (to: string, label: string, variant: 'blue' | 'yellow' | 'pink') => {
  const styles = {
    blue:   'bg-[#2885FF] border-[#8DC3FF] shadow-[0_6px_0_#004E98,0_10px_0_rgba(0,0,0,0.2)]',
    yellow: 'bg-[#FBC02D] border-[#FFF59D] shadow-[0_6px_0_#F57F17,0_10px_0_rgba(0,0,0,0.2)]',
    pink:   'bg-[#E943D5] border-[#FF99F5] shadow-[0_6px_0_#A60098,0_10px_0_rgba(0,0,0,0.2)]',
  };
  return (
    <Link
      to={to}
      className={`block text-center rounded-full font-black text-white uppercase tracking-wider px-6 py-2.5 text-sm border-t-4 border-l-2 border-r-2 border-b-0 hover:brightness-125 hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all duration-150 ${styles[variant]}`}
    >
      {label}
    </Link>
  );
};

const TierCard: React.FC<TierCardProps> = (props) => {
  if (props.type === 'free') {
    return (
      <div className="hover:-translate-y-2 hover:brightness-110 transition-all duration-200">
      <NeonCard variant="green" className="w-full h-full">
        <div className="flex flex-col gap-5 h-full">
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{props.name}</h3>
            <p className="text-5xl font-black text-white mt-3">
              {props.price}
              <span className="text-base font-semibold text-white/80 ml-2">{props.period}</span>
            </p>
          </div>
          <ul className="flex-1 space-y-2">
            {props.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/90">
                <span className="text-white/50 mt-0.5 flex-shrink-0">•</span>{f}
              </li>
            ))}
          </ul>
          {neonLink(props.ctaTo, props.cta, 'blue')}
        </div>
      </NeonCard>
      </div>
    );
  }

  if (props.type === 'pro') {
    const price = props.annual ? props.priceAnnual : props.priceMonthly;
    const period = props.annual ? props.periodAnnual : props.periodMonthly;
    return (
      <div className="relative md:-translate-y-4">
        {/* Pulsing glow ring */}
        <motion.div
          className="absolute -inset-3 rounded-3xl bg-orange-500/40 blur-xl pointer-events-none"
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Most Popular badge */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 px-5 py-1 rounded-full bg-[#FBC02D] border-t-2 border-[#FFF59D] shadow-[0_3px_0_#F57F17] whitespace-nowrap">
          <span className="text-xs font-black uppercase tracking-widest text-yellow-900">⭐ Most Popular</span>
        </div>
        <div className="relative hover:-translate-y-2 hover:brightness-110 transition-all duration-200">
          <NeonCard variant="orange" className="w-full h-full">
            <div className="flex flex-col gap-5 h-full">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">{props.name}</h3>
                <p className="text-5xl font-black text-white mt-2">
                  {price}
                  <span className="text-base font-semibold text-white/70 ml-2">{period}</span>
                </p>
                {props.annual && (
                  <p className="text-xs text-white/60 mt-1">{props.annualTotal}</p>
                )}
              </div>
              <ul className="flex-1 space-y-2">
                {props.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white">
                    <span className="text-yellow-200 mt-0.5 flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              {neonLink(props.ctaTo, props.cta, 'yellow')}
            </div>
          </NeonCard>
        </div>
      </div>
    );
  }

  // school - pink, coming soon
  return (
    <div className="hover:-translate-y-2 hover:brightness-110 transition-all duration-200">
    <div className="relative flex flex-col p-1 rounded-3xl shadow-[0_8px_0_#A60098,0_12px_20px_rgba(0,0,0,0.3)]">
      {/* Shine overlay */}
      <div className="absolute inset-x-2 top-2 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-[20px] pointer-events-none z-10" />
      <div className="relative px-6 py-6 rounded-[20px] bg-[#E943D5] border-4 border-[#FF99F5] flex flex-col gap-5">
        <div>
          <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-widest mb-2">
            {props.badge}
          </span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">{props.name}</h3>
          <p className="mt-3 text-sm text-white/80 leading-relaxed">{props.description}</p>
        </div>
        <div className="flex-1" />
        <a
          href="mailto:hello@sparks.app"
          className="block text-center rounded-full font-black text-white uppercase tracking-wider px-6 py-2.5 text-sm bg-[#FBC02D] border-t-4 border-l-2 border-r-2 border-b-0 border-[#FFF59D] shadow-[0_6px_0_#F57F17] hover:brightness-125 hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all duration-150"
        >
          {props.cta}
        </a>
      </div>
    </div>
    </div>
  );
};

export default TierCard;
