// --- START OF FILE: src/UchiawaseView.tsx ---
import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Calendar,
  ClipboardList,
  Send,
  Link as LinkIcon,
  X
} from 'lucide-react';
import { LessonPlan, ChatMessage } from './types';
import { safeParseArray } from './utils';
import { useAuth } from '../../context/AuthContext';

// Local safe parse helpers removed in favor of utils.ts versions

export const UchiawaseView = ({ plan }: { plan: LessonPlan }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const justSent = useRef(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Helper to handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    setIsNearBottom(isAtBottom);
  };

  const safeUchiawasePoints = safeParseArray(plan.uchiawase_points);
  const safeSections = safeParseArray(plan.sections);

  // --- START OF SECTION: Chat Sync & Send Logic ---
  const { user } = useAuth();
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Load chat messages from Supabase with polling
  useEffect(() => {
    const planId = (plan as any).id;
    if (!planId) return;

    if (isInitialLoad.current) {
      setLoading(true);
    }

    const fetchMessages = async () => {
      const { supabase } = await import('../../lib/supabase');
      const { data, error } = await supabase
        .from('plan_chats')
        .select('*')
        .eq('plan_id', String(planId))
        .order('timestamp', { ascending: true });

      if (error) {
        console.error("Chat sync failed:", error);
        setLoading(false);
        isInitialLoad.current = false;
        return;
      }

      const chats = data || [];
      const mappedChats: ChatMessage[] = chats.map((c: any) => ({
        id: String(c.id),
        text: c.text,
        link: c.link,
        sender: c.sender_id === user?.id ? 'me' : 'partner',
        timestamp: c.timestamp
      }));

      setMessages(mappedChats);
      setLoading(false);
      isInitialLoad.current = false;
    };

    fetchMessages();
    pollIntervalRef.current = setInterval(fetchMessages, 10000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [plan, user?.id]);
  // Dependency on user.id ensures we re-map 'me' vs 'partner' if auth changes

  // 3. Smart Auto-scroll to bottom
  useEffect(() => {
    if (isInitialLoad.current || isNearBottom || justSent.current) {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: isInitialLoad.current ? 'auto' : 'smooth'
        });
      }
      justSent.current = false;
    }
  }, [messages]);

  // --- START OF SECTION: Sync Helpers and Chat Logic ---

  // 4. Send Message to Database (Firestore Array Union)
  const handleSend = async (msgData: { text?: string, link?: { url: string, label: string } }) => {
    const messageContent = msgData.text || "";
    if (!messageContent.trim() && !msgData.link) return;

    const planId = (plan as any).id;
    if (!planId) {
      alert("This lesson plan needs to be saved to the cloud before you can use chat.");
      return;
    }

    if (!user) {
      alert("You must be logged in to chat.");
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      sender: 'me',
      timestamp: new Date().toISOString(),
      text: msgData.text,
      link: msgData.link
    };

    // Optimistic UI Update
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setLinkUrl("");
    setLinkLabel("");
    setShowLinkInput(false);
    setSending(true);
    justSent.current = true;

    try {
      const { supabase } = await import('../../lib/supabase');

      const chatPayload = {
        plan_id: String(planId),
        text: msgData.text ?? null,
        link: msgData.link ?? null,
        sender_id: user.id,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase.from('plan_chats').insert(chatPayload);
      if (error) throw error;

      // Refresh messages after send
      const { data } = await supabase
        .from('plan_chats')
        .select('*')
        .eq('plan_id', String(planId))
        .order('timestamp', { ascending: true });

      if (data) {
        setMessages(data.map((c: any) => ({
          id: String(c.id),
          text: c.text,
          link: c.link,
          sender: c.sender_id === user.id ? 'me' : 'partner',
          timestamp: c.timestamp
        })));
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // --- END OF SECTION ---

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in min-h-[600px] flex flex-col">
      <div className="bg-slate-800 text-white p-6 flex-shrink-0">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-teal-400" /> Uchiawase Notes
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Review these points with {plan.meta?.teacher2 || "the other teacher"} before class.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row flex-grow min-h-0">
        {/* LEFT: Content */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-8 border-r border-slate-100 min-h-0">
          {plan.uchiawase_schedule?.scheduled && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 md:gap-6">
              <div>
                <h4 className="text-xs font-black text-teal-700 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Scheduled Meeting
                </h4>
                <p className="text-lg font-black text-slate-800">
                  {plan.uchiawase_schedule.date || "Date TBD"} @ {plan.uchiawase_schedule.time || "Time TBD"}
                </p>
              </div>
              {plan.uchiawase_schedule.notes && (
                <div className="flex-grow">
                  <h4 className="text-xs font-black text-teal-700 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <ClipboardList className="w-3 h-3" /> Agenda/Notes
                  </h4>
                  <p className="text-sm text-slate-700 font-medium">{plan.uchiawase_schedule.notes}</p>
                </div>
              )}
            </div>
          )}

          <div>
            <h3 className="font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2 uppercase tracking-tight">
              <CheckCircle2 className="w-5 h-5 text-teal-600" /> Confirmation Points
            </h3>
            <ul className="space-y-3">
              {safeUchiawasePoints.length > 0 ? safeUchiawasePoints.map((point, i) => (
                <li key={i} className="flex gap-3 items-start text-slate-700 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                  <span className="bg-teal-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg mt-0.5">{i + 1}</span>
                  <span className="font-medium text-sm leading-relaxed">{point}</span>
                </li>
              )) : (
                <li className="text-slate-400 italic p-4 text-center">No confirmation points listed.</li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2 uppercase tracking-tight">
              <Clock className="w-5 h-5 text-indigo-600" /> Timeline & Roles
            </h3>
            <div className="space-y-3">
              {safeSections.length > 0 ? safeSections.map((s: any, i: number) => (
                <div key={i} className="flex flex-col md:flex-row md:items-start justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 flex-shrink-0 md:mt-1.5">
                    <div className="bg-slate-800 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                      {s.time} min
                    </div>
                    <span className="font-black text-slate-800 tracking-tight">{s.phase}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full md:flex-1">
                    <div className="px-3 py-2 bg-indigo-50/50 border border-indigo-100/50 rounded-lg text-xs">
                      <span className="text-[9px] font-black text-indigo-400 uppercase block mb-0.5">ALT</span>
                      <span className="text-indigo-900 font-bold break-words">{s.altRole}</span>
                    </div>
                    <div className="px-3 py-2 bg-teal-50/50 border border-teal-100/50 rounded-lg text-xs">
                      <span className="text-[9px] font-black text-teal-400 uppercase block mb-0.5">Teacher 2</span>
                      <span className="text-teal-900 font-bold break-words">{s.teacher2Role}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-slate-400 italic p-4 text-center">No timeline sections found.</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Chat Interface */}
        <div className="w-full lg:w-96 flex flex-col bg-slate-50 border-l border-slate-200 h-[500px] lg:h-auto min-h-0 flex-shrink-0">
          <div className="p-4 border-b border-slate-200 bg-white shadow-sm">
            <h3 className="font-bold text-slate-700 text-sm">Meeting Chat</h3>
            <p className="text-xs text-slate-400">Real-time discussion</p>
          </div>

          {/* Messages Area */}
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-grow p-4 overflow-y-auto space-y-4"
          >
            {loading ? (
              <div className="text-center text-slate-400 text-sm mt-10">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-slate-400 text-sm mt-10">
                <p>No messages yet.</p>
                <p className="text-xs">Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-end gap-2 ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar for Partner */}
                    {msg.sender === 'partner' && (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center mb-1">
                        {(() => {
                          // Try to find custom avatar for partner
                          const jteOverridesRaw = localStorage.getItem('alt_jte_display_overrides');
                          const altOverridesRaw = localStorage.getItem('jte_alt_display_overrides');

                          let customAvatar = null;
                          try {
                            if (jteOverridesRaw && plan.teacher_id) {
                              const overrides = JSON.parse(jteOverridesRaw);
                              customAvatar = overrides[plan.teacher_id]?.avatarUrl;
                            }
                            if (!customAvatar && altOverridesRaw) {
                              const overrides = JSON.parse(altOverridesRaw);
                              const planAltName = plan.meta.alt;
                              const altOverride = Object.values(overrides).find((o: any) => o.displayName === planAltName);
                              if (altOverride) customAvatar = (altOverride as any).avatarUrl;
                            }
                          } catch (e) { }

                          return customAvatar ? (
                            <img src={customAvatar} alt="Partner" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-[10px] font-bold text-slate-400">
                              {plan.meta.alt?.charAt(0) || 'P'}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'me'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                      }`}>
                      {msg.text && <p>{msg.text}</p>}
                      {msg.link && (
                        <a href={msg.link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline font-bold mt-1 text-inherit">
                          <LinkIcon className="w-3 h-3" /> {msg.link.label}
                        </a>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200">
            {showLinkInput ? (
              <div className="flex flex-col gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 mb-2 animate-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Attach Link</span>
                  <button onClick={() => setShowLinkInput(false)}>
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <input type="text" placeholder="Paste URL..." value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="p-2 border rounded text-sm" autoFocus />
                <input type="text" placeholder="Label (optional)" value={linkLabel} onChange={e => setLinkLabel(e.target.value)} className="p-2 border rounded text-sm" />
                <button onClick={() => handleSend({ link: { url: linkUrl, label: linkLabel || linkUrl } })} className="bg-indigo-600 text-white p-2 rounded text-sm font-bold">
                  Send Link
                </button>
              </div>
            ) : (
              <div className="relative flex items-center gap-2">
                <button onClick={() => setShowLinkInput(true)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                  <LinkIcon className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !sending && input.trim() && handleSend({ text: input })}
                  placeholder="Type a message..."
                  className="flex-grow py-2 px-4 border border-slate-300 rounded-full focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  disabled={sending}
                />
                <button
                  onClick={() => input.trim() && handleSend({ text: input })}
                  disabled={!input.trim() || sending}
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
            <div className="text-[10px] text-slate-400 text-center mt-2">
              Messages older than 6 months are automatically deleted.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// --- END OF FILE: src/UchiawaseView.tsx ---