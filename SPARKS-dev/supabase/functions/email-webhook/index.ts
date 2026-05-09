import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WEBHOOK_SECRET   = Deno.env.get('RESEND_WEBHOOK_SECRET') ?? '';

// Higher rank = further in funnel. Never downgrade.
const STATUS_RANK: Record<string, number> = {
  pending: 0, enriched: 1, drafted: 2,
  sent: 3, opened: 4, clicked: 5, replied: 6, converted: 7,
  interested: 7, not_interested: 7, skipped: 7, bounced: 7,
};

const EVENT_STATUS: Record<string, string> = {
  'email.sent':       'sent',
  'email.opened':     'opened',
  'email.clicked':    'clicked',
  'email.bounced':    'bounced',
  'email.complained': 'bounced',
};

async function verifySignature(req: Request, body: string): Promise<boolean> {
  if (!WEBHOOK_SECRET) return true; // Skip in development
  const svixId        = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');
  if (!svixId || !svixTimestamp || !svixSignature) return false;

  const toSign = `${svixId}.${svixTimestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(toSign));
  const computed = `v1,${btoa(String.fromCharCode(...new Uint8Array(sig)))}`;
  return svixSignature.split(' ').some(s => s === computed);
}

serve(async (req) => {
  const rawBody = await req.text();

  if (!await verifySignature(req, rawBody)) {
    return new Response('Unauthorized', { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const type = String(payload.type ?? '');
  const data = (payload.data ?? {}) as Record<string, unknown>;

  // ── Inbound reply ────────────────────────────────────────────────────────
  if (type === 'email.received') {
    const toField = data.to as Array<{ email: string }> | undefined;
    const toEmail = toField?.[0]?.email ?? '';
    const match = toEmail.match(/^replies\+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})@/i);
    if (!match) return new Response('OK', { status: 200 });

    const prospectId = match[1];
    const { data: current } = await supabase
      .from('email_prospects')
      .select('send_status')
      .eq('id', prospectId)
      .single();

    if (current && (STATUS_RANK['replied'] ?? 0) > (STATUS_RANK[current.send_status] ?? 0)) {
      await supabase.from('email_prospects').update({
        send_status: 'replied',
        replied_at: new Date().toISOString(),
      }).eq('id', prospectId);
    }
    return new Response('OK', { status: 200 });
  }

  // ── Delivery/engagement events ───────────────────────────────────────────
  const newStatus = EVENT_STATUS[type];
  if (!newStatus) return new Response('OK', { status: 200 });

  const emailId = String(data.email_id ?? data.id ?? '');
  if (!emailId) return new Response('OK', { status: 200 });

  const { data: prospect } = await supabase
    .from('email_prospects')
    .select('id, send_status')
    .eq('resend_message_id', emailId)
    .single();

  if (!prospect) return new Response('OK', { status: 200 });

  if ((STATUS_RANK[newStatus] ?? 0) > (STATUS_RANK[prospect.send_status] ?? 0)) {
    await supabase.from('email_prospects')
      .update({ send_status: newStatus })
      .eq('id', prospect.id);
  }

  return new Response('OK', { status: 200 });
});
