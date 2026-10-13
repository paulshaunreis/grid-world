import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from './persistence/config';
import './site.css';

// Account recovery intentionally uses Supabase Auth's email reset flow only.
// Do not reveal security-question prompts or expose an answer-verification oracle.

const app = document.querySelector<HTMLDivElement>('#recover-app')!;

app.innerHTML = `
  <div class="recover-card">
    <div class="recover-kicker">GRID WORLD // ACCOUNT RECOVERY</div>
    <h1>Recover your <span class="accent">account.</span></h1>
    <p class="recover-sub">Enter your account email. If an eligible account exists, we'll send password-reset instructions.</p>
    <form id="recover-form" novalidate>
      <div class="field">
        <label for="r-email">Email</label>
        <input id="r-email" type="email" placeholder="you@example.com" autocomplete="email" required>
      </div>
      <div id="recover-status" class="recover-status" role="status" aria-live="polite"></div>
      <div class="btn-row">
        <button class="btn btn-primary" id="r-submit" type="submit">SEND RESET EMAIL</button>
      </div>
    </form>
    <div class="recover-alt">Remembered it? <a href="/enter.html">Log in</a></div>
  </div>`;

const form = app.querySelector<HTMLFormElement>('#recover-form')!;
const emailInput = app.querySelector<HTMLInputElement>('#r-email')!;
const submit = app.querySelector<HTMLButtonElement>('#r-submit')!;
const status = app.querySelector<HTMLDivElement>('#recover-status')!;

if (!supabaseConfigured || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  emailInput.disabled = true;
  submit.disabled = true;
  status.textContent = 'Account recovery is temporarily unavailable. Please try again later.';
  status.className = 'recover-status error';
} else {
  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    if (!email || !emailInput.checkValidity()) {
      status.textContent = 'Enter a valid email address.';
      status.className = 'recover-status error';
      emailInput.focus();
      return;
    }

    submit.disabled = true;
    submit.textContent = 'SENDING…';
    status.textContent = 'Submitting your request…';
    status.className = 'recover-status info';

    try {
      // Supabase Auth issues the reset email. Inspect SDK-returned errors as well
      // as thrown exceptions, but never expose provider/account details to the UI.
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password.html`,
      });
      if (error) throw error;
    } catch {
      // Keep the public response identical to avoid disclosing account existence
      // or provider-specific details. End-to-end email delivery must be tested.
    }

    status.textContent = 'If an eligible account exists for that email, reset instructions will arrive shortly. Check your inbox and spam folder.';
    status.className = 'recover-status success';
    submit.textContent = 'REQUEST SUBMITTED';
  });
}
