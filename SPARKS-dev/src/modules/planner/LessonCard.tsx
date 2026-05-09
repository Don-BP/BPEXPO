// --- START OF FILE: src/LessonCard.tsx ---
import React, { useState } from 'react';
import {
  Download, Share2, Printer, Heart, Layers, BookOpen, Cloud, Loader2, MessageSquare, X, Send, Wand2, Trash2
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LessonPlan, UserProfile, LessonComment } from './types';
import { ShareLessonPlanModal } from './ShareLessonPlanModal';
import { saveLessonPlanToDb, shareLessonPlan, markCommentAsRead } from './api';
import { safeParseArray, safeParseObject } from './utils';

function renderActivitySteps(text: string) {
  if (!text) return null;
  const hasSteps = /\s1\.\s/.test(text) || /^1\.\s/.test(text);
  if (!hasSteps) return <p className="text-sm leading-relaxed text-slate-700">{text}</p>;

  const firstStep = text.search(/(?:^|\s)1\.\s/);
  const title = firstStep > 0 ? text.slice(0, firstStep).trim() : '';
  const stepsRaw = firstStep >= 0 ? text.slice(firstStep).trim() : text;
  const parts = stepsRaw.split(/\s+(?=\d+\.\s)/).map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);

  return (
    <div>
      {title && <p className="text-sm font-semibold text-slate-800 mb-2">{title}</p>}
      <ol className="space-y-2">
        {parts.map((step, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-slate-700">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-black flex items-center justify-center mt-0.5">{i + 1}</span>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function renderBullets(text: string, color: 'indigo' | 'teal') {
  if (!text) return null;
  const hasBullets = text.includes('•') || text.includes('·');
  if (!hasBullets) return <p className="text-sm leading-relaxed">{text}</p>;

  const dotColor = color === 'indigo' ? 'bg-indigo-400' : 'bg-teal-400';
  const items = text.split(/[•·]/).map(s => s.trim()).filter(Boolean);
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm">
          <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${dotColor} mt-1.5`} />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

interface LessonCardProps {
  plan: LessonPlan;
  onSaveFavorite: () => void;
  isSaved: boolean;
  onOpenFlashcards: (words: string[]) => void;
  onEnterClassroomMode: () => void;
  onEdit?: (plan: LessonPlan) => void;
  userProfile?: UserProfile;
  onUpdate?: (plan: LessonPlan) => void;
  onDelete?: (id: string | number) => void;
}

// Local safe parse helpers removed in favor of utils.ts versions

export const LessonCard: React.FC<LessonCardProps> = ({
  plan,
  onSaveFavorite,
  isSaved,
  onOpenFlashcards,
  onEnterClassroomMode,
  onEdit,
  userProfile,
  onUpdate,
  onDelete
}) => {
  const [shareModalPlan, setShareModalPlan] = useState<LessonPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeMemoSection, setActiveMemoSection] = useState<string | null>(null);
  const [newMemoText, setNewMemoText] = useState("");
  const [isSendingMemo, setIsSendingMemo] = useState(false);
  const [readMemos, setReadMemos] = useState<number[]>([]);

  // === SAFE DATA PARSING ===
  const sectionComments = plan.sectionComments || [];
  const safeVocabulary = safeParseArray(plan.lesson_vocabulary);
  const safeMaterials = safeParseArray(plan.materials);
  const safeSections = safeParseArray(plan.sections);
  const safeMeta = safeParseObject(plan.meta);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Lesson Plan: ${plan.title} `, 14, 15);
    doc.setFontSize(10);
    doc.text(`Target: ${plan.target} `, 14, 22);

    const tableData = safeSections.map((s: any) => [
      `${s.time} m`, s.phase, s.activity, s.altRole, s.jteRole
    ]);

    autoTable(doc, {
      head: [['Time', 'Phase', 'Activity', 'ALT Role', 'JTE Role']],
      body: tableData,
      startY: 30,
    });
    doc.save(`${plan.title.replace(/\s+/g, '_')}.pdf`);
  };

  const handlePrint = () => { window.print(); };

  const handleSaveToCloud = async () => {
    if (!onUpdate) return null;
    setIsSaving(true);
    try {
      console.log("🔄 Saving plan to cloud...");
      const savedPlan = await saveLessonPlanToDb(plan);
      if (savedPlan && savedPlan.id) {
        console.log("✅ Plan saved successfully with ID:", savedPlan.id);
        onUpdate(savedPlan);
        return savedPlan;
      } else {
        alert("Failed to save to cloud.");
        return null;
      }
    } catch (e) {
      console.error("Save error", e);
      alert("Error saving plan.");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenShareModal = async () => {
    let targetPlan = plan;
    if (!plan.id) {
      const saved = await handleSaveToCloud();
      if (!saved) return;
      targetPlan = saved;
    }
    setShareModalPlan(targetPlan);
  };

  const performShare = async (jteId: number, _schoolName: string) => {
    if (!shareModalPlan?.id) return;
    await shareLessonPlan(shareModalPlan.id, String(jteId));
  };

  const handleToggleMemo = (sectionTitle: string) => {
    if (activeMemoSection === sectionTitle) {
      setActiveMemoSection(null);
    } else {
      setActiveMemoSection(sectionTitle);

      // If ALT is viewing unread memos, mark them as read
      if (userProfile?.role?.toUpperCase() === 'ALT') {
        const unreadForSection = sectionComments.filter(c => c.section === sectionTitle && !c.isReadByAlt && !readMemos.includes(c.id));
        unreadForSection.forEach(c => {
          markCommentAsRead(c.id);
          setReadMemos(prev => [...prev, c.id]);
        });
      }
    }
  };

  const handleAddMemo = async () => {
    if (!newMemoText.trim() || !activeMemoSection || !plan.id) return;
    setIsSendingMemo(true);
    try {
      const token = localStorage.getItem('bplabo_jwt_token');
      const res = await fetch(`/api/collaboration/lesson-plans/${plan.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ section: activeMemoSection, content: newMemoText })
      });
      if (res.ok) {
        const data = await res.json();
        if (onUpdate) {
          const updatedPlan = { ...plan, sectionComments: [...(plan.sectionComments || []), data.comment] };
          onUpdate(updatedPlan);
        }
        setNewMemoText("");
      }
    } catch (e) { console.error(e); }
    finally { setIsSendingMemo(false); }
  };

  const totalTime = safeSections.reduce((acc: number, curr: any) => acc + (parseInt(curr.time) || 0), 0);

  const renderMemoButton = (sectionName: string) => {
    const role = userProfile?.role?.toUpperCase();
    const isJTE = role === 'JTE';
    const isALT = role === 'ALT';

    const sectionMemos = sectionComments.filter(c => c.section === sectionName);
    const hasUnread = sectionMemos.some(c => !c.isReadByAlt && !readMemos.includes(c.id));
    const isActive = activeMemoSection === sectionName;

    // Logic: 
    // - ALTs ONLY see the button if memos EXIST.
    // - JTEs (and others like admin) see the button if plan is saved (to add memos).
    // - If role is missing, we default to ALT behavior for safety (hide Add Memo).

    const shouldShow = sectionMemos.length > 0 || isJTE;
    const canAdd = isJTE;

    if (!shouldShow) return null;

    // If it's an ALT and there are no memos, it would have returned null above.
    // If it's an ALT and there ARE memos, they see "Memos (X)".
    // If it's a JTE and there are no memos, they see "Add Memo".

    return (
      <div className="relative inline-block">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleMemo(sectionName);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-tight transition-all shadow-md active:scale-95 ${hasUnread && isALT
            ? "bg-amber-400 text-white animate-memo-glow"
            : isActive
              ? "bg-slate-800 text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
        >
          <MessageSquare className="w-4 h-4" />
          {sectionMemos.length > 0 ? `Memos (${sectionMemos.length})` : "Add Memo"}
        </button>

        {isActive && (
          <div className="absolute top-full left-0 mt-3 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-200 z-[100] w-[calc(90vw)] max-w-3xl sm:w-[500px] md:w-[700px]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Section Memos</h4>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setActiveMemoSection(null); }} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-4 mb-6 pr-1 custom-scrollbar">
              {sectionMemos.map((comment, idx) => (
                <div key={idx} className={`p-4 rounded-2xl text-sm shadow-sm border ${String(comment.userId) === userProfile?.id ? "bg-indigo-50 border-indigo-100 ml-8" : "bg-slate-50 border-slate-100 mr-8"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{comment.commenter?.username || 'Teacher'}</span>
                    <span className="text-[10px] text-slate-300">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">{comment.content}</p>
                </div>
              ))}
              {sectionMemos.length === 0 && (
                <p className="text-xs text-slate-400 italic py-4 text-center">No collaborative memos yet.</p>
              )}
            </div>

            {isJTE && (
              <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-inner">
                <textarea
                  value={newMemoText}
                  onChange={e => setNewMemoText(e.target.value)}
                  placeholder="Add a collaborative note..."
                  className="flex-grow text-sm p-3 outline-none bg-transparent resize-none h-20"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddMemo();
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={handleAddMemo}
                  disabled={isSendingMemo || !newMemoText.trim()}
                  className="px-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-all flex items-center justify-center"
                >
                  {isSendingMemo ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden print:shadow-none print:border-none">
      <div className="bg-slate-800 text-white p-6 print:bg-white print:text-black print:p-0 print:border-b-2 print:border-black">
        <div className="flex flex-col md:flex-row md:justify-between items-start gap-4">
          <div className="w-full md:w-auto">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2 py-1 bg-teal-500/20 text-teal-300 text-[10px] md:text-xs font-bold rounded border border-teal-500/30 uppercase">
                {plan.grade_level || safeMeta.grade || 'General'}
              </span>
              <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] md:text-xs font-bold rounded border border-indigo-500/30 uppercase">
                {safeMeta.duration || totalTime} mins
              </span>
              {(safeMeta.altRole || safeMeta.jteRole) && (
                <span className="px-2 py-1 bg-slate-500/20 text-slate-300 text-[10px] md:text-xs font-bold rounded border border-slate-500/30 uppercase">
                  ALT: {safeMeta.altRole || '?'} | JTE: {safeMeta.jteRole || '?'}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-4xl font-black mb-3 leading-tight tracking-tight">{plan.title}</h1>
            <p className="text-slate-400 text-sm md:text-base print:text-slate-600 font-medium">
              Target: <span className="text-white font-bold print:text-black">{plan.target || (plan as any).target_language || "None specified"}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto pt-4 md:pt-0 border-t border-slate-700 md:border-t-0 print:hidden">
            {!plan.id && userProfile?.role?.toUpperCase() === 'ALT' && (
              <button
                onClick={() => handleSaveToCloud()}
                disabled={isSaving}
                className="flex-1 md:flex-none p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Cloud className="w-5 h-5" />}
                <span className="text-xs font-black uppercase">Save</span>
              </button>
            )}
            <button onClick={onSaveFavorite} className={`flex-1 md:flex-none p-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${isSaved ? 'bg-yellow-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              <span className="text-xs font-black md:hidden uppercase">{isSaved ? 'Saved' : 'Fav'}</span>
            </button>
            <button onClick={handleDownloadPDF} className="flex-1 md:flex-none p-2.5 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
              <Download className="w-5 h-5" />
              <span className="text-xs font-black md:hidden uppercase">PDF</span>
            </button>
            <button onClick={handlePrint} className="flex-1 md:flex-none p-2.5 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
              <Printer className="w-5 h-5" />
              <span className="text-xs font-black md:hidden uppercase">Print</span>
            </button>
            {userProfile && userProfile.role?.toUpperCase() === 'ALT' && (
              <>
                <button onClick={() => onEdit?.(plan)} className="flex-1 md:flex-none p-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95" title="Edit Plan">
                  <Wand2 className="w-5 h-5" />
                  <span className="text-xs font-black uppercase">Edit</span>
                </button>
                <button onClick={handleOpenShareModal} className="flex-1 md:flex-none p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
                  <Share2 className="w-5 h-5" />
                  <span className="text-xs font-black uppercase">Share</span>
                </button>
                {plan.id && onDelete && (
                  <button
                    onClick={() => onDelete(plan.id!)}
                    className="flex-1 md:flex-none p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="text-xs font-black uppercase">Delete</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {!plan.id && userProfile?.role?.toUpperCase() === 'ALT' && (
        <div className="bg-amber-50 text-amber-800 px-6 py-2 text-xs font-bold flex items-center gap-2 border-b border-amber-100 print:hidden">
          <Cloud className="w-4 h-4" />
          This plan is not saved to the cloud. Save it to enable Sharing and Uchiawase Chat.
        </div>
      )}

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col">
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Vocabulary</div>
            <div className="text-sm font-bold text-slate-800 flex-grow">
              {safeVocabulary.length > 0 ? safeVocabulary.join(", ") : "None"}
            </div>
            {plan.id && (userProfile?.role?.toUpperCase() === 'JTE' || sectionComments.some(c => c.section === 'Vocabulary')) && (
              <div className="mt-2 pt-2 border-t border-slate-200">
                {renderMemoButton('Vocabulary')}
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col">
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Materials</div>
            <div className="text-sm font-bold text-slate-800 flex-grow">
              {safeMaterials.length > 0
                ? safeMaterials.map((m: any) => typeof m === 'string' ? m : m.name).join(", ")
                : "None"}
            </div>
            {plan.id && (userProfile?.role?.toUpperCase() === 'JTE' || sectionComments.some(c => c.section === 'Materials')) && (
              <div className="mt-2 pt-2 border-t border-slate-200">
                {renderMemoButton('Materials')}
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 grid-cols-1 sm:grid-cols-2 md:col-span-2">
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">SMART Goal</div>
            <div className="text-sm font-bold text-slate-800">{plan.smart_goal || "None specified"}</div>
          </div>
        </div>



        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Layers className="w-5 h-5 text-indigo-500" /> Lesson Flow</h3>
          <div className="space-y-6 md:space-y-4">
            {safeSections.map((section: any, idx: number) => (
              <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 md:p-6 rounded-2xl border border-slate-200 bg-white print:break-inside-avoid shadow-sm hover:shadow-md transition-shadow">
                {/* Mobile: Time and Phase as Tags Above */}
                <div className="flex md:hidden items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-slate-800 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
                    {section.time} min
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-wider">
                    {section.phase}
                  </span>
                </div>

                <div className="hidden md:flex flex-shrink-0 w-20 text-center flex-col items-center justify-center border-r border-slate-100 pr-4">
                  <div className="text-2xl font-black text-slate-800">{section.time}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">mins</div>
                  <span className="mt-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-500 whitespace-nowrap">{section.phase}</span>
                </div>

                <div className="flex-grow">
                  <div className="mb-3">
                    {renderActivitySteps(section.activity)}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">ALT Role</span>
                      <div className="text-indigo-900 font-medium">{renderBullets(section.altRole, 'indigo')}</div>
                    </div>
                    <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-100/50">
                      <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest block mb-2">JTE Role</span>
                      <div className="text-teal-900 font-medium">{renderBullets(section.teacher2Role || section.jteRole, 'teal')}</div>
                    </div>
                  </div>

                  {/* MEMO BUTTON */}
                  {plan.id && (userProfile?.role?.toUpperCase() === 'JTE' || sectionComments.some(c => c.section === section.activity)) && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      {renderMemoButton(section.activity)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-center print:hidden">
        <button onClick={onEnterClassroomMode} className="bg-slate-800 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Enter Classroom Mode
        </button>
      </div>



      {userProfile && shareModalPlan && (
        <ShareLessonPlanModal
          isOpen={!!shareModalPlan}
          onClose={() => setShareModalPlan(null)}
          lessonPlan={shareModalPlan}
          profile={userProfile}
          onShare={performShare}
        />
      )}
    </div>
  );
};
// --- END OF FILE: src/LessonCard.tsx ---