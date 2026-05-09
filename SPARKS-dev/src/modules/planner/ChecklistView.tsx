// --- START OF FILE: src/ChecklistView.tsx ---
import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Plus, Trash2 } from 'lucide-react';
import { LessonPlan } from './types';
import { safeParseArray } from './utils';

// Local safe parse helpers removed in favor of utils.ts versions

export const ChecklistView = ({ plan, onUpdate, readOnly }: { plan: LessonPlan, onUpdate: (items: string[]) => void, readOnly?: boolean }) => {
   const [items, setItems] = useState<string[]>([]);
   const [newItem, setNewItem] = useState("");

   // Safely load items on mount
   useEffect(() => {
      // If checklist exists (and is string/array), parse it.
      // If not, default to uchiawase_points as a base if checklist is empty
      const checklistData = safeParseArray(plan.checklist);
      if (checklistData.length > 0) {
         setItems(checklistData);
      } else {
         // Fallback to uchiawase points if available
         setItems(safeParseArray(plan.uchiawase_points));
      }
   }, [plan]);

   const toggleItem = (index: number) => {
      // In a real app, you might track "checked" state separately. 
      // For now, this is just a list viewer editor.
      // If you want checkbox functionality, you'd need a state for checked indices.
   };

   const addItem = () => {
      if (!newItem.trim()) return;
      const updated = [...items, newItem];
      setItems(updated);
      onUpdate(updated);
      setNewItem("");
   };

   const removeItem = (index: number) => {
      const updated = items.filter((_, i) => i !== index);
      setItems(updated);
      onUpdate(updated);
   };

   return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
         <div className="bg-slate-800 text-white p-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
               <CheckSquare className="w-6 h-6 text-teal-400" /> Preparation Checklist
            </h2>
            <p className="text-slate-400 text-sm mt-1">Materials and tasks to prepare before class.</p>
         </div>

         <div className="p-6">
            <div className="space-y-2 mb-6">
               {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                     <Square className="w-5 h-5 text-slate-300" />
                     <span className="flex-grow text-slate-700 font-medium">{item}</span>
                     {!readOnly && (
                        <button onClick={() => removeItem(i)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     )}
                  </div>
               ))}
               {items.length === 0 && (
                  <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
                     No items yet. Add tasks below.
                  </div>
               )}
            </div>

            {!readOnly && (
               <div className="flex flex-col sm:flex-row gap-3">
                  <input
                     type="text"
                     value={newItem}
                     onChange={(e) => setNewItem(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && addItem()}
                     placeholder="Add new task..."
                     className="flex-grow p-4 md:p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
                  />
                  <button onClick={addItem} className="bg-teal-600 text-white px-6 py-4 md:py-2 rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                     <Plus className="w-5 h-5" /> Add
                  </button>
               </div>
            )}
         </div>
      </div>
   );
};
// --- END OF FILE: src/ChecklistView.tsx ---