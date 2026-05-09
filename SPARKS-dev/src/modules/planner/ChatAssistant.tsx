// --- START OF SECTION: src/ChatAssistant.tsx ---
import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Settings, Calendar, GraduationCap, School, Sparkles, BookOpen, ChevronDown, User } from 'lucide-react';
import { callSecureAi } from './api';
import { ManualPlanState } from './types';
import { TEXTBOOKS, TEXTBOOK_UNITS, GRADES, PEDAGOGICAL_TIPS } from './constants';

export const ChatAssistant = ({
  isOpen,
  onClose,
  onUpdateForm,
  currentForm
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpdateForm: (data: Partial<ManualPlanState>) => void;
  currentForm: ManualPlanState;
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: "Hi! I'm Sparkii, your Lesson Assistant. I can help you brainstorm activities or even fill out the lesson plan form for you. What are you teaching today?" }
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  /* Updated Handle Send to include Student Level in prompt */
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");
    setIsThinking(true);

    // Use Secure Backend Call
    const aiResponse = await callSecureAi(userMsg, "gemini-1.5-flash"); // Flash for speed in chat

    if (!aiResponse) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm out of energy (0 Sparks). Please get more Sparks to continue!" }]);
      setIsThinking(false);
      return;
    }

    try {
      const responseText = aiResponse || "Sorry, I couldn't process that.";

      // Robust regex for JSON extraction (handles standard and markdown-wrapped JSON)
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```\n([\s\S]*?)\n```/);
      let cleanText = responseText;

      if (jsonMatch) {
        try {
          const formData = JSON.parse(jsonMatch[1]);
          onUpdateForm(formData);
          cleanText = responseText.replace(jsonMatch[0], "").trim();
          cleanText += "\n\n(I've updated the form with these details!)";
        } catch (e) {
          console.error("Failed to parse JSON from AI", e);
        }
      }

      setMessages(prev => [...prev, { role: 'model', text: cleanText }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to Sparks AI." }]);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
      <div className="bg-slate-900 p-4 text-white flex justify-between items-center shadow-md relative z-10">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-teal-400" />
          <div>
            <h3 className="font-bold">Sparkii Assistant</h3>
            <p className="text-xs text-slate-400">Powered by SPARKS</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowContext(!showContext)}
            className={`p-2 rounded transition-colors ${showContext ? 'bg-teal-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
            title="Lesson Context"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="hover:bg-slate-800 p-2 rounded text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Lesson Context Panel */}
      {showContext && (
        <div className="bg-white border-b border-slate-200 shadow-inner overflow-y-auto max-h-[70%] animate-in slide-in-from-top duration-300">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2 border-b pb-2">
              <Sparkles className="w-4 h-4 text-teal-500" />
              Lesson Context Guidance
            </div>

            {/* Mode Switch */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => onUpdateForm({ textbook: TEXTBOOKS[currentForm.level][0] })}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${currentForm.textbook ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Standard (Textbook)
              </button>
              <button
                onClick={() => onUpdateForm({ textbook: '', unit: '' })}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${!currentForm.textbook ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Custom Mode
              </button>
            </div>

            {/* School & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <School className="w-3 h-3" /> School
                </label>
                <input
                  type="text"
                  value={currentForm.school}
                  onChange={e => onUpdateForm({ school: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Date
                </label>
                <input
                  type="date"
                  value={currentForm.date}
                  onChange={e => onUpdateForm({ date: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>

            {/* Grade & Level */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> Grade
                </label>
                <select
                  value={currentForm.grade}
                  onChange={e => onUpdateForm({ grade: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                >
                  {GRADES[currentForm.level].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" /> Eng. Level (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={currentForm.studentLevel}
                  onChange={e => onUpdateForm({ studentLevel: parseInt(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>

            {/* Dynamic Content based on Mode */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              {!currentForm.textbook && (
                <div className="p-2 bg-indigo-50 border border-indigo-100 rounded text-[10px] text-indigo-700 font-bold mb-2">
                  Custom Mode: Define your own targets for AI guidance.
                </div>
              )}

              {/* Textbook Selection (Now available in both but emphasized in Standard) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> {currentForm.textbook ? 'Textbook' : 'Textbook (Opt.)'}
                  </label>
                  <select
                    value={currentForm.textbook}
                    onChange={e => onUpdateForm({ textbook: e.target.value, unit: '' })}
                    className="w-full p-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                  >
                    <option value="">None / Manual</option>
                    {TEXTBOOKS[currentForm.level].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <ChevronDown className="w-3 h-3" /> {currentForm.textbook ? 'Unit' : 'Unit (Opt.)'}
                  </label>
                  {currentForm.textbook ? (
                    <select
                      value={currentForm.unit}
                      onChange={e => {
                        const unitName = e.target.value;
                        const unitData = TEXTBOOK_UNITS[currentForm.textbook]?.find(u => u.title === unitName);
                        onUpdateForm({
                          unit: unitName,
                          targetLanguage: unitData?.target || currentForm.targetLanguage,
                          lessonVocabulary: unitData?.vocabulary?.join(', ') || currentForm.lessonVocabulary
                        });
                      }}
                      className="w-full p-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                    >
                      <option value="">Select Unit...</option>
                      {TEXTBOOK_UNITS[currentForm.textbook]?.map(u => (
                        <option key={u.title} value={u.title}>{u.title}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={currentForm.unit}
                      onChange={e => onUpdateForm({ unit: e.target.value })}
                      placeholder="e.g. Greetings"
                      className="w-full p-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Manual Inputs - Always visible in Custom, but still useful in Standard for overrides */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Language Phrases</label>
                  <textarea
                    value={currentForm.targetLanguage}
                    onChange={e => onUpdateForm({ targetLanguage: e.target.value })}
                    placeholder="e.g. My name is... / Nice to meet you."
                    className="w-full p-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-teal-500 outline-none h-16"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vocabulary</label>
                  <textarea
                    value={currentForm.lessonVocabulary}
                    onChange={e => onUpdateForm({ lessonVocabulary: e.target.value })}
                    placeholder="e.g. name, meet, nice"
                    className="w-full p-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-teal-500 outline-none h-16"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowContext(false)}
              className="w-full py-2 bg-slate-800 text-white rounded text-xs font-bold hover:bg-slate-700 transition-colors"
            >
              Apply Context & Chat
            </button>
          </div>
        </div>
      )}

      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${m.role === 'user'
              ? 'bg-teal-600 text-white rounded-br-none'
              : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
              }`}>
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 rounded-bl-none shadow-sm flex gap-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Sparkii for ideas..."
            className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-teal-500 outline-none text-sm shadow-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="absolute right-2 top-2 p-1.5 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
// --- END OF SECTION: src/ChatAssistant.tsx ---