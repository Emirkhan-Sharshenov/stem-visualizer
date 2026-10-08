// Freemius payment webhook as a Supabase Edge Function (Deno): turns a paid license into Pro / Teacher.
import { createClient } from 'npm:@supabase/supabase-js@2';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const SECRET = Deno.env.get('FREEMIUS_SECRET_KEY') ?? '';
const TEACHER_PLAN = Deno.env.get('FREEMIUS_TEACHER_PLAN_ID') ?? '';

async function hmacHex(key: string, body: ArrayBuffer) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, body);
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const same = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
};

Deno.serve(async (req) => {
  // always 200 so Freemius doesn't retry forever; problems go to the function logs
  const ok = () => new Response('ok');
  if (req.method !== 'POST') return ok();
  if (!SECRET) {
    console.warn('[billing] FREEMIUS_SECRET_KEY is not set');
    return ok();
  }
  const raw = await req.arrayBuffer();
  const expected = await hmacHex(SECRET, raw);
  if (!same(req.headers.get('x-signature') ?? '', expected)) {
    console.warn('[billing] bad signature');
    return ok();
  }
  // deno-lint-ignore no-explicit-any
  let ev: any;
  try {
    ev = JSON.parse(new TextDecoder().decode(raw));
  } catch {
    return ok();
  }
  const type: string = ev.type || '';
  const license = ev.objects?.license;
  const licenseId = String(license?.id ?? ev.data?.license_id ?? '');
  console.log('[billing]', type, licenseId);

  // license gone, revoked or refunded: end access now
  if (/^license\.(deleted|cancelled)$/.test(type) || /^payment\.(refund|dispute\.lost)$/.test(type)) {
    if (licenseId) await admin.from('subscriptions').update({ status: 'canceled', expires_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('external_id', licenseId);
    return ok();
  }
  if (!license || !/^(license|subscription|payment)\./.test(type)) return ok();

  const email = ev.objects?.user?.email;
  let userId: string | null = null;
  if (email) {
    const { data } = await admin.rpc('user_id_by_email', { p_email: email });
    userId = (data as string) || null;
  }
  if (!userId) {
    const { data } = await admin.from('subscriptions').select('user_id').eq('external_id', licenseId).maybeSingle();
    userId = data?.user_id ?? null;
  }
  if (!userId) {
    console.warn('[billing] no account for', email);
    return ok();
  }

  // Freemius dates are UTC "YYYY-MM-DD HH:MM:SS"; null means lifetime
  const expires = license.expiration ? new Date(String(license.expiration).replace(' ', 'T') + 'Z') : new Date(Date.now() + 100 * 365 * 864e5);
  const active = !license.is_cancelled && type !== 'license.expired' && expires > new Date();
  const plan = TEACHER_PLAN && String(license.plan_id) === TEACHER_PLAN ? 'teacher' : 'pro';
  const { error } = await admin.from('subscriptions').upsert({
    user_id: userId,
    plan,
    status: active ? 'active' : 'expired',
    expires_at: expires.toISOString(),
    source: 'freemius',
    external_id: licenseId,
    updated_at: new Date().toISOString(),
  });
  if (error) console.warn('[billing] upsert', error.message);
  return ok();
});
