// --- START OF SECTION: src/ReflectionView.tsx ---
import React, { useState, useEffect } from 'react';
import { Star, Smile, Meh, Frown, Save, Check } from 'lucide-react';
import { LessonPlan, LessonReflection } from './types';

export const ReflectionView = ({
  plan,
  onUpdate,
  role = "ALT"
}: {
  plan: LessonPlan;
  onUpdate: (reflection: LessonReflection) => void;
  role?: "ALT" | "TEACHER2";
}) => {
  const safeParse = (data: any) => {
    if (!data) return null;
    if (typeof data === 'object') return data;
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse reflection data", e);
      return null;
    }
  };

  // Determine which reflection to initialize with based on role
  const rawData = role?.toUpperCase() === "TEACHER2" ? plan.teacher2Reflection : plan.reflection;
  const initialReflectionData = safeParse(rawData);

  const [rating, setRating] = useState(initialReflectionData?.rating || 0);
  const [engagement, setEngagement] = useState<LessonReflection['studentEngagement']>(initialReflectionData?.studentEngagement || 'Medium');
  const [notes, setNotes] = useState(initialReflectionData?.notes || '');
  const [adjustments, setAdjustments] = useState(initialReflectionData?.nextTimeAdjustments || '');
  const [saved, setSaved] = useState(false);

  // Sync state if plan changes
  useEffect(() => {
    const raw = role?.toUpperCase() === "TEACHER2" ? plan.teacher2Reflection : plan.reflection;
    const data = safeParse(raw);

    setRating(data?.rating || 0);
    setEngagement(data?.studentEngagement || 'Medium');
    setNotes(data?.notes || '');
    // Support both legacy "adjustments" and new "nextTimeAdjustments"
    setAdjustments(data?.nextTimeAdjustments || (data as any)?.adjustments || '');
  }, [plan.id, plan.reflection, plan.teacher2Reflection, role]);

  const handleManualSave = () => {
    const reflection: LessonReflection = {
      rating,
      studentEngagement: engagement,
      notes,
      nextTimeAdjustments: adjustments,
      completedAt: new Date().toISOString()
    };

    onUpdate(reflection);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const jteRef = safeParse(plan.teacher2Reflection);
  const altRef = safeParse(plan.reflection);

  // Premium Card Sub-component for consistency
  const PartnerReflectionCard = ({ data, title, isIndigo }: { data: any, title: string, isIndigo: boolean }) => (
    <div className="mb-10">
      <h3 className={`text-sm font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-3 ${isIndigo ? 'text-indigo-400' : 'text-rose-400'}`}>
        <Star className={`w-5 h-5 ${isIndigo ? 'text-indigo-500' : 'text-yellow-500'}`} />
        {title}
      </h3>
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-50 ${isIndigo ? 'bg-indigo-50' : 'bg-rose-50'}`} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 mb-6">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= (data.rating || 0)
                    ? (isIndigo ? 'text-indigo-500 fill-current' : 'text-yellow-400 fill-current')
                    : 'text-slate-200'
                    }`}
                />
              ))}
            </div>
            <span className="font-black text-slate-800 text-lg">
              {data.rating}/5
            </span>
          </div>
          <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border shadow-inner ${data.studentEngagement === 'High'
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
            : data.studentEngagement === 'Medium'
              ? 'bg-amber-50 text-amber-600 border-amber-100'
              : 'bg-rose-50 text-rose-600 border-rose-100'
            }`}>
            {data.studentEngagement} Engagement
          </div>
        </div>
        <div className="relative z-10 space-y-4">
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Observations</h4>
            <p className="text-slate-600 font-medium leading-relaxed italic">"{data.notes}"</p>
          </div>
          {data.nextTimeAdjustments && (
            <div>
              <h4 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isIndigo ? 'text-rose-400' : 'text-indigo-400'}`}>Future Adjustments</h4>
              <p className={`text-slate-600 font-medium leading-relaxed p-4 rounded-2xl border ${isIndigo ? 'bg-rose-50/30 border-rose-50/50' : 'bg-indigo-50/30 border-indigo-50/50'}`}>"{data.nextTimeAdjustments}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in flex flex-col lg:max-w-4xl mx-auto w-full">
      <div className={`${role?.toUpperCase() === 'JTE' ? 'bg-indigo-50 border-indigo-100' : 'bg-rose-50 border-rose-100'} border-b p-8`}>
        <h2 className={`text-3xl font-black flex items-center gap-3 tracking-tight uppercase ${role?.toUpperCase() === 'JTE' ? 'text-indigo-900' : 'text-rose-900'}`}>
          <Star className={`w-8 h-8 ${role?.toUpperCase() === 'JTE' ? 'text-indigo-500' : 'text-rose-500'}`} />
          {role?.toUpperCase() === 'TEACHER2' ? "Teacher 2 Reflection" : "Lesson Reflection"}
        </h2>
        <p className={`${role?.toUpperCase() === 'JTE' ? 'text-indigo-700' : 'text-rose-700'} text-sm font-medium mt-2 opacity-80 uppercase tracking-wider`}>
          {role?.toUpperCase() === 'TEACHER2' ? "Provide your feedback and observations on the lesson." : "Take a moment to evaluate how the lesson went. This helps improve future classes."}
        </p>
      </div>

      <div className="p-8 space-y-12 overflow-y-auto flex-grow custom-scrollbar">
        {/* Other teacher's reflection summary if viewing own */}
        {role?.toUpperCase() === 'ALT' && jteRef && (
          <PartnerReflectionCard data={jteRef} title="Teacher 2 Reflection" isIndigo={true} />
        )}

        {role?.toUpperCase() === 'TEACHER2' && altRef && (
          <PartnerReflectionCard data={altRef} title="Other Teacher's Reflection" isIndigo={false} />
        )}

        {/* Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase mb-3">Overall Satisfaction</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-lg transition-all ${rating >= star ? (role?.toUpperCase() === 'JTE' ? 'text-indigo-500 scale-110' : 'text-yellow-400 scale-110') : 'text-slate-200 hover:text-slate-400'
                    }`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase mb-3">Student Engagement</label>
            <div className="flex gap-4">
              {(['High', 'Medium', 'Low'] as const).map(lev => (
                <button
                  key={lev}
                  onClick={() => setEngagement(lev)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all w-24 ${engagement === lev
                    ? (lev === 'High' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : lev === 'Medium' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-rose-500 bg-rose-50 text-rose-700')
                    : 'border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                >
                  {lev === 'High' ? <Smile className="w-8 h-8" /> : lev === 'Medium' ? <Meh className="w-8 h-8" /> : <Frown className="w-8 h-8" />}
                  <span className="text-xs font-bold">{lev}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Text Areas */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase mb-2">
              {role?.toUpperCase() === 'JTE' ? "Observations / Feedback" : "What went well / Problems"}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={role?.toUpperCase() === 'JTE' ? "Add your observations about the class flow and ALT interaction..." : "The students really enjoyed the card game..."}
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm resize-none font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase mb-2">Adjustments for Next Time</label>
            <textarea
              value={adjustments}
              onChange={(e) => setAdjustments(e.target.value)}
              placeholder="Use a visual demo for the rules..."
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm resize-none font-medium"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleManualSave}
            disabled={rating === 0}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-lg transition-all active:scale-95 ${saved
              ? 'bg-emerald-500 text-white'
              : rating > 0
                ? (role?.toUpperCase() === 'JTE' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-rose-600 text-white hover:bg-rose-700')
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saved ? 'Saved!' : 'Save Reflection'}
          </button>
        </div>
      </div>
    </div>
  );
};
// --- END OF SECTION: src/ReflectionView.tsx ---