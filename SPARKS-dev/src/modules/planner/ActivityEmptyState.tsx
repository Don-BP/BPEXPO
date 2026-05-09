import React from 'react';
import { Sparkles, Zap, Users } from 'lucide-react';

export const ActivityEmptyState = () => {
  return (
    <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed animate-in fade-in">
      <div className="inline-flex p-4 rounded-full bg-indigo-50 text-indigo-500 mb-4">
        <Sparkles className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">Need Inspiration?</h3>
      <p className="text-slate-500 max-w-md mx-auto mb-6">
        Select a grade and skill above, then let Sparkii suggest engaging games and activities tailored for your students.
      </p>
      <div className="flex gap-2 justify-center text-sm text-slate-400">
        <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> Instant Ideas</span>
        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Class-size adaptable</span>
      </div>
    </div>
  );
};