import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { EmailProspect, ProspectStatus, DiscoverResult } from './types';

interface UseProspects {
  prospects: EmailProspect[];
  loading: boolean;
  discovering: boolean;
  enriching: boolean;
  drafting: boolean;
  sending: boolean;
  error: string | null;
  load: (campaignId: string) => Promise<void>;
  discover: (campaignId: string, query: string) => Promise<void>;
  addManual: (campaignId: string, data: DiscoverResult) => Promise<void>;
  enrichAll: (campaignId: string) => Promise<void>;
  draftAll: (campaignId: string) => Promise<void>;
  sendAll: (campaignId: string, scheduledAt?: string) => Promise<void>;
  updateDraft: (id: string, subject: string, body: string) => Promise<void>;
  updateStatus: (id: string, status: ProspectStatus) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useProspects(): UseProspects {
  const [prospects, setProspects] = useState<EmailProspect[]>([]);
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const getToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? '';
  }, []);

  const callEdgeFn = useCallback(async (fn: string, body: unknown) => {
    const token = await getToken();
    const resp = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fn}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    return resp.json() as Promise<{ ok: boolean; error?: string }>;
  }, [getToken]);

  const load = useCallback(async (campaignId: string) => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('email_prospects')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      if (!isMountedRef.current) return;
      if (err) { setError(err.message); return; }
      setProspects((data as EmailProspect[]) ?? []);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  const discover = useCallback(async (campaignId: string, query: string) => {
    if (!isMountedRef.current) return;
    setDiscovering(true);
    setError(null);
    try {
      const result = await callEdgeFn('email-discover', { mode: 'discover', campaign_id: campaignId, query });
      if (!result.ok) { if (isMountedRef.current) setError(result.error ?? 'Discovery failed'); return; }
      await load(campaignId);
    } catch (e) {
      if (isMountedRef.current) setError((e as Error).message);
    } finally {
      if (isMountedRef.current) setDiscovering(false);
    }
  }, [callEdgeFn, load]);

  const addManual = useCallback(async (campaignId: string, data: DiscoverResult) => {
    const { data: inserted, error: err } = await supabase
      .from('email_prospects')
      .insert({ campaign_id: campaignId, ...data, send_status: 'pending' })
      .select()
      .single();
    if (err || !inserted || !isMountedRef.current) return;
    setProspects(prev => [inserted as EmailProspect, ...prev]);
  }, []);

  const enrichAll = useCallback(async (campaignId: string) => {
    if (!isMountedRef.current) return;
    setEnriching(true);
    setError(null);
    const ids = prospects.filter(p => p.send_status === 'pending').map(p => p.id);
    try {
      const result = await callEdgeFn('email-discover', { mode: 'enrich', campaign_id: campaignId, prospect_ids: ids });
      if (!result.ok) { if (isMountedRef.current) setError(result.error ?? 'Enrich failed'); return; }
      await load(campaignId);
    } catch (e) {
      if (isMountedRef.current) setError((e as Error).message);
    } finally {
      if (isMountedRef.current) setEnriching(false);
    }
  }, [prospects, callEdgeFn, load]);

  const draftAll = useCallback(async (campaignId: string) => {
    if (!isMountedRef.current) return;
    setDrafting(true);
    setError(null);
    const ids = prospects.filter(p => p.send_status === 'enriched').map(p => p.id);
    try {
      const result = await callEdgeFn('email-discover', { mode: 'draft', campaign_id: campaignId, prospect_ids: ids });
      if (!result.ok) { if (isMountedRef.current) setError(result.error ?? 'Draft failed'); return; }
      await load(campaignId);
    } catch (e) {
      if (isMountedRef.current) setError((e as Error).message);
    } finally {
      if (isMountedRef.current) setDrafting(false);
    }
  }, [prospects, callEdgeFn, load]);

  const sendAll = useCallback(async (campaignId: string, scheduledAt?: string) => {
    if (!isMountedRef.current) return;
    setSending(true);
    setError(null);
    const ids = prospects.filter(p => p.send_status === 'drafted').map(p => p.id);
    try {
      const result = await callEdgeFn('email-send', { prospect_ids: ids, scheduled_at: scheduledAt ?? null });
      if (!result.ok) { if (isMountedRef.current) setError(result.error ?? 'Send failed'); return; }
      await load(campaignId);
    } catch (e) {
      if (isMountedRef.current) setError((e as Error).message);
    } finally {
      if (isMountedRef.current) setSending(false);
    }
  }, [prospects, callEdgeFn, load]);

  const updateDraft = useCallback(async (id: string, subject: string, body: string) => {
    await supabase.from('email_prospects').update({ draft_subject: subject, draft_body: body }).eq('id', id);
    if (isMountedRef.current) {
      setProspects(prev => prev.map(p => p.id === id ? { ...p, draft_subject: subject, draft_body: body } : p));
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: ProspectStatus) => {
    const updates: Record<string, unknown> = { send_status: status };
    if (status === 'replied')   updates.replied_at   = new Date().toISOString();
    if (status === 'converted') updates.converted_at = new Date().toISOString();
    await supabase.from('email_prospects').update(updates).eq('id', id);
    if (isMountedRef.current) {
      setProspects(prev => prev.map(p => p.id === id ? { ...p, ...updates } as EmailProspect : p));
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    await supabase.from('email_prospects').delete().eq('id', id);
    if (isMountedRef.current) setProspects(prev => prev.filter(p => p.id !== id));
  }, []);

  return {
    prospects, loading, discovering, enriching, drafting, sending, error,
    load, discover, addManual, enrichAll, draftAll, sendAll,
    updateDraft, updateStatus, remove,
  };
}
