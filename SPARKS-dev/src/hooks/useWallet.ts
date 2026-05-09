import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types/user';

export const useWallet = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        // Initial fetch
        supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()
            .then(({ data }) => {
                if (data) setProfile(data as UserProfile);
                setLoading(false);
            });

        // Real-time subscription — fires when sparks/profile changes (e.g. after AI generation)
        // Remove any stale channel with the same name before creating a new one (React StrictMode safe)
        const channelName = `user-profile-${user.id}`;
        supabase.removeChannel(supabase.channel(channelName));
        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'users',
                    filter: `id=eq.${user.id}`,
                },
                (payload) => {
                    if (payload.new) setProfile(payload.new as UserProfile);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user]);

    // Purge expired unlocks from local state every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setProfile(prev => {
                if (!prev) return prev;
                const now = Date.now();
                const filtered = Object.fromEntries(
                    Object.entries(prev.active_unlocks).filter(([, exp]) => (exp as number) > now)
                );
                const changed = Object.keys(filtered).length !== Object.keys(prev.active_unlocks).length;
                return changed ? { ...prev, active_unlocks: filtered } : prev;
            });
        }, 60_000);
        return () => clearInterval(interval);
    }, []);

    const unlockFeature = async (featureId: string, durationMs: number = 7_200_000) => {
        if (!user || !profile) return;
        const expiresAt = Date.now() + durationMs;

        // Optimistic update
        setProfile(prev => prev ? {
            ...prev,
            active_unlocks: { ...prev.active_unlocks, [featureId]: expiresAt }
        } : prev);

        // Persist the updated unlocks map to the DB
        const updatedUnlocks = { ...profile.active_unlocks, [featureId]: expiresAt };
        await supabase
            .from('users')
            .update({ active_unlocks: updatedUnlocks })
            .eq('id', user.id);
    };

    const isUnlocked = (featureId: string) => {
        const tier = profile?.subscription_tier ?? 'FREE';
        if (tier === 'PRO' || tier === 'TEACHER_PLUS') return true;
        const expiry = profile?.active_unlocks?.[featureId];
        return !!expiry && (expiry as number) > Date.now();
    };

    return {
        sparks: profile?.sparks ?? 0,
        tier: profile?.subscription_tier ?? 'FREE',
        isPro: profile?.subscription_tier === 'PRO' || profile?.subscription_tier === 'TEACHER_PLUS',
        loading,
        isUnlocked,
        unlockFeature,
    };
};
