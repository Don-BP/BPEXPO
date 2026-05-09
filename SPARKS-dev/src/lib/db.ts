import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export const ensureUserProfile = async (user: User) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

        if (!existing) {
            const { error } = await supabase.from('users').insert({
                id: user.id,
                email: user.email ?? null,
                display_name: user.user_metadata?.full_name ?? user.email ?? null,
                sparks: 100,
                subscription_tier: 'FREE',
                active_unlocks: {},
                connected_teachers: [],
                specializations: [],
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString(),
            });
            if (error) throw error;
            console.log(`Created new profile for ${user.email} with 100 Sparks.`);
        } else {
            await supabase
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', user.id);
        }
    } catch (error) {
        console.error('Error ensuring user profile (offline or timed out):', error);
    } finally {
        clearTimeout(timeout);
    }
};

export const deductSparks = async (uid: string, amount: number): Promise<boolean> => {
    try {
        const { data, error } = await supabase.rpc('deduct_sparks', {
            p_user_id: uid,
            p_amount: amount,
        });
        if (error) throw error;
        return data === true;
    } catch (e) {
        console.error('Spark deduction failed:', e);
        return false;
    }
};
