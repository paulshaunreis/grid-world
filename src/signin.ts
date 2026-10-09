// Grid World sign-in page (Paul's request 2026-10-08).
// Second Life-style clean login: email + password, Supabase auth.
// Redirects to / on success. Honest in-active-development framing.
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, supabaseConfigured } from './persistence/config';
import { getAccessLevel, hasFullAccess } from './auth/accessGate';

const app = document.querySelector<HTMLDivElement>('#signin-app')!;

if (!supabaseConfigured || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  app.innerHTML = `<main class="signin-page"><div class="signin-card"><h1>Sign In</h1><p class="sub">The account backend is not configured yet. Grid World is in active development.</p><p style="text-align:center"><a href="/" style="color:#00e5ff">← Back to Grid World</a></p></div></main>`;
  throw new Error('Supabase not configured');
}

const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Already signed in? Go home.
client.auth.getSession().then(({ data }) => {
  if (data.session) window.location.href = '/';
});

app.innerHTML = `
<main class="signin-page">
  <div class="signin-card">
    <h1>◇ GRID WORLD</h1>
    <p class="sub">Sign in to your citizen account</p>
    <div class="signin-error" id="signin-error" role="alert"></div>
    <form id="signin-form">
      <div class="signin-field">
        <label for="signin-email">EMAIL</label>
        <input type="email" id="signin-email" name="email" autocomplete="email" required placeholder="you@example.com">
      </div>
      <div class="signin-field">
        <label for="signin-password">PASSWORD</label>
        <input type="password" id="signin-password" name="password" autocomplete="current-password" required placeholder="••••••••••">
      </div>
      <button class="signin-btn" type="submit" id="signin-submit">SIGN IN →</button>
    </form>
    <div class="signin-links">
      <a href="/recover.html">Forgot password?</a>
      <a href="/join.html">Create account</a>
    </div>
    <div class="signin-join">
      New to the Grid? <a href="/join.html">Join Grid World</a>
    </div>
  </div>
</main>`;

const form = document.querySelector<HTMLFormElement>('#signin-form')!;
const errBox = document.querySelector<HTMLDivElement>('#signin-error')!;
const submitBtn = document.querySelector<HTMLButtonElement>('#signin-submit')!;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errBox.classList.remove('show');
  submitBtn.disabled = true;
  submitBtn.textContent = 'SIGNING IN…';
  const email = (document.querySelector<HTMLInputElement>('#signin-email')!.value || '').trim().toLowerCase();
  const password = document.querySelector<HTMLInputElement>('#signin-password')!.value;
  try {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Closed development: non-approved accounts go to the beta application page.
    const level = await getAccessLevel();
    window.location.href = hasFullAccess(level) ? '/account.html' : '/beta.html?reason=signin';
  } catch (err: any) {
    errBox.textContent = err?.message === 'Invalid login credentials'
      ? 'Email or password didn\'t match. Try again or reset your password.'
      : (err?.message || 'Sign-in failed. Please try again.');
    errBox.classList.add('show');
    submitBtn.disabled = false;
    submitBtn.textContent = 'SIGN IN →';
  }
});
