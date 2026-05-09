import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AuthCallback = () => {
    const navigate = useNavigate();
    const hasExchanged = useRef(false);

    useEffect(() => {
        // Guard against React StrictMode double-invocation — PKCE codes are single-use.
        if (hasExchanged.current) return;
        hasExchanged.current = true;

        supabase.auth.exchangeCodeForSession(window.location.href)
            .then(() => navigate('/'))
            .catch((err) => {
                console.error('OAuth callback error:', err);
                navigate('/');
            });
    }, [navigate]);

    return <div>Signing you in...</div>;
};
