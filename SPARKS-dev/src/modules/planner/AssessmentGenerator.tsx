// --- START OF SECTION: src/AssessmentGenerator.tsx ---
import React, { useState } from 'react';
import { ClipboardCheck, Sparkles, Printer, FileText, Plus, X, RotateCcw } from 'lucide-react';
import { GRADES } from './constants';
import { generateRubric } from './api';

export const AssessmentGenerator = () => {
   const [grade, setGrade] = useState(GRADES.Elementary[4]);
   const [target, setTarget] = useState("");
   const [activityType, setActivityType] = useState("Speaking Interaction");

   // Default criteria list
   const DEFAULT_CRITERIA = ["Attitude/Participation", "Communication/Expression", "Understanding/Accuracy"];
   const [criteriaList, setCriteriaList] = useState<string[]>(DEFAULT_CRITERIA);
   const [newCriterion, setNewCriterion] = useState("");

   const [rubric, setRubric] = useState<{ criteria: string, levels: { a: string, b: string, c: string } }[] | null>(null);
   const [loading, setLoading] = useState(false);

   const handleGenerate = async () => {
      if (!target) return;
      setLoading(true);
      const result = await generateRubric(grade, target, activityType, criteriaList);
      if (result) setRubric(result);
      setLoading(false);
   };

   const addCriterion = () => {
      if (newCriterion.trim()) {
         setCriteriaList([...criteriaList, newCriterion.trim()]);
         setNewCriterion("");
      }
   };

   const removeCriterion = (index: number) => {
      setCriteriaList(criteriaList.filter((_, i) => i !== index));
   };

   const resetCriteria = () => {
      setCriteriaList(DEFAULT_CRITERIA);
   };

   return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
         <div className="bg-indigo-50 border-b border-indigo-100 p-6">
            <h2 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
               <ClipboardCheck className="w-6 h-6 text-indigo-500" /> Assessment Generator
            </h2>
            <p className="text-indigo-700 text-sm mt-1">
               Create quick, MEXT-aligned rubrics for observing student performance during activities.
            </p>
         </div>

         <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4 print:hidden">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Grade</label>
                  <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                     {GRADES.Elementary.map((g: string) => <option key={g} value={g}>{g}</option>)}
                     {GRADES.JuniorHigh.map((g: string) => <option key={g} value={g}>{g}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Activity Type</label>
                  <select value={activityType} onChange={e => setActivityType(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                     <option>Speaking Interaction (Pair Work)</option>
                     <option>Speaking Presentation (Speech)</option>
                     <option>Listening Comprehension</option>
                     <option>Writing (Short Essay/Sentences)</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Language / Topic</label>
                  <textarea
                     value={target}
                     onChange={e => setTarget(e.target.value)}
                     placeholder="e.g. Can you...? / Animals"
                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm h-24"
                  />
               </div>

               {/* Custom Criteria Section */}
               <div className="border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-center mb-2">
                     <label className="block text-xs font-bold text-slate-500 uppercase">Rubric Categories</label>
                     <button onClick={resetCriteria} className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" /> Reset
                     </button>
                  </div>
                  <div className="space-y-2 mb-3">
                     {criteriaList.map((c, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded border border-slate-200 text-sm">
                           <span className="truncate">{c}</span>
                           <button onClick={() => removeCriterion(i)} className="text-slate-400 hover:text-red-500">
                              <X className="w-4 h-4" />
                           </button>
                        </div>
                     ))}
                  </div>
                  <div className="flex gap-2">
                     <input
                        type="text"
                        value={newCriterion}
                        onChange={e => setNewCriterion(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCriterion()}
                        placeholder="Add category (e.g. Eye Contact)"
                        className="flex-grow p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                     />
                     <button onClick={addCriterion} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300">
                        <Plus className="w-5 h-5" />
                     </button>
                  </div>
               </div>

               <button
                  onClick={handleGenerate}
                  disabled={loading || !target || criteriaList.length === 0}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
               >
                  {loading ? "Generating..." : <><Sparkles className="w-4 h-4" /> Create Rubric</>}
               </button>
            </div>

            <div className="lg:col-span-2">
               {rubric ? (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden print:border-none print:w-full">
                     <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center print:hidden">
                        <h3 className="font-bold text-slate-700">Preview</h3>
                        <button onClick={() => window.print()} className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 font-bold">
                           <Printer className="w-4 h-4" /> Print
                        </button>
                     </div>

                     <div className="p-8 print:p-0">
                        <div className="mb-6 text-center border-b-2 border-slate-800 pb-4">
                           <h2 className="text-2xl font-bold uppercase tracking-widest mb-1">Observation Checklist</h2>
                           <p className="text-slate-600">{grade} • {activityType}</p>
                           <p className="text-slate-500 text-sm mt-1">Target: {target}</p>
                        </div>

                        <div className="space-y-6 mb-8">
                           {rubric.map((item, i) => (
                              <div key={i} className="break-inside-avoid">
                                 <h4 className="font-bold text-lg text-slate-800 mb-2 border-l-4 border-indigo-500 pl-3">{item.criteria}</h4>
                                 <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded print:bg-white print:border-slate-300">
                                       <div className="font-bold text-emerald-800 mb-1 print:text-black">Level A (Excellent)</div>
                                       <p className="text-emerald-900 leading-relaxed print:text-black">{item.levels.a}</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 border border-blue-100 rounded print:bg-white print:border-slate-300">
                                       <div className="font-bold text-blue-800 mb-1 print:text-black">Level B (Good)</div>
                                       <p className="text-blue-900 leading-relaxed print:text-black">{item.levels.b}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded print:bg-white print:border-slate-300">
                                       <div className="font-bold text-slate-600 mb-1 print:text-black">Level C (Developing)</div>
                                       <p className="text-slate-700 leading-relaxed print:text-black">{item.levels.c}</p>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-200 print:mt-4">
                           <h4 className="font-bold text-slate-500 uppercase text-xs mb-2">Class Roster</h4>
                           <table className="w-full text-xs border-collapse border border-slate-300">
                              <thead>
                                 <tr className="bg-slate-100 print:bg-white">
                                    <th className="border border-slate-300 p-2 text-left w-32">Student Name</th>
                                    {rubric.map((r, i) => (
                                       <th key={i} className="border border-slate-300 p-2 text-center w-16">
                                          {r.criteria.split('/')[0].split(' ')[0]} {/* Shorten label */}
                                       </th>
                                    ))}
                                    <th className="border border-slate-300 p-2 text-left">Notes</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {[...Array(20)].map((_, rowIdx) => (
                                    <tr key={rowIdx}>
                                       <td className="border border-slate-300 p-2 h-8"></td>
                                       {rubric.map((_, colIdx) => (
                                          <td key={colIdx} className="border border-slate-300 p-2 text-center text-slate-300">A / B / C</td>
                                       ))}
                                       <td className="border border-slate-300 p-2"></td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl min-h-[400px]">
                     <FileText className="w-16 h-16 mb-4 opacity-20" />
                     <p>Customize categories and click generate to create a rubric.</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};
// --- END OF SECTION: src/AssessmentGenerator.tsx ---