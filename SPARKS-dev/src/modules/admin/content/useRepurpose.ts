import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { RepurposeVariant, RepurposeSourceType } from './types';

export const useRepurpose = () => {
    const [variants, setVariants] = useState<RepurposeVariant[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const repurpose = async (source_text: string, source_type: RepurposeSourceType) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase.functions.invoke('content-repurpose', {
                body: { source_text, source_type },
            });
            if (err) throw err;
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            setVariants(parsed as RepurposeVariant[]);
        } catch {
            setError('Repurposing failed — please try again.');
        } finally {
            setLoading(false);
        }
    };

    return { variants, loading, error, repurpose };
};
