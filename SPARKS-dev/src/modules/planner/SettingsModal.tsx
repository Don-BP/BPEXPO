// --- START OF SECTION: src/SettingsModal.tsx ---
import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, AlertTriangle, Loader2, Camera, User } from 'lucide-react';
import { UserProfile, ConnectedTeacher } from './types';

export const SettingsModal = ({
  isOpen,
  onClose,
  profile,
  setProfile
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
}) => {
  const [tempProfile, setTempProfile] = useState(profile);
  const [teacherConnectId, setTeacherConnectId] = useState("");
  const [connectStatus, setConnectStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [connectMsg, setConnectMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTempProfile(prev => ({ ...prev, connected_teachers: profile.connected_teachers }));
    }
  }, [isOpen, profile.connected_teachers]); // Only sync connected_teachers to avoid overwriting typed input in other fields

  const handleSave = () => {
    setProfile(tempProfile);
    localStorage.setItem('brainPowerProfile', JSON.stringify(tempProfile));
    onClose();
  };

  const handleConnectTeacher = async () => {
    if (!teacherConnectId.trim()) return;
    setConnectStatus("loading");
    setConnectMsg("");

    try {
      const mockTeacher = {
        id: teacherConnectId,
        username: `Teacher ${teacherConnectId.slice(-3)}`,
      };

      if (tempProfile.connected_teachers.some(t => String(t.id) === mockTeacher.id)) {
        setConnectStatus("error");
        setConnectMsg("Teacher already connected.");
        return;
      }

      const newTeacher: ConnectedTeacher = {
        id: mockTeacher.id,
        username: mockTeacher.username,
        displayName: mockTeacher.username,
        schoolName: "Unassigned School",
        role: "Teacher",
        email: "",
        employeeId: mockTeacher.id,
      };

      setTempProfile(prev => ({ ...prev, connected_teachers: [...prev.connected_teachers, newTeacher] }));
      setConnectStatus("success");
      setConnectMsg(`Connected to ${mockTeacher.username}!`);
      setTeacherConnectId("");
    } catch (error) {
      setConnectStatus("error");
      setConnectMsg("Connection failed.");
    }
  };

  const removeTeacher = (id: string | number) => {
    setTempProfile(prev => ({ ...prev, connected_teachers: prev.connected_teachers.filter(t => t.id !== id) }));
  };

  const addSpec = (newSpec: string) => {
    if (newSpec.trim()) {
      setTempProfile(prev => ({
        ...prev,
        specializations: [...(prev.specializations || []), newSpec.trim()]
      }));
    }
  };

  const removeSpec = (idx: number) => {
    setTempProfile(prev => ({
      ...prev,
      specializations: (prev.specializations || []).filter((_, i) => i !== idx)
    }));
  };

  const [specInput, setSpecInput] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Profile Settings</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Connected Teachers List (Read Only / Delete) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Connected Teachers</label>
            <div className="space-y-4 max-h-[400px] overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50">
              {tempProfile.connected_teachers.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">No teachers connected.</p>}
              {tempProfile.connected_teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <div className="relative group/avatar">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-slate-100 bg-slate-100 flex items-center justify-center flex-shrink-0">
                      {teacher.avatarUrl ? (
                        <img src={teacher.avatarUrl} alt={teacher.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover/avatar:opacity-100 rounded-lg cursor-pointer transition-opacity">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const base64 = reader.result as string;
                              const updatedTeachers = tempProfile.connected_teachers.map(t =>
                                t.id === teacher.id ? { ...t, avatarUrl: base64 } : t
                              );
                              setTempProfile({ ...tempProfile, connected_teachers: updatedTeachers });

                              const savedOverrides = localStorage.getItem('alt_teacher_display_overrides');
                              let overrides = {};
                              try { overrides = savedOverrides ? JSON.parse(savedOverrides) : {}; } catch (e) { }
                              (overrides as any)[String(teacher.id)] = {
                                ...(overrides as any)[String(teacher.id)],
                                avatarUrl: base64
                              };
                              localStorage.setItem('alt_teacher_display_overrides', JSON.stringify(overrides));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex-grow">
                    <h5 className="text-sm font-bold text-slate-700 leading-tight">{teacher.displayName}</h5>
                    <p className="text-[10px] text-slate-500 uppercase font-medium">{teacher.schoolName}</p>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to remove ${teacher.displayName}?`)) {
                        removeTeacher(teacher.id);
                      }
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">Tap photo icon to personalize. Changes saved to this device only.</p>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Name (ALT)</label>
              <input
                type="text"
                value={tempProfile.display_name ?? ""}
                onChange={e => setTempProfile({ ...tempProfile, display_name: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nationality</label>
              <input
                type="text"
                value={tempProfile.nationality || ""}
                onChange={e => setTempProfile({ ...tempProfile, nationality: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Years in Japan</label>
              <select
                value={tempProfile.experience || "1-3"}
                onChange={e => setTempProfile({ ...tempProfile, experience: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="1-3">1-3 Years</option>
                <option value="4-6">4-6 Years</option>
                <option value="7-9">7-9 Years</option>
                <option value="10+">10+ Years</option>
              </select>
            </div>
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Specializations</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={specInput}
                onChange={e => setSpecInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { addSpec(specInput); setSpecInput(""); } }}
                placeholder="e.g. Grammar"
                className="flex-grow p-2 border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 outline-none text-sm"
              />
              <button onClick={() => { addSpec(specInput); setSpecInput(""); }} className="bg-indigo-600 text-white px-3 rounded font-bold text-sm">+</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(tempProfile.specializations || []).map((spec, i) => (
                <div key={i} className="flex items-center bg-indigo-50 px-2 py-1 rounded text-xs text-indigo-700 border border-indigo-100">
                  <span>{spec}</span>
                  <button onClick={() => removeSpec(i)} className="ml-2 text-indigo-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 mt-auto">
          <button onClick={onClose} className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 shadow-sm">Save Profile</button>
        </div>
      </div>
    </div>
  );
};
// --- END OF SECTION: src/SettingsModal.tsx ---