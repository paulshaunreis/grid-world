import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from './persistence/config';
import './site.css';

// GridWorld account recovery — 3 steps: email → security questions → reset email sent.
// Answers are hashed client-side (lowercase + SHA-256, matching signup) and verified
// server-side via the verify_recovery_answers RPC. Hashes never leave the server.

const app = document.querySelector<HTMLDivElement>('#recover-app')!;

if (!supabaseConfigured || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  app.innerHTML = `<div class="recover-card"><h1>Recovery unavailable.</h1><p class="recover-sub">The account backend is not configured.</p><a href="/">← Back</a></div>`;
} else {
  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  let step = 0;
  let email = '';
  let questions: string[] = [];

  function dots(): string {
    return `<div class="step-dots">${[0, 1, 2].map(i => `<i class="${i <= step ? 'done' : ''}"></i>`).join('')}</div>`;
  }

  function setStatus(msg: string, cls: string): void {
    const el = app.querySelector<HTMLDivElement>('#recover-status');
    if (el) { el.textContent = msg; el.className = 'recover-status ' + cls; }
  }

  async function hashAnswer(answer: string): Promise<string> {
    const data = new TextEncoder().encode(answer.trim().toLowerCase());
    const hash = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function render(): void {
    let html = '';

    if (step === 0) {
      // STEP 1: Email
      html = `<div class="recover-card">
        <div class="recover-kicker">GRID WORLD // ACCOUNT RECOVERY</div>
        ${dots()}
        <h1>Recover your <span class="accent">account.</span></h1>
        <p class="recover-sub">Enter the email you signed up with. We'll pull up your security questions next.</p>
        <div class="field">
          <label for="r-email">Email</label>
          <input id="r-email" type="email" placeholder="you@example.com" autocomplete="email">
        </div>
        <div id="recover-status" class="recover-status"></div>
        <div class="btn-row">
          <button class="btn btn-primary" id="r-next">CONTINUE →</button>
        </div>
        <div class="recover-alt">Remembered it? <a href="/enter.html">Log in</a></div>
      </div>`;
    } else if (step === 1) {
      // STEP 2: Security questions
      html = `<div class="recover-card">
        <div class="recover-kicker">GRID WORLD // VERIFY IDENTITY</div>
        ${dots()}
        <h1>Answer your <span class="accent">security questions.</span></h1>
        <p class="recover-sub">Answer all three correctly to prove it's you.</p>
        ${questions.map((q, i) => `
          <div class="field">
            <div class="q-label">${i + 1}. ${q}</div>
            <input id="r-a${i}" type="text" placeholder="Your answer" autocomplete="off">
          </div>`).join('')}
        <div id="recover-status" class="recover-status"></div>
        <div class="btn-row">
          <button class="btn btn-ghost" id="r-back">← BACK</button>
          <button class="btn btn-primary" id="r-verify">VERIFY ANSWERS</button>
        </div>
      </div>`;
    } else {
      // STEP 3: Done — reset email sent
      html = `<div class="recover-card">
        <div class="recover-kicker">GRID WORLD // CHECK YOUR INBOX</div>
        ${dots()}
        <h1>Reset link <span class="accent">sent.</span></h1>
        <p class="recover-sub">Identity verified. We've sent a password reset link to <strong>${email}</strong>. Click it to choose a new password, then log in.</p>
        <div class="btn-row">
          <button class="btn btn-primary" id="r-done">BACK TO LOGIN</button>
        </div>
      </div>`;
    }

    app.innerHTML = html;
    wire();
  }

  function wire(): void {
    if (step === 0) {
      const next = app.querySelector<HTMLButtonElement>('#r-next')!;
      const emailEl = app.querySelector<HTMLInputElement>('#r-email')!;
      emailEl.focus();
      const go = async () => {
        const e = emailEl.value.trim();
        if (!e || !e.includes('@')) { setStatus('Enter a valid email address.', 'error'); return; }
        next.disabled = true; next.textContent = 'LOOKING UP…';
        setStatus('Looking up your security questions…', 'info');
        try {
          const { data, error } = await client.rpc('get_recovery_questions', { p_email: e });
          if (error) throw error;
          const row = Array.isArray(data) ? data[0] : data;
          if (!row || !row.q1) {
            setStatus('No account found with that email, or no security questions set up.', 'error');
            next.disabled = false; next.textContent = 'CONTINUE →';
            return;
          }
          email = e;
          questions = [row.q1, row.q2, row.q3];
          step = 1;
          render();
        } catch (err) {
          setStatus('Something went wrong. Try again.', 'error');
          next.disabled = false; next.textContent = 'CONTINUE →';
        }
      };
      next.addEventListener('click', go);
      emailEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    } else if (step === 1) {
      app.querySelector<HTMLButtonElement>('#r-back')!.addEventListener('click', () => { step = 0; render(); });
      const verify = app.querySelector<HTMLButtonElement>('#r-verify')!;
      verify.addEventListener('click', async () => {
        const answers = [0, 1, 2].map(i => (app.querySelector<HTMLInputElement>(`#r-a${i}`)!).value);
        if (answers.some(a => !a.trim())) { setStatus('Answer all three questions.', 'error'); return; }
        verify.disabled = true; verify.textContent = 'VERIFYING…';
        setStatus('Checking your answers…', 'info');
        try {
          const hashes = await Promise.all(answers.map(hashAnswer));
          const { data, error } = await client.rpc('verify_recovery_answers', {
            p_email: email, p_h1: hashes[0], p_h2: hashes[1], p_h3: hashes[2],
          });
          if (error) throw error;
          if (data === true) {
            // Verified — send the password reset email
            const { error: resetErr } = await client.auth.resetPasswordForEmail(email, {
              redirectTo: 'https://grid-world-qghn.onrender.com/enter.html',
            });
            if (resetErr) throw resetErr;
            step = 2;
            render();
          } else {
            setStatus('One or more answers didn\'t match. Try again.', 'error');
            verify.disabled = false; verify.textContent = 'VERIFY ANSWERS';
          }
        } catch (err) {
          setStatus('Something went wrong. Try again.', 'error');
          verify.disabled = false; verify.textContent = 'VERIFY ANSWERS';
        }
      });
    } else {
      app.querySelector<HTMLButtonElement>('#r-done')!.addEventListener('click', () => {
        window.location.href = '/enter.html';
      });
    }
  }

  render();
}
