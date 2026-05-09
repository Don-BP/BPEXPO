import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signInWithGoogle: async () => { },
    logout: async () => { }
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load current session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            if (session?.user) {
                import('../lib/db').then(({ ensureUserProfile }) => {
                    ensureUserProfile(session.user).catch(console.error);
                });
            }
        });

        // Listen for auth state changes (sign in, sign out, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);

                if (event === 'SIGNED_IN' && session?.user) {
                    const { ensureUserProfile } = await import('../lib/db');
                    ensureUserProfile(session.user).catch(console.error);
                }
            }
        );

        // Handle deep link OAuth callback on native Capacitor
        const urlListenerPromise = App.addListener('appUrlOpen', async ({ url }) => {
            if (url.includes('login-callback')) {
                await Browser.close();
                const { error } = await supabase.auth.exchangeCodeForSession(url);
                if (error) console.error('OAuth callback error:', error);
            }
        });

        return () => {
            subscription.unsubscribe();
            urlListenerPromise.then(listener => listener.remove());
        };
    }, []);

    const signInWithGoogle = async () => {
        setLoading(true);
        try {
            if (Capacitor.isNativePlatform()) {
                // Native: open system browser for OAuth, return via deep link
                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: 'com.sparks.app://login-callback',
                        skipBrowserRedirect: true,
                    }
                });
                if (error) throw error;
                if (data.url) await Browser.open({ url: data.url });
            } else {
                // Web: standard redirect — Supabase handles the callback at /auth/callback
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                    }
                });
                if (error) throw error;
            }
        } catch (error) {
            console.error('Error signing in with Google:', error);
            setLoading(false);
            throw error;
        }
    };

    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
