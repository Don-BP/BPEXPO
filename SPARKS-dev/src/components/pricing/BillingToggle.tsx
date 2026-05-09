import React from 'react';
import { useTranslation } from 'react-i18next';

interface BillingToggleProps {
  annual: boolean;
  onChange: (annual: boolean) => void;
}

const BillingToggle: React.FC<BillingToggleProps> = ({ annual, onChange }) => {
  const { t } = useTranslation('pricing');

  const activeClass = 'bg-[#F55926] text-white border-t-4 border-l-2 border-r-2 border-b-0 border-[#FFAB91] shadow-[0_4px_0_#BF360C]';
  const inactiveClass = 'text-slate-400 hover:text-white border-t-4 border-transparent';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center p-1.5 rounded-full bg-slate-800 border border-slate-700">
        <button
          onClick={() => onChange(false)}
          className={`px-6 py-2 rounded-full text-sm font-black uppercase tracking-wide transition-all ${!annual ? activeClass : inactiveClass}`}
        >
          {t('billing.monthly')}
        </button>
        <button
          onClick={() => onChange(true)}
          className={`px-6 py-2 rounded-full text-sm font-black uppercase tracking-wide transition-all ${annual ? activeClass : inactiveClass}`}
        >
          {t('billing.annual')}
        </button>
      </div>

      <div className="h-6 flex items-center">
        {annual && (
          <span className="px-4 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-black">
            {t('billing.annualSavings')}
          </span>
        )}
      </div>
    </div>
  );
};

export default BillingToggle;
