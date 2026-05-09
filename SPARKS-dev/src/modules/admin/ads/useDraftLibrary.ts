import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { ContentDraft, ContentVariant, DraftStatus, GenerateInputs, AdAnatomy } from './types';

export const useDraftLibrary = () => {
    const [drafts, setDrafts] = useState<ContentDraft[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        const { data, error: err } = await supabase
            .from('admin_content_drafts')
            .select('*')
            .order('created_at', { ascending: false });
        if (err) {
            setError('Failed to load drafts');
        } else {
            setDrafts((data ?? []) as ContentDraft[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const save = async (
        variant: ContentVariant,
        inputs: GenerateInputs
    ): Promise<ContentDraft> => {
        const { data, error: err } = await supabase
            .from('admin_content_drafts')
            .insert({
                platform: variant.platform,
                format: variant.format,
                goal: inputs.goal,
                avatar: inputs.avatar,
                tone: inputs.tone,
                key_message: inputs.key_message,
                anatomy: variant.anatomy,
                hd_score: variant.hd_score,
                char_count: variant.char_count,
            })
            .select()
            .single();
        if (err) throw err;
        const draft = data as ContentDraft;
        setDrafts(prev => [draft, ...prev]);
        return draft;
    };

    const updateAnatomy = async (id: string, anatomy: AdAnatomy): Promise<void> => {
        const now = new Date().toISOString();
        setDrafts(prev =>
            prev.map(d => d.id === id ? { ...d, anatomy, updated_at: now } : d)
        );
        const { error: err } = await supabase
            .from('admin_content_drafts')
            .update({ anatomy, updated_at: now })
            .eq('id', id);
        if (err) throw err;
    };

    const updateStatus = async (id: string, status: DraftStatus): Promise<void> => {
        setDrafts(prev =>
            prev.map(d => d.id === id ? { ...d, status } : d)
        );
        const { error: err } = await supabase
            .from('admin_content_drafts')
            .update({ status })
            .eq('id', id);
        if (err) throw err;
    };

    const remove = async (id: string): Promise<void> => {
        setDrafts(prev => prev.filter(d => d.id !== id));
        const { error: err } = await supabase
            .from('admin_content_drafts')
            .delete()
            .eq('id', id);
        if (err) throw err;
    };

    return { drafts, loading, error, save, updateAnatomy, updateStatus, remove, refresh };
};
