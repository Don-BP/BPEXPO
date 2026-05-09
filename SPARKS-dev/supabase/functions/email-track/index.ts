import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SPARKS_SIGNUP_URL = Deno.env.get('SPARKS_SIGNUP_URL') ?? 'https://sparks-app.com/signup';

serve(async (req) => {
  const url   = new URL(req.url);
  const token = url.searchParams.get('token') ?? '';

  if (token) {
    try {
      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
      const { data: prospect } = await supabase
        .from('email_prospects')
        .select('id, send_status')
        .eq('tracking_token', token)
        .single();

      if (prospect && prospect.send_status !== 'converted') {
        await supabase.from('email_prospects').update({
          send_status: 'converted',
          converted_at: new Date().toISOString(),
        }).eq('id', prospect.id);
      }
    } catch { /* best-effort — always redirect */ }
  }

  return new Response(null, {
    status: 302,
    headers: { Location: SPARKS_SIGNUP_URL },
  });
});
