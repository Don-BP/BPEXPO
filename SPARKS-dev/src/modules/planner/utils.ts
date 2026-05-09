// src/utils.ts

import { TEXTBOOKS, COMMON_ALT_GAMES } from './constants';
import { ActivityIdea, LessonPlan } from './types';

export const getDefaultTextbook = (level: "Elementary" | "JuniorHigh", grade: string) => {
  if (level === "Elementary") {
    if (grade === "Grade 1" || grade === "Grade 2") return "General Activities";
    if (grade === "Grade 3") return TEXTBOOKS.Elementary[0];
    if (grade === "Grade 4") return TEXTBOOKS.Elementary[1];
    if (grade === "Grade 5") return TEXTBOOKS.Elementary[2];
    if (grade === "Grade 6") return TEXTBOOKS.Elementary[3];
    return TEXTBOOKS.Elementary[2];
  } else {
    if (grade === "1st Year") return TEXTBOOKS.JuniorHigh[0];
    if (grade === "2nd Year") return TEXTBOOKS.JuniorHigh[1];
    if (grade === "3rd Year") return TEXTBOOKS.JuniorHigh[2];
    return TEXTBOOKS.JuniorHigh[0];
  }
};

/**
 * Safely parse an array from various inputs (actual array, stringified JSON, or null)
 */
export const safeParseArray = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("Failed to parse array:", data);
      return [];
    }
  }
  return [];
};

/**
 * Safely parse an object from various inputs (actual object, stringified JSON, or null)
 */
export const safeParseObject = (data: any): any => {
  if (!data) return {};
  if (typeof data === 'object') return data;
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (e) {
      return {};
    }
  }
  return {};
};

/**
 * Get a consolidated rating from both ALT and JTE reflections.
 * Averages them if both exist, otherwise uses the available one.
 */
export const getConsolidatedRating = (plan: LessonPlan): number => {
  const altRef = safeParseObject(plan.reflection);
  const jteRef = safeParseObject(plan.teacher2Reflection);

  const altRating = Number(altRef?.rating) || 0;
  const jteRating = Number(jteRef?.rating) || 0;

  if (altRating > 0 && jteRating > 0) return (altRating + jteRating) / 2;
  return altRating || jteRating || 0;
};

/**
 * Get consolidated engagement level.
 * Prioritizes the teacher's rating, but can be adjusted for combined logic.
 */
export const getConsolidatedEngagement = (plan: LessonPlan): 'Low' | 'Medium' | 'High' => {
  const altRef = safeParseObject(plan.reflection);
  const jteRef = safeParseObject(plan.teacher2Reflection);

  const altEng = altRef?.studentEngagement;
  const jteEng = jteRef?.studentEngagement;

  if (!altEng && !jteEng) return 'Medium';
  if (altEng && !jteEng) return altEng;
  if (!altEng && jteEng) return jteEng;

  // If both exist, prioritize 'High' as a positive indicator, or 'Low' as a warning
  const scores = { 'Low': 1, 'Medium': 2, 'High': 3 };
  const altScore = scores[altEng as keyof typeof scores] || 2;
  const jteScore = scores[jteEng as keyof typeof scores] || 2;

  const avg = (altScore + jteScore) / 2;
  if (avg >= 2.5) return 'High';
  if (avg >= 1.5) return 'Medium';
  return 'Low';
};

export const getMaterialStatusColor = (status: string) => {
  switch (status) {
    case 'Available': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Prepare': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Borrow': return 'bg-rose-100 text-rose-800 border-rose-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

// --- NEW: SMART ACTIVITY MATCHING LOGIC ---

// Map common grammar keywords to Activity Tags
const KEYWORD_TAG_MAP: Record<string, string[]> = {
  "like": ["Interview", "Communication", "Likes"],
  "want": ["Interview", "Dream", "Wants"],
  "can": ["Interview", "Ability", "Gestures"],
  "where": ["Directions", "Town", "Prepositions"],
  "when": ["Time", "Schedule"],
  "time": ["Time", "Schedule"],
  "how many": ["Numbers", "Counting"],
  "who": ["People", "Guessing"],
  "was": ["Past Tense", "Memories"],
  "went": ["Past Tense", "Memories"],
  "did": ["Past Tense"],
  "will": ["Future", "Dream"],
  "going to": ["Future", "Plans"],
  "must": ["Rules"],
  "have to": ["Rules"],
  "should": ["Advice"],
  "if": ["Conditional"],
  "because": ["Reasoning"],
  "compared": ["Comparison"],
  "er": ["Comparison"], // biggER
  "est": ["Comparison"], // biggEST
};

export const findRelevantActivities = (targetLanguage: string, grade: string): ActivityIdea[] => {
  if (!targetLanguage) return [];

  const targetLower = targetLanguage.toLowerCase();

  // 1. Identify relevant tags based on keywords in target language
  const relevantTags = new Set<string>();
  Object.keys(KEYWORD_TAG_MAP).forEach(keyword => {
    if (targetLower.includes(keyword)) {
      KEYWORD_TAG_MAP[keyword].forEach(tag => relevantTags.add(tag));
    }
  });

  // 2. Score activities
  const scoredActivities = COMMON_ALT_GAMES.map(activity => {
    let score = 0;

    // Score based on Tags (High weight)
    if (activity.tags) {
      activity.tags.forEach(tag => {
        // Direct tag match (e.g. game has tag "Past Tense" and we found keyword "went")
        if (relevantTags.has(tag)) score += 5;
        // Text match (e.g. game name contains "Interview" and target is "Do you like?")
        if (targetLower.includes(tag.toLowerCase())) score += 3;
      });
    }

    // Score based on Skill/Type matching context (Medium weight)
    if (targetLower.includes("speak") && activity.skill.includes("Speaking")) score += 2;
    if (targetLower.includes("listen") && activity.skill.includes("Listening")) score += 2;

    // Score based on Grade (Low weight, just a filter really)
    if (activity.recommended_grades?.includes(grade)) score += 1;

    return { activity, score };
  });

  // 3. Sort and Return top results (only if score > 0)
  return scoredActivities
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.activity)
    .slice(0, 5); // Return top 5 suggestions
};