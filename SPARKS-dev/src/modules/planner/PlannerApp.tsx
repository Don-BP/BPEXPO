// --- START OF SECTION: src/main.tsx ---
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
    Sparkles,
    Lightbulb,
    LayoutGrid,
    Search,
    Heart,
    BrainCircuit,
    Filter,
    Wrench,
    ChevronDown,
    ChevronRight,
    BarChart2,
    Maximize2,
    Minimize2,
    Loader2
} from 'lucide-react';

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SettingsModal } from './SettingsModal';
import { Dashboard } from './Dashboard';
import { LessonCard } from './LessonCard';
import { UchiawaseView } from './UchiawaseView';
import { ChecklistView } from './ChecklistView';
import { ReflectionView } from './ReflectionView';
import { ActivityIdeaCard } from './ActivityIdeaCard';
import { ManualBuilder, ManualBuilderRef } from './ManualBuilder';
import { ActivityEmptyState } from './ActivityEmptyState';
import { CurriculumBrowser } from './CurriculumBrowser';
import { AnalyticsView } from './AnalyticsView';
import { AssessmentGenerator } from './AssessmentGenerator';
import { FlashcardViewer } from './FlashcardViewer';
import { ClassroomView } from './ClassroomView';
import { ConfirmationModal } from './ConfirmationModal';
import { CollaborationView } from './CollaborationView';

import { UserProfile, LessonPlan, ActivityIdea, SavedItem, LessonReflection } from './types';
import { GRADES, TEXTBOOKS, TEXTBOOK_UNITS, ACTIVITY_TYPES, ACTIVITY_SKILLS, COMMON_ALT_GAMES } from './constants';
import { getDefaultTextbook } from './utils';
import { generateLessonContent, generateActivityIdeas, saveLessonPlanToDb, deleteLessonPlan, getUserPlans, getLessonPlanById } from './api';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../hooks/useWallet';



const App = () => {
    // --- Auth & Wallet ---
    const { user } = useAuth();
    const { sparks } = useWallet();

    // --- UI State ---
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [navCollapsed, setNavCollapsed] = useState(false);

    // --- UI Persistence State ---
    const [preOverlayState, setPreOverlayState] = useState<{ nav: boolean } | null>(null);
    const [flashcardWords, setFlashcardWords] = useState<string[] | null>(null);
    const [classroomPlan, setClassroomPlan] = useState<LessonPlan | null>(null);

    // --- App Mode State ---
    const [appMode, setAppMode] = useState<"DASHBOARD" | "PLANNER" | "MANUAL" | "LIBRARY" | "TOOLS" | "COLLAB">("DASHBOARD");
    const [viewMode, setViewMode] = useState<"PLAN" | "UCHIAWASE" | "CHECKLIST" | "REFLECTION">("PLAN");
    const [libraryMode, setLibraryMode] = useState<"BROWSE" | "AI" | "SAVED" | "CURRICULUM">("BROWSE");
    const [toolsMode, setToolsMode] = useState<"ANALYTICS" | "RUBRIC">("ANALYTICS");
    const [settingsOpen, setSettingsOpen] = useState(false);

    // --- Navigation Guard State ---
    const [navConfirmOpen, setNavConfirmOpen] = useState(false);
    const [pendingNavView, setPendingNavView] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [deleteId, setDeleteId] = useState<string | number | null>(null);

    // --- User Data State ---
    const [profile, setProfile] = useState<UserProfile>({
        id: "",
        display_name: null,
        nationality: null,
        experience: null,
        email: null,
        phone: null,
        specializations: [],
        connected_teachers: [],
        school_name: null,
        sparks: 0,
        subscription_tier: 'FREE',
        active_unlocks: {},
        created_at: "",
        last_login: "",
        role: null,
        employee_id: null,
    });

    // --- AI Planner Form State ---
    const [level, setLevel] = useState<"Elementary" | "JuniorHigh">("Elementary");
    const [grade, setGrade] = useState(GRADES.Elementary[4]);
    const [textbook, setTextbook] = useState(TEXTBOOKS.Elementary[2]);
    const [unit, setUnit] = useState("");
    const [classSize, setClassSize] = useState(35);
    const [duration, setDuration] = useState(45);
    const [studentLevel, setStudentLevel] = useState(3);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(true);

    // --- Custom Mode State ---
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [customTarget, setCustomTarget] = useState("");
    const [customVocab, setCustomVocab] = useState("");

    // --- Activity Library State ---
    const [activitySearch, setActivitySearch] = useState("");
    const [activitySkill, setActivitySkill] = useState("All");
    const [activityType, setActivityType] = useState("All");
    const [activityGradeFilter, setActivityGradeFilter] = useState("All");
    const [activityResults, setActivityResults] = useState<ActivityIdea[] | null>(null);
    const [savedActivities, setSavedActivities] = useState<ActivityIdea[]>([]);
    const [dbResults, setDbResults] = useState<ActivityIdea[]>(COMMON_ALT_GAMES);
    const [isAuthSettled, setIsAuthSettled] = useState(false); // New state to prevent flash of wrong role
    const [aiGuidance, setAiGuidance] = useState({
        target: "",
        vocab: ""
    });
    const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(null);

    // --- Core Data State ---
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<LessonPlan | null>(null);
    const [history, setHistory] = useState<SavedItem[]>([]);
    const [favorites, setFavorites] = useState<SavedItem[]>([]);
    const [lastPath, setLastPath] = useState<string>("");

    // --- Refs ---
    const manualBuilderRef = useRef<ManualBuilderRef>(null);

    // --- Browser Back Navigation ---

    // --- Browser Back Navigation ---
    useEffect(() => {
        const handlePopState = () => {
            const state = window.history.state;
            if (state && state.mode) {
                setAppMode(state.mode);
            } else {
                setAppMode("DASHBOARD");
            }
        };

        window.addEventListener('popstate', handlePopState);
        // Initial state
        window.history.replaceState({ mode: appMode }, "", "");

        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Push state when appMode changes
    useEffect(() => {
        const state = window.history.state;
        if (!state || state.mode !== appMode) {
            window.history.pushState({ mode: appMode }, "", "");
        }
    }, [appMode]);

    // --- Initialization Effects ---
    useEffect(() => {
        // 1. Load History & Favorites
        const savedHistory = localStorage.getItem('brainPowerHistory');
        if (savedHistory) try { setHistory(JSON.parse(savedHistory)); } catch (e) { }

        const savedFavorites = localStorage.getItem('brainPowerFavorites');
        if (savedFavorites) try { setFavorites(JSON.parse(savedFavorites)); } catch (e) { }

        const savedActs = localStorage.getItem('brainPowerActivityFavorites');
        if (savedActs) {
            try { setSavedActivities(JSON.parse(savedActs)); } catch (e) { }
        } else {
            setSavedActivities(COMMON_ALT_GAMES.slice(0, 3));
        }

        // 2. Load Local Profile Settings
        let loadedProfile = { ...profile };
        const savedProfile = localStorage.getItem('brainPowerProfile');
        if (savedProfile) {
            try {
                const parsed = JSON.parse(savedProfile);
                delete parsed.jtes; // Remove any stale legacy JTE data
                delete parsed.connected_teachers; // Connected teachers come from API only
                loadedProfile = { ...loadedProfile, ...parsed };
            } catch (e) { console.error("Profile load error", e); }
        }

        // 3. Load REAL Auth User
        const authUserStr = localStorage.getItem('bplabo_current_user');
        if (authUserStr) {
            try {
                const authUser = JSON.parse(authUserStr);
                loadedProfile = {
                    ...loadedProfile,
                    display_name: loadedProfile.display_name || authUser.username || null,
                    email: authUser.email,
                    school_name: authUser.schoolName || loadedProfile.school_name || null,
                    employee_id: authUser.employeeId || null,
                    connected_teachers: []
                };
            } catch (e) { console.error("Auth user load error", e); }
        }

        setProfile(loadedProfile);
        setIsAuthSettled(true);
    }, []);

    // --- Data Persistence Loop (Synced with Auth) ---
    useEffect(() => {
        if (!isAuthSettled) return;

        // 1. Fetch Connected Teachers from collaboration API
        const token = localStorage.getItem('bplabo_jwt_token');
        if (token) {
            fetch('/api/collaboration/teachers', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data?.teachers) {
                        const savedOverrides = localStorage.getItem('alt_teacher_display_overrides');
                        let overrides: Record<string, any> = {};
                        try { overrides = savedOverrides ? JSON.parse(savedOverrides) : {}; } catch (e) { }

                        const updatedTeachers = data.teachers.map((t: any) => {
                            const ovr = overrides[String(t.id)];
                            return {
                                id: t.id,
                                username: t.username || "Teacher",
                                displayName: ovr?.displayName || t.username || "Teacher",
                                schoolName: ovr?.schoolName || t.schoolName || "Unassigned School",
                                schools: ovr?.schools || (t.schoolName ? [t.schoolName] : ["Unassigned School"]),
                                role: ovr?.role || "Teacher",
                                email: ovr?.email || "",
                                employeeId: t.employeeId,
                                avatarUrl: ovr?.avatarUrl || t.avatarUrl || undefined,
                            };
                        });
                        setProfile(prev => ({ ...prev, connected_teachers: updatedTeachers }));
                    }
                })
                .catch(e => console.error("Connected teachers fetch failed", e));
        }

        // 2. Fetch User Plans (Dashboard Persistence)
        getUserPlans().then(plans => {
            if (plans && plans.length > 0) {
                // Map plans to SavedItem format for history
                const savedItems: SavedItem[] = plans.map(p => ({
                    id: String(p.id),
                    label: p.title,
                    timestamp: p.updatedAt || new Date().toISOString(),
                    data: p
                }));
                setHistory(savedItems);
                localStorage.setItem('brainPowerHistory', JSON.stringify(savedItems));
                console.log("✅ Fetched User Plans:", plans.length);
            }
        }).catch(e => console.error("Plan Fetch Failed", e));

    }, [isAuthSettled]); // Only re-run if auth state changes

    // Save profile on change
    useEffect(() => {
        localStorage.setItem('brainPowerProfile', JSON.stringify(profile));
    }, [profile]);

    // Save History/Favorites on change
    useEffect(() => {
        localStorage.setItem('brainPowerHistory', JSON.stringify(history));
        localStorage.setItem('brainPowerFavorites', JSON.stringify(favorites));
    }, [history, favorites]);

    // --- Activity Filtering ---
    useEffect(() => {
        let filtered = COMMON_ALT_GAMES;
        if (activitySearch.trim()) {
            const q = activitySearch.toLowerCase();
            filtered = filtered.filter(a =>
                a.name.toLowerCase().includes(q) ||
                (a.tags && a.tags.some(t => t.toLowerCase().includes(q))) ||
                a.instructions.toLowerCase().includes(q)
            );
        }
        if (activitySkill !== "All") {
            filtered = filtered.filter(a => a.skill.includes(activitySkill));
        }
        if (activityType !== "All") {
            filtered = filtered.filter(a => a.type === activityType);
        }
        if (activityGradeFilter !== "All") {
            filtered = filtered.filter(a => a.recommended_grades?.includes(activityGradeFilter));
        }
        setDbResults(filtered);
    }, [activitySkill, activityType, activitySearch, activityGradeFilter]);

    // --- Handlers ---
    const openOverlay = () => {
        setPreOverlayState({ nav: navCollapsed });
        setNavCollapsed(true);
    };

    const closeOverlay = () => {
        setFlashcardWords(null);
        setClassroomPlan(null);
        if (preOverlayState) {
            setNavCollapsed(preOverlayState.nav);
            setPreOverlayState(null);
        }
    };

    const handleOpenFlashcards = (words: string[]) => {
        openOverlay();
        setFlashcardWords(words);
    };

    const handleOpenClassroom = (plan: LessonPlan) => {
        openOverlay();
        setClassroomPlan(plan);
    };

    const saveCurrentResult = () => {
        if (!result) return;
        const existingHistoryIndex = history.findIndex(item =>
            item.data.meta.date === result.meta.date && item.data.title === result.title
        );

        let updatedHistory;
        if (existingHistoryIndex >= 0) {
            updatedHistory = [...history];
            updatedHistory[existingHistoryIndex] = {
                ...updatedHistory[existingHistoryIndex],
                timestamp: new Date().toISOString(),
                data: result
            };
        } else {
            const newItem: SavedItem = {
                id: Date.now().toString(),
                label: result.title,
                timestamp: new Date().toISOString(),
                data: result
            };
            updatedHistory = [newItem, ...history].slice(0, 20);
        }
        setHistory(updatedHistory);
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: In standard mode must have unit. In custom mode must have target.
        if (isCustomMode) {
            if (!customTarget.trim()) return;
        } else {
            if (!unit.trim()) return;
        }

        // --- PAYMENT CHECK ---
        if (!user) {
            alert("Please log in to generate lesson plans.");
            return;
        }

        const COST = 5;
        if (sparks < COST) {
            alert(`Insufficient Sparks! You need ${COST} Sparks but have ${sparks}.\n\n(This is a demo, check the Wallet Debug box to add more!)`);
            return;
        }

        // ---------------------

        setLoading(true);
        setResult(null);
        if (window.innerWidth < 1024) setMobileMenuOpen(false);

        const data = await generateLessonContent(
            level,
            grade,
            textbook,
            isCustomMode ? (unit || "Custom Lesson") : unit,
            classSize,
            duration,
            studentLevel,
            profile,
            isCustomMode ? customTarget : undefined,
            isCustomMode ? customVocab : undefined
        );

        if (data) {
            setResult(data);
            setIsDirty(false);
            setIsFormVisible(false);
            const newHistoryItem: SavedItem = {
                id: Date.now().toString(),
                label: isCustomMode ? `Custom: ${customTarget.slice(0, 20)}...` : `${textbook} - ${unit}`,
                timestamp: new Date().toISOString(),
                data: data
            };
            setHistory(prev => [newHistoryItem, ...prev].slice(0, 20));
        }
        setLoading(false);
    };

    const handleManualPreview = (plan: LessonPlan) => {
        setResult(plan);
        setEditingPlan(null); // Clear editing state after preview
        setIsDirty(false);
        setAppMode("PLANNER");
        setIsFormVisible(false);
        const newHistoryItem: SavedItem = {
            id: plan.id || Date.now().toString(),
            label: plan.title,
            timestamp: new Date().toISOString(),
            data: plan
        };
        setHistory(prev => [newHistoryItem, ...prev.filter(h => h.data.id !== plan.id)].slice(0, 20));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpdateReflection = (reflection: LessonReflection) => {
        if (!result) return;
        const updatedPlan = { ...result, reflection };
        setResult(updatedPlan);
        setIsDirty(true);

        // ✅ Update History & Favorites to maintain persistence
        const updateStorage = (prev: SavedItem[]) => prev.map(item =>
            (item.data.id === updatedPlan.id || (item.data.title === updatedPlan.title && item.data.meta.date === updatedPlan.meta.date))
                ? { ...item, data: updatedPlan }
                : item
        );
        setHistory(updateStorage);
        setFavorites(updateStorage);

        // ✅ AUTO-SAVE TO CLOUD if already persisted
        if (updatedPlan.id) {
            import('./api').then(({ saveLessonPlanToDb }) => {
                saveLessonPlanToDb(updatedPlan).then(saved => {
                    if (saved) {
                        setIsDirty(false);
                        console.log("✅ Reflection auto-saved to cloud");
                    }
                });
            });
        }
    };

    const handleUpdateChecklist = (checkedItems: string[]) => {
        if (!result) return;
        const updatedPlan = { ...result, checklist: checkedItems };
        setResult(updatedPlan);
        setIsDirty(true);

        // ✅ Update History & Favorites to maintain persistence
        const updateStorage = (prev: SavedItem[]) => prev.map(item =>
            (item.data.id === updatedPlan.id || (item.data.title === updatedPlan.title && item.data.meta.date === updatedPlan.meta.date))
                ? { ...item, data: updatedPlan }
                : item
        );
        setHistory(updateStorage);
        setFavorites(updateStorage);

        // ✅ AUTO-SAVE TO CLOUD if already persisted
        if (updatedPlan.id) {
            import('./api').then(({ saveLessonPlanToDb }) => {
                saveLessonPlanToDb(updatedPlan).then(saved => {
                    if (saved) {
                        setIsDirty(false);
                        console.log("✅ Checklist auto-saved to cloud");
                    }
                });
            });
        }
    };

    const handleAiActivitySearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setActivityResults(null);
        if (window.innerWidth < 1024) setMobileMenuOpen(false);
        const ideas = await generateActivityIdeas(
            level,
            grade,
            activitySkill === "All" ? "Speaking" : activitySkill,
            activityType === "All" ? "Main Game" : activityType,
            classSize,
            aiGuidance.target,
            aiGuidance.vocab
        );
        if (ideas) {
            setActivityResults(ideas);
            // ✅ AUTO-SAVE AI Generation Results
            const newSaved = [...ideas, ...savedActivities].slice(0, 50);
            setSavedActivities(newSaved);
            localStorage.setItem('brainPowerActivityFavorites', JSON.stringify(newSaved));
        }
        setLoading(false);
    };

    const toggleFavorite = () => {
        if (!result) return;
        const existingIndex = favorites.findIndex(f => f.data.title === result.title && f.data.meta.date === result.meta.date);
        let newFavs;
        if (existingIndex >= 0) {
            newFavs = favorites.filter((_, i) => i !== existingIndex);
        } else {
            const newItem: SavedItem = {
                id: Date.now().toString(),
                label: result.title,
                timestamp: new Date().toISOString(),
                data: result
            };
            newFavs = [newItem, ...favorites];
        }
        setFavorites(newFavs);
    };

    const toggleActivityFavorite = (activity: ActivityIdea) => {
        const exists = savedActivities.some(a => a.name === activity.name);
        let newSaved;
        if (exists) {
            newSaved = savedActivities.filter(a => a.name !== activity.name);
        } else {
            newSaved = [activity, ...savedActivities];
        }
        setSavedActivities(newSaved);
        localStorage.setItem('brainPowerActivityFavorites', JSON.stringify(newSaved));
    };

    const isCurrentFavorite = result ? favorites.some(f => f.data.title === result.title && f.data.meta.date === result.meta.date) : false;

    const handleEditPlan = (plan: LessonPlan) => {
        setEditingPlan(plan);
        setAppMode("MANUAL");
    };

    // --- Navigation Logic ---
    const navigateTo = (view: string) => {
        if (view === 'dashboard') setAppMode("DASHBOARD");
        else if (view === 'ai-planner') {
            setAppMode("PLANNER");
            if (!result) setIsFormVisible(true);
        }
        else if (view === 'manual-builder') setAppMode("MANUAL");
        else if (view === 'activities') {
            setAppMode("LIBRARY");
            setLibraryMode("BROWSE");
        }
        else if (view === 'collaboration') setAppMode("COLLAB");
        else if (view === 'tools') {
            setAppMode("TOOLS");
            setToolsMode("ANALYTICS");
        }
    };

    const handleSidebarChange = (view: string) => {
        const isCurrentlyGuarded = (appMode === "PLANNER" && result) || (appMode === "MANUAL");
        const currentViewId = getCurrentViewForSidebar();

        if (isCurrentlyGuarded && view !== currentViewId) {
            if (isDirty) {
                setPendingNavView(view);
                setNavConfirmOpen(true);
            } else {
                navigateTo(view);
            }
        } else {
            navigateTo(view);
        }
    };

    const handleConfirmNavigation = () => {
        if (appMode === "PLANNER") saveCurrentResult();

        // If Manual Builder, try to trigger its internal save
        if (appMode === "MANUAL" && manualBuilderRef.current) {
            manualBuilderRef.current.triggerSave();
            // We do NOT navigate immediately here, because save is async or might fail.
            // But since handleSaveAndClose in ManualBuilder calls onSaveAndClose prop...
            // Actually, handleSaveAndClose in main.tsx handles the post-save navigation (setAppMode("PLANNER")).
            // So we just trigger it.
            // However, we also have pendingNavView. If they wanted to go to "DASHBOARD",
            // just saving sends them to "PLANNER" (viewing the plan).
            // That is actually fine: "Save & Leave" -> "Save & View Plan". User can then go to dashboard.
            setNavConfirmOpen(false);
            return;
        }

        setIsDirty(false);
        setEditingPlan(null);
        localStorage.removeItem('brainPowerManualDraft');
        if (pendingNavView) {
            navigateTo(pendingNavView);
            setResult(null);
            if (pendingNavView === 'ai-planner') setIsFormVisible(true);
        }
        setNavConfirmOpen(false);
    };

    const handleDiscardNavigation = () => {
        setIsDirty(false);
        setEditingPlan(null);
        if (pendingNavView) {
            navigateTo(pendingNavView);
            setResult(null);
            if (pendingNavView === 'ai-planner') setIsFormVisible(true);
        }
        setNavConfirmOpen(false);
    };

    const getCurrentViewForSidebar = () => {
        if (appMode === "DASHBOARD") return "dashboard";
        if (appMode === "PLANNER") return "ai-planner";
        if (appMode === "MANUAL") return "manual-builder";
        if (appMode === "LIBRARY") return "activities";
        if (appMode === "COLLAB") return "collaboration";
        if (appMode === "TOOLS") return "tools";
        return "dashboard";
    };

    // --- START OF SECTION: src/main.tsx (Update Render Content - Planner Section) ---
    const handleUpdatePlan = (updatedPlan: LessonPlan) => {
        setResult(updatedPlan);
        setIsDirty(false); // Saved, so not dirty

        // Update history if this plan exists there
        setHistory(prev => prev.map(item =>
            (item.data.title === updatedPlan.title && item.data.meta.date === updatedPlan.meta.date)
                ? { ...item, data: updatedPlan }
                : item
        ));
    };

    const handleLoadLatestPlan = async (p: LessonPlan) => {
        // Fetch the latest version from backend to ensure we see all updates
        let latestPlan = p;
        if (p.id) {
            const latest = await getLessonPlanById(p.id);
            if (latest) latestPlan = latest;
        }
        setResult(JSON.parse(JSON.stringify(latestPlan)));
        setIsDirty(false);
        setAppMode("PLANNER");
        setIsFormVisible(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSaveAndClose = async (plan: LessonPlan) => {
        const saved = await saveLessonPlanToDb(plan);
        if (saved) {
            setResult(saved);
            setAppMode("PLANNER");
            setViewMode("PLAN");
            setEditingPlan(null);
            setIsDirty(false);
        }
    };

    const handleDiscardEdit = () => {
        if (window.confirm("You have unsaved changes. Discard and return to dashboard?")) {
            setEditingPlan(null);
            setIsDirty(false);
            localStorage.removeItem('brainPowerManualDraft');
            setAppMode("DASHBOARD");
        }
    };

    const handleDeletePlan = (id: string | number) => {
        setDeleteId(id);
    };

    const confirmDeletePlan = async () => {
        if (!deleteId) return;
        const success = await deleteLessonPlan(deleteId);
        if (success) {
            // Remove from history and favorites
            setHistory(prev => prev.filter(item => item.data.id !== deleteId));
            setFavorites(prev => prev.filter(item => item.data.id !== deleteId));
            // If it was the current result or editing plan, clear it
            if (result?.id === deleteId) setResult(null);
            if (editingPlan?.id === deleteId) setEditingPlan(null);

            setAppMode("DASHBOARD");
        } else {
            alert("Failed to delete lesson plan.");
        }
        setDeleteId(null);
    };

    // --- Render Content ---
    const renderContent = () => {
        // 0. Wait for Auth to settle
        if (!isAuthSettled) {
            return (
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                </div>
            );
        }

        // Full feature set for all accounts
        if (appMode === "DASHBOARD") {
            return (
                <div className="space-y-8">
                    <Dashboard
                        history={history}
                        favorites={favorites}
                        profile={profile}
                        onLoadPlan={handleLoadLatestPlan}
                        onNavigate={(mode) => {
                            if (mode === "AI") {
                                setAppMode("PLANNER");
                                setIsFormVisible(true);
                            } else {
                                setAppMode("MANUAL");
                            }
                        }}
                    />
                    <AnalyticsView history={history} />
                </div>
            );
        }

        // --- START OF SECTION: src/main.tsx (Planner Section Update) ---
        if (appMode === "PLANNER") {
            return (
                <div className="flex flex-col lg:flex-row gap-6 w-full">
                    {/* INPUT FORM (LEFT COLUMN) */}
                    <div className={`
                        bg-white rounded-2xl shadow-sm border border-slate-200 flex-shrink-0 transition-all duration-300
                        ${isFormVisible ? 'w-full lg:w-80 p-6 opacity-100' : 'hidden lg:block lg:w-0 p-0 opacity-0 overflow-hidden border-0'}
                    `}>
                        <div className="flex justify-between items-center mb-6 min-w-[200px]">
                            <h2 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                                <Lightbulb className="w-5 h-5 text-yellow-500" /> Lesson Context
                            </h2>
                        </div>

                        <form onSubmit={handleGenerate} className="space-y-4 min-w-[200px]">
                            <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-lg">
                                <button type="button" onClick={() => { setLevel("Elementary"); setGrade(GRADES.Elementary[4]); setTextbook(TEXTBOOKS.Elementary[2]); }} className={`py-2 text-sm font-medium rounded-md ${level === "Elementary" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500"}`}>Elementary</button>
                                <button type="button" onClick={() => { setLevel("JuniorHigh"); setGrade(GRADES.JuniorHigh[1]); setTextbook(TEXTBOOKS.JuniorHigh[0]); }} className={`py-2 text-sm font-medium rounded-md ${level === "JuniorHigh" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500"}`}>Junior High</button>
                            </div>

                            {/* MODE TOGGLE */}
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button type="button" onClick={() => setIsCustomMode(false)} className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${!isCustomMode ? "bg-white text-slate-800 shadow-sm" : "text-slate-400"}`}>Standard</button>
                                <button type="button" onClick={() => setIsCustomMode(true)} className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${isCustomMode ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400"}`}>Custom</button>
                            </div>

                            {isCustomMode ? (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="p-2 bg-indigo-50 border border-indigo-100 rounded text-[10px] text-indigo-700 font-bold">
                                        Custom Mode: You define the lesson targets.
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Language <span className="text-rose-500">*</span></label>
                                        <textarea
                                            value={customTarget}
                                            onChange={(e) => setCustomTarget(e.target.value)}
                                            placeholder="e.g. I want to be a teacher."
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none h-16"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vocabulary</label>
                                        <textarea
                                            value={customVocab}
                                            onChange={(e) => setCustomVocab(e.target.value)}
                                            placeholder="e.g. doctor, nurse, pilot"
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none h-12"
                                        />
                                    </div>
                                    <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Topic (Optional)" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <select value={grade} onChange={(e) => { setGrade(e.target.value); setTextbook(getDefaultTextbook(level, e.target.value)); }} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                                        {GRADES[level].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                    <select value={textbook} onChange={(e) => setTextbook(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                                        {TEXTBOOKS[level].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    {TEXTBOOK_UNITS[textbook] ? (
                                        <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                                            <option value="">Select a Unit...</option>
                                            {TEXTBOOK_UNITS[textbook].map(u => (
                                                <option key={u.title} value={u.title}>{u.number}. {u.title}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit / Topic" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                                    )}
                                </div>
                            )}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-teal-600 transition-colors"
                                >
                                    {showAdvanced ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                    Advanced Options
                                </button>
                                {showAdvanced && (
                                    <div className="mt-3 space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100 animate-in fade-in">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duration: {duration}m</label>
                                            <input type="range" min="30" max="60" step="5" value={duration} onChange={e => setDuration(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class Size: {classSize}</label>
                                            <input type="number" value={classSize} onChange={e => setClassSize(parseInt(e.target.value))} className="w-full p-1 border rounded text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">English Level: {studentLevel}/5</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-slate-400 font-bold">1</span>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="5"
                                                    step="1"
                                                    value={studentLevel}
                                                    onChange={e => setStudentLevel(parseInt(e.target.value))}
                                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                                                />
                                                <span className="text-[10px] text-slate-400 font-bold">5</span>
                                            </div>
                                            <p className="text-[10px] text-teal-600 mt-1 font-medium text-center bg-teal-50 rounded py-0.5">
                                                {studentLevel <= 2 ? "Beginner (TPR/Drills)" : studentLevel === 3 ? "Standard (Games/Practice)" : "Advanced (Communicative)"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button type="submit" disabled={loading || (isCustomMode ? !customTarget : !unit)} className="w-full py-3 bg-teal-600 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors disabled:opacity-50">
                                {loading ? "Thinking..." : <><Sparkles className="w-4 h-4" /> Generate Plan (5 Sparks)</>}
                            </button>
                        </form>
                    </div>

                    {/* RESULTS AREA (RIGHT COLUMN) */}
                    <div className="flex-grow min-w-0 flex flex-col w-full">
                        {/* Toolbar for Form Visibility */}
                        <div className="mb-4 flex items-center justify-between">
                            {!isFormVisible && (
                                <button
                                    onClick={() => setIsFormVisible(true)}
                                    className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:text-teal-600 hover:border-teal-300 transition-all shadow-sm"
                                >
                                    <Maximize2 className="w-4 h-4" /> Show Context
                                </button>
                            )}
                            {isFormVisible && result && (
                                <button
                                    onClick={() => setIsFormVisible(false)}
                                    className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:text-teal-600 hover:border-teal-300 transition-all shadow-sm"
                                >
                                    <Minimize2 className="w-4 h-4" /> Hide Context
                                </button>
                            )}
                        </div>

                        {result ? (
                            <>
                                {/* Tabs Navigation */}
                                <div className="mb-6 bg-white p-1 rounded-xl flex flex-shrink-0 w-full shadow-sm border border-slate-200 print:hidden overflow-x-auto scrollbar-hide">
                                    <div className="flex w-full min-w-max md:min-w-0 gap-1">
                                        {(["PLAN", "UCHIAWASE", "CHECKLIST", "REFLECTION"] as const).map(m => (
                                            <button key={m} onClick={() => setViewMode(m)} className={`flex-1 px-2 md:px-4 py-2 rounded-lg text-[10px] sm:text-xs md:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${viewMode === m ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}>
                                                <span className="md:hidden">
                                                    {m === "PLAN" ? "Plan" : m === "UCHIAWASE" ? "Uchi" : m === "CHECKLIST" ? "Check" : "Reflect"}
                                                </span>
                                                <span className="hidden md:inline">
                                                    {m === "PLAN" ? "Lesson Plan" : m === "UCHIAWASE" ? "Uchiawase" : m === "CHECKLIST" ? "Checklist" : "Reflection"}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {viewMode === "PLAN" && (
                                        <LessonCard
                                            plan={result}
                                            onSaveFavorite={toggleFavorite}
                                            isSaved={isCurrentFavorite}
                                            onOpenFlashcards={handleOpenFlashcards}
                                            onEnterClassroomMode={() => handleOpenClassroom(result)}
                                            onEdit={handleEditPlan}
                                            userProfile={profile}
                                            // ✅ FIXED: This prop is critical for saving!
                                            onUpdate={handleUpdatePlan}
                                            onDelete={handleDeletePlan}
                                        />
                                    )}
                                    {viewMode === "UCHIAWASE" && <UchiawaseView plan={result} />}
                                    {viewMode === "CHECKLIST" && (
                                        <ChecklistView
                                            plan={result}
                                            onUpdate={handleUpdateChecklist}
                                        />
                                    )}
                                    {viewMode === "REFLECTION" && (
                                        <ReflectionView
                                            plan={result}
                                            onUpdate={handleUpdateReflection}
                                        />
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Empty State */
                            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
                                <Sparkles className="w-16 h-16 mb-4 text-teal-200" />
                                <h3 className="text-xl font-bold text-slate-600 mb-2">Sparkii Assistant is Ready</h3>
                                <p className="max-w-md text-center text-sm">Fill out the context on the left to generate a lesson plan instantly.</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        // --- END OF SECTION: src/main.tsx (Planner Section Update) ---

        if (appMode === "MANUAL") {
            return <ManualBuilder
                ref={manualBuilderRef}
                initialProfile={profile}
                onPreview={handleManualPreview}
                onSaveAndClose={handleSaveAndClose}
                onDiscard={handleDiscardEdit}
                onDelete={handleDeletePlan}
                editingPlan={editingPlan || undefined}
            />;
        }
        // --- END OF SECTION: src/main.tsx (Update Render Content - Planner Section) ---

        if (appMode === "LIBRARY") {
            return (
                <div className="animate-in fade-in">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 sticky top-0 z-10">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4 border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <LayoutGrid className="w-6 h-6 text-indigo-500" />
                                <h2 className="text-xl font-bold text-slate-800">
                                    {libraryMode === "SAVED" ? "Saved Activities" : libraryMode === "BROWSE" ? "Browse Database" : libraryMode === "CURRICULUM" ? "Curriculum Browser" : "AI Suggestions"}
                                </h2>
                            </div>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button onClick={() => setLibraryMode("BROWSE")} className={`px-4 py-1.5 text-xs font-bold rounded ${libraryMode === "BROWSE" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Browse</button>
                                <button onClick={() => setLibraryMode("CURRICULUM")} className={`px-4 py-1.5 text-xs font-bold rounded ${libraryMode === "CURRICULUM" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Curriculum</button>
                                <button onClick={() => setLibraryMode("AI")} className={`px-4 py-1.5 text-xs font-bold rounded ${libraryMode === "AI" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>AI</button>
                                <button onClick={() => setLibraryMode("SAVED")} className={`px-4 py-1.5 text-xs font-bold rounded ${libraryMode === "SAVED" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Saved</button>
                            </div>
                        </div>

                        {/* Filters Bar */}
                        {libraryMode !== "CURRICULUM" && (
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="relative flex-grow">
                                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                        <input type="text" value={activitySearch} onChange={(e) => setActivitySearch(e.target.value)} placeholder="Search activities..." className="w-full pl-9 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                                        <select value={activityType} onChange={e => setActivityType(e.target.value)} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm min-w-[120px]">
                                            <option value="All">All Types</option>
                                            {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <select value={activitySkill} onChange={e => setActivitySkill(e.target.value)} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm min-w-[120px]">
                                            <option value="All">All Skills</option>
                                            {ACTIVITY_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        {libraryMode === "AI" && (
                                            <button onClick={handleAiActivitySearch} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg flex items-center gap-2 whitespace-nowrap">
                                                <BrainCircuit className="w-4 h-4" /> {loading ? "Thinking..." : "Generate Ideas"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {libraryMode === "AI" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 animate-in fade-in slide-in-from-top-2">
                                        <div>
                                            <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">Target Language / Phrase</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Do you have a pen?"
                                                value={aiGuidance.target}
                                                onChange={e => setAiGuidance({ ...aiGuidance, target: e.target.value })}
                                                className="w-full p-2 bg-white border border-indigo-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">Specific Vocabulary</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. pen, eraser, ruler"
                                                value={aiGuidance.vocab}
                                                onChange={e => setAiGuidance({ ...aiGuidance, vocab: e.target.value })}
                                                className="w-full p-2 bg-white border border-indigo-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Content Render */}
                    {libraryMode === "CURRICULUM" && <CurriculumBrowser />}

                    {libraryMode === "BROWSE" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
                            {dbResults.length > 0 ? dbResults.map((activity, i) => (
                                <ActivityIdeaCard
                                    key={i}
                                    activity={activity}
                                    onToggleFavorite={toggleActivityFavorite}
                                    isFavorite={savedActivities.some(a => a.name === activity.name)}
                                />
                            )) : (
                                <div className="col-span-3 text-center py-20 text-slate-400 flex flex-col items-center">
                                    <Filter className="w-12 h-12 mb-4 opacity-20" />
                                    <p>No activities match your filters.</p>
                                    <button onClick={() => { setActivitySearch(""); setActivityType("All"); setActivitySkill("All"); setActivityGradeFilter("All"); }} className="mt-2 text-indigo-600 text-sm font-bold hover:underline">Clear Filters</button>
                                </div>
                            )}
                        </div>
                    )}

                    {libraryMode === "AI" && (
                        activityResults ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                                {activityResults.map((activity, i) => (
                                    <ActivityIdeaCard
                                        key={i}
                                        activity={activity}
                                        onToggleFavorite={toggleActivityFavorite}
                                        isFavorite={savedActivities.some(a => a.name === activity.name)}
                                    />
                                ))}
                            </div>
                        ) : <ActivityEmptyState />
                    )}

                    {libraryMode === "SAVED" && (
                        savedActivities.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                                {savedActivities.map((activity, i) => (
                                    <ActivityIdeaCard
                                        key={i}
                                        activity={activity}
                                        onToggleFavorite={toggleActivityFavorite}
                                        isFavorite={true}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <Heart className="w-12 h-12 mb-4 opacity-20" />
                                <p>No saved activities yet.</p>
                                <button onClick={() => setLibraryMode("BROWSE")} className="mt-4 text-indigo-600 font-bold hover:underline">Find Activities</button>
                            </div>
                        )
                    )}
                </div>
            );
        }

        if (appMode === "COLLAB") {
            return (
                <CollaborationView
                    profile={profile}
                    onUpdateProfile={setProfile}
                    onLoadPlan={handleLoadLatestPlan}
                />
            );
        }

        if (appMode === "TOOLS") {
            return (
                <div className="animate-in fade-in">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <Wrench className="w-8 h-8 text-rose-500" />
                            Teacher Toolkit
                        </h2>
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                            <button
                                onClick={() => setToolsMode("ANALYTICS")}
                                className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${toolsMode === "ANALYTICS" ? "bg-rose-50 text-rose-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                <BarChart2 className="w-4 h-4" /> Analytics
                            </button>
                            <button
                                onClick={() => setToolsMode("RUBRIC")}
                                className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${toolsMode === "RUBRIC" ? "bg-rose-50 text-rose-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                {/* ClipboardCheck icon was missing from imports, replaced logic if needed or removed */}
                                Rubric Generator
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-1 rounded-xl">
                        {toolsMode === "ANALYTICS" && <AnalyticsView history={history} />}
                        {toolsMode === "RUBRIC" && <AssessmentGenerator />}
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col lg:flex-row overflow-hidden">
            {/* 1. Sidebar - Visible to all users */}
            <Sidebar
                currentView={getCurrentViewForSidebar() as any}
                onChangeView={handleSidebarChange}
                isOpen={mobileMenuOpen}
                closeMenu={() => setMobileMenuOpen(false)}
                isCollapsed={navCollapsed}
                toggleCollapse={() => setNavCollapsed(!navCollapsed)}
                openSettings={() => setSettingsOpen(true)}
                profile={profile}
                sparks={sparks}
            />

            {/* 2. Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                <Header
                    toggleMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
                />

                <main className="flex-1 overflow-y-auto px-2 md:px-4 lg:px-6 py-6 md:py-8 scrollbar-thin scrollbar-thumb-slate-300">
                    <div className="w-full">
                        {renderContent()}
                    </div>
                </main>
            </div>

            <SettingsModal
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                profile={profile}
                setProfile={setProfile}
            />

            <ConfirmationModal
                isOpen={navConfirmOpen}
                title="Unsaved Changes"
                message="You have made changes to an open lesson. Do you want to save changes before leaving?"
                onClose={() => setNavConfirmOpen(false)}
                onConfirm={handleConfirmNavigation}
                onDiscard={handleDiscardNavigation}
            />

            <ConfirmationModal
                isOpen={!!deleteId}
                title="Delete Lesson Plan?"
                message="Are you sure you want to permanently delete this plan? This action cannot be undone."
                confirmLabel="Delete Forever"
                cancelLabel="Cancel"
                isDestructive={true}
                onConfirm={confirmDeletePlan}
                onDiscard={() => setDeleteId(null)}
            />
            {/* Global Overlays */}
            {flashcardWords && <FlashcardViewer words={flashcardWords} onClose={closeOverlay} />}
            {classroomPlan && <ClassroomView plan={classroomPlan} onClose={closeOverlay} />}
        </div>
    );
};

export default App;
// --- END OF SECTION: src/main.tsx ---