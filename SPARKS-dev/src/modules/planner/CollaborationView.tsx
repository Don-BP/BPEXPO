// --- START OF SECTION: src/CollaborationView.tsx ---
import React, { useState, useEffect, useRef } from 'react';
import {
    Users, School, ChevronRight, User, Mail, Save, MessageSquare,
    Send, Link as LinkIcon, X, ArrowLeft, UserPlus, Loader2, Check, AlertTriangle, Share2
} from 'lucide-react';
import { UserProfile, ConnectedTeacher, ChatMessage, LessonPlan } from './types';
import { BookOpen, Search, Settings } from 'lucide-react';

// TeacherChat Component - Direct messaging with a connected teacher
const TeacherChat = ({
    teacher,
}: {
    teacher: ConnectedTeacher;
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkLabel, setLinkLabel] = useState("");
    const endRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInitialLoad = useRef(true);
    const justSent = useRef(false);
    const [isNearBottom, setIsNearBottom] = useState(true);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
        setIsNearBottom(isAtBottom);
    };

    const getCurrentUserId = () => {
        try {
            const token = localStorage.getItem('bplabo_jwt_token');
            if (!token) return 0;
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId;
        } catch (e) { return 0; }
    };

    const parseLink = (text: string) => {
        const content = text.replace('LINK:', '');
        const [url, label] = content.split('|');
        return { url, label: label || url };
    };

    const fetchMessages = async () => {
        if (isInitialLoad.current) {
            setLoading(true);
        }
        try {
            const token = localStorage.getItem('bplabo_jwt_token');
            const res = await fetch(`/api/collaboration/general-chat/${teacher.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const mapped = data.messages.map((m: any) => ({
                    id: String(m.id),
                    text: m.message.startsWith('LINK:') ? undefined : m.message,
                    link: m.message.startsWith('LINK:') ? parseLink(m.message) : undefined,
                    sender: Number(m.senderId) === Number(getCurrentUserId()) ? 'me' : 'partner',
                    timestamp: m.createdAt
                }));
                if (mapped.length !== messages.length || (mapped.length > 0 && mapped[mapped.length - 1].id !== messages[messages.length - 1]?.id)) {
                    setMessages(mapped);
                }
            }
        } catch (e) { console.error("Chat sync error", e); }
        finally {
            setLoading(false);
            isInitialLoad.current = false;
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [teacher.id]);

    useEffect(() => {
        if (isInitialLoad.current || isNearBottom || justSent.current) {
            endRef.current?.scrollIntoView({ behavior: isInitialLoad.current ? 'auto' : 'smooth' });
            justSent.current = false;
        }
    }, [messages]);

    const handleSend = async (text?: string, link?: { url: string, label: string }) => {
        let content = text || "";
        if (link) content = `LINK:${link.url}|${link.label}`;
        if (!content.trim()) return;

        try {
            const token = localStorage.getItem('bplabo_jwt_token');
            const res = await fetch(`/api/collaboration/general-chat/${teacher.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message: content })
            });
            if (res.ok) {
                setInput("");
                setLinkUrl("");
                setLinkLabel("");
                setShowLinkInput(false);
                justSent.current = true;
                fetchMessages();
            }
        } catch (e) { alert("Failed to send message"); }
    };

    return (
        <div className="flex flex-col h-[500px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 bg-white border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" /> Direct Messages
            </div>

            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-grow overflow-y-auto p-4 space-y-4"
            >
                {loading ? (
                    <div className="text-center text-slate-400 text-sm mt-10">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        Loading messages...
                    </div>
                ) : (!messages || messages.length === 0) && (
                    <div className="text-center text-slate-400 text-sm mt-10">
                        <p>No messages yet.</p>
                        <p>Start a conversation or share a file link.</p>
                    </div>
                )}
                {!loading && messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'me'
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                            }`}>
                            {msg.text && <p>{msg.text}</p>}
                            {msg.link && (
                                <a href={msg.link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline font-bold">
                                    <LinkIcon className="w-3 h-3" /> {msg.link.label}
                                </a>
                            )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            <div className="p-3 bg-white border-t border-slate-200">
                {showLinkInput ? (
                    <div className="flex flex-col gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 mb-2 animate-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">Attach Link</span>
                            <button onClick={() => setShowLinkInput(false)}><X className="w-4 h-4 text-slate-400" /></button>
                        </div>
                        <input type="text" placeholder="URL" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="p-2 border rounded text-sm" autoFocus />
                        <input type="text" placeholder="Label (optional)" value={linkLabel} onChange={e => setLinkLabel(e.target.value)} className="p-2 border rounded text-sm" />
                        <button onClick={() => handleSend(undefined, { url: linkUrl, label: linkLabel || linkUrl })} className="bg-indigo-600 text-white p-2 rounded text-sm font-bold">Send Link</button>
                    </div>
                ) : (
                    <div className="relative flex items-center gap-2">
                        <button onClick={() => setShowLinkInput(true)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><LinkIcon className="w-5 h-5" /></button>
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend(input)} placeholder="Type a message..." className="flex-grow py-2 px-4 border border-slate-300 rounded-full focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                        <button onClick={() => handleSend(input)} disabled={!input.trim()} className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50"><Send className="w-4 h-4" /></button>
                    </div>
                )}
            </div>
        </div>
    );
};
// --- END OF SECTION: TeacherChat ---

export const CollaborationView = ({
    profile,
    onUpdateProfile,
    onLoadPlan
}: {
    profile: UserProfile;
    onUpdateProfile: (p: UserProfile) => void;
    onLoadPlan: (plan: LessonPlan) => void;
}) => {
    const [view, setView] = useState<'SCHOOLS' | 'ROSTER' | 'DETAIL'>('SCHOOLS');
    const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<ConnectedTeacher | null>(null);

    // Detail Tabs
    const [activeTab, setActiveTab] = useState<'PLANS' | 'UCHIAWASE'>('PLANS');
    const [teacherPlans, setTeacherPlans] = useState<LessonPlan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(false);

    // Edit State
    const [editForm, setEditForm] = useState<Partial<ConnectedTeacher>>({});
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<ConnectedTeacher | null>(null);

    // Connection Logic State
    const [teacherConnectId, setTeacherConnectId] = useState("");
    const [connectStatus, setConnectStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [connectMsg, setConnectMsg] = useState("");

    // Confirmation Modal for Removal
    const [confirmRemovalId, setConfirmRemovalId] = useState<string | number | null>(null);

    const handleRemoveConnection = async (teacherId: string | number) => {
        try {
            const token = localStorage.getItem('bplabo_jwt_token');
            const res = await fetch(`/api/collaboration/remove-connection/${teacherId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const updatedTeachers = profile.connected_teachers.filter(t => t.id !== teacherId);
                onUpdateProfile({ ...profile, connected_teachers: updatedTeachers });

                try {
                    const saved = localStorage.getItem('alt_teacher_display_overrides');
                    if (saved) {
                        const overrides = JSON.parse(saved);
                        delete overrides[teacherId];
                        localStorage.setItem('alt_teacher_display_overrides', JSON.stringify(overrides));
                    }
                } catch (e) { }

                if (selectedTeacher && selectedTeacher.id === teacherId) {
                    setSelectedTeacher(null);
                    setView('SCHOOLS');
                }
                setShowEditModal(false);
                setConfirmRemovalId(null);
            } else {
                alert("Failed to remove connection.");
            }
        } catch (e) { console.error(e); }
    };

    // connected_teachers are fetched in App.tsx but we refresh here as a fallback
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const token = localStorage.getItem('bplabo_jwt_token');
                if (!token) return;

                const res = await fetch('/api/collaboration/teachers', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();

                    const savedOverrides = localStorage.getItem('alt_teacher_display_overrides');
                    let overrides = {};
                    try { overrides = savedOverrides ? JSON.parse(savedOverrides) : {}; } catch (e) { }

                    const updatedTeachers = data.teachers.map((t: any) => {
                        const ovr = (overrides as any)[String(t.id)];
                        return {
                            id: t.id,
                            username: t.username || "Teacher",
                            displayName: ovr?.displayName || t.username || "Teacher",
                            schoolName: ovr?.schoolName || t.schoolName || "Unassigned School",
                            schools: ovr?.schools || (t.schoolName ? [t.schoolName] : ["Unassigned School"]),
                            role: ovr?.role || "Teacher",
                            email: ovr?.email || "",
                            employeeId: t.employeeId,
                            avatarUrl: t.avatarUrl || undefined,
                        };
                    });

                    onUpdateProfile({ ...profile, connected_teachers: updatedTeachers });
                }
            } catch (e) {
                console.error("Failed to fetch teachers", e);
            }
        };
        fetchTeachers();
    }, []);


    // 1. Get Unique Schools
    const schools: string[] = Array.from(new Set(profile.connected_teachers.flatMap(t => t.schools && t.schools.length > 0 ? t.schools : [t.schoolName || "Unassigned School"]))).sort();

    // 2. Map schools to teacher name lists for the landing cards
    const schoolTeacherMap: Record<string, string[]> = schools.reduce((acc: Record<string, string[]>, school: string) => {
        acc[school] = profile.connected_teachers
            .filter(t => (t.schools || [t.schoolName || "Unassigned School"]).includes(school))
            .map(t => t.displayName);
        return acc;
    }, {} as Record<string, string[]>);

    // 3. Filter teachers by School for the Roster view
    const schoolRoster = selectedSchool
        ? profile.connected_teachers.filter(t => (t.schools || [t.schoolName || "Unassigned School"]).includes(selectedSchool))
        : [];

    const handleConnectTeacher = async () => {
        if (!teacherConnectId.trim()) return;
        setConnectStatus("loading");
        setConnectMsg("");

        try {
            const token = localStorage.getItem('bplabo_jwt_token');
            const res = await fetch('/api/collaboration/connect-teacher', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ teacherEmployeeId: teacherConnectId })
            });

            const data = await res.json();

            if (res.ok) {
                setConnectStatus("success");
                setConnectMsg(data.message || "Connected successfully!");
                setTeacherConnectId("");

                const newTeacher: ConnectedTeacher = {
                    id: data.teacher.id,
                    username: data.teacher.username,
                    displayName: data.teacher.username,
                    schoolName: "New Connection",
                    role: "Teacher",
                    email: "",
                    employeeId: data.teacher.employeeId,
                };
                const exists = profile.connected_teachers.some(t => t.id === newTeacher.id);
                if (!exists) {
                    onUpdateProfile({ ...profile, connected_teachers: [...profile.connected_teachers, newTeacher] });
                }

            } else {
                setConnectStatus("error");
                setConnectMsg(data.message || "Connection failed.");
            }
        } catch (error) {
            setConnectStatus("error");
            setConnectMsg("Network error.");
        }
    };

    const saveTeacherDetails = (targetTeacher: ConnectedTeacher | null) => {
        const teacherToSave = targetTeacher || editingTeacher || selectedTeacher;
        if (!teacherToSave) return;

        const updatedTeachers = profile.connected_teachers.map(t => t.id === teacherToSave.id ? { ...t, ...editForm } as ConnectedTeacher : t);

        try {
            const saved = localStorage.getItem('alt_teacher_display_overrides');
            const overrides = saved ? JSON.parse(saved) : {};
            overrides[String(teacherToSave.id)] = {
                displayName: editForm.displayName,
                schools: editForm.schools,
                schoolName: editForm.schools?.[0] || editForm.schoolName,
                role: editForm.role,
                email: editForm.email
            };
            localStorage.setItem('alt_teacher_display_overrides', JSON.stringify(overrides));
        } catch (e) { console.error("Failed to save overrides", e); }

        onUpdateProfile({ ...profile, connected_teachers: updatedTeachers });

        if (selectedTeacher && selectedTeacher.id === teacherToSave.id) {
            setSelectedTeacher({ ...selectedTeacher, ...editForm } as ConnectedTeacher);
        }

        setShowEditModal(false);
        setEditingTeacher(null);
    };

    const handleChatSend = async (msg: ChatMessage) => {
        if (!selectedTeacher) return;

        try {
            const token = localStorage.getItem('bplabo_jwt_token');
            let messageContent = msg.text || "";

            if (msg.link) {
                messageContent = `LINK:${msg.link.url}|${msg.link.label}`;
            }

            const res = await fetch(`/api/collaboration/general-chat/${selectedTeacher.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: messageContent })
            });

            if (!res.ok) {
                console.error("Failed to send message");
                alert("Failed to send message. Please try again.");
                setSelectedTeacher(selectedTeacher);
                onUpdateProfile({ ...profile, connected_teachers: profile.connected_teachers });
            }
        } catch (error) {
            console.error("Send error:", error);
            alert("Network error. Please check your connection.");
            setSelectedTeacher(selectedTeacher);
            onUpdateProfile({ ...profile, connected_teachers: profile.connected_teachers });
        }
    };

    // --- VIEWS ---

    // 4. Fetch Shared Plans for a specific JTE
    useEffect(() => {
        if (view === 'DETAIL' && selectedTeacher) {
            const fetchPlans = async () => {
                setLoadingPlans(true);
                try {
                    const token = localStorage.getItem('bplabo_jwt_token');
                    const res = await fetch(`/api/collaboration/shared-plans/${selectedTeacher.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setTeacherPlans(data.lessonPlans || []);
                    }
                } catch (e) { console.error(e); }
                finally { setLoadingPlans(false); }
            };
            fetchPlans();
        }
    }, [view, selectedTeacher]);

    // --- RENDER HELPERS ---
    const renderDetailView = () => {
        if (!selectedTeacher) return null;
        return (
            <div className="animate-in fade-in space-y-6">
                <div className="flex items-center justify-between">
                    <button onClick={() => setView('ROSTER')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to {selectedSchool}
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-tighter shadow-sm border border-indigo-100">
                            {selectedTeacher.role || "Teacher"}
                        </span>
                    </div>
                </div>

                {/* Profile Header Card */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />
                    <div className="relative z-10 w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-indigo-100">
                        {(selectedTeacher.displayName || "T").charAt(0)}
                    </div>
                    <div className="relative z-10 text-center md:text-left flex-grow">
                        <h2 className="text-3xl font-black text-slate-800 mb-1">{selectedTeacher.displayName}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-bold text-slate-400">
                            <span className="flex items-center gap-1"><User className="w-4 h-4" /> ID: {selectedTeacher.employeeId}</span>
                            {selectedTeacher.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {selectedTeacher.email}</span>}
                        </div>
                    </div>
                    <div className="relative z-10 flex gap-2">
                        <button
                            onClick={() => {
                                setEditingTeacher(selectedTeacher);
                                setEditForm({
                                    displayName: selectedTeacher.displayName,
                                    schoolName: selectedTeacher.schoolName,
                                    schools: selectedTeacher.schools || [selectedTeacher.schoolName || ""],
                                    role: selectedTeacher.role,
                                    email: selectedTeacher.email
                                });
                                setShowEditModal(true);
                            }}
                            className="p-4 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-slate-100"
                        >
                            <Settings className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-slate-100/50 p-1.5 rounded-2xl flex gap-1 w-full md:w-fit">
                    <button
                        onClick={() => setActiveTab('PLANS')}
                        className={`flex-grow md:flex-initial px-8 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${activeTab === 'PLANS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <BookOpen className="w-4 h-4" /> Shared Plans
                    </button>
                    <button
                        onClick={() => setActiveTab('UCHIAWASE')}
                        className={`flex-grow md:flex-initial px-8 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${activeTab === 'UCHIAWASE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" /> Uchiawase Chat
                    </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'PLANS' ? (
                        <div className="space-y-4">
                            {loadingPlans ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 italic text-slate-400">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-300" />
                                    <p className="font-bold">Fetching shared history...</p>
                                </div>
                            ) : teacherPlans.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 text-slate-300">
                                    <BookOpen className="w-16 h-16 mb-4 opacity-10" />
                                    <p className="font-black text-lg">No plans shared yet.</p>
                                    <p className="text-sm font-medium">Shared plans will appear here for easy reference.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {teacherPlans.map(plan => (
                                        <div
                                            key={plan.id}
                                            onClick={() => onLoadPlan(plan)}
                                            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex items-center justify-between group cursor-pointer hover:border-indigo-200"
                                        >
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{plan.title}</h4>
                                                    <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[9px] font-black rounded-lg border border-slate-100 uppercase">
                                                        {plan.grade_level || "G-Level"}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Share2 className="w-3 h-3 text-indigo-400" />
                                                    Shared {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'recently'}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-100 transition-all duration-300">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden h-[calc(100vh-450px)] min-h-[500px]">
                            <TeacherChat teacher={selectedTeacher} />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderRosterView = () => {
        return (
            <div className="animate-in fade-in space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('SCHOOLS')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-slate-500" />
                        </button>
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-2">
                                <School className="w-8 h-8 text-indigo-600" /> {selectedSchool}
                            </h2>
                            <p className="text-slate-500 font-medium font-sm">Teacher Roster</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schoolRoster.map(teacher => (
                        <div
                            key={teacher.id}
                            className="group relative bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className="flex items-center gap-4 cursor-pointer flex-grow"
                                    onClick={() => { setSelectedTeacher(teacher); setActiveTab('PLANS'); setView('DETAIL'); }}
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                        {(teacher.displayName || "T").charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 group-hover:text-indigo-700 transition-colors truncate max-w-[120px]">{teacher.displayName}</h3>
                                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">{teacher.role || "Teacher"}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingTeacher(teacher);
                                        setEditForm({
                                            displayName: teacher.displayName,
                                            schoolName: teacher.schoolName,
                                            schools: teacher.schools || [teacher.schoolName || ""],
                                            role: teacher.role,
                                            email: teacher.email
                                        });
                                        setShowEditModal(true);
                                    }}
                                    className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                                >
                                    <Settings className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Email hidden for privacy */}

                            <button
                                onClick={() => { setSelectedTeacher(teacher); setActiveTab('PLANS'); setView('DETAIL'); }}
                                className="w-full py-3 bg-slate-50 text-slate-600 text-xs font-black rounded-xl border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-400 transition-all flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" /> Open Details
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // DEFAULT: SCHOOLS LIST (LANDING PAGE) + CONNECT FORM
    const renderSchoolsView = () => (
        <div className="space-y-6 animate-in fade-in">
            {/* Connection Form (Header-style) */}
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <UserPlus className="w-6 h-6 text-indigo-300" /> Connect with a Teacher
                    </h2>
                    <p className="text-indigo-200 text-sm mb-6 max-w-md">
                        Link your account with another teacher to start sharing lesson plans and chatting.
                    </p>
                    <div className="flex flex-col md:flex-row gap-3 items-center">
                        <input
                            type="text"
                            placeholder="Enter Teacher Employee ID (e.g. T0001)"
                            value={teacherConnectId}
                            onChange={(e) => setTeacherConnectId(e.target.value)}
                            className="w-full md:w-80 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-indigo-400 outline-none backdrop-blur-sm transition-all"
                        />
                        <button
                            onClick={handleConnectTeacher}
                            disabled={connectStatus === 'loading'}
                            className="w-full md:w-auto bg-white text-indigo-900 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl"
                        >
                            {connectStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect"}
                        </button>
                    </div>
                    {connectStatus !== 'idle' && (
                        <div className={`mt-4 text-xs flex items-center gap-1 font-bold ${connectStatus === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {connectStatus === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            {connectMsg}
                        </div>
                    )}
                </div>
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            </div>

            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <School className="w-8 h-8 text-indigo-600" />
                        My Schools
                    </h2>
                    <p className="text-slate-500 font-medium">Click a school to view your teacher roster.</p>
                </div>
                {profile.connected_teachers.length > 0 && (
                    <div className="text-right">
                        <span className="text-2xl font-black text-indigo-600 leading-none">{profile.connected_teachers.length}</span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Teachers</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                        <School className="w-16 h-16 mb-4 opacity-20" />
                        <p className="font-bold">No schools connected yet.</p>
                        <p className="text-sm">Add a teacher above to get started.</p>
                    </div>
                ) : (
                    schools.map(school => (
                        <button
                            key={school}
                            onClick={() => { setSelectedSchool(school); setView('ROSTER'); }}
                            className="group relative bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                        <School className="w-8 h-8" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-none">{schoolTeacherMap[school]?.length || 0}</div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Teachers</div>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-slate-800 group-hover:text-indigo-800 transition-colors uppercase tracking-tight mb-2 truncate">{school}</h3>
                                <div className="flex flex-wrap gap-1">
                                    {(schoolTeacherMap[school] || []).slice(0, 3).map((name, i) => (
                                        <span key={i} className="text-[9px] font-bold px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">{name}</span>
                                    ))}
                                    {(schoolTeacherMap[school]?.length || 0) > 3 && (
                                        <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md">+{schoolTeacherMap[school].length - 3} more</span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="relative">
            {view === 'SCHOOLS' && renderSchoolsView()}
            {view === 'ROSTER' && renderRosterView()}
            {view === 'DETAIL' && renderDetailView()}

            {/* Edit Teacher Modal */}
            {showEditModal && editingTeacher && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="bg-indigo-600 p-8 text-white relative">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-3xl font-black backdrop-blur-md">
                                    {editForm.displayName?.charAt(0) || "T"}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black">Edit Teacher Details</h3>
                                    <p className="text-indigo-100 text-sm font-medium">Local changes only • ID: {editingTeacher.employeeId}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nickname / Display Name</label>
                                <input
                                    type="text"
                                    value={editForm.displayName ?? ""}
                                    onChange={e => setEditForm({ ...editForm, displayName: e.target.value })}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Schools (Up to 6)</label>
                                <div className="space-y-2">
                                    {(editForm.schools || [""]).map((school, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={school}
                                                onChange={e => {
                                                    const newSchools = [...(editForm.schools || [])];
                                                    newSchools[idx] = e.target.value;
                                                    setEditForm({ ...editForm, schools: newSchools });
                                                }}
                                                placeholder={`School ${idx + 1}`}
                                                className="flex-grow p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                                            />
                                            {idx > 0 && (
                                                <button
                                                    onClick={() => {
                                                        const newSchools = editForm.schools?.filter((_, i) => i !== idx);
                                                        setEditForm({ ...editForm, schools: newSchools });
                                                    }}
                                                    className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {(editForm.schools?.length || 0) < 6 && (
                                        <button
                                            onClick={() => setEditForm({ ...editForm, schools: [...(editForm.schools || []), ""] })}
                                            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-xs font-black text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                                        >
                                            + Add Another School
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Role</label>
                                    <input
                                        type="text"
                                        value={editForm.role ?? ""}
                                        onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email ?? ""}
                                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row gap-4">
                            <button
                                onClick={() => setConfirmRemovalId(editingTeacher.id)}
                                className="order-3 md:order-1 px-4 py-4 text-rose-500 font-bold hover:bg-rose-50 rounded-2xl transition-all uppercase text-[10px] tracking-widest"
                            >
                                Remove Connection
                            </button>
                            <div className="flex-grow order-2" />
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="order-2 md:order-2 px-8 py-4 bg-white text-slate-500 font-black rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all uppercase text-[10px] tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => saveTeacherDetails(editingTeacher)}
                                className="order-1 md:order-3 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all uppercase text-xs tracking-widest"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Premium Removal Confirmation Modal */}
            {confirmRemovalId && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[70] flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Remove Connection?</h3>
                            <p className="text-slate-500 font-medium mb-8">
                                You will lose access to shared plans and chat history with
                                <span className="text-rose-600 font-black ml-1">
                                    {(profile.connected_teachers.find(t => t.id === confirmRemovalId))?.displayName}
                                </span>.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => handleRemoveConnection(confirmRemovalId)}
                                    className="w-full py-4 bg-rose-600 text-white font-black rounded-2xl shadow-lg shadow-rose-100 hover:bg-rose-700 active:scale-95 transition-all"
                                >
                                    Yes, Remove Teacher
                                </button>
                                <button
                                    onClick={() => setConfirmRemovalId(null)}
                                    className="w-full py-4 bg-slate-50 text-slate-400 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase text-xs tracking-widest"
                                >
                                    Actually, keep them
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
// --- END OF SECTION: src/CollaborationView.tsx ---