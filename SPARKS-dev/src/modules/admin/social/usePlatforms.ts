import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { Platform, PlatformConnection } from './types';

export const usePlatforms = () => {
    const [connections, setConnections] = useState<PlatformConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        const { data, error: err } = await supabase
            .from('platform_connections')
            .select('id, platform, account_name, account_id, connected_at')
            .order('connected_at', { ascending: false });
        if (err) {
            setError('Failed to load platform connections');
        } else {
            setConnections((data ?? []) as PlatformConnection[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const isConnected = useCallback(
        (platform: Platform) => connections.some(c => c.platform === platform),
        [connections]
    );

    const disconnect = async (platform: Platform): Promise<void> => {
        setConnections(prev => prev.filter(c => c.platform !== platform));
        const { error: err } = await supabase
            .from('platform_connections')
            .delete()
            .eq('platform', platform);
        if (err) {
            setError('Failed to disconnect');
            await refresh();
        }
    };

    return { connections, loading, error, isConnected, disconnect, refresh };
};
