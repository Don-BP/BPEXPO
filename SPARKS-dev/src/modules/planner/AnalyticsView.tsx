
import React from 'react';
import { TrendingUp, BarChart2, Star, Smile, Frown, Meh, Calendar } from 'lucide-react';
import { SavedItem } from './types';
import { getConsolidatedRating, getConsolidatedEngagement } from './utils';

export const AnalyticsView = ({ history }: { history: SavedItem[] }) => {
   // Filter only items with any reflection data
   const reflectedItems = history
      .filter(item => item.data.reflection || item.data.teacher2Reflection)
      .reverse(); // Oldest first for chart

   if (reflectedItems.length === 0) {
      return (
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center animate-in fade-in">
            <BarChart2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Data Yet</h3>
            <p className="text-slate-500 max-w-md mx-auto">
               Complete "Reflections" after your lessons to see analytics and improvement trends here.
            </p>
         </div>
      );
   }

   // Calculate Stats
   const total = reflectedItems.length;
   const avgRating = (reflectedItems.reduce((acc, curr) => acc + getConsolidatedRating(curr.data), 0) / total).toFixed(1);

   const engagementCounts = reflectedItems.reduce((acc, curr) => {
      const e = getConsolidatedEngagement(curr.data);
      acc[e] = (acc[e] || 0) + 1;
      return acc;
   }, {} as Record<string, number>);

   const last5 = reflectedItems.slice(-5);

   return (
      <div className="space-y-6 animate-in fade-in">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Key Metrics */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
               <div className="p-4 bg-yellow-100 text-yellow-600 rounded-full">
                  <Star className="w-8 h-8 fill-current" />
               </div>
               <div>
                  <div className="text-sm font-bold text-slate-400 uppercase">Avg Rating</div>
                  <div className="text-3xl font-bold text-slate-800">{avgRating}<span className="text-sm text-slate-400 ml-1">/ 5.0</span></div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
               <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full">
                  <TrendingUp className="w-8 h-8" />
               </div>
               <div>
                  <div className="text-sm font-bold text-slate-400 uppercase">Tracked Lessons</div>
                  <div className="text-3xl font-bold text-slate-800">{total}</div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-bold text-slate-400 uppercase">Engagement Breakdown</div>
                  <div className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Student Response</div>
               </div>
               <p className="text-[10px] text-slate-400 mb-4 leading-tight italic">
                  Shows how often students respond with High, Medium, or Low energy across all reflected lessons.
               </p>
               <div className="flex gap-2 items-end h-16">
                  {/* Engagement Bars - Added justify-end and removed redundant h-full from percentage wrappers */}
                  <div className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                     <div className="w-full bg-emerald-100 rounded-t relative group" style={{ height: `${((engagementCounts['High'] || 0) / total) * 100}%`, minHeight: '4px' }}>
                        <div className="absolute bottom-0 w-full bg-emerald-400 rounded-t" style={{ height: '100%' }}></div>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 transition-opacity">
                           {engagementCounts['High'] || 0} Lessons
                        </div>
                     </div>
                     <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Smile className="w-3 h-3" /> High</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                     <div className="w-full bg-amber-100 rounded-t relative group" style={{ height: `${((engagementCounts['Medium'] || 0) / total) * 100}%`, minHeight: '4px' }}>
                        <div className="absolute bottom-0 w-full bg-amber-400 rounded-t" style={{ height: '100%' }}></div>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 transition-opacity">
                           {engagementCounts['Medium'] || 0} Lessons
                        </div>
                     </div>
                     <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Meh className="w-3 h-3" /> Med</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                     <div className="w-full bg-rose-100 rounded-t relative group" style={{ height: `${((engagementCounts['Low'] || 0) / total) * 100}%`, minHeight: '4px' }}>
                        <div className="absolute bottom-0 w-full bg-rose-400 rounded-t" style={{ height: '100%' }}></div>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 transition-opacity">
                           {engagementCounts['Low'] || 0} Lessons
                        </div>
                     </div>
                     <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Frown className="w-3 h-3" /> Low</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Ratings Trend */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
               <BarChart2 className="w-5 h-5 text-indigo-500" /> Recent Performance Trend
            </h3>
            {/* Bars Area */}
            <div className="flex items-end gap-4 h-48 border-b border-slate-200 pb-2 px-2">
               {last5.map((item, i) => {
                  const r = getConsolidatedRating(item.data);
                  return (
                     <div key={i} className="flex-1 flex flex-col items-center justify-end relative h-full group cursor-pointer">
                        <div
                           className={`w-full max-w-[40px] rounded-t-lg transition-all ${r >= 4 ? 'bg-teal-400 group-hover:bg-teal-500' : r >= 3 ? 'bg-indigo-400 group-hover:bg-indigo-500' : 'bg-rose-400 group-hover:bg-rose-500'}`}
                           style={{ height: `${(r / 5) * 100}%` }}
                        >
                           <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                              {r.toFixed(1)} Stars - {new Date(item.timestamp).toLocaleDateString()}
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
            {/* Labels Area - separated to ensure bars scale correctly against parent h-48 */}
            <div className="flex gap-4 px-2 mt-2">
               {last5.map((item, i) => (
                  <span key={i} className="flex-1 text-[10px] font-bold uppercase tracking-tight text-slate-400 truncate text-center">
                     {item.label}
                  </span>
               ))}
            </div>
         </div>

         {/* Improvement Notes */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Notes for Next Time</h3>
            <div className="space-y-4">
               {reflectedItems.slice(0, 5).map((item, i) => (
                  item.data.reflection?.nextTimeAdjustments && (
                     <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex-shrink-0 w-12 text-center">
                           <div className="text-xs font-bold text-slate-500 uppercase">{new Date(item.timestamp).toLocaleString('default', { month: 'short' })}</div>
                           <div className="text-lg font-bold text-slate-800">{new Date(item.timestamp).getDate()}</div>
                        </div>
                        <div>
                           <div className="font-bold text-slate-700 text-sm mb-1">{item.label}</div>
                           <p className="text-sm text-slate-600 italic">"{item.data.reflection.nextTimeAdjustments}"</p>
                        </div>
                     </div>
                  )
               ))}
            </div>
         </div>
      </div>
   );
};
