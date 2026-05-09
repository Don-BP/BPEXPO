import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import type { AutoLearnRun, ActiveStrategy } from './types';

interface UseAutoLearnReturn {
    runs: AutoLearnRun[];
    loading: boolean;
    error: string | null;
    triggering: boolean;
    triggerRun: () => Promise<void>;
    strategies: ActiveStrategy[];
    saveStrategyOverride: (module: string, strategy: string) => Promise<void>;
    resetStrategyToAI: (module: string) => Promise<void>;
}

export function useAutoLearn(): UseAutoLearnReturn {
    const [runs, setRuns] = useState<AutoLearnRun[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [triggering, setTriggering] = useState(false);
    const [strategies, setStrategies] = useState<ActiveStrategy[]>([]);
    const isMountedRef = useRef(true);

    const refreshStrategies = useCallback(async () => {
        const { data } = await supabase.from('active_strategies').select('*');
        setStrategies((data ?? []) as ActiveStrategy[]);
    }, []);

    useEffect(() => { refreshStrategies(); }, [refreshStrategies]);

    const load = useCallback(async () => {
        const { data, error: err } = await supabase
            .from('auto_learn_runs')
            .select('*')
            .order('ran_at', { ascending: false });

        if (!isMountedRef.current) return;
        if (err) {
            setError(err.message);
            setLoading(false);
            return;
        }
        setRuns((data as AutoLearnRun[]) ?? []);
        setLoading(false);
    }, []);

    useEffect(() => {
        isMountedRef.current = true;
        load();
        return () => { isMountedRef.current = false; };
    }, [load]);

    const triggerRun = useCallback(async () => {
        setTriggering(true);
        setError(null);
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token ?? '';
            const resp = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-learn`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ triggered_by: 'manual' }),
                }
            );
            const json = await resp.json() as { ok: boolean; error?: string };
            if (!json.ok && json.error) {
                if (isMountedRef.current) setError(json.error);
            }
            await load();
        } catch (e) {
            if (isMountedRef.current) setError((e as Error).message);
        } finally {
            if (isMountedRef.current) setTriggering(false);
        }
    }, [load]);

    const saveStrategyOverride = async (module: string, strategy: string): Promise<void> => {
        await supabase.from('active_strategies').update({
            strategy,
            is_manual_override: true,
            updated_at: new Date().toISOString(),
        }).eq('module', module);
        setStrategies(prev => prev.map(s =>
            s.module === module ? { ...s, strategy, is_manual_override: true } : s
        ));
    };

    const resetStrategyToAI = async (module: string): Promise<void> => {
        await supabase.from('active_strategies').update({
            is_manual_override: false,
            updated_at: new Date().toISOString(),
        }).eq('module', module);
        setStrategies(prev => prev.map(s =>
            s.module === module ? { ...s, is_manual_override: false } : s
        ));
    };

    return { runs, loading, error, triggering, triggerRun, strategies, saveStrategyOverride, resetStrategyToAI };
}
