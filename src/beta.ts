// GridWorld Beta Program — application page.
// GridWorld is in closed development. No public access. Visitors apply here;
// team reviews applications. Paul's direction 2026-10-08.
import './beta.css';
import './theme/accent.css';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, supabaseConfigured } from './persistence/config';

const root = document.querySelector<HTMLDivElement>('#beta-root')!;

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderForm(prefillEmail = '', notice = ''): void {
  root.innerHTML = `
  <main class="beta-wrap">
    <section class="beta-hero">
      <span class="beta-dev-badge">CLOSED DEVELOPMENT · BY APPLICATION ONLY</span>
      <h1>GridWorld Beta Program</h1>
      <p class="beta-lede">GridWorld is in active development and not yet open to the public.
      Beta testers get early access, help shape the world, and work directly with the build team.</p>
      ${notice ? `<div class="beta-notice">${notice}</div>` : ''}
    </section>

    <section class="beta-grid">
      <div class="beta-card">
        <h2>What beta testers do</h2>
        <ul>
          <li>Explore early builds and report what works — and what breaks</li>
          <li>Give honest feedback on worlds, creatures, and systems</li>
          <li>Help us find the fun before the world opens wider</li>
          <li>Keep unreleased details private until they're public</li>
        </ul>
      </div>
      <div class="beta-card">
        <h2>What you get</h2>
        <ul>
          <li>Early access to First Light and new regions as they open</li>
          <li>A <span class="badge-beta">BETA</span> badge on your profile</li>
          <li>Direct line to the team through beta channels</li>
          <li>Your name in the beta credits when we launch</li>
        </ul>
      </div>
    </section>

    <section class="beta-form-card">
      <h2>Apply for beta access</h2>
      <p class="beta-form-sub">Applications are reviewed by the GridWorld team. We'll reach out by email.</p>
      <div class="beta-error" id="beta-error" role="alert"></div>
      <form id="beta-form">
        <div class="beta-field">
          <label for="beta-name">NAME</label>
          <input type="text" id="beta-name" required maxlength="80" placeholder="What should we call you?">
        </div>
        <div class="beta-field">
          <label for="beta-email">EMAIL</label>
          <input type="email" id="beta-email" required maxlength="160" placeholder="you@example.com" value="${esc(prefillEmail)}">
        </div>
        <div class="beta-row">
          <div class="beta-field">
            <label for="beta-age">AGE RANGE</label>
            <select id="beta-age">
              <option value="">Prefer not to say</option>
              <option>Under 13</option>
              <option>13–17</option>
              <option>18–24</option>
              <option>25–34</option>
              <option>35–44</option>
              <option>45+</option>
            </select>
          </div>
          <div class="beta-field">
            <label for="beta-device">PRIMARY DEVICE</label>
            <select id="beta-device">
              <option value="">Select…</option>
              <option>Desktop (Windows)</option>
              <option>Desktop (Mac)</option>
              <option>Desktop (Linux)</option>
              <option>Mobile (iOS)</option>
              <option>Mobile (Android)</option>
              <option>VR Headset</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div class="beta-field">
          <label for="beta-interests">INTERESTS <span class="opt">(optional)</span></label>
          <input type="text" id="beta-interests" maxlength="200" placeholder="Building, exploring, creatures, economy, social…">
        </div>
        <div class="beta-field">
          <label for="beta-why">WHY DO YOU WANT TO TEST GRIDWORLD?</label>
          <textarea id="beta-why" rows="4" maxlength="1000" placeholder="Tell us in your own words…"></textarea>
        </div>
        <button class="beta-btn" type="submit" id="beta-submit">SUBMIT APPLICATION →</button>
      </form>
    </section>

    <footer class="beta-foot">
      <p>GridWorld is in active development. Beta access is limited and not guaranteed.</p>
      <p>© 2026 GridWorld. All rights reserved.</p>
    </footer>
  </main>`;

  const form = document.querySelector<HTMLFormElement>('#beta-form')!;
  const errBox = document.querySelector<HTMLDivElement>('#beta-error')!;
  const submitBtn = document.querySelector<HTMLButtonElement>('#beta-submit')!;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errBox.classList.remove('show');
    submitBtn.disabled = true;
    submitBtn.textContent = 'SUBMITTING…';

    const get = (id: string) => (document.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(id)?.value || '').trim();
    const payload = {
      name: get('#beta-name'),
      email: get('#beta-email').toLowerCase(),
      age_range: get('#beta-age') || null,
      device: get('#beta-device') || null,
      interests: get('#beta-interests') || null,
      why_test: get('#beta-why') || null,
    };

    if (!payload.name || !payload.email) {
      errBox.textContent = 'Please fill in your name and email.';
      errBox.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = 'SUBMIT APPLICATION →';
      return;
    }

    try {
      if (!supabaseConfigured || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) throw new Error('backend');
      const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

      // Attach the signed-in user id if they have an account (lets us auto-approve later).
      let userId: string | null = null;
      try {
        const { data: { user } } = await client.auth.getUser();
        userId = user?.id ?? null;
      } catch { /* anon application is fine */ }

      const { error } = await client.from('grid_beta_applications').insert({
        user_id: userId,
        name: payload.name,
        email: payload.email,
        age_range: payload.age_range,
        interests: payload.interests,
        why_test: payload.why_test,
        device: payload.device,
      });
      if (error) throw error;

      renderSuccess(payload.name);
    } catch (err) {
      console.error('Beta application failed:', err);
      errBox.textContent = 'Something went wrong submitting your application. Please try again.';
      errBox.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = 'SUBMIT APPLICATION →';
    }
  });
}

function renderSuccess(name: string): void {
  root.innerHTML = `
  <main class="beta-wrap">
    <section class="beta-hero">
      <span class="beta-dev-badge">APPLICATION RECEIVED</span>
      <h1>You're on the list, ${esc(name)}.</h1>
      <p class="beta-lede">Thanks for applying to the GridWorld beta program. The team reviews
      every application by hand — we'll reach out by email when there's news.</p>
      <p class="beta-lede">While you wait, you can explore the public pages and meet the mascots.</p>
      <div class="beta-actions">
        <a class="beta-btn" href="/store.html">Meet the Mascots</a>
        <a class="beta-btn beta-btn-ghost" href="/">Back to GridWorld</a>
      </div>
    </section>
    <footer class="beta-foot">
      <p>© 2026 GridWorld. All rights reserved.</p>
    </footer>
  </main>`;
}

// If the visitor arrived here after being gated, show context.
// ?reason=signedup → they just created an account and need beta approval.
async function init(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const reason = params.get('reason');
  let notice = '';
  let prefill = '';

  if (reason === 'signedup' || reason === 'signin') {
    notice = `<strong>GridWorld is in closed development.</strong> Your account is created, but full access
      requires beta approval. Apply below and we'll be in touch.`;
    // Prefill email from the signed-in session if available.
    if (supabaseConfigured && SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
      try {
        const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
        const { data: { user } } = await client.auth.getUser();
        prefill = user?.email ?? '';
      } catch { /* ignore */ }
    }
  }

  renderForm(prefill, notice);
}

init();
