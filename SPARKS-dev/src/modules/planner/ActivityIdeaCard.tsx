
import React from 'react';
import {
  Clock,
  Heart,
  Target,
  CheckSquare,
  GraduationCap,
  Tag
} from 'lucide-react';
import { ActivityIdea } from './types';

export const ActivityIdeaCard: React.FC<{
  activity: ActivityIdea;
  onToggleFavorite: (a: ActivityIdea) => void;
  isFavorite: boolean;
}> = ({
  activity,
  onToggleFavorite,
  isFavorite
}) => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-indigo-300 transition-all group relative h-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">{activity.type}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 text-slate-600 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> {activity.duration}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 leading-tight">{activity.name}</h3>
          </div>
          <button
            onClick={() => onToggleFavorite(activity)}
            className={`p-2 rounded-full transition-colors ${isFavorite ? "text-rose-500 bg-rose-50" : "text-slate-300 hover:bg-slate-50 hover:text-rose-400"}`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>

        <div className="space-y-4 flex-grow">
          <div className="flex gap-4">
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <Target className="w-3 h-3" /> Skill Focus
              </h4>
              <p className="text-sm text-slate-700">{activity.skill}</p>
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <CheckSquare className="w-3 h-3" /> Materials
              </h4>
              <p className="text-sm text-slate-700">{activity.materials || "None"}</p>
            </div>
          </div>

          {activity.recommended_grades && activity.recommended_grades.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> Recommended Grades
              </h4>
              <div className="flex flex-wrap gap-1">
                {activity.recommended_grades.map(g => (
                  <span key={g} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{g}</span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">How to play</h4>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{activity.instructions}</p>
          </div>

          {activity.tags && activity.tags.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
              <Tag className="w-3 h-3 text-slate-400" />
              {activity.tags.map(t => (
                <span key={t} className="text-[10px] text-slate-500 italic">#{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
