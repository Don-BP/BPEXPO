export type { UserProfile, ConnectedTeacher } from '../../types/user';
import type { ConnectedTeacher } from '../../types/user';

// --- START OF SECTION: src/types.ts ---
export type ChatMessage = {
  id: string;
  text?: string;
  link?: { url: string; label: string };
  sender: 'me' | 'partner';
  timestamp: string;
};

// Helper for metadata embedded in the plan
export type PlanMeta = {
  alt: string;
  teacher2: string;
  altRole?: string;
  teacher2Role?: string;
  school: string;
  date: string;
  grade?: string;
  classSize?: number;
  studentLevel?: number;
  duration?: number;
};

// Enhanced Material Type
export type MaterialItem = {
  name: string;
  status: 'Available' | 'Prepare' | 'Borrow' | 'Unknown';
};

export type LessonReflection = {
  rating: number; // 1-5 stars
  studentEngagement: 'Low' | 'Medium' | 'High';
  notes: string;
  nextTimeAdjustments: string;
  completedAt: string;
};

export type LessonComment = {
  id: number;
  lessonPlanId: string;
  userId: number;
  section: string;
  content: string;
  isResolved: boolean;
  isReadByAlt: boolean;
  createdAt: string;
  commenter?: {
    id: number;
    username: string;
    role: string;
  }
};

export type LessonPlan = {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  teacher_id?: number;
  author?: {
    id: number;
    username: string;
    email: string;
    schoolName?: string;
  };
  meta: PlanMeta;
  title: string;
  grade_level?: string;
  target: string;
  smart_goal: string;
  lesson_vocabulary: string[];
  grammar_points: string;
  uchiawase_points: string[];
  uchiawase_schedule?: {
    date: string;
    time: string;
    notes: string;
    scheduled: boolean;
  };
  assessment_criteria: string[];
  materials: (string | MaterialItem)[];
  cultural_note: string;
  checklist?: string[];
  roles?: {
    management: string;
    discipline: string;
    assessment: string;
  };
  differentiation: {
    support: string;
    challenge: string;
  };
  sections: {
    time: string;
    phase: string;
    activity: string;
    altRole: string;
    teacher2Role: string;
    instructions?: string;
    assessment?: string;
    teacherComment?: string;
  }[];
  sectionComments?: LessonComment[];
  games: {
    name: string;
    duration: string;
    howToPlay: string;
    preparation: string;
  }[];
  reflection?: LessonReflection;
  teacher2Reflection?: LessonReflection;
  chats?: ChatMessage[];
  sharedWithGroups?: string[];
};

export type ActivityIdea = {
  name: string;
  type: string;
  skill: string;
  duration: string;
  materials: string;
  instructions: string;
  preparation: string;
  recommended_grades?: string[];
  tags?: string[];
};

export type SavedItem = {
  id: string;
  label: string;
  timestamp: string;
  data: LessonPlan;
};

// Manual Builder State Types
export type ManualSectionState = {
  time: number;
  title: string;
  activity: string;
  instructions: string;
  assessment: string;
  altRole: string;
  teacher2Role: string;
  materials: string;
};

export type MaterialEntry = {
  name: string;
  status: 'Available' | 'Prepare' | 'Borrow';
};

export type ManualPlanState = {
  id?: string;
  // Phase 1: Teacher Info
  altName: string;
  altNationality: string;
  altExperience: string;
  altEmail: string;
  altPhone: string;

  teacher2Name: string;
  teacher2Email: string;
  teacher2Proficiency: number; // 1-5
  teacher2Experience: string;
  communicationMethod: string;
  uchiawaseFreq: string;
  altRoleType: "T1" | "T2" | "Co-teacher";
  teacher2RoleType: "T1" | "T2" | "Co-teacher";

  // Phase 2: Preparation
  date: string;
  startTime: string;
  school: string;
  level: "Elementary" | "JuniorHigh";
  grade: string;
  classNumber: string;
  studentLevel: number;
  textbook: string;
  unit: string;
  classSize: number;
  targetLanguage: string;
  lessonVocabulary: string;
  grammarPoints: string;

  // SMART Goal Components
  smartS: string;
  smartM: string;
  smartA: string;
  smartR: string;
  smartT: string;

  // Materials
  materialsList: MaterialEntry[];

  // Phase 3: Flow
  warmup: ManualSectionState;
  present: ManualSectionState;
  practice: ManualSectionState;
  produce: ManualSectionState;
  wrapup: ManualSectionState;

  // Phase 4: Review
  assessmentPoints: string;
  culturalNote: string;
  diffSupport: string;
  diffChallenge: string;
  flexibility: string;
  checklist: Set<string>;

  // Quality Assurance
  reviewStatus: 'Self-reviewed' | 'Peer-reviewed';
  approvedBy: string;

  // Uchiawase Specifics
  uchiawaseScheduled: boolean;
  uchiawaseDate: string;
  uchiawaseTime: string;
  uchiawaseNotes: string;
};

// ========== TEACHER GROUPS ==========

export type TeacherGroup = {
  id: string;
  name: string;
  createdBy: string;
  memberIds: string[];
  members?: ConnectedTeacher[];
  createdAt: string;
};

export type GroupMessage = {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  text?: string;
  link?: { url: string; label: string };
  sharedPlanId?: string;
  sharedPlan?: LessonPlan;
  createdAt: string;
};
// --- END OF SECTION: src/types.ts ---