// --- START OF SECTION: src/LessonPlanner.tsx ---
import React, { useState } from 'react';
import { ManualBuilder } from './ManualBuilder';
import { UserProfile, LessonPlan, ManualPlanState } from './types';
import { GRADES, TEXTBOOKS, TEXTBOOK_UNITS, INITIAL_MANUAL_STATE } from './constants';
import { generateLessonContent } from './api';
import { ChatAssistant } from './ChatAssistant';
import { ChevronDown, Sparkles, PenTool, Shield, MessageSquare } from 'lucide-react';

export const LessonPlanner = ({
    profile,
    onPlanGenerated
}: {
    profile: UserProfile;
    onPlanGenerated: (plan: LessonPlan) => void;
}) => {
    const [mode, setMode] = useState<'AI' | 'MANUAL'>('AI');
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<ManualPlanState>({
        ...INITIAL_MANUAL_STATE,
        level: "Elementary",
        grade: GRADES.Elementary[4],
        textbook: TEXTBOOKS.Elementary[2],
        studentLevel: 3,
        classSize: 35
    });

    const [isChatOpen, setIsChatOpen] = useState(false);

    // Sync Teacher 2 from profile
    React.useEffect(() => {
        if (profile.connected_teachers.length > 0 && !form.teacher2Name) {
            setForm(prev => ({ ...prev, teacher2Name: profile.connected_teachers[0].displayName }));
        }
    }, [profile.connected_teachers, form.teacher2Name]);

    const handleBatchUpdate = (data: Partial<ManualPlanState>) => {
        setForm(prev => ({ ...prev, ...data }));
    };

    const updateField = (field: keyof ManualPlanState, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Must have EITHER unit OR target language
        if (!form.unit.trim() && !form.targetLanguage.trim()) return;

        setLoading(true);

        const data = await generateLessonContent(
            form.level,
            form.grade,
            form.textbook,
            form.unit,
            form.classSize,
            45, // Default duration
            form.studentLevel,
            profile,
            form.targetLanguage || undefined,
            form.lessonVocabulary || undefined
        );

        if (data) onPlanGenerated(data);
        setLoading(false);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            <aside className="w-full lg:w-64 flex-shrink-0 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <h3 className="font-bold text-slate-800 mb-3 px-2">Builder Mode</h3>
                    <div className="space-y-2">
                        <button onClick={() => setMode('AI')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'AI' ? "bg-teal-600 text-white shadow-md" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
                            <Sparkles className="w-4 h-4" /> AI Generator
                        </button>
                        <button onClick={() => setMode('MANUAL')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'MANUAL' ? "bg-indigo-600 text-white shadow-md" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
                            <PenTool className="w-4 h-4" /> Manual Builder
                        </button>
                    </div>
                </div>
            </aside>

            <div className="flex-1 min-w-0">
                {mode === 'MANUAL' ? (
                    <ManualBuilder initialProfile={profile} onPreview={onPlanGenerated} />
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 animate-in fade-in">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-teal-500" /> AI Lesson Generator
                                </h2>
                                <p className="text-slate-500 mt-1">Configure your class details and generate a plan.</p>
                            </div>
                            <button
                                onClick={() => setIsChatOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-all shadow-sm group whitespace-nowrap"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Custom AI Guidance & Chat</span>
                            </button>
                        </div>
                        <form onSubmit={handleGenerate} className="max-w-2xl space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">School Level</label>
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        <button type="button" onClick={() => handleBatchUpdate({ level: "Elementary", grade: GRADES.Elementary[4], textbook: TEXTBOOKS.Elementary[2] })} className={`flex-1 py-2 text-sm font-bold rounded-md ${form.level === "Elementary" ? "bg-white text-teal-600 shadow-sm" : "text-slate-400"}`}>Elementary</button>
                                        <button type="button" onClick={() => handleBatchUpdate({ level: "JuniorHigh", grade: GRADES.JuniorHigh[1], textbook: TEXTBOOKS.JuniorHigh[0] })} className={`flex-1 py-2 text-sm font-bold rounded-md ${form.level === "JuniorHigh" ? "bg-white text-teal-600 shadow-sm" : "text-slate-400"}`}>Junior High</button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Grade</label>
                                    <select value={form.grade} onChange={(e) => updateField('grade', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                                        {GRADES[form.level].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Textbook</label>
                                    <select value={form.textbook} onChange={(e) => updateField('textbook', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                                        {TEXTBOOKS[form.level].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Unit</label>
                                {TEXTBOOK_UNITS[form.textbook] ? (
                                    <select value={form.unit} onChange={(e) => updateField('unit', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                                        <option value="">Select a Unit...</option>
                                        {TEXTBOOK_UNITS[form.textbook].map(u => <option key={u.title} value={u.title}>{u.number}. {u.title}</option>)}
                                    </select>
                                ) : (
                                    <input type="text" value={form.unit} onChange={(e) => updateField('unit', e.target.value)} placeholder="Unit Name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                                )}
                            </div>

                            {form.targetLanguage && (
                                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2 animate-in slide-in-from-top-2">
                                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase">
                                        <Sparkles className="w-3 h-3" /> Custom Context Active
                                    </div>
                                    <div className="text-sm text-slate-700">
                                        <strong>Target:</strong> {form.targetLanguage}
                                    </div>
                                    {form.lessonVocabulary && (
                                        <div className="text-sm text-slate-700">
                                            <strong>Vocabulary:</strong> {form.lessonVocabulary}
                                        </div>
                                    )}
                                    <div className="text-[10px] text-indigo-400 font-medium italic">
                                        Set in Sparkii Assistant Context
                                    </div>
                                </div>
                            )}

                            <button type="submit" disabled={loading || (!form.unit && !form.targetLanguage)} className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                                {loading ? "Thinking..." : "Generate Plan"}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <ChatAssistant
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                onUpdateForm={handleBatchUpdate}
                currentForm={form}
            />
        </div>
    );
};
// --- END OF SECTION: src/LessonPlanner.tsx ---