import { supabase } from '../../lib/supabase';
import { UserProfile, LessonPlan, ActivityIdea, TeacherGroup, GroupMessage } from './types';
import { TEXTBOOK_UNITS } from './constants';
import { safeParseArray, safeParseObject } from './utils';

// Helper to clean JSON string from AI response
const cleanJson = (text: string): string => {
  if (!text) return "";
  const match = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
  if (match) return match[1];
  return text.replace(/```json/g, "").replace(/```/g, "");
};

export const sanitizeLessonPlan = (plan: any): LessonPlan => {
  if (!plan) return plan;
  return {
    ...plan,
    meta: safeParseObject(plan.meta),
    sections: safeParseArray(plan.sections),
    lesson_vocabulary: safeParseArray(plan.lesson_vocabulary),
    materials: safeParseArray(plan.materials),
    uchiawase_points: safeParseArray(plan.uchiawase_points),
    assessment_criteria: safeParseArray(plan.assessment_criteria),
    checklist: safeParseArray(plan.checklist),
    games: safeParseArray(plan.games),
    reflection: safeParseObject(plan.reflection),
    teacher2Reflection: safeParseObject(plan.teacher2Reflection),
    roles: safeParseObject(plan.roles),
    differentiation: safeParseObject(plan.differentiation),
  };
};

// Maps unified DB profile (snake_case) to planner-expected field names (camelCase)
export const toPlannerProfile = (p: UserProfile) => ({
  ...p,
  altName: p.display_name ?? '',
  schoolName: p.school_name ?? '',
});

// ========== CLOUD / EDGE FUNCTION CALLS ==========

export const callSecureAi = async (prompt: string, model: string = "gemini-3.1-flash-lite"): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-lesson', {
      body: { prompt, model }
    });
    if (error) throw error;
    return data?.content ?? null;
  } catch (error: any) {
    console.error("Edge Function AI call failed:", error);
    return null;
  }
};

export const generateLessonContent = async (
  level: string,
  grade: string,
  textbook: string,
  unit: string,
  classSize: number,
  duration: number,
  studentLevel: number,
  profile: UserProfile,
  customTarget?: string,
  customVocabulary?: string
): Promise<LessonPlan | null> => {
  const plannerProfile = toPlannerProfile(profile);
  const teacher1Name = plannerProfile.altName || "Teacher 1";

  let realTargetLanguage = "None specified";
  let realUnitTitle = unit;

  if (customTarget) {
    realTargetLanguage = customTarget;
    realUnitTitle = unit || "Custom Unit";
  } else if (TEXTBOOK_UNITS[textbook]) {
    const curriculumData = TEXTBOOK_UNITS[textbook].find(u => u.title === unit);
    if (curriculumData) {
      realTargetLanguage = curriculumData.target;
      realUnitTitle = `${curriculumData.number}. ${curriculumData.title}`;
    }
  }

  let textResponse: string | null = null;
  try {
    const { data, error } = await supabase.functions.invoke('generate-lesson', {
      body: {
        generatePlan: true,
        textbook: customTarget ? 'Custom Material' : textbook,
        unit: realUnitTitle,
        grade,
        level,
        studentLevel,
        classSize,
        duration,
        teacher1Name,
        teacher2Name: '',
        customTarget: customTarget ?? undefined,
        customVocab: customVocabulary ?? undefined,
      }
    });
    if (error) throw error;
    textResponse = data?.content ?? null;
  } catch (invokeErr: any) {
    console.error('Edge Function AI call failed:', invokeErr);
    return null;
  }
  if (!textResponse) return null;

  try {
    const text = cleanJson(textResponse);
    if (!text) return null;
    const content = JSON.parse(text);

    const planData: LessonPlan = {
      ...content,
      meta: {
        alt: teacher1Name,
        teacher2: "",
        altRole: "T2",
        teacher2Role: "T1",
        school: plannerProfile.schoolName,
        date: new Date().toISOString(),
        grade: grade,
        classSize: classSize,
        studentLevel: studentLevel,
        duration: duration
      }
    };

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const savedPlan = await saveLessonPlanToDb(planData);
      if (savedPlan) {
        return sanitizeLessonPlan(savedPlan);
      }
    }

    return sanitizeLessonPlan(planData);

  } catch (error) {
    console.error("Error parsing AI response:", error);
    return null;
  }
};

export const generateActivityIdeas = async (
  level: string, grade: string, skill: string, type: string, classSize: number,
  targetLanguage?: string, vocabulary?: string
): Promise<ActivityIdea[] | null> => {
  const prompt = `
    List 6 distinct, high-engagement English activities for Japanese schools.
    Context: ${level} ${grade}, Skill: ${skill}, Type: ${type}, Size: ${classSize}.
    ${targetLanguage ? `Target Language/Phrase to practice: "${targetLanguage}".` : ""}
    ${vocabulary ? `Key Vocabulary to include: "${vocabulary}".` : ""}
    Output strictly in JSON format as an array of objects with keys: name, type, skill, duration, materials, instructions, preparation, recommended_grades (array of strings), tags (array of strings).
  `;

  const textResponse = await callSecureAi(prompt);
  if (!textResponse) return null;

  try {
    const text = cleanJson(textResponse);
    return text ? JSON.parse(text) as ActivityIdea[] : null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const generateSingleActivitySuggestion = async (phase: string, grade: string, target: string): Promise<string | null> => {
  const prompt = `
    Suggest ONE short, engaging activity for the "${phase}" phase of an English lesson.
    Grade: ${grade}
    Target Language: "${target}"
    Keep it concise (under 50 words). Provide the instructions directly.
  `;
  return callSecureAi(prompt);
};

export const generateRubric = async (
  grade: string,
  target: string,
  activityType: string,
  customCriteria?: string[]
): Promise<{ criteria: string, levels: { a: string, b: string, c: string } }[] | null> => {
  const criteriaList = customCriteria && customCriteria.length > 0
    ? customCriteria.join(", ")
    : "1. Attitude/Participation, 2. Communication/Expression, 3. Understanding/Accuracy";

  const prompt = `
    Create a simple 3-level assessment rubric (A, B, C) for an English activity in a Japanese school.
    Grade: ${grade}
    Target: ${target}
    Activity Type: ${activityType}

    Output strictly in JSON format as an array of objects with keys:
    criteria (string), levels (object with keys a, b, c).

    CRITICAL: Generate rubric rows specifically for these criteria: ${criteriaList}.
    Ensure the "levels" descriptions are observable behaviors suitable for a teacher to check during class.
  `;

  const textResponse = await callSecureAi(prompt);
  if (!textResponse) return null;

  try {
    const text = cleanJson(textResponse);
    return text ? JSON.parse(text) : null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

// ========== LESSON PLAN DATABASE FUNCTIONS ==========

export const saveLessonPlanToDb = async (plan: LessonPlan): Promise<LessonPlan | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn("User not logged in");
    return null;
  }

  try {
    const payload = {
      user_id: user.id,
      title: plan.title ?? null,
      data: {
        ...plan,
        meta: {
          ...plan.meta,
          alt: user.user_metadata?.full_name || user.email || "Teacher",
          date: plan.meta?.date || new Date().toISOString()
        }
      },
      updated_at: new Date().toISOString()
    };

    if (plan.id) {
      const { error } = await supabase
        .from('plans')
        .update(payload)
        .eq('id', String(plan.id))
        .eq('user_id', user.id);
      if (error) throw error;
      console.log("Plan updated:", plan.id);
      return plan;
    } else {
      const { data, error } = await supabase
        .from('plans')
        .insert({ ...payload, created_at: new Date().toISOString() })
        .select('id')
        .single();
      if (error) throw error;
      console.log("Plan created:", data.id);
      return { ...plan, id: data.id };
    }
  } catch (error) {
    console.error("Error saving lesson plan:", error);
    return null;
  }
};

export const getUserPlans = async (): Promise<LessonPlan[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('plans')
    .select('id, data, updated_at, created_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error("Failed to fetch user plans", error);
    return [];
  }

  return (data ?? []).map(row => sanitizeLessonPlan({ ...row.data, id: row.id }));
};

export const getLessonPlanById = async (id: string | number): Promise<LessonPlan | null> => {
  if (!id) return null;
  const { data, error } = await supabase
    .from('plans')
    .select('id, data')
    .eq('id', String(id))
    .single();
  if (error) {
    console.error("Failed to fetch lesson plan", error);
    return null;
  }
  return sanitizeLessonPlan({ ...data.data, id: data.id });
};

export const deleteLessonPlan = async (id: number | string): Promise<boolean> => {
  if (!id) return false;
  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', String(id));
  if (error) {
    console.error("Failed to delete lesson plan", error);
    return false;
  }
  return true;
};

export const shareLessonPlan = async (_lessonPlanId: string, _teacherId: string) => {
  return { success: true };
};

export const updateConnectionDetails = async (_altId: string | number, _details: any) => {
  return { success: true };
};

export const getAltUpdates = async (): Promise<{ updates: { plan: LessonPlan, unreadCount: number }[] }> => {
  return { updates: [] };
};

export const markCommentAsRead = async (_commentId: number) => {
  // Not yet implemented
};

// ========== TEACHER GROUPS ==========

export const createTeacherGroup = async (name: string, memberIds: string[]): Promise<TeacherGroup | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const allMembers = Array.from(new Set([user.id, ...memberIds]));
  const { data, error } = await supabase
    .from('teacher_groups')
    .insert({ name, created_by: user.id, member_ids: allMembers })
    .select()
    .single();
  if (error) { console.error("Failed to create teacher group", error); return null; }
  return { id: data.id, name: data.name, createdBy: data.created_by, memberIds: data.member_ids, createdAt: data.created_at };
};

export const getUserGroups = async (): Promise<TeacherGroup[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('teacher_groups')
    .select('*')
    .contains('member_ids', [user.id]);
  if (error) { console.error("Failed to fetch groups", error); return []; }
  return (data ?? []).map(d => ({ id: d.id, name: d.name, createdBy: d.created_by, memberIds: d.member_ids, createdAt: d.created_at }));
};

export const addMemberToGroup = async (groupId: string, userId: string): Promise<boolean> => {
  const { data: group } = await supabase.from('teacher_groups').select('member_ids').eq('id', groupId).single();
  if (!group) return false;
  const updated = Array.from(new Set([...group.member_ids, userId]));
  const { error } = await supabase.from('teacher_groups').update({ member_ids: updated, updated_at: new Date().toISOString() }).eq('id', groupId);
  return !error;
};

export const removeMemberFromGroup = async (groupId: string, userId: string): Promise<boolean> => {
  const { data: group } = await supabase.from('teacher_groups').select('member_ids').eq('id', groupId).single();
  if (!group) return false;
  const updated = group.member_ids.filter((id: string) => id !== userId);
  const { error } = await supabase.from('teacher_groups').update({ member_ids: updated, updated_at: new Date().toISOString() }).eq('id', groupId);
  return !error;
};

export const deleteTeacherGroup = async (groupId: string): Promise<boolean> => {
  const { error } = await supabase.from('teacher_groups').delete().eq('id', groupId);
  return !error;
};

export const getGroupMessages = async (groupId: string): Promise<GroupMessage[]> => {
  const { data, error } = await supabase
    .from('group_messages')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true });
  if (error) { console.error("Failed to fetch group messages", error); return []; }
  return (data ?? []).map(d => ({
    id: d.id,
    groupId: d.group_id,
    senderId: d.sender_id,
    senderName: d.sender_name,
    text: d.text,
    link: d.link,
    sharedPlanId: d.shared_plan_id,
    createdAt: d.created_at,
  }));
};

export const sendGroupMessage = async (
  groupId: string,
  senderName: string,
  text?: string,
  link?: { url: string; label: string }
): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || (!text && !link)) return false;
  const { error } = await supabase.from('group_messages').insert({
    group_id: groupId,
    sender_id: user.id,
    sender_name: senderName,
    ...(text ? { text } : {}),
    ...(link ? { link } : {}),
  });
  return !error;
};

export const sharePlanToGroup = async (planId: string, groupId: string, senderName: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: plan } = await supabase.from('plans').select('shared_with_groups').eq('id', planId).single();
  if (!plan) return false;

  const updatedGroups = Array.from(new Set([...(plan.shared_with_groups ?? []), groupId]));

  const [planUpdate, msgInsert] = await Promise.all([
    supabase.from('plans').update({ shared_with_groups: updatedGroups }).eq('id', planId),
    supabase.from('group_messages').insert({
      group_id: groupId,
      sender_id: user.id,
      sender_name: senderName,
      shared_plan_id: planId,
    })
  ]);

  return !planUpdate.error && !msgInsert.error;
};

export const getGroupSharedPlans = async (groupId: string): Promise<LessonPlan[]> => {
  const { data, error } = await supabase
    .from('plans')
    .select('id, data')
    .contains('shared_with_groups', [groupId]);
  if (error) { console.error("Failed to fetch group plans", error); return []; }
  return (data ?? []).map(row => sanitizeLessonPlan({ ...row.data, id: row.id }));
};
