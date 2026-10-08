// Supabase Edge Function: verify Cloudflare Turnstile CAPTCHA token.
// Deploy: supabase functions deploy verify-captcha --no-verify-jwt
// Set TURNSTILE_SECRET_KEY in Supabase dashboard → Edge Functions → Secrets.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

serve(async (req: Request) => {
  // CORS for the GridWorld site
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Missing token' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const secret = Deno.env.get('TURNSTILE_SECRET_KEY');
    if (!secret) {
      console.error('TURNSTILE_SECRET_KEY not configured');
      return new Response(JSON.stringify({ success: false, error: 'Server not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);

    const verifyRes = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData,
    });
    const verifyData = await verifyRes.json();

    return new Response(JSON.stringify({ success: verifyData.success === true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: 'Verification failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
