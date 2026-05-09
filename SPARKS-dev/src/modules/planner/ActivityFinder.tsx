// ActivityFinder.tsx

import React, { useState } from 'react';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { ActivityIdea } from './types';
import { COMMON_ALT_GAMES, GRADES, ACTIVITY_SKILLS, ACTIVITY_TYPES } from './constants';
import { ActivityIdeaCard } from './ActivityIdeaCard';
import { ActivityEmptyState } from './ActivityEmptyState';
import { generateActivityIdeas } from './api';

export const ActivityFinder = () => {
  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All Grades");
  const [selectedSkill, setSelectedSkill] = useState("All Skills");
  const [selectedType, setSelectedType] = useState("All Types");

  const [generatedIdeas, setGeneratedIdeas] = useState<ActivityIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Merge static games with generated ones
  const allActivities = [...COMMON_ALT_GAMES, ...generatedIdeas];

  const filteredActivities = allActivities.filter(a => {
    // FIX: Added (t: string) type definition
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.tags && a.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase())));

    const matchesGrade = selectedGrade === "All Grades" ||
      (a.recommended_grades && a.recommended_grades.includes(selectedGrade));

    const matchesSkill = selectedSkill === "All Skills" || a.skill.includes(selectedSkill);
    const matchesType = selectedType === "All Types" || a.type === selectedType;

    return matchesSearch && matchesGrade && matchesSkill && matchesType;
  });

  const handleGenerate = async () => {
    if (selectedGrade === "All Grades" || selectedSkill === "All Skills") {
      alert("Please select a specific Grade and Skill to generate targeted ideas.");
      return;
    }

    setIsGenerating(true);
    // Determine level based on grade string
    const level = selectedGrade.includes("Year") ? "Junior High" : "Elementary";

    const newIdeas = await generateActivityIdeas(level, selectedGrade, selectedSkill, selectedType, 35);

    if (newIdeas) {
      setGeneratedIdeas(prev => [...newIdeas, ...prev]);
    }
    setIsGenerating(false);
  };

  const toggleFavorite = (activity: ActivityIdea) => {
    const next = new Set(favorites);
    if (next.has(activity.name)) next.delete(activity.name);
    else next.add(activity.name);
    setFavorites(next);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Activity Library</h2>
            <p className="text-slate-500">Browse {allActivities.length} games or generate new ones with AI.</p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isGenerating ? "Dreaming..." : "Generate New Ideas"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative col-span-1 md:col-span-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
          >
            <option>All Grades</option>
            {/* FIX: Added (g: string) type definition */}
            {GRADES.Elementary.map((g: string) => <option key={g} value={g}>{g}</option>)}
            {GRADES.JuniorHigh.map((g: string) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
          >
            <option>All Skills</option>
            {/* FIX: Added (s: string) type definition */}
            {ACTIVITY_SKILLS.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
          >
            <option>All Types</option>
            {/* FIX: Added (t: string) type definition */}
            {ACTIVITY_TYPES.map((t: string) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredActivities.map((activity, idx) => (
            <ActivityIdeaCard
              key={`${activity.name}-${idx}`}
              activity={activity}
              onToggleFavorite={toggleFavorite}
              isFavorite={favorites.has(activity.name)}
            />
          ))}
        </div>
      ) : (
        <ActivityEmptyState />
      )}
    </div>
  );
};