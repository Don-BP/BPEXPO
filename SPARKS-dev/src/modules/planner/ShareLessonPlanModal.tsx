// --- START OF FILE: src/ShareLessonPlanModal.tsx ---
import React, { useState, useEffect } from 'react';
import { X, Share2, Users, School, Send, CheckCircle } from 'lucide-react';
import { UserProfile, ConnectedTeacher, LessonPlan } from './types';

interface ShareLessonPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonPlan: LessonPlan;
  profile: UserProfile;
  onShare: (teacherId: number, schoolName: string) => Promise<void>;
}

export const ShareLessonPlanModal = ({
  isOpen,
  onClose,
  lessonPlan,
  profile,
  onShare
}: ShareLessonPlanModalProps) => {
  const [selectedTeacher, setSelectedTeacher] = useState<ConnectedTeacher | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Group teachers by school
  const schools: string[] = Array.from(new Set(profile.connected_teachers.map(t => t.schoolName || "Unassigned School")));
  const teachersBySchool = schools.map(schoolName => ({
    school: schoolName,
    teachers: profile.connected_teachers.filter(t => (t.schoolName || "Unassigned School") === schoolName)
  })).filter(group => group.teachers.length > 0);

  useEffect(() => {
    if (isOpen) {
      setSelectedTeacher(null);
      setSelectedSchool('');
      setShareStatus('idle');
    }
  }, [isOpen]);

  const handleShare = async () => {
    if (!selectedTeacher) return;

    setIsSharing(true);
    setShareStatus('idle');

    try {
      await onShare(selectedTeacher.id as unknown as number, selectedSchool);
      setShareStatus('success');

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Share error:', error);
      setShareStatus('error');
    } finally {
      setIsSharing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-teal-600 text-white p-6 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold">Share Lesson Plan</h3>
              <p className="text-teal-100 text-sm">"{lessonPlan.title}"</p>
            </div>
          </div>
          <button onClick={onClose} className="text-teal-100 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {shareStatus === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-slate-800 mb-2">Shared Successfully!</h4>
              <p className="text-slate-600">The teacher will be notified and can now access this lesson plan.</p>
            </div>
          ) : (
            <>
              {/* Current Plan Info */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2">Plan Details</h4>
                <div className="space-y-1 text-sm text-slate-600">
                  <p><strong>Target:</strong> {lessonPlan.target}</p>
                  <p><strong>Grade:</strong> {lessonPlan.meta.grade || 'Not specified'}</p>
                  <p><strong>Duration:</strong> {lessonPlan.meta.duration || 'Not specified'} minutes</p>
                </div>
              </div>

              {/* School Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                  <School className="w-4 h-4" /> Select School
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {teachersBySchool.map(({ school, teachers }) => (
                    <button
                      key={school}
                      onClick={() => {
                        setSelectedSchool(school);
                        setSelectedTeacher(null);
                      }}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${selectedSchool === school
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800">{school}</h4>
                          <p className="text-sm text-slate-500">{teachers.length} teacher{teachers.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-teal-600">
                          <School className="w-5 h-5" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Teacher Selection */}
              {selectedSchool && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Select Teacher
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {teachersBySchool
                      .find(group => group.school === selectedSchool)
                      ?.teachers.map((teacher) => (
                        <button
                          key={teacher.id}
                          onClick={() => setSelectedTeacher(teacher)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${selectedTeacher?.id === teacher.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
                              {(teacher.displayName || "T").charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800">{teacher.displayName}</h4>
                              <p className="text-sm text-slate-500">{teacher.role} • {teacher.employeeId}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Share Info */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">What will be shared:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Complete lesson plan details</li>
                  <li>• Uchiawase (meeting notes &amp; timeline)</li>
                  <li>• Pre-lesson checklist</li>
                  <li>• Your lesson reflection (after completion)</li>
                </ul>
                <p className="text-xs text-blue-600 mt-2">
                  The teacher can add their own comments and submit a reflection for this lesson.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {shareStatus !== 'success' && (
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={!selectedTeacher || isSharing}
              className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSharing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Share Plan
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
// --- END OF FILE: src/ShareLessonPlanModal.tsx ---