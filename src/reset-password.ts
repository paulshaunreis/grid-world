import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from './persistence/config';
import './site.css';

const form = document.querySelector<HTMLFormElement>('#reset-form')!;
const password = document.querySelector<HTMLInputElement>('#new-password')!;
const confirmation = document.querySelector<HTMLInputElement>('#confirm-password')!;
const submit = document.querySelector<HTMLButtonElement>('#reset-submit')!;
const status = document.querySelector<HTMLDivElement>('#reset-status')!;

function showStatus(message: string, kind: 'info' | 'error' | 'success') {
  status.textContent = message;
  status.className = kind;
}
function setFormEnabled(enabled: boolean) {
  password.disabled = !enabled;
  confirmation.disabled = !enabled;
  submit.disabled = !enabled;
}

setFormEnabled(false);
if (!supabaseConfigured || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  showStatus('Password reset is temporarily unavailable. Please try again later.', 'error');
} else {
  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  let recoverySessionReady = false;
  let completed = false;

  // Only enable password changes after Supabase confirms a recovery session.
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' && session) {
      recoverySessionReady = true;
      setFormEnabled(true);
      showStatus('Secure link verified. Choose a new password of at least 12 characters.', 'info');
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!recoverySessionReady || completed) {
      showStatus('This reset link is invalid or has expired. Request a new one from account recovery.', 'error');
      setFormEnabled(false);
      return;
    }
    const nextPassword = password.value;
    if (nextPassword.length < 12) {
      showStatus('Choose a password with at least 12 characters.', 'error');
      password.focus();
      return;
    }
    if (nextPassword !== confirmation.value) {
      showStatus('The passwords do not match. Check both fields and try again.', 'error');
      confirmation.focus();
      return;
    }

    setFormEnabled(false);
    submit.textContent = 'UPDATING…';
    showStatus('Updating your password…', 'info');
    try {
      const { error } = await client.auth.updateUser({ password: nextPassword });
      if (error) throw error;
      completed = true;
      showStatus('Your password has been updated. You can now sign in with the new password.', 'success');
      form.reset();
      submit.textContent = 'PASSWORD UPDATED';
      window.setTimeout(() => { window.location.href = '/signin.html'; }, 1800);
    } catch {
      showStatus('We could not update your password. The reset link may have expired; request a new one and try again.', 'error');
      setFormEnabled(recoverySessionReady);
      submit.textContent = 'UPDATE PASSWORD';
    }
  });

  // An invalid/expired link never receives a recovery event; explain the safe next step.
  window.setTimeout(() => {
    if (!recoverySessionReady && !completed) {
      showStatus('This reset link is invalid or expired. Request a new reset email to continue.', 'error');
    }
  }, 8000);
}
