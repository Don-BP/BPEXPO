import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const ACTIVE_EVENTS = new Set([
  'INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION',
]);
const INACTIVE_EVENTS = new Set([
  'EXPIRATION', 'CANCELLATION', 'BILLING_ISSUE',
]);

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  let event: any;
  try {
    event = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { event: eventType, app_user_id, entitlement_id } = event;
  if (!app_user_id) return new Response('Missing app_user_id', { status: 400 });

  if (ACTIVE_EVENTS.has(eventType)) {
    await supabase
      .from('user_profiles')
      .update({ subscription_status: 'premium', subscription_entitlement: entitlement_id })
      .eq('id', app_user_id);
  } else if (INACTIVE_EVENTS.has(eventType)) {
    await supabase
      .from('user_profiles')
      .update({ subscription_status: 'free', subscription_entitlement: null })
      .eq('id', app_user_id);
  }

  return new Response('OK', { status: 200 });
});
