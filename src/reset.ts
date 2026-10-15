// Grid World password reset completion (Phase 1 §F1 — closes audit A1).
//
// Before this page existed, reset links pointed at the site root / enter.html,
// which have no auth handling — a user could NEVER set a new password.
// This page is the only reset-completion UI: it detects the recovery session,
// shows the set-new-password form, and calls supabase.auth.updateUser().
//
// Session detection (both Supabase Auth flows):
//   - Implicit flow: the emailed link carries #access_token=...&type=recovery.
//     The Supabase client fires onAuthStateChange with PASSWORD_RECOVERY.
//   - PKCE flow: the emailed link carries ?code=. We exchange it via
//     exchangeCodeForSession(code).
// If neither yields a session, we show "link invalid or expired" + a link to
// /recover.html — never a password form with no session behind it.
//
// On success we sign out the recovery session and send the user to
// /signin.html?reset=success ("password updated, sign in").
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, supabaseConfigured } from './persistence/config';

const app = document.querySelector<HTMLDivElement>('#reset-app')!;

if (!supabaseConfigured || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  app.innerHTML = `<main class="reset-page"><div class="reset-card"><h1>Reset Password</h1><p class="sub">The account backend is not configured yet. Grid World is in active development.</p><p style="text-align:center"><a href="/" style="color:#00e5ff">← Back to Grid World</a></p></div></main>`;
  throw new Error('Supabase not configured');
}

const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

function showInvalid(msg: string): void {
  app.innerHTML = `
  <main class="reset-page">
    <div class="reset-card">
      <h1>◇ GRID WORLD</h1>
      <p class="sub">${msg}</p>
      <div class="reset-links"><a href="/recover.html">Request a new reset link →</a></div>
      <div class="reset-links"><a href="/signin.html">Back to sign in</a></div>
    </div>
  </main>`;
}

function showForm(): void {
  app.innerHTML = `
  <main class="reset-page">
    <div class="reset-card">
      <h1>◇ GRID WORLD</h1>
      <p class="sub">Choose a new password for your citizen account.</p>
      <div class="reset-error" id="reset-error" role="alert"></div>
      <div class="reset-ok" id="reset-ok" role="status"></div>
      <form id="reset-form">
        <div class="reset-field">
          <label for="reset-password">NEW PASSWORD</label>
          <input type="password" id="reset-password" name="password" autocomplete="new-password" required placeholder="••••••••••••">
        </div>
        <div class="reset-field">
          <label for="reset-confirm">CONFIRM NEW PASSWORD</label>
          <input type="password" id="reset-confirm" name="confirm" autocomplete="new-password" required placeholder="••••••••••••">
        </div>
        <button class="reset-btn" type="submit" id="reset-submit">SET NEW PASSWORD →</button>
      </form>
      <div class="reset-links"><a href="/signin.html">Back to sign in</a></div>
    </div>
  </main>`;

  const form = document.querySelector<HTMLFormElement>('#reset-form')!;
  const errBox = document.querySelector<HTMLDivElement>('#reset-error')!;
  const okBox = document.querySelector<HTMLDivElement>('#reset-ok')!;
  const submitBtn = document.querySelector<HTMLButtonElement>('#reset-submit')!;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errBox.classList.remove('show');
    const password = (document.querySelector<HTMLInputElement>('#reset-password')!.value || '');
    const confirm = (document.querySelector<HTMLInputElement>('#reset-confirm')!.value || '');
    if (password.length < 12) {
      errBox.textContent = 'Password needs 12+ characters.';
      errBox.classList.add('show');
      return;
    }
    if (password !== confirm) {
      errBox.textContent = 'Passwords do not match.';
      errBox.classList.add('show');
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = 'SAVING…';
    try {
      const { error } = await client.auth.updateUser({ password });
      if (error) throw error;
      okBox.textContent = 'Password updated. Signing you out — please sign in with your new password.';
      okBox.classList.add('show');
      // Sign out the recovery session so the next sign-in uses the new password.
      await client.auth.signOut();
      setTimeout(() => { window.location.href = '/signin.html?reset=success'; }, 1200);
    } catch (err: unknown) {
      errBox.textContent = err instanceof Error ? err.message : 'Could not update your password. Please try again.';
      errBox.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = 'SET NEW PASSWORD →';
    }
  });
}

async function init(): Promise<void> {
  // PKCE flow: ?code= — exchange it for a session.
  const code = new URLSearchParams(window.location.search).get('code');
  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
      showInvalid('This reset link is invalid or has expired. Reset links work once — request a new one.');
      return;
    }
    showForm();
    return;
  }

  // Implicit flow: the client fires PASSWORD_RECOVERY when it processes
  // the #access_token=...&type=recovery fragment.
  const { data: { subscription } } = client.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      subscription.unsubscribe();
      showForm();
    }
  });

  // Already signed in (e.g. page refresh after the session was established)?
  // A valid session is enough to set a password — the user proved ownership
  // by reaching this page with a live recovery session.
  const { data: { session } } = await client.auth.getSession();
  if (session) {
    subscription.unsubscribe();
    showForm();
    return;
  }

  // No session yet: give the client a moment to process the URL fragment,
  // then fall through to the invalid/expired message if nothing fired.
  setTimeout(async () => {
    const { data: { session: later } } = await client.auth.getSession();
    if (later) {
      subscription.unsubscribe();
      showForm();
    } else {
      subscription.unsubscribe();
      showInvalid('This reset link is invalid or has expired. Reset links work once — request a new one.');
    }
  }, 1500);
}

void init();
