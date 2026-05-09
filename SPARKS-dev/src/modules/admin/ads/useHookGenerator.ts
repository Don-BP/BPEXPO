import { useState } from 'react';
import { callAi } from '../../../lib/ai';
import { HookVariant } from './types';

const buildHookPrompt = (topic: string): string =>
    `You are a viral headline writer. Generate 5 hook variants for this topic: "${topic}"

Apply these formulas:
- unexpected_modifier: take a surprising/counterintuitive angle on the familiar subject
- curiosity_gap: create a gap the reader can ONLY close by clicking ("Why X teachers in Japan are [doing unexpected thing]...")
- number: specific number that creates specificity and trust ("The 3 words that...")
- contrast: before/after or expectation vs reality ("Everyone thinks X. The truth is Y.")
- question: question that makes them feel "that's about me" ("Are you still doing X?")

Key rules:
- Grade 3-4 reading level
- Write to "you" (one person)
- Every hook must create an itch only clicking can scratch
- Specific > generic

Return ONLY a valid JSON array of exactly 5 objects:
[
  { "hook": "...", "formula": "unexpected_modifier" },
  { "hook": "...", "formula": "curiosity_gap" },
  { "hook": "...", "formula": "number" },
  { "hook": "...", "formula": "contrast" },
  { "hook": "...", "formula": "question" }
]`;

const parseHooks = (text: string): HookVariant[] => {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) throw new Error('Invalid shape');
    return parsed as HookVariant[];
};

export const useHookGenerator = () => {
    const [hooks, setHooks] = useState<HookVariant[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generate = async (topic: string): Promise<void> => {
        if (!topic.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const text = await callAi(buildHookPrompt(topic), 'gemini-2.0-flash');
            if (!text) throw new Error('Empty response');
            setHooks(parseHooks(text));
        } catch {
            setError('Hook generation failed — please try again.');
        } finally {
            setLoading(false);
        }
    };

    return { hooks, loading, error, generate };
};
