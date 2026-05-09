import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { CalendarEntry } from './types';

export const useContentCalendar = () => {
    const [entries, setEntries] = useState<CalendarEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        const { data, error: err } = await supabase
            .from('content_calendar')
            .select('*')
            .order('scheduled_at', { ascending: true });
        if (err) setError('Failed to load calendar');
        else setEntries((data ?? []) as CalendarEntry[]);
        setLoading(false);
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const reschedule = async (id: string, scheduled_at: string) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, scheduled_at } : e));
        await supabase.from('content_calendar').update({ scheduled_at }).eq('id', id);
    };

    const updateStatus = async (id: string, status: CalendarEntry['status']) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
        await supabase.from('content_calendar').update({ status }).eq('id', id);
    };

    const remove = async (id: string) => {
        setEntries(prev => prev.filter(e => e.id !== id));
        await supabase.from('content_calendar').delete().eq('id', id);
    };

    return { entries, loading, error, refresh, reschedule, updateStatus, remove };
};
