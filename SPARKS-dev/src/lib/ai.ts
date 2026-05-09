import { supabase } from './supabase';

export const callAi = async (
    prompt: string,
    model: string = 'gemini-2.0-flash'
): Promise<string | null> => {
    try {
        const { data, error } = await supabase.functions.invoke('generate-lesson', {
            body: { prompt, model },
        });
        if (error) throw error;
        return data?.content ?? null;
    } catch (err) {
        console.error('AI call failed:', err);
        return null;
    }
};
