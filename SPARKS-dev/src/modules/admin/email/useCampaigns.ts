import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { EmailCampaign, EmailProspect, CampaignStatus, CampaignStats } from './types';
import { computeStats } from './types';

interface UseCampaigns {
  campaigns: EmailCampaign[];
  statsMap: Record<string, CampaignStats>;
  loading: boolean;
  error: string | null;
  create: (name: string, goal: string) => Promise<EmailCampaign | null>;
  updateStatus: (id: string, status: CampaignStatus) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useCampaigns(): UseCampaigns {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, CampaignStats>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const refresh = useCallback(async () => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const [{ data: cData, error: cErr }, { data: pData }] = await Promise.all([
        supabase.from('email_campaigns').select('*').order('created_at', { ascending: false }),
        supabase.from('email_prospects').select('id, campaign_id, send_status, replied_at, converted_at'),
      ]);
      if (!isMountedRef.current) return;
      if (cErr) { setError(cErr.message); return; }
      setCampaigns((cData as EmailCampaign[]) ?? []);

      const allProspects = (pData as EmailProspect[]) ?? [];
      const map: Record<string, CampaignStats> = {};
      for (const c of (cData as EmailCampaign[]) ?? []) {
        map[c.id] = computeStats(allProspects.filter(p => p.campaign_id === c.id));
      }
      setStatsMap(map);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (name: string, goal: string): Promise<EmailCampaign | null> => {
    const { data, error: err } = await supabase
      .from('email_campaigns')
      .insert({ name, goal })
      .select()
      .single();
    if (err || !data) return null;
    const campaign = data as EmailCampaign;
    if (isMountedRef.current) {
      setCampaigns(prev => [campaign, ...prev]);
      setStatsMap(prev => ({ ...prev, [campaign.id]: computeStats([]) }));
    }
    return campaign;
  }, []);

  const updateStatus = useCallback(async (id: string, status: CampaignStatus) => {
    await supabase.from('email_campaigns').update({ status }).eq('id', id);
    if (isMountedRef.current) setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  }, []);

  const remove = useCallback(async (id: string) => {
    await supabase.from('email_campaigns').delete().eq('id', id);
    if (isMountedRef.current) {
      setCampaigns(prev => prev.filter(c => c.id !== id));
      setStatsMap(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  }, []);

  return { campaigns, statsMap, loading, error, create, updateStatus, remove, refresh };
}
