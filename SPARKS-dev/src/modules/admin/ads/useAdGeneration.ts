import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { callAi } from '../../../lib/ai';
import { ContentVariant, GenerateInputs, HyperDopamineScore, AdAnatomy } from './types';

const PLATFORM_SPECS: Record<string, { maxChars: number; requirements: string }> = {
    instagram: { maxChars: 150, requirements: '150-char caption + 5 hashtags + visual hook opener' },
    facebook: { maxChars: 250, requirements: '80-250 chars, conversational, question or story hook' },
    tiktok: { maxChars: 150, requirements: '60-150 chars, hook MUST be line 1, trending casual language' },
    pinterest: { maxChars: 300, requirements: '100-300 chars, keyword-rich, value/outcome focused' },
    twitter_x: { maxChars: 280, requirements: '≤280 chars, single punchy idea, no filler' },
    linkedin: { maxChars: 300, requirements: '150-300 chars, professional but human, insight-led opener' },
    youtube_shorts: { maxChars: 160, requirements: 'title ≤60 chars on first line "Title: ...", then description ≤100 chars' },
    email: { maxChars: 300, requirements: 'subject ≤50 chars on first line "Subject: ...", then 3-4 sentence body' },
};

const FORMAT_INSTRUCTIONS: Record<string, string> = {
    breaking_news: 'Frame as a breaking news alert. Headline mimics breaking news style ("BREAKING:", "JUST IN:"). Immediately credible.',
    sms_screenshot: 'Frame as a real text message exchange. Casual, native format. Start with a friend-to-friend message style.',
    native_post: 'Look like organic content from a friend. Zero promotional language. Blend in with the feed naturally.',
    standard: 'Direct response copywriting. No format constraint.',
};

const buildPrompt = (inputs: GenerateInputs, strategy: string): string => {
    const platformBlocks = inputs.platforms
        .map(p => {
            const spec = PLATFORM_SPECS[p];
            return `### ${p.toUpperCase()}\nRequirements: ${spec.requirements}\nMax chars: ${spec.maxChars}`;
        })
        .join('\n\n');

    const strategyBlock = strategy && !strategy.startsWith('No strategy')
        ? `\nCurrent strategy context (apply these learnings to every variant):\n${strategy}\n`
        : '';

    return `You are a direct response copywriter applying the Hyper-Dopamine Ad Formula.

GLOBAL RULES (apply to every variant):
- Write at grade 3-4 reading level. Short lines only — never a text wall.
- SELL THE CLICK, not the product. The ad gets the click; the landing page sells.
- Every line must answer: "how does this serve the reader's self-interest?"
- Write to "you" (one singular person), never to a group.
- Mirror the avatar's own language back at them.
- Curiosity gap headlines: the reader MUST click to close the gap. Create an itch only clicking can scratch.

AD FORMAT: ${FORMAT_INSTRUCTIONS[inputs.format]}
${strategyBlock}
AVATAR PROFILE:
- Pain points: ${inputs.avatar.pain_points}
- Desires: ${inputs.avatar.desires}
- Their language: ${inputs.avatar.their_language}

Campaign goal: ${inputs.goal}
Tone: ${inputs.tone}
Key message: ${inputs.key_message}

For EACH platform below, generate one ad variant with this EXACT JSON structure:
- platform: the platform key
- format: "${inputs.format}"
- anatomy:
    - pattern_interrupt_brief: one sentence describing what makes the scroll-stop image unexpected/strange/mysterious (designer brief for the visual)
    - headline: curiosity gap + specific benefit — reader MUST click to close the gap
    - slippery_intro: first 1-2 sentences that re-capture the reader who almost scrolled past (this single element can 5× ROAS — make it irresistible)
    - link_description: irresistible micro-copy max 10 words (e.g. "Look closely, then click.")
    - main_copy: long-form body max 2200 chars — butter smooth, short lines, reader self-interest in every line
- char_count: total character count of headline + slippery_intro + link_description + main_copy combined
- hd_score: { pattern_interrupt: N, curiosity_gap: N, benefit_specificity: N, total: N } (each axis 1-10, total = rounded average)

${platformBlocks}

Return ONLY a valid JSON array, one object per platform. No other text.`;
};

const isValidScore = (s: unknown): s is HyperDopamineScore =>
    typeof s === 'object' && s !== null &&
    ['pattern_interrupt', 'curiosity_gap', 'benefit_specificity', 'total'].every(
        k => typeof (s as Record<string, unknown>)[k] === 'number'
    );

const isValidAnatomy = (a: unknown): a is AdAnatomy =>
    typeof a === 'object' && a !== null &&
    ['pattern_interrupt_brief', 'headline', 'slippery_intro', 'link_description', 'main_copy'].every(
        k => typeof (a as Record<string, unknown>)[k] === 'string'
    );

const parseVariants = (text: string): ContentVariant[] => {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid response shape');
    return parsed.map((v: unknown) => {
        const item = v as Record<string, unknown>;
        if (!isValidAnatomy(item.anatomy) || !isValidScore(item.hd_score)) {
            throw new Error('Invalid variant shape');
        }
        return item as unknown as ContentVariant;
    });
};

const fetchStrategy = async (): Promise<string> => {
    const { data } = await supabase
        .from('active_strategies')
        .select('strategy')
        .eq('module', 'ad_manager')
        .single();
    return data?.strategy ?? '';
};

export const useAdGeneration = () => {
    const [variants, setVariants] = useState<ContentVariant[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generate = async (inputs: GenerateInputs): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const strategy = await fetchStrategy();
            const text = await callAi(buildPrompt(inputs, strategy), 'gemini-2.0-flash');
            if (!text) throw new Error('Empty response');
            setVariants(parseVariants(text));
        } catch {
            setError('Generation failed — please try again.');
        } finally {
            setLoading(false);
        }
    };

    const regenerateOne = async (index: number, inputs: GenerateInputs): Promise<void> => {
        if (!variants[index]) return;
        const platform = variants[index].platform;
        setLoading(true);
        setError(null);
        try {
            const strategy = await fetchStrategy();
            const singleInputs = { ...inputs, platforms: [platform] };
            const text = await callAi(buildPrompt(singleInputs, strategy), 'gemini-2.0-flash');
            if (!text) throw new Error('Empty response');
            const newVariants = parseVariants(text);
            if (newVariants[0]) {
                setVariants(prev => prev.map((v, i) => (i === index ? newVariants[0] : v)));
            }
        } catch {
            setError('Regeneration failed — please try again.');
        } finally {
            setLoading(false);
        }
    };

    return { generate, regenerateOne, variants, loading, error };
};
