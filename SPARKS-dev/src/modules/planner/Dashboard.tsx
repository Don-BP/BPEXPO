// --- START OF SECTION: src/Dashboard.tsx ---
import React, { useState, useEffect } from 'react';
import { getAltUpdates } from './api';
import {
  Plus,
  BookOpen,
  Star,
  CalendarDays,
  TrendingUp,
  Calendar,
  ChevronRight,
  History,
  FileText,
  Sparkles,
  PenTool,
  ClipboardCheck,
  Zap,
  Bell
} from 'lucide-react';
import { SavedItem, LessonPlan, UserProfile } from './types';
import { getConsolidatedRating, getConsolidatedEngagement } from './utils';

export const Dashboard = ({
  history,
  favorites,
  onLoadPlan,
  onNavigate,
  profile
}: {
  history: SavedItem[],
  favorites: SavedItem[],
  onLoadPlan: (plan: LessonPlan) => void,
  onNavigate: (mode: "AI" | "MANUAL") => void,
  profile: UserProfile
}) => {
  const [activeTab, setActiveTab] = useState<"RECENT" | "FAVORITES" | "UPDATES">("RECENT");
  const [updates, setUpdates] = useState<{ plan: LessonPlan, unreadCount: number }[]>([]);

  useEffect(() => {
    getAltUpdates().then(data => {
      setUpdates(data.updates);
    });
  }, [profile.role]); // Fetch on mount and if role changes

  const totalUnread = updates.reduce((acc, curr) => acc + curr.unreadCount, 0);

  // --- START: Dynamic Stats Calculation ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = history.filter(item => {
    const dateStr = item?.data?.meta?.date;
    if (dateStr) {
      // Handle YYYY-MM-DD or ISO strings
      const lessonDate = new Date(dateStr);
      return lessonDate >= today;
    }
    return false;
  })
    .sort((a, b) => new Date(a.data.meta.date).getTime() - new Date(b.data.meta.date).getTime())
    .slice(0, 3);

  const reflectedItems = history
    .filter(h => h.data?.reflection || h.data?.teacher2Reflection)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Newest first

  const recentRefs = reflectedItems.slice(0, 5); // Get latest 5 reflected lessons

  const engagementCounts = reflectedItems.reduce((acc, curr) => {
    const e = getConsolidatedEngagement(curr.data);
    acc[e] = (acc[e] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  let engagementSummary = "No Data";
  if (recentRefs.length > 0) {
    const high = engagementCounts['High'] || 0;
    const low = engagementCounts['Low'] || 0;
    if (high >= recentRefs.length * 0.6) engagementSummary = "High";
    else if (low >= recentRefs.length * 0.4) engagementSummary = "Low";
    else engagementSummary = "Medium";
  }
  // --- END: Dynamic Stats Calculation ---

  const displayList = activeTab === "RECENT"
    ? history.slice(0, 5)
    : activeTab === "FAVORITES"
      ? favorites
      : updates.map(u => ({
        id: u.plan.id || "0",
        label: u.plan.title,
        timestamp: u.plan.updatedAt || "",
        data: u.plan,
        unreadCount: u.unreadCount
      } as any));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Section - SHORTER & HORIZONTAL LAYOUT */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-400 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left: Welcome Text */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">
              Good Morning, {profile.display_name || "Teacher"}!
            </h1>
            <p className="text-indigo-100 text-sm">
              {upcoming.length} upcoming lessons • {favorites.length} favorites saved
            </p>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={() => onNavigate("AI")}
              className="bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all flex items-center gap-2"
            >
              <div className="bg-indigo-100 p-1.5 rounded-lg">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-left">
                <div className="text-xs uppercase text-indigo-500 font-extrabold tracking-wider">Launch</div>
                <div className="text-sm font-bold">Sparkii Assistant</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate("MANUAL")}
              className="bg-indigo-700 text-indigo-100 border border-indigo-500/30 px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-800 hover:scale-105 transition-all flex items-center gap-2"
            >
              <div className="bg-indigo-800 p-1.5 rounded-lg">
                <PenTool className="w-4 h-4 text-indigo-300" />
              </div>
              <div className="text-left">
                <div className="text-xs uppercase text-indigo-300/70 font-extrabold tracking-wider">Open</div>
                <div className="text-sm font-bold">Build Plan</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:border-indigo-200 transition-colors">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full"><BookOpen className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Total Plans</p>
            <p className="text-2xl font-bold text-slate-800">{history.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:border-yellow-200 transition-colors">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full"><Star className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Favorites</p>
            <p className="text-2xl font-bold text-slate-800">{favorites.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:border-purple-200 transition-colors">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><CalendarDays className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Upcoming</p>
            <p className="text-2xl font-bold text-slate-800">{upcoming.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:border-rose-200 transition-colors">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-full"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Engagement</p>
            <p className="text-2xl font-bold text-slate-800">{engagementSummary}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Lessons */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" /> Upcoming Lessons
            </h3>
          </div>
          <div className="space-y-3">
            {upcoming.length > 0 ? upcoming.map(item => (
              <div key={item.id} onClick={() => onLoadPlan(item.data)} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all cursor-pointer group">
                <div className="bg-white p-2 rounded border border-slate-200 font-mono text-xs text-center min-w-[3rem]">
                  <div className="text-indigo-600 font-bold">{new Date(item.data.meta.date).getDate()}</div>
                  <div className="text-slate-400 text-[10px]">{new Date(item.data.meta.date).toLocaleString('default', { month: 'short' })}</div>
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-slate-700 text-sm">{item.label}</h4>
                  <p className="text-xs text-slate-500">{item.data?.meta?.school || "Unknown School"} • {item.data?.meta?.teacher2 || ""}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
              </div>
            )) : (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No upcoming lessons found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent & Favorites (Consolidated) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-4 border-b border-slate-100">
            <button
              onClick={() => setActiveTab("RECENT")}
              className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${activeTab === "RECENT" ? "text-slate-800 border-teal-500" : "text-slate-400 border-transparent hover:text-slate-600"}`}
            >
              <History className="w-4 h-4" /> Recent
            </button>
            <button
              onClick={() => setActiveTab("FAVORITES")}
              className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${activeTab === "FAVORITES" ? "text-slate-800 border-yellow-500" : "text-slate-400 border-transparent hover:text-slate-600"}`}
            >
              <Star className="w-4 h-4" /> Favorites
            </button>
            <button
              onClick={() => setActiveTab("UPDATES")}
              className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 relative ${activeTab === "UPDATES" ? "text-slate-800 border-indigo-500" : "text-slate-400 border-transparent hover:text-slate-600"}`}
            >
              <Zap className="w-4 h-4" /> Updates
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {totalUnread}
                </span>
              )}
            </button>
          </div>

          <div className="space-y-3 flex-grow overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
            {displayList.map(item => (
              <div key={item.id} onClick={() => onLoadPlan(item.data)} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all group">
                <div className="flex items-center gap-3">
                  {/* CHANGED: Use ClipboardCheck for reflected lessons to distinguish from Favorites */}
                  <div className={`p-2 rounded-lg ${getConsolidatedRating(item.data) > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'}`}>
                    {getConsolidatedRating(item.data) > 0 ? <ClipboardCheck className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      {item.label}
                      {/* CHANGED: Use consolidated rating */}
                      {getConsolidatedRating(item.data) > 0 && (
                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 rounded-full font-bold">
                          {getConsolidatedRating(item.data).toFixed(1)} ★
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {activeTab === "RECENT"
                        ? `Edited ${new Date(item.timestamp).toLocaleDateString()}`
                        : activeTab === "FAVORITES"
                          ? `Saved ${new Date(item.timestamp).toLocaleDateString()}`
                          : "New Memos Added"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeTab === "UPDATES" && item.unreadCount > 0 && (
                    <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                      {item.unreadCount} New
                    </span>
                  )}
                  <span className="text-xs text-teal-600 font-medium opacity-0 group-hover:opacity-100">Open</span>
                </div>
              </div>
            ))}
            {displayList.length === 0 && (
              <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                {activeTab === "RECENT" ? <History className="w-12 h-12 mb-2 opacity-20" /> : activeTab === "FAVORITES" ? <Star className="w-12 h-12 mb-2 opacity-20" /> : <Bell className="w-12 h-12 mb-2 opacity-20" />}
                <p>
                  {activeTab === "RECENT"
                    ? "No recent plans."
                    : activeTab === "FAVORITES"
                      ? "No favorites saved yet."
                      : "No new activity from JTEs."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
// --- END OF SECTION: src/Dashboard.tsx ---