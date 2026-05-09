import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { ScriptResult, ContentScriptFormat } from './types';

export const useScriptBuilder = () => {
    const [result, setResult] = useState<ScriptResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const build = async (topic: string, format: ContentScriptFormat, platform: string, reference_url?: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase.functions.invoke('content-script', {
                body: { topic, format, platform, reference_url },
            });
            if (err) throw err;
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            setResult(parsed as ScriptResult);
        } catch {
            setError('Script generation failed — please try again.');
        } finally {
            setLoading(false);
        }
    };

    return { result, loading, error, build };
};
