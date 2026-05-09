import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { ResearchResult } from './types';

type Category = ResearchResult['category'];

interface UseResearchReturn {
    results: ResearchResult[];
    loading: boolean;
    searching: boolean;
    error: string | null;
    loadCategory: (category: Category) => Promise<void>;
    search: (query: string, category: Category) => Promise<void>;
}

export function useResearch(): UseResearchReturn {
    const [results, setResults] = useState<ResearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    const loadCategory = useCallback(async (category: Category) => {
        if (!isMountedRef.current) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase
                .from('research_results')
                .select('*')
                .eq('category', category)
                .order('searched_at', { ascending: false })
                .limit(50);

            if (!isMountedRef.current) return;
            if (err) { setError(err.message); return; }
            setResults((data as ResearchResult[]) ?? []);
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    }, []);

    const search = useCallback(async (query: string, category: Category) => {
        if (!isMountedRef.current) return;
        setSearching(true);
        setError(null);
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token ?? '';
            if (!token) {
                if (isMountedRef.current) setError('Not authenticated');
                return;
            }
            const resp = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/research`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query, category }),
                }
            );
            const json = await resp.json() as {
                ok: boolean;
                error?: string;
                results?: ResearchResult[];
            };
            if (!json.ok) {
                if (isMountedRef.current) setError(json.error ?? 'Search failed');
                return;
            }
            if (json.results && isMountedRef.current) {
                setResults((prev) => [...(json.results!), ...prev]);
            }
        } catch (e) {
            if (isMountedRef.current) setError((e as Error).message);
        } finally {
            if (isMountedRef.current) setSearching(false);
        }
    }, []);

    return { results, loading, searching, error, loadCategory, search };
}
