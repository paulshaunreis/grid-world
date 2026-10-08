// Grid World Account Settings page (Paul's request 2026-10-08).
// Full account overview after sign-in: identity, handle, security,
// Grid Coin balance, land holdings, membership. Honest in-active-development framing.
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, supabaseConfigured } from './persistence/config';
import { GridAuthService } from './auth/GridAuthService';

const app = document.querySelector<HTMLDivElement>('#account-app')!;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const pageStyle = document.createElement('style');
pageStyle.textContent = `
.grid-page-wrap{max-width:860px;margin:0 auto;padding:48px 24px}
.grid-page-wrap h1{font:700 32px system-ui;color:#f2fbff;margin:0 0 8px}
.grid-page-wrap .lede{font:14px system-ui;color:rgba(230,245,255,.6);margin:0 0 32px}
.account-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:700px){.account-grid{grid-template-columns:1fr}}
.account-card{padding:24px;border:1px solid rgba(100,220,255,.15);border-radius:10px;
  background:linear-gradient(165deg,rgba(10,24,42,.9),rgba(5,13,23,.92))}
.account-card h2{font:700 12px system-ui;letter-spacing:.18em;color:#00e5ff;margin:0 0 16px}
.account-card p{font:14px/1.7 system-ui;color:rgba(230,245,255,.75);margin:6px 0}
.account-card p strong{color:#fff}
.account-card a{color:#00e5ff;text-decoration:none;font-size:13px}
.account-card a:hover{text-decoration:underline}
.account-card button{padding:12px 24px;font:700 12px system-ui;letter-spacing:.1em;color:#eaf8ff;
  background:transparent;border:1px solid rgba(100,220,255,.3);border-radius:6px;cursor:pointer}
.account-card button:hover{border-color:#00e5ff;background:rgba(0,229,255,.06)}
.account-card .dev-note{font-size:12px;color:rgba(230,245,255,.4);font-style:italic}
`;
document.head.appendChild(pageStyle);

if (!supabaseConfigured || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  app.innerHTML = `<div class="grid-page-wrap"><h1>Account Settings</h1><p class="lede">The account backend is not configured yet. Grid World is in active development.</p><p><a href="/" style="color:#00e5ff">← Back to Grid World</a></p></div>`;
  throw new Error('Supabase not configured');
}

const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const auth = new GridAuthService(client);

async function render() {
  const user = await auth.currentUser();
  if (!user) {
    app.innerHTML = `<div class="grid-page-wrap"><h1>Account Settings</h1><p class="lede">You're not signed in.</p><p><a href="/signin.html" style="color:#00e5ff">Sign in →</a></p></div>`;
    return;
  }
  const profile = await auth.profile().catch(() => null);
  const handle = profile?.handle ?? '—';
  const displayName = profile?.display_name ?? '—';

  app.innerHTML = `
    <div class="grid-page-wrap">
      <p><a href="/" style="color:#00e5ff">← Back to Grid World</a></p>
      <h1>Welcome, ${esc(handle)}</h1>
      <p class="lede">Manage your Grid World citizen account. The world is in active development — more settings arrive as systems come online.</p>
      <div class="account-grid">
        <section class="account-card">
          <h2>CITIZEN IDENTITY</h2>
          <p><strong>Handle:</strong> @${esc(handle)}</p>
          <p><strong>Display name:</strong> ${esc(displayName)}</p>
          <p><strong>Avatar style:</strong> ${esc(profile?.avatar_style ?? '—')}</p>
          <p><a href="/profile.html">Edit profile →</a></p>
        </section>
        <section class="account-card">
          <h2>SIGN-IN & SECURITY</h2>
          <p><strong>Email:</strong> ${esc(user.email ?? '—')}</p>
          <p><strong>Confirmed:</strong> ${user.email_confirmed_at ? 'Yes ✓' : 'Pending'}</p>
          <p><a href="/recover.html">Change password / account recovery →</a></p>
        </section>
        <section class="account-card">
          <h2>GRID COIN</h2>
          <p class="dev-note">Wallet balance and transaction history are in active development.</p>
          <p><a href="/economics.html">How Grid Coin works →</a></p>
        </section>
        <section class="account-card">
          <h2>LAND & MEMBERSHIP</h2>
          <p class="dev-note">Land holdings and membership tier are in active development.</p>
          <p><a href="/membership.html">Membership options →</a></p>
        </section>
        <section class="account-card">
          <h2>NOTIFICATIONS</h2>
          <p class="dev-note">Notification preferences are in active development.</p>
        </section>
        <section class="account-card">
          <h2>SESSION</h2>
          <p>Signed in as ${esc(user.email ?? '—')}</p>
          <p><button id="acct-signout" type="button">Sign Out</button></p>
        </section>
      </div>
    </div>`;
  document.querySelector('#acct-signout')?.addEventListener('click', async () => {
    await auth.signOut();
    window.location.href = '/';
  });
}
render();
