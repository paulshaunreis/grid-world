import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from './persistence/config';
import './site.css';

// GridWorld account recovery — 3 steps: email → security questions → reset email sent.
// Answers are sent PLAINTEXT over TLS and verified + hashed server-side by the
// verify_recovery_answers RPC (v2 bcrypt; legacy v1 rows upgrade on verify).
// Client-side hashing was removed in Phase 1 (§F4): unsalted SHA-256 of
// low-entropy answers fell to dictionary attacks, and the salt must never
// be in client reach. Plaintext answers are never logged.
// Recovery is throttled server-side (5 failed verifies / 15 min → lockout)
// and step 1 uses one generic message so unknown emails are indistinguishable
// from known emails without questions (Phase 1 §F3, §F5).

const app = document.querySelector<HTMLDivElement>('#recover-app')!;

if (!supabaseConfigured || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  app.innerHTML = `<div class="recover-card"><h1>Recovery unavailable.</h1><p class="recover-sub">The account backend is not configured.</p><a href="/">← Back</a></div>`;
} else {
  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  let step = 0;
  let email = '';
  let questions: string[] = [];

  // CAPTCHA state (Cloudflare Turnstile) — recovery is anon-callable, so
  // step 1 is CAPTCHA-gated like signup (Phase 1 §F6 step 5).
  let captchaToken: string | null = null;
  (window as unknown as { __gridRecoverCaptchaCallback?: (t: string) => void }).__gridRecoverCaptchaCallback = (token: string) => { captchaToken = token; };
  (window as unknown as { __gridRecoverCaptchaExpired?: () => void }).__gridRecoverCaptchaExpired = () => { captchaToken = null; };

  // Lockout state: verify RPC returns NULL when the email is locked out
  // (>= 5 failed verifies in 15 min). Client enforces the same window.
  let lockedOutUntil = 0;

  function dots(): string {
    return `<div class="step-dots">${[0, 1, 2].map(i => `<i class="${i <= step ? 'done' : ''}"></i>`).join('')}</div>`;
  }

  function setStatus(msg: string, cls: string): void {
    const el = app.querySelector<HTMLDivElement>('#recover-status');
    if (el) { el.textContent = msg; el.className = 'recover-status ' + cls; }
  }

  // (Re-)render the Turnstile widget for the current step-0 card. The widget
  // is added dynamically, so auto-render misses it — explicit render required.
  function renderCaptcha(): void {
    const captchaEl = app.querySelector('#cf-captcha-recover');
    const ts = (window as unknown as { turnstile?: { render: (el: Element) => void; reset?: () => void } }).turnstile;
    if (captchaEl && ts && typeof ts.render === 'function') {
      try { ts.render(captchaEl); } catch { /* already rendered */ }
    }
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
        <div class="captcha-wrap">
          <div class="cf-turnstile" data-sitekey="0x4AAAAAAFRqBTI4HVx4dvQa" data-theme="dark"
            data-callback="__gridRecoverCaptchaCallback" data-expired-callback="__gridRecoverCaptchaExpired" id="cf-captcha-recover"></div>
          <small class="field-hint">Prove you're human to look up your account.</small>
        </div>
        <div id="recover-status" class="recover-status"></div>
        <div class="btn-row">
          <button class="btn btn-primary" id="r-next">CONTINUE →</button>
        </div>
        <div class="recover-alt">Remembered it? <a href="/signin.html">Log in</a></div>
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
    if (step === 0) renderCaptcha();
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
        // CAPTCHA gate (Phase 1 §F6 step 5): recovery is anon-callable.
        // Requires TURNSTILE_SECRET_KEY (Paul-only step) — do NOT
        // merge/deploy this branch until it is set.
        if (!captchaToken) { setStatus('Please complete the CAPTCHA to prove you\'re human.', 'error'); return; }
        next.disabled = true; next.textContent = 'LOOKING UP…';
        setStatus('Verifying you\'re human…', 'info');
        try {
          const verifyRes = await client.functions.invoke('verify-captcha', {
            body: { token: captchaToken },
          });
          if (verifyRes.error || !verifyRes.data?.success) {
            setStatus('CAPTCHA verification failed. Please try again.', 'error');
            captchaToken = null;
            try { (window as unknown as { turnstile?: { reset?: () => void } }).turnstile?.reset?.(); } catch { /* re-render fallback */ }
            next.disabled = false; next.textContent = 'CONTINUE →';
            return;
          }
          setStatus('Looking up your security questions…', 'info');
          const { data, error } = await client.rpc('get_recovery_questions', { p_email: e });
          if (error) throw error;
          const row = Array.isArray(data) ? data[0] : data;
          if (!row || !row.q1) {
            // GENERIC message (Phase 1 §F5): unknown emails and known
            // emails without questions produce byte-identical UI, and we
            // do NOT advance. The old "No account found…" text was an
            // enumeration oracle. Note: a locked-out email also lands
            // here (the RPC returns empty on lockout by design).
            setStatus('If an account exists with that email and has recovery questions set up, you can continue. Otherwise, check the email or create an account.', 'error');
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
        // Server-enforced lockout (Phase 1 §F3): the RPC returns NULL when
        // this email is locked out. Mirror the 15-minute window client-side.
        if (Date.now() < lockedOutUntil) {
          setStatus('Too many attempts. Try again in 15 minutes.', 'error');
          return;
        }
        verify.disabled = true; verify.textContent = 'VERIFYING…';
        setStatus('Checking your answers…', 'info');
        try {
          // PLAINTEXT answers over TLS (Phase 1 §F4). The server compares
          // with bcrypt (v2) or legacy SHA-256 (v1, upgrade-on-verify).
          // Parameter names p_h1/p_h2/p_h3 are kept for call-shape
          // compatibility with the pre-v2 RPC — their values are answers now.
          const { data, error } = await client.rpc('verify_recovery_answers', {
            p_email: email, p_h1: answers[0], p_h2: answers[1], p_h3: answers[2],
          });
          if (error) throw error;
          if (data === null) {
            lockedOutUntil = Date.now() + 15 * 60 * 1000;
            setStatus('Too many attempts. Try again in 15 minutes.', 'error');
            verify.disabled = true; verify.textContent = 'LOCKED — TRY AGAIN IN 15 MIN';
            setTimeout(() => {
              verify.disabled = false; verify.textContent = 'VERIFY ANSWERS';
            }, 15 * 60 * 1000);
          } else if (data === true) {
            // Verified — send the password reset email (→ /reset.html,
            // the only page that completes a reset — Phase 1 §F1).
            const { error: resetErr } = await client.auth.resetPasswordForEmail(email, {
              redirectTo: 'https://grid-world-qghn.onrender.com/reset.html',
            });
            if (resetErr) throw resetErr;
            step = 2;
            render();
          } else {
            // Wrong answers: brief client-side cooldown, then re-enable.
            // The server is the real enforcer (5 failures / 15 min).
            setStatus('One or more answers didn\'t match. Try again.', 'error');
            verify.textContent = 'VERIFY ANSWERS';
            setTimeout(() => { verify.disabled = false; }, 3000);
          }
        } catch (err) {
          setStatus('Something went wrong. Try again.', 'error');
          verify.disabled = false; verify.textContent = 'VERIFY ANSWERS';
        }
      });
    } else {
      app.querySelector<HTMLButtonElement>('#r-done')!.addEventListener('click', () => {
        window.location.href = '/signin.html';
      });
    }
  }

  render();
}
