
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  UserCog, BookOpen, Layers, CheckCircle2, Bot, User, Mail, Phone,
  GraduationCap, Users, ChevronRight, Check, Printer, Shield, Wand2,
  X, CalendarDays, Save, Mic, MicOff, Library, Search, AlertTriangle, Clock,
  Sparkles, ChevronDown, Trash2
} from 'lucide-react';
import { ChatAssistant } from './ChatAssistant';
import { UserProfile, LessonPlan, ManualPlanState, ManualSectionState, MaterialEntry, ActivityIdea } from './types';
import { INITIAL_MANUAL_STATE, TEXTBOOKS, TEXTBOOK_UNITS, GRADES, COMMON_MATERIALS, COMMON_ALT_GAMES } from './constants';
import { getDefaultTextbook, findRelevantActivities } from './utils'; // <--- ADDED findRelevantActivities
import { generateSingleActivitySuggestion } from './api';

// Simple hook for speech recognition
const useSpeechRecognition = (onResult: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError("Speech recognition not supported in this browser.");
      return;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      // @ts-ignore - Webkit specific
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e: any) => {
        console.error(e);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  return { isListening, toggleListening, error };
};

const VoiceInput = ({ onSpeech }: { onSpeech: (text: string) => void }) => {
  const { isListening, toggleListening, error } = useSpeechRecognition((text) => onSpeech(text));

  if (error) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-1.5 rounded-full transition-all ${isListening ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}
      title="Voice Input"
    >
      {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
    </button>
  );
};

export interface ManualBuilderRef {
  triggerSave: () => void;
}

export const ManualBuilder = forwardRef<ManualBuilderRef, {
  initialProfile: UserProfile,
  onPreview: (plan: LessonPlan) => void,
  onSaveAndClose?: (plan: LessonPlan) => void,
  onDiscard?: () => void,
  onDelete?: (id: string | number) => void,
  editingPlan?: LessonPlan
}>(({
  initialProfile,
  onPreview,
  onSaveAndClose,
  onDiscard,
  onDelete,
  editingPlan
}, ref) => {
  const [step, setStep] = useState(1);
  const [isDirty, setIsDirty] = useState(false);

  // FIX: Handle browser navigation/refresh warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Handle connected teachers for Teacher 2 default
  const teacher2Data = initialProfile.connected_teachers.length > 0 ? initialProfile.connected_teachers[0] : null;
  const defaultTeacher2Name = teacher2Data
    ? (typeof teacher2Data === 'string' ? teacher2Data : teacher2Data.displayName)
    : "";

  const [form, setForm] = useState<ManualPlanState>({
    ...INITIAL_MANUAL_STATE,
    altName: initialProfile.display_name || "",
    altNationality: initialProfile.nationality || "",
    altExperience: initialProfile.experience || "Beginner",
    altEmail: initialProfile.email || "",
    altPhone: initialProfile.phone || "",
    teacher2Name: defaultTeacher2Name,
    teacher2Email: (teacher2Data && typeof teacher2Data !== 'string') ? teacher2Data.email || "" : "",
    school: initialProfile.school_name || ""
  });

  const resetForm = () => {
    setForm({
      ...INITIAL_MANUAL_STATE,
      altName: initialProfile.display_name || "",
      altNationality: initialProfile.nationality || "",
      altExperience: initialProfile.experience || "Beginner",
      altEmail: initialProfile.email || "",
      altPhone: initialProfile.phone || "",
      teacher2Name: defaultTeacher2Name,
      teacher2Email: (teacher2Data && typeof teacher2Data !== 'string') ? teacher2Data.email || "" : "",
      school: initialProfile.school_name || ""
    });
    setStep(1);
    setIsDirty(false);
    localStorage.removeItem('brainPowerManualDraft');
  };

  // Update form when profile loads connected teachers (if form teacher2Name is empty)
  useEffect(() => {
    if (initialProfile.connected_teachers.length > 0 && !form.teacher2Name) {
      const firstTeacher = initialProfile.connected_teachers[0];
      const name = typeof firstTeacher === 'string' ? firstTeacher : firstTeacher.displayName;
      updateForm('teacher2Name', name);
    }
  }, [initialProfile.connected_teachers]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Activity Picker State
  const [pickingPhase, setPickingPhase] = useState<'warmup' | 'present' | 'practice' | 'produce' | 'wrapup' | null>(null);
  const [activitySearch, setActivitySearch] = useState("");
  const [activePopout, setActivePopout] = useState<string | null>(null);

  // Load draft from localStorage or editingPlan on mount
  useEffect(() => {
    if (editingPlan) {
      const p = editingPlan;

      // SAFE JSON PARSING
      const parseSafe = (data: any) => {
        if (!data) return null;
        if (typeof data === 'object') return data;
        try { return JSON.parse(data); } catch (e) { return null; }
      };

      const sections = parseSafe(p.sections) || [];
      const meta = parseSafe(p.meta) || {};
      const roles = parseSafe(p.roles) || {};
      const differentiation = parseSafe(p.differentiation) || {};

      const getSection = (phase: string) => (Array.isArray(sections) ? sections.find(s => s.phase === phase) : null) || { time: 5, activity: "", altRole: "", teacher2Role: "" };

      // Map vocabulary back to string with better parsing
      const pAny = p as any;
      let vocabStr = "";
      if (Array.isArray(p.lesson_vocabulary)) {
        vocabStr = p.lesson_vocabulary.join('\n');
      } else if (typeof pAny.lesson_vocabulary === 'string') {
        const v = pAny.lesson_vocabulary;
        // Check if it's a stringified JSON array
        if (v.trim().startsWith('[')) {
          try {
            const parsedV = JSON.parse(v);
            if (Array.isArray(parsedV)) vocabStr = parsedV.join('\n');
            else vocabStr = v;
          } catch { vocabStr = v; }
        } else {
          vocabStr = v;
        }
      }

      // Map Materials
      // Ensure we parse p.materials if it is undefined or comes in as string
      let loadedMaterials: MaterialEntry[] = [];
      const rawMaterials = parseSafe(p.materials);
      if (Array.isArray(rawMaterials)) {
        loadedMaterials = rawMaterials.map((m: any, i: number) => ({
          id: i + 1,
          name: typeof m === 'string' ? m : m.name,
          status: (typeof m === 'object' && m.status) ? m.status : 'havet'
        }));
      }

      // Map SMART Goals more robustly
      // If regex match fails, try splitting by known delimiters or just dumping string into 'S'
      const rawSmart = p.smart_goal || "";
      let sS = "", sM = "", sA = "", sR = "", sT = "";

      const sMatch = rawSmart.match(/S: (.*?)(?: \| M:|$)/);
      const mMatch = rawSmart.match(/M: (.*?)(?: \| A:|$)/);
      const aMatch = rawSmart.match(/A: (.*?)(?: \| R:|$)/);
      const rMatch = rawSmart.match(/R: (.*?)(?: \| T:|$)/);
      const tMatch = rawSmart.match(/T: (.*?)(?:$)/);

      if (sMatch || mMatch) {
        sS = sMatch?.[1] || "";
        sM = mMatch?.[1] || "";
        sA = aMatch?.[1] || "";
        sR = rMatch?.[1] || "";
        sT = tMatch?.[1] || "";
      } else if (rawSmart && rawSmart !== "No SMART goal specified") {
        // If format is totally different, put it all in S or split by |
        const parts = rawSmart.split('|').map((s: string) => s.trim());
        if (parts.length >= 5) {
          // Assume order S | M | A | R | T
          sS = parts[0]; sM = parts[1]; sA = parts[2]; sR = parts[3]; sT = parts[4];
        } else {
          sS = rawSmart; // Fallback
        }
      }

      setForm({
        ...INITIAL_MANUAL_STATE,
        id: p.id,
        altName: meta.alt || initialProfile.display_name || "",
        teacher2Name: meta.teacher2 || defaultTeacher2Name,
        school: meta.school || initialProfile.school_name || "",
        date: meta.date?.split('T')[0] || new Date().toISOString().split('T')[0],
        grade: meta.grade || GRADES.Elementary[4],
        level: (meta.grade?.includes('Year') ? 'JuniorHigh' : 'Elementary') as any,
        textbook: p.title?.split(' - ')[0] || "",
        unit: p.title?.split(' - ')[1] || "",
        targetLanguage: p.target || "",
        lessonVocabulary: vocabStr,
        grammarPoints: p.grammar_points || "",
        smartS: sS,
        smartM: sM,
        smartA: sA,
        smartR: sR,
        smartT: sT,
        altRoleType: (meta.altRole as any) || "T2",
        teacher2RoleType: (meta.teacher2Role as any) || "T1",
        warmup: { ...INITIAL_MANUAL_STATE.warmup, ...getSection('Warm-up') as any, time: Number(getSection('Warm-up').time) || 5 },
        present: { ...INITIAL_MANUAL_STATE.present, ...getSection('Present') as any, time: Number(getSection('Present').time) || 10 },
        practice: { ...INITIAL_MANUAL_STATE.practice, ...getSection('Practice') as any, time: Number(getSection('Practice').time) || 15 },
        produce: { ...INITIAL_MANUAL_STATE.produce, ...getSection('Produce') as any, time: Number(getSection('Produce').time) || 10 },
        wrapup: { ...INITIAL_MANUAL_STATE.wrapup, ...getSection('Wrap-up') as any, time: Number(getSection('Wrap-up').time) || 5 },
        culturalNote: p.cultural_note || "",
        diffSupport: differentiation.support || "",
        diffChallenge: differentiation.challenge || "",
        materialsList: loadedMaterials.length > 0 ? loadedMaterials : INITIAL_MANUAL_STATE.materialsList,
      });
      return;
    }

    // DISABLE AUTO-LOAD DRAFT unless explicitly requested or if we add a feature for it.
    // User requested "Manual Builder should always start with a default clean blank lesson plan"
    // So we skip the localStorage loading here.
    /*
    const savedDraft = localStorage.getItem('brainPowerManualDraft');
    if (savedDraft) {
      // ...
    }
    */
  }, [editingPlan]);

  // Save draft to localStorage on change
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('brainPowerManualDraft', JSON.stringify(form));
      setLastSaved(new Date());
    }, 1000);
    return () => clearTimeout(timer);
  }, [form]);

  const updateForm = (field: keyof ManualPlanState, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleVoiceInput = (field: keyof ManualPlanState, text: string) => {
    const current = form[field] as string;
    const newValue = current ? `${current} ${text}` : text;
    updateForm(field, newValue);
  };

  const handleUnitChange = (unitName: string) => {
    updateForm('unit', unitName);
    if (TEXTBOOK_UNITS[form.textbook]) {
      // FIX: Added 'as any' to bypass the type check for now since we just added 'vocabulary' to the constant
      // In a real scenario, you'd update the Type definition for TEXTBOOK_UNITS
      const unitData = TEXTBOOK_UNITS[form.textbook].find(u => u.title === unitName) as any;

      if (unitData) {
        updateForm('targetLanguage', unitData.target);
        // NEW: Auto-populate vocabulary if available
        if (unitData.vocabulary && Array.isArray(unitData.vocabulary)) {
          updateForm('lessonVocabulary', unitData.vocabulary.join('\n'));
        }
      }
    }
  };

  const handleBatchUpdate = (data: Partial<ManualPlanState>) => {
    setForm(prev => {
      const next = { ...prev, ...data };
      if (data.warmup) next.warmup = { ...prev.warmup, ...data.warmup };
      if (data.present) next.present = { ...prev.present, ...data.present };
      if (data.practice) next.practice = { ...prev.practice, ...data.practice };
      if (data.produce) next.produce = { ...prev.produce, ...data.produce };
      if (data.wrapup) next.wrapup = { ...prev.wrapup, ...data.wrapup };
      return next;
    });
  };

  const updateSection = (section: 'warmup' | 'present' | 'practice' | 'produce' | 'wrapup', field: keyof ManualSectionState, value: any) => {
    setForm(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
    setIsDirty(true);
  };

  const handleSectionVoice = (section: 'warmup' | 'present' | 'practice' | 'produce' | 'wrapup', field: keyof ManualSectionState, text: string) => {
    const current = form[section][field] as string;
    const newValue = current ? `${current} ${text}` : text;
    updateSection(section, field, newValue);
  };

  const suggestActivity = async (section: 'warmup' | 'present' | 'practice' | 'produce' | 'wrapup') => {
    let targetToUse = form.targetLanguage;
    if (!targetToUse && TEXTBOOK_UNITS[form.textbook]) {
      const unitData = TEXTBOOK_UNITS[form.textbook].find(u => u.title === form.unit);
      if (unitData) targetToUse = unitData.target;
    }

    if (!targetToUse) {
      alert("Please select a Unit or enter a Target Language first.");
      return;
    }

    setLoadingSuggestion(section);
    const suggestion = await generateSingleActivitySuggestion(section, form.grade, targetToUse);
    if (suggestion) {
      updateSection(section, 'activity', suggestion);
    }
    setLoadingSuggestion(null);
  };

  const selectActivityFromLibrary = (activity: ActivityIdea) => {
    if (!pickingPhase) return;

    // Auto-fill fields based on selected activity
    updateSection(pickingPhase, 'title', activity.name);
    updateSection(pickingPhase, 'activity', activity.instructions);

    // Add materials if not present
    if (activity.materials && activity.materials !== "None") {
      const mats = activity.materials.split(',').map(s => s.trim());
      const currentMatNames = form.materialsList.map(m => m.name.toLowerCase());
      const newMats = [...form.materialsList];

      mats.forEach(m => {
        if (!currentMatNames.includes(m.toLowerCase())) {
          newMats.push({ name: m, status: 'Prepare' });
        }
      });
      updateForm('materialsList', newMats);
    }

    setPickingPhase(null);
  };

  const addMaterial = () => {
    setForm(prev => ({
      ...prev,
      materialsList: [...prev.materialsList, { name: "", status: "Available" }]
    }));
  };

  const addCommonMaterial = (name: string) => {
    if (form.materialsList.some(m => m.name === name)) return;
    setForm(prev => ({
      ...prev,
      materialsList: [...prev.materialsList, { name: name, status: "Available" }]
    }));
  };

  const updateMaterial = (idx: number, field: keyof MaterialEntry, value: any) => {
    const newMats = [...form.materialsList];
    newMats[idx] = { ...newMats[idx], [field]: value };
    setForm(prev => ({ ...prev, materialsList: newMats }));
    setIsDirty(true);
  };

  const removeMaterial = (idx: number) => {
    setForm(prev => ({ ...prev, materialsList: prev.materialsList.filter((_, i) => i !== idx) }));
  };

  const handleGeneratePreview = () => {
    const sections = [
      { ...form.warmup, phase: "Warm-up / Review" },
      { ...form.present, phase: "Present" },
      { ...form.practice, phase: "Practice" },
      { ...form.produce, phase: "Produce" },
      { ...form.wrapup, phase: "Wrap-up" }
    ].map(s => {
      let richActivity = `**${s.title}**\n\n${s.activity}`;
      return {
        time: String(s.time),
        phase: s.phase,
        activity: s.title ? richActivity : s.activity,
        altRole: s.altRole,
        teacher2Role: s.teacher2Role,
        instructions: s.instructions,
        assessment: s.assessment
      };
    });

    const smartGoalCombined = [
      form.smartS && `S: ${form.smartS}`,
      form.smartM && `M: ${form.smartM}`,
      form.smartA && `A: ${form.smartA}`,
      form.smartR && `R: ${form.smartR}`,
      form.smartT && `T: ${form.smartT}`
    ].filter(Boolean).join(' | ');

    const richMaterials = form.materialsList.map(m => ({
      name: m.name,
      status: m.status
    }));

    // Calculate total duration for metadata
    const totalDuration = form.warmup.time + form.present.time + form.practice.time + form.produce.time + form.wrapup.time;

    const plan: LessonPlan = {
      id: form.id,
      meta: {
        alt: form.altName,
        teacher2: form.teacher2Name,
        altRole: form.altRoleType,
        teacher2Role: form.teacher2RoleType,
        school: form.school,
        date: form.date,
        grade: form.grade,
        duration: totalDuration
      },
      title: `${form.textbook} - ${form.unit}`,
      target: form.targetLanguage,
      lesson_vocabulary: form.lessonVocabulary.split('\n').filter(Boolean),
      grammar_points: form.grammarPoints,
      smart_goal: smartGoalCombined || "No SMART goal specified",
      uchiawase_points: ["Check material prep", "Review assessment criteria"],
      uchiawase_schedule: {
        scheduled: form.uchiawaseScheduled,
        date: form.uchiawaseDate,
        time: form.uchiawaseTime,
        notes: form.uchiawaseNotes
      },
      assessment_criteria: form.assessmentPoints.split('\n').filter(s => s.trim()),
      materials: richMaterials.length > 0 ? richMaterials : ["Textbook", "Blackboard"],
      cultural_note: form.culturalNote,
      differentiation: {
        support: form.diffSupport,
        challenge: form.diffChallenge
      },
      sections: sections, // These now support jteComment implicitly via type definition
      games: [],
      chats: [] // <--- ADDED: Initialize empty chat array
    };
    onPreview(plan);
  };

  const handleSaveAndClose = () => {
    const sections = [
      { ...form.warmup, phase: "Warm-up / Review" },
      { ...form.present, phase: "Present" },
      { ...form.practice, phase: "Practice" },
      { ...form.produce, phase: "Produce" },
      { ...form.wrapup, phase: "Wrap-up" }
    ].map(s => {
      let richActivity = `**${s.title}**\n\n${s.activity}`;
      return {
        time: String(s.time),
        phase: s.phase,
        activity: s.title ? richActivity : s.activity,
        altRole: s.altRole,
        teacher2Role: s.teacher2Role,
        instructions: s.instructions,
        assessment: s.assessment
      };
    });

    const smartGoalCombined = [
      form.smartS && `S: ${form.smartS}`,
      form.smartM && `M: ${form.smartM}`,
      form.smartA && `A: ${form.smartA}`,
      form.smartR && `R: ${form.smartR}`,
      form.smartT && `T: ${form.smartT}`
    ].filter(Boolean).join(' | ');

    // Calculate total duration for metadata
    const totalDuration = form.warmup.time + form.present.time + form.practice.time + form.produce.time + form.wrapup.time;

    const richMaterials = form.materialsList.map(m => ({
      name: m.name,
      status: m.status
    }));

    const plan: LessonPlan = {
      id: form.id,
      meta: {
        alt: form.altName,
        teacher2: form.teacher2Name,
        altRole: form.altRoleType,
        teacher2Role: form.teacher2RoleType,
        school: form.school,
        date: form.date,
        grade: form.grade,
        duration: totalDuration
      },
      title: `${form.textbook} - ${form.unit}`,
      target: form.targetLanguage,
      lesson_vocabulary: form.lessonVocabulary.split('\n').filter(Boolean),
      grammar_points: form.grammarPoints,
      smart_goal: smartGoalCombined || "No SMART goal specified",
      uchiawase_points: ["Check material prep", "Review assessment criteria"],
      uchiawase_schedule: {
        scheduled: form.uchiawaseScheduled,
        date: form.uchiawaseDate,
        time: form.uchiawaseTime,
        notes: form.uchiawaseNotes
      },
      sections: sections,
      assessment_criteria: [],
      materials: richMaterials,
      cultural_note: form.culturalNote,
      differentiation: {
        support: form.diffSupport,
        challenge: form.diffChallenge
      },
      games: [],
      chats: []
    };
    onSaveAndClose?.(plan);
    resetForm();
  };

  useImperativeHandle(ref, () => ({
    triggerSave: handleSaveAndClose
  }));

  const tabs = [
    { id: 1, label: "Context", icon: UserCog },
    { id: 2, label: "Prep", icon: BookOpen },
    { id: 3, label: "Flow", icon: Layers },
    { id: 4, label: "Review", icon: CheckCircle2 },
  ];

  // Calculate total time
  const totalTime = form.warmup.time + form.present.time + form.practice.time + form.produce.time + form.wrapup.time;
  const targetDuration = form.level === "Elementary" ? 45 : 50;
  let timeColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
  let timeMessage = "Perfect timing!";

  if (totalTime < targetDuration) {
    timeColor = "text-amber-600 bg-amber-50 border-amber-200";
    timeMessage = `${targetDuration - totalTime} min under`;
  } else if (totalTime > targetDuration) {
    timeColor = "text-rose-600 bg-rose-50 border-rose-200";
    timeMessage = `${totalTime - targetDuration} min over`;
  }

  // Filter activities for the picker modal
  const filteredActivities = COMMON_ALT_GAMES.filter(a => {
    const searchMatch = a.name.toLowerCase().includes(activitySearch.toLowerCase()) ||
      a.type.toLowerCase().includes(activitySearch.toLowerCase()) ||
      a.tags?.some(t => t.toLowerCase().includes(activitySearch.toLowerCase()));

    if (!activitySearch && pickingPhase) {
      if (pickingPhase === 'warmup') return a.type === 'Warm-up';
      if (pickingPhase === 'wrapup') return a.type === 'Cool-down' || a.type === 'Review Activity';
      return a.type === 'Main Game' || a.type === 'Production';
    }
    return searchMatch;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 relative">
      <ChatAssistant
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onUpdateForm={handleBatchUpdate}
        currentForm={form}
      />



      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto scrollbar-hide py-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setStep(t.id)}
              className={`flex flex-col items-center gap-1 ${step === t.id ? "text-teal-600 font-bold" : "text-slate-400"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${step === t.id
                ? "bg-teal-600 border-teal-600 text-white"
                : step > t.id
                  ? "bg-teal-100 border-teal-600 text-teal-600"
                  : "bg-white border-slate-300"
                }`}>
                {step > t.id ? <Check className="w-4 h-4" /> : <t.icon className="w-4 h-4" />}
              </div>
              <span className="text-[10px] uppercase hidden sm:block">{t.label}</span>
            </button>
          ))}
        </div>
        {/* --- START OF SECTION: src/ManualBuilder.tsx --- */}
        <div className="flex items-center gap-2 sm:gap-3">
          {lastSaved && (
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5 whitespace-nowrap">
              <Save className="w-2.5 h-2.5" /> {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 sm:px-4 sm:py-2 rounded-full shadow-md hover:shadow-lg transition-all text-sm font-bold animate-pulse-slow active:scale-95"
            title="AI Assistant"
          >
            <Bot className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Custom AI Guidance</span>
          </button>
        </div>
      </div>
      {/* --- END OF SECTION: src/ManualBuilder.tsx --- */}

      <div className="p-6">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Teacher & School Context</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-teal-700 uppercase bg-teal-50 p-2 rounded flex items-center gap-2"><User className="w-4 h-4" /> ALT Profile</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                    <input type="text" value={form.altName} onChange={e => updateForm('altName', e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                    <select value={form.altRoleType} onChange={e => updateForm('altRoleType', e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500">
                      <option value="T1">T1 (Lead)</option>
                      <option value="T2">T2 (Assistant)</option>
                      <option value="Co-teacher">Co-teacher</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Info (Optional)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="relative">
                      <Mail className="w-3 h-3 absolute left-2 top-2.5 text-slate-400" />
                      <input type="email" placeholder="Email" value={form.altEmail} onChange={e => updateForm('altEmail', e.target.value)} className="w-full pl-7 p-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 text-sm" />
                    </div>
                    <div className="relative">
                      <Phone className="w-3 h-3 absolute left-2 top-2.5 text-slate-400" />
                      <input type="tel" placeholder="Phone" value={form.altPhone} onChange={e => updateForm('altPhone', e.target.value)} className="w-full pl-7 p-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-indigo-700 uppercase bg-indigo-50 p-2 rounded flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Teacher 2 Profile</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                    {/* Switch to dropdown if JTEs are available */}
                    {initialProfile.connected_teachers.length > 0 ? (
                      <select
                        value={form.teacher2Name}
                        onChange={e => {
                          const selectedName = e.target.value;
                          const selectedTeacher = initialProfile.connected_teachers.find(j => (typeof j === 'string' ? j : j.displayName) === selectedName);
                          updateForm('teacher2Name', selectedName);
                          if (selectedTeacher && typeof selectedTeacher !== 'string' && selectedTeacher.email) {
                            updateForm('teacher2Email', selectedTeacher.email);
                          }
                        }}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
                      >
                        {form.teacher2Name && !initialProfile.connected_teachers.some(j => (typeof j === 'string' ? j : j.displayName) === form.teacher2Name) && (
                          <option value={form.teacher2Name}>{form.teacher2Name}</option>
                        )}
                        {initialProfile.connected_teachers.map((j, idx) => {
                          const name = typeof j === 'string' ? j : j.displayName;
                          return <option key={idx} value={name}>{name}</option>;
                        })}
                      </select>
                    ) : (
                      <input type="text" value={form.teacher2Name} onChange={e => updateForm('teacher2Name', e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500" />
                    )}
                    <div className="text-[10px] text-slate-400 mt-1 flex items-start gap-1">
                      <Shield className="w-3 h-3 text-slate-300 mt-0.5" />
                      <span>Selecting a teacher here only adds their name to the plan. It does <strong>not</strong> share the plan with them yet.</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                    <select value={form.teacher2RoleType} onChange={e => updateForm('teacher2RoleType', e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500">
                      <option value="T1">T1 (Lead)</option>
                      <option value="T2">T2 (Assistant)</option>
                      <option value="Co-teacher">Co-teacher</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">English Level (1-5)</label>
                    <input type="number" min="1" max="5" value={form.teacher2Proficiency} onChange={e => updateForm('teacher2Proficiency', Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Comm. Style</label>
                    <select value={form.communicationMethod} onChange={e => updateForm('communicationMethod', e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500">
                      <option>In-person</option>
                      <option>Email</option>
                      <option>Notebook</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">School</label>
                <input type="text" value={form.school} onChange={e => updateForm('school', e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e => updateForm('date', e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Time</label>
                  <input type="time" value={form.startTime} onChange={e => updateForm('startTime', e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500" />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Next <ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Lesson Preparation</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Textbook (Optional)</label>
                <select
                  value={form.textbook}
                  onChange={e => {
                    updateForm('textbook', e.target.value);
                    updateForm('unit', '');
                    updateForm('targetLanguage', '');
                    updateForm('lessonVocabulary', '');
                  }}
                  className="w-full p-2 border border-slate-300 rounded"
                >
                  <option value="">Manual / Other</option>
                  {TEXTBOOKS[form.level].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unit Name</label>
                <div className="relative">
                  {form.textbook ? (
                    <select
                      value={form.unit}
                      onChange={(e) => handleUnitChange(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded appearance-none"
                    >
                      <option value="">Select Unit...</option>
                      {TEXTBOOK_UNITS[form.textbook]?.map((u: any) => (
                        <option key={u.title} value={u.title}>{u.title}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={form.unit}
                      onChange={e => updateForm('unit', e.target.value)}
                      placeholder="e.g. My Dream"
                      className="w-full p-2 border border-slate-300 rounded"
                    />
                  )}
                  {form.textbook && <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />}
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-2">
                  Target Language Phrases <VoiceInput onSpeech={(t) => handleVoiceInput('targetLanguage', t)} />
                </label>
                <textarea
                  value={form.targetLanguage}
                  onChange={(e) => updateForm('targetLanguage', e.target.value)}
                  placeholder="e.g. I want to buy a ticket. / How much is it?"
                  className="w-full p-2 border border-slate-300 rounded text-sm min-h-[60px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-2">
                  Lesson Vocabulary <VoiceInput onSpeech={(t) => handleVoiceInput('lessonVocabulary', t)} />
                </label>
                <textarea
                  value={form.lessonVocabulary}
                  onChange={(e) => updateForm('lessonVocabulary', e.target.value)}
                  placeholder="e.g. ticket, train, bus, station, platform (comma separated)"
                  className="w-full p-2 border border-slate-300 rounded text-sm min-h-[60px]"
                />
              </div>
            </div>

            {/* Common Fields for Both Modes */}
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-2">Grammar Points <VoiceInput onSpeech={(t) => handleVoiceInput('grammarPoints', t)} /></label>
              <textarea rows={2} value={form.grammarPoints} onChange={e => updateForm('grammarPoints', e.target.value)} placeholder="e.g. Do you like...?" className="w-full p-2 border border-slate-300 rounded text-sm" />
            </div>

            <div className="bg-indigo-50 p-4 rounded border border-indigo-100">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-indigo-800">SMART Goal</h4>
                <div className="text-[10px] text-indigo-400 font-bold bg-indigo-100/50 px-2 py-0.5 rounded flex items-center gap-1 group relative cursor-help">
                  <AlertTriangle className="w-3 h-3" /> Hints
                  <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 text-white p-3 rounded-lg text-[10px] font-medium leading-relaxed shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 space-y-2 border border-slate-700">
                    <p><strong className="text-indigo-300">S:</strong> Specific goal (e.g. Can ask about hobbies)</p>
                    <p><strong className="text-indigo-300">M:</strong> Measurable task (e.g. 3 interviews)</p>
                    <p><strong className="text-indigo-300">A:</strong> Achievable (Realistically suited to level)</p>
                    <p><strong className="text-indigo-300">R:</strong> Relevant (Matches textbook unit)</p>
                    <p><strong className="text-indigo-300">T:</strong> Time-bound (Finish by end of class)</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {['S', 'M', 'A', 'R', 'T'].map(l => (
                  <div key={l} className="flex flex-col">
                    <span className="text-[10px] font-bold text-indigo-500 text-center mb-1">{l}</span>
                    <input
                      type="text"
                      value={(form as any)[`smart${l}`]}
                      onChange={e => updateForm(`smart${l}` as any, e.target.value)}
                      className="p-1 text-xs border border-indigo-200 rounded text-center focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-500 uppercase">Materials List</label>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Quick Add Common Items</span>
                <div className="flex flex-wrap gap-2">
                  {COMMON_MATERIALS.map(m => (
                    <button
                      key={m}
                      onClick={() => addCommonMaterial(m)}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${form.materialsList.some(item => item.name === m)
                        ? "bg-teal-100 border-teal-300 text-teal-800 cursor-default"
                        : "bg-white border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600"
                        }`}
                    >
                      {form.materialsList.some(item => item.name === m) && <Check className="w-3 h-3 inline mr-1" />}
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              {form.materialsList.length === 0 && <p className="text-sm text-slate-400 italic">No materials added.</p>}
              <div className="space-y-2">
                {form.materialsList.map((m, i) => (
                  <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-left-2">
                    <input type="text" value={m.name} onChange={e => updateMaterial(i, 'name', e.target.value)} placeholder="Item name" className="flex-grow p-1.5 text-sm border border-slate-300 rounded" />
                    <select value={m.status} onChange={e => updateMaterial(i, 'status', e.target.value)} className="w-28 p-1.5 text-xs border border-slate-300 rounded">
                      <option value="Available">Available</option>
                      <option value="Prepare">Prepare</option>
                      <option value="Borrow">Borrow</option>
                    </select>
                    <button onClick={() => removeMaterial(i)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={addMaterial} className="text-xs text-teal-600 hover:text-teal-800 font-bold flex items-center gap-1 mt-2">+ Add Custom Item</button>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="px-6 py-2 text-slate-500">Back</button>
              <button onClick={() => setStep(3)} className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Next <ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="text-lg font-bold text-slate-800">Detailed Lesson Flow</h3>
              {/* Time Validator Widget */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${timeColor}`}>
                {totalTime !== targetDuration ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                <span>{totalTime} / {targetDuration} min</span>
                <span className="hidden sm:inline opacity-75">({timeMessage})</span>
              </div>
            </div>

            {(['warmup', 'present', 'practice', 'produce', 'wrapup'] as const).map((phase, idx) => (
              <div key={phase} className="bg-slate-50 p-4 rounded border border-slate-200 relative group">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-teal-700 uppercase flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs">{idx + 1}</span>
                    {phase.charAt(0).toUpperCase() + phase.slice(1)}
                  </h4>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Min:</label>
                    <input type="number" value={form[phase].time} onChange={e => updateSection(phase, 'time', Number(e.target.value))} className="w-12 text-center p-1 border rounded text-sm font-bold text-slate-700" />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Activity Title"
                  value={form[phase].title}
                  onChange={e => updateSection(phase, 'title', e.target.value)}
                  className="w-full p-2 mb-2 border border-slate-300 rounded font-bold text-sm"
                />
                <div className="relative">
                  <textarea
                    rows={2}
                    placeholder="Procedure..."
                    value={form[phase].activity}
                    onChange={e => updateSection(phase, 'activity', e.target.value)}
                    className="w-full p-2 mb-2 border border-slate-300 rounded text-sm pr-10"
                  />
                  <div className="absolute right-2 top-2">
                    <button
                      onClick={() => setActivePopout(activePopout === phase ? null : phase)}
                      className={`p-1.5 rounded-full transition-all border ${activePopout === phase ? 'bg-slate-800 text-white border-slate-800 rotate-180' : 'bg-white text-slate-400 border-slate-200 hover:text-teal-600 hover:border-teal-200'}`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {activePopout === phase && (
                      <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-10 flex flex-col gap-2 min-w-[40px] animate-in fade-in zoom-in-95">
                        <button
                          onClick={() => { setPickingPhase(phase); setActivePopout(null); }}
                          className="p-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-all flex items-center justify-center"
                          title="Pick from Library"
                        >
                          <Library className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { suggestActivity(phase); setActivePopout(null); }}
                          disabled={loadingSuggestion === phase}
                          className={`p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all ${loadingSuggestion === phase ? 'animate-pulse' : ''}`}
                          title="Suggest Activity with AI"
                        >
                          <Wand2 className="w-4 h-4" />
                        </button>
                        <div className="p-1 rounded-lg bg-slate-50 flex items-center justify-center">
                          <VoiceInput onSpeech={(t) => handleSectionVoice(phase, 'activity', t)} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <input type="text" placeholder="ALT Role" value={form[phase].altRole} onChange={e => updateSection(phase, 'altRole', e.target.value)} className="w-full p-2 border border-slate-300 rounded text-xs" />
                  <input type="text" placeholder="Teacher 2 Role" value={form[phase].teacher2Role} onChange={e => updateSection(phase, 'teacher2Role', e.target.value)} className="w-full p-2 border border-slate-300 rounded text-xs" />
                </div>
                <input type="text" placeholder="Assessment/Check" value={form[phase].assessment} onChange={e => updateSection(phase, 'assessment', e.target.value)} className="w-full p-2 border border-yellow-200 bg-yellow-50 rounded text-xs" />
              </div>
            ))}

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(2)} className="px-6 py-2 text-slate-500">Back</button>
              <button onClick={() => setStep(4)} className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Next <ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Final Review & QA</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-2">Cultural Note <VoiceInput onSpeech={(t) => handleVoiceInput('culturalNote', t)} /></label>
                <textarea rows={3} value={form.culturalNote} onChange={e => updateForm('culturalNote', e.target.value)} className="w-full p-2 border border-slate-300 rounded" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-2">Flexibility Plan <VoiceInput onSpeech={(t) => handleVoiceInput('flexibility', t)} /></label>
                <textarea rows={3} value={form.flexibility} onChange={e => updateForm('flexibility', e.target.value)} className="w-full p-2 border border-slate-300 rounded" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Diff. Support</label>
                <input type="text" value={form.diffSupport} onChange={e => updateForm('diffSupport', e.target.value)} className="w-full p-2 border border-slate-300 rounded" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Diff. Challenge</label>
                <input type="text" value={form.diffChallenge} onChange={e => updateForm('diffChallenge', e.target.value)} className="w-full p-2 border border-slate-300 rounded" />
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-100 rounded-lg p-4">
              <h4 className="font-bold text-teal-800 mb-3 flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Uchiawase (Meeting) Plan</h4>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="uchiawaseScheduled"
                  checked={form.uchiawaseScheduled}
                  onChange={e => updateForm('uchiawaseScheduled', e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <label htmlFor="uchiawaseScheduled" className="text-sm font-bold text-slate-700">Meeting Scheduled?</label>
              </div>
              {form.uchiawaseScheduled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                    <input type="date" value={form.uchiawaseDate} onChange={e => updateForm('uchiawaseDate', e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time</label>
                    <input type="time" value={form.uchiawaseTime} onChange={e => updateForm('uchiawaseTime', e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-2">Notes / Agenda <VoiceInput onSpeech={(t) => handleVoiceInput('uchiawaseNotes', t)} /></label>
                    <input type="text" placeholder="e.g. Discuss Main Activity roles" value={form.uchiawaseNotes} onChange={e => updateForm('uchiawaseNotes', e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm" />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-100 p-4 rounded-lg">
              <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> Quality Assurance</h4>
              <div className="flex gap-4 items-center">
                <select value={form.reviewStatus} onChange={e => updateForm('reviewStatus', e.target.value)} className="p-2 border rounded text-sm">
                  <option>Self-reviewed</option>
                  <option>Peer-reviewed</option>
                  <option>JTE-reviewed</option>
                </select>
                <input type="text" placeholder="Approved By" value={form.approvedBy} onChange={e => updateForm('approvedBy', e.target.value)} className="p-2 border rounded text-sm flex-grow" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4 border-t border-slate-100 pt-6">
              <button onClick={() => setStep(3)} className="order-2 sm:order-1 px-6 py-2 text-slate-500 font-bold hover:text-slate-700 transition-colors">Back</button>
              <div className="order-1 sm:order-2 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button onClick={() => window.print()} className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 shadow-sm transition-all text-sm">
                  <Printer className="w-5 h-5" /> Print PDF
                </button>
                <button onClick={handleGeneratePreview} className="flex items-center justify-center gap-2 px-8 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg transition-all text-sm">
                  <CheckCircle2 className="w-5 h-5" /> Preview Plan
                </button>
                {editingPlan && (
                  <button onClick={handleSaveAndClose} className="flex items-center justify-center gap-2 px-8 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 shadow-lg transition-all text-sm">
                    <Save className="w-5 h-5" /> Save Changes
                  </button>
                )}
                {editingPlan && onDelete && (
                  <button onClick={() => onDelete(editingPlan.id!)} className="flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-all text-sm" title="Delete Plan">
                    <Trash2 className="w-5 h-5" /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Activity Picker Modal */}
      {
        pickingPhase && (
          <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800">Select Activity</h3>
                  <p className="text-xs text-slate-500">For {pickingPhase} phase</p>
                </div>
                <button onClick={() => setPickingPhase(null)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="p-4 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search library..."
                    value={activitySearch}
                    onChange={e => setActivitySearch(e.target.value)}
                    className="w-full pl-9 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {filteredActivities.length > 0 ? filteredActivities.map((game, i) => (
                  <button
                    key={i}
                    onClick={() => selectActivityFromLibrary(game)}
                    className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-teal-200 hover:bg-teal-50 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-700 group-hover:text-teal-700">{game.name}</span>
                      <span className="text-[10px] uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded group-hover:bg-white">{game.type}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{game.instructions}</p>
                    <div className="mt-2 flex gap-1">
                      {game.tags?.map(t => (
                        <span key={t} className="text-[10px] text-slate-400">#{t}</span>
                      ))}
                    </div>
                  </button>
                )) : (
                  <div className="text-center py-8 text-slate-400">
                    <p>No activities found.</p>
                    <button onClick={() => setActivitySearch("")} className="text-teal-600 text-xs font-bold mt-2">Clear Filters</button>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 border-t border-slate-200 p-4 text-center text-xs text-slate-400">
                &copy; 2024 SPARKS. All rights reserved.
              </div>

            </div>
          </div>
        )
      }
    </div>
  );
});
