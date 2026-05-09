import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL        = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY      = Deno.env.get('RESEND_API_KEY')!;
const RESEND_FROM_EMAIL   = Deno.env.get('RESEND_FROM_EMAIL')!;
const RESEND_REPLY_DOMAIN = Deno.env.get('RESEND_REPLY_DOMAIN')!;
const SPARKS_TRACKING_URL = Deno.env.get('SPARKS_TRACKING_URL')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  let prospect_ids: string[];
  let scheduled_at: string | null;

  try {
    const body = await req.json();
    prospect_ids = body.prospect_ids ?? [];
    scheduled_at = body.scheduled_at ?? null;
  } catch {
    return json({ ok: false, error: 'Invalid request body' });
  }

  if (!prospect_ids.length) return json({ ok: false, error: 'prospect_ids required' });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: prospects, error } = await supabase
    .from('email_prospects')
    .select('id, email, draft_subject, draft_body')
    .in('id', prospect_ids)
    .eq('send_status', 'drafted');

  if (error) return json({ ok: false, error: error.message });
  if (!prospects?.length) return json({ ok: true, sent: 0 });

  let sent = 0;
  await Promise.allSettled(
    prospects.map(async (p) => {
      const trackingToken   = crypto.randomUUID();
      const replyToAddress  = `replies+${p.id}@${RESEND_REPLY_DOMAIN}`;
      const trackingLink    = `${SPARKS_TRACKING_URL}?token=${trackingToken}`;

      const bodyWithTracking =
        `${p.draft_body}\n\n---\nLearn more about SPARKS: ${trackingLink}\n詳しくはこちら / Más información: ${trackingLink}`;

      const resendPayload: Record<string, unknown> = {
        from: RESEND_FROM_EMAIL,
        to: [p.email],
        reply_to: replyToAddress,
        subject: p.draft_subject || 'A message from SPARKS',
        text: bodyWithTracking,
      };
      if (scheduled_at) resendPayload.scheduledAt = scheduled_at;

      try {
        const resp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resendPayload),
        });

        if (!resp.ok) {
          console.error(`Resend error for ${p.id}: ${await resp.text()}`);
          return;
        }

        const resendData = await resp.json();
        await supabase.from('email_prospects').update({
          resend_message_id: resendData.id ?? '',
          tracking_token: trackingToken,
          reply_to_address: replyToAddress,
          sent_at: new Date().toISOString(),
          send_status: 'sent',
        }).eq('id', p.id);
        sent++;
      } catch (e) {
        console.error(`Send error for ${p.id}:`, (e as Error).message);
      }
    })
  );

  return json({ ok: true, sent });
});

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
