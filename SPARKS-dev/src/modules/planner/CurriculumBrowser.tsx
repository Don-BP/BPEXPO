
import React, { useState } from 'react';
import { Book, ChevronRight, GraduationCap, Search } from 'lucide-react';
import { TEXTBOOKS, TEXTBOOK_UNITS, GRADES } from './constants';

export const CurriculumBrowser = () => {
  const [level, setLevel] = useState<"Elementary" | "JuniorHigh">("Elementary");
  const [selectedTextbook, setSelectedTextbook] = useState(TEXTBOOKS.Elementary[2]); // Default We Can 1

  const units = TEXTBOOK_UNITS[selectedTextbook] || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
      <div className="bg-slate-50 border-b border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
            <Book className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Curriculum Browser</h2>
            <p className="text-sm text-slate-500">Review targets and topics for any textbook.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">School Level</label>
            <div className="flex bg-white rounded-lg border border-slate-200 p-1">
              <button
                onClick={() => { setLevel("Elementary"); setSelectedTextbook(TEXTBOOKS.Elementary[0]); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${level === "Elementary" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-500 hover:text-slate-700"}`}
              >
                Elementary
              </button>
              <button
                onClick={() => { setLevel("JuniorHigh"); setSelectedTextbook(TEXTBOOKS.JuniorHigh[0]); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${level === "JuniorHigh" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-500 hover:text-slate-700"}`}
              >
                Junior High
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Textbook</label>
            <select
              value={selectedTextbook}
              onChange={(e) => setSelectedTextbook(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TEXTBOOKS[level].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-0">
        {units.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {units.map((unit) => (
              <div key={unit.number} className="p-4 hover:bg-slate-50 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-700 font-bold text-lg">
                    {unit.number}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                      {unit.title}
                    </h3>
                    <div className="mt-1 flex items-start gap-2">
                      <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mt-0.5">Target</span>
                      <p className="text-sm text-slate-600 font-medium">{unit.target}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400">No unit data available for this textbook yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
