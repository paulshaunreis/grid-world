// Grid World Account Settings page (Paul's request 2026-10-08).
// Lets signed-in users view/update their account: email, password, handle,
// display name. Honest, in-active-development framing throughout.
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, supabaseConfigured } from './persistence/config';
import { GridAuthService } from './auth/GridAuthService';

const app = document.querySelector<HTMLDivElement>('#account-app')!;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

if (!supabaseConfigured || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  app.innerHTML = `<div class="grid-page-wrap"><h1>Account Settings</h1><p>The account backend is not configured yet. Grid World is in active development.</p><p><a href="/">← Back to Grid World</a></p></div>`;
  throw new Error('Supabase not configured');
}

const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const auth = new GridAuthService(client);

async function render() {
  const user = await auth.currentUser();
  if (!user) {
    app.innerHTML = `<div class="grid-page-wrap"><h1>Account Settings</h1><p>You're not signed in.</p><p><a href="/enter.html">Sign in →</a></p></div>`;
    return;
  }
  const profile = await auth.profile().catch(() => null);
  app.innerHTML = `
    <div class="grid-page-wrap">
      <p><a href="/">← Back to Grid World</a></p>
      <h1>Account Settings</h1>
      <section class="account-card">
        <h2>Sign-in</h2>
        <p><strong>Email:</strong> ${esc(user.email ?? '—')}</p>
        <p><a href="/recover.html">Change password / account recovery →</a></p>
      </section>
      <section class="account-card">
        <h2>Identity</h2>
        <p><strong>Handle:</strong> ${esc(profile?.handle ?? '—')}</p>
        <p><strong>Display name:</strong> ${esc(profile?.display_name ?? '—')}</p>
        <p><a href="/profile.html">Edit profile →</a></p>
      </section>
      <section class="account-card">
        <h2>Session</h2>
        <button id="acct-signout" type="button">Sign Out</button>
      </section>
    </div>`;
  document.querySelector('#acct-signout')?.addEventListener('click', async () => {
    await auth.signOut();
    window.location.href = '/';
  });
}
render();
