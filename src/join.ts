import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from './persistence/config';
import { GridAuthService } from './auth/GridAuthService';
import { readLocalLocale, localeToLanguage } from './i18n/GridLanguageService';
import './site.css';

// GridWorld join — stepped character creator (Cyberpunk 2077 / FFXIV style).
// One focused step centered on screen at a time, fade transitions.

const AVATAR_STYLES = [
  {id:'navigator',label:'Navigator',body:'#3e8eb8',accent:'#72e8ff'},
  {id:'muse',label:'Muse',body:'#8f4fb2',accent:'#f1a1ff'},
  {id:'explorer',label:'Explorer',body:'#b86d31',accent:'#ffc078'},
  {id:'builder',label:'Builder',body:'#725239',accent:'#e0b06e'},
  {id:'scholar',label:'Scholar',body:'#53699d',accent:'#b8c8ff'},
  {id:'sentinel',label:'Sentinel',body:'#8d7841',accent:'#ffe28a'},
  {id:'wanderer',label:'Wanderer',body:'#477b5a',accent:'#8ff0ae'},
  {id:'artist',label:'Artist',body:'#a44376',accent:'#ff8bc8'},
  {id:'ranger',label:'Ranger',body:'#496844',accent:'#9ddc8c'},
  {id:'architect',label:'Architect',body:'#496f84',accent:'#93dfff'},
] as const;

const SECURITY_QUESTIONS = [
  'What was the name of your first pet?',
  'What city were you born in?',
  'What is your mother\'s maiden name?',
  'What was the name of your elementary school?',
  'What is your favorite book?',
  'What street did you grow up on?',
  'What is the name of your best childhood friend?',
  'What was your first car?',
  'What is your favorite movie?',
  'What is the name of the town where you were born?',
] as const;

const COUNTRIES = [
  ['US','United States'],['CA','Canada'],['MX','Mexico'],['GB','United Kingdom'],
  ['DE','Germany'],['FR','France'],['ES','Spain'],['IT','Italy'],['PT','Portugal'],
  ['NL','Netherlands'],['SE','Sweden'],['NO','Norway'],['DK','Denmark'],['FI','Finland'],
  ['AU','Australia'],['NZ','New Zealand'],['JP','Japan'],['KR','South Korea'],['CN','China'],
  ['IN','India'],['BR','Brazil'],['AR','Argentina'],['ZA','South Africa'],['NG','Nigeria'],
] as const;

const STEPS = ['Avatar', 'Account', 'Identity', 'Security', 'Review'];

const app = document.querySelector<HTMLDivElement>('#join-app')!;

if (!supabaseConfigured || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  app.innerHTML = `<div class="join-card"><h1>Signup unavailable.</h1><p class="join-sub">The account backend is not configured.</p><a href="/">← Back</a></div>`;
} else {
  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  const auth = new GridAuthService(client);

  // Wizard state
  let step = 0;
  let gender: 'masculine' | 'feminine' | 'nonbinary' | 'fluid' = 'masculine';
  let avatarStyle = 'navigator';
  let rotation = 0;

  // CAPTCHA state (Cloudflare Turnstile)
  let captchaToken: string | null = null;
  (window as any).__gridCaptchaCallback = (token: string) => { captchaToken = token; };
  (window as any).__gridCaptchaExpired = () => { captchaToken = null; };

  const state = {
    handle: '', email: '', password: '',
    firstIrl: '', lastIrl: '', dob: '', country: '',
    sq: [{q:'',a:''},{q:'',a:''},{q:'',a:''}],
    terms: false, news: false,
  };

  function progressBar(): string {
    return `<div class="step-progress">${STEPS.map((s, i) =>
      `<i class="${i < step ? 'done' : i === step ? 'now' : ''}" title="${s}"></i>`).join('')}</div>`;
  }

  function avatarFigure(): string {
    const s = AVATAR_STYLES.find(x => x.id === avatarStyle)!;
    // Darken body color for depth
    const dark = s.body;
    return `<div class="avatar-figure" id="avatar-figure" style="--bd:${s.body};--bd-dark:${dark};--ac:${s.accent};--ac-glow:${s.accent}55">
      <div class="avatar-glow"></div>
      <div class="avatar-part avatar-head"></div>
      <div class="avatar-part avatar-torso"></div>
      <div class="avatar-part avatar-arm left"></div>
      <div class="avatar-part avatar-arm right"></div>
      <div class="avatar-part avatar-leg left"></div>
      <div class="avatar-part avatar-leg right"></div>
    </div>`;
  }

  function renderStep(): void {
    const card = app.querySelector('.join-card');
    if (card) card.classList.add('step-out');

    setTimeout(() => {
      let html = '';
      const pb = progressBar();

      if (step === 0) {
        // STEP 1: Avatar — gender + rotatable preview + style
        html = `<div class="join-card"><div class="join-step">
          <div class="join-kicker">GRID WORLD // ARRIVAL</div>
          ${pb}
          <h1>Design your <span class="accent">avatar.</span></h1>
          <p class="join-sub">Drag the figure to rotate. Pick a style that feels like you.</p>
          <div class="gender-toggle">
            <button type="button" class="gender-btn gender-card${gender === 'masculine' ? ' selected' : ''}" data-gender="masculine">
              <img src="/avatars/concepts/masculine.webp" alt="Masculine avatar concept" loading="lazy">
              <span>♂ Masculine</span>
            </button>
            <button type="button" class="gender-btn gender-card${gender === 'feminine' ? ' selected' : ''}" data-gender="feminine">
              <img src="/avatars/concepts/feminine.webp" alt="Feminine avatar concept" loading="lazy">
              <span>♀ Feminine</span>
            </button>
            <button type="button" class="gender-btn gender-card${gender === 'nonbinary' ? ' selected' : ''}" data-gender="nonbinary">
              <img src="/avatars/concepts/nonbinary.webp" alt="Non-binary avatar concept" loading="lazy">
              <span>⚲ Non-binary</span>
            </button>
            <button type="button" class="gender-btn gender-card${gender === 'fluid' ? ' selected' : ''}" data-gender="fluid">
              <img src="/avatars/concepts/fluid.webp" alt="Gender-fluid avatar concept" loading="lazy">
              <span>✦ Fluid</span>
            </button>
          </div>
          <div class="avatar-stage" id="avatar-stage">
            ${avatarFigure()}
            <div class="stage-hint">⟲ drag to rotate</div>
          </div>
          <div class="avatar-grid">
            ${AVATAR_STYLES.map(s => `
              <button type="button" class="avatar-card${s.id === avatarStyle ? ' selected' : ''}" data-style="${s.id}">
                <div class="avatar-swatch" style="background:linear-gradient(135deg,${s.body},${s.accent})"></div>
                <span>${s.label}</span>
              </button>`).join('')}
          </div>
          <div class="join-nav">
            <button type="button" class="join-submit" id="next-btn" style="flex:1">CONTINUE →</button>
          </div>
        </div></div>`;
      } else if (step === 1) {
        // STEP 2: Account
        html = `<div class="join-card"><div class="join-step">
          <div class="join-kicker">GRID WORLD // ARRIVAL</div>
          ${pb}
          <h1>Account <span class="accent">details.</span></h1>
          <p class="join-sub">Your handle is how the Grid knows you.</p>
          <div class="join-form">
            <label class="join-field"><span>Handle <em>— visible to others</em></span>
              <input id="f-handle" maxlength="32" placeholder="yourname" value="${esc(state.handle)}" autocomplete="username">
              <small class="field-hint" id="handle-hint"></small></label>
            <label class="join-field"><span>Email</span>
              <input id="f-email" type="email" placeholder="you@example.com" value="${esc(state.email)}" autocomplete="email"></label>
            <label class="join-field"><span>Password <em>— 12+ characters</em></span>
              <input id="f-password" type="password" placeholder="••••••••••••" autocomplete="new-password">
              <small class="field-hint" id="password-hint"></small></label>
          </div>
          <div class="join-nav">
            <button type="button" class="join-back" id="back-btn">← BACK</button>
            <button type="button" class="join-submit" id="next-btn">CONTINUE →</button>
          </div>
          <div class="join-status" id="step-status"></div>
        </div></div>`;
      } else if (step === 2) {
        // STEP 3: Identity (private)
        html = `<div class="join-card"><div class="join-step">
          <div class="join-kicker">GRID WORLD // ARRIVAL</div>
          ${pb}
          <h1>About <span class="accent">you.</span></h1>
          <p class="join-sub"><span class="private-badge">🔒 Private — never shown to others</span></p>
          <div class="join-form">
            <div class="join-row">
              <label class="join-field"><span>First name (real)</span>
                <input id="f-first" maxlength="60" placeholder="Your first name" value="${esc(state.firstIrl)}" autocomplete="given-name"></label>
              <label class="join-field"><span>Last name (real)</span>
                <input id="f-last" maxlength="60" placeholder="Your last name" value="${esc(state.lastIrl)}" autocomplete="family-name"></label>
            </div>
            <div class="join-row">
              <label class="join-field"><span>Date of birth</span>
                <input id="f-dob" type="date" value="${esc(state.dob)}"></label>
              <label class="join-field"><span>Country</span>
                <select id="f-country"><option value="">Select…</option>
                  ${COUNTRIES.map(([c, n]) => `<option value="${c}"${state.country === c ? ' selected' : ''}>${n}</option>`).join('')}
                </select></label>
            </div>
          </div>
          <div class="join-nav">
            <button type="button" class="join-back" id="back-btn">← BACK</button>
            <button type="button" class="join-submit" id="next-btn">CONTINUE →</button>
          </div>
          <div class="join-status" id="step-status"></div>
        </div></div>`;
      } else if (step === 3) {
        // STEP 4: Security questions
        html = `<div class="join-card"><div class="join-step">
          <div class="join-kicker">GRID WORLD // ARRIVAL</div>
          ${pb}
          <h1>Secure your <span class="accent">account.</span></h1>
          <p class="join-sub"><span class="private-badge">🔒 For recovery only — answers are hashed, never stored as text</span></p>
          <div class="join-form">
            ${[0, 1, 2].map(i => `
              <div class="join-row">
                <label class="join-field"><span>Question ${i + 1}</span>
                  <select id="f-sq${i}"><option value="">Select…</option>
                    ${SECURITY_QUESTIONS.map(q => `<option value="${esc(q)}"${state.sq[i].q === q ? ' selected' : ''}>${esc(q)}</option>`).join('')}
                  </select></label>
                <label class="join-field"><span>Answer</span>
                  <input id="f-sa${i}" maxlength="200" placeholder="Only you'd know" value="${esc(state.sq[i].a)}" autocomplete="off"></label>
              </div>`).join('')}
          </div>
          <div class="join-nav">
            <button type="button" class="join-back" id="back-btn">← BACK</button>
            <button type="button" class="join-submit" id="next-btn">REVIEW →</button>
          </div>
          <div class="join-status" id="step-status"></div>
        </div></div>`;
      } else {
        // STEP 5: Review & consent
        const s = AVATAR_STYLES.find(x => x.id === avatarStyle)!;
        html = `<div class="join-card"><div class="join-step">
          <div class="join-kicker">GRID WORLD // ARRIVAL</div>
          ${pb}
          <h1>Ready to <span class="accent">enter?</span></h1>
          <p class="join-sub">Review your details, agree, and step into First Light.</p>
          <div class="join-form">
            <div class="section-label">🧑 Avatar: ${s.label} (${gender})</div>
            <div class="section-label">📛 Handle: @${esc(state.handle)}</div>
            <div class="section-label">✉️ Email: ${esc(state.email)}</div>
            <label class="join-check"><input type="checkbox" id="f-terms"${state.terms ? ' checked' : ''}>
              <span>I agree to the <a href="/docs.html" target="_blank">Terms of Service</a> and <a href="/docs.html" target="_blank">Privacy Policy</a>.</span></label>
            <label class="join-check"><input type="checkbox" id="f-news"${state.news ? ' checked' : ''}>
              <span>Send me Grid World news and offers.</span></label>
            <div class="captcha-wrap">
              <!-- Cloudflare Turnstile test key (always passes). Replace with real site key from dash.cloudflare.com -->
              <div class="cf-turnstile" data-sitekey="1x00000000000000000000AA" data-theme="dark"
                data-callback="__gridCaptchaCallback" data-expired-callback="__gridCaptchaExpired" id="cf-captcha"></div>
              <small class="field-hint">Prove you're human to create your account.</small>
            </div>
          </div>
          <div class="join-nav">
            <button type="button" class="join-back" id="back-btn">← BACK</button>
            <button type="button" class="join-submit" id="submit-btn">CREATE ACCOUNT ✦</button>
          </div>
          <div class="join-status" id="step-status"></div>
        </div></div>`;
      }

      app.innerHTML = html;
      wireStep();
    }, card ? 180 : 0);
  }

  function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function setStatus(msg: string, cls: string): void {
    const el = app.querySelector<HTMLDivElement>('#step-status');
    if (el) { el.textContent = msg; el.className = 'join-status ' + cls; }
  }

  function wireStep(): void {
    // Gender + avatar style (step 0)
    app.querySelectorAll<HTMLButtonElement>('[data-gender]').forEach(b => {
      b.onclick = () => {
        gender = b.dataset.gender as 'masculine' | 'feminine' | 'nonbinary' | 'fluid';
        app.querySelectorAll('[data-gender]').forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
      };
    });
    app.querySelectorAll<HTMLButtonElement>('[data-style]').forEach(b => {
      b.onclick = () => {
        avatarStyle = b.dataset.style!;
        app.querySelectorAll('[data-style]').forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
        // Update the 3D figure colors live
        const fig = app.querySelector<HTMLDivElement>('#avatar-figure');
        const s = AVATAR_STYLES.find(x => x.id === avatarStyle)!;
        if (fig) {
          fig.style.setProperty('--bd', s.body);
          fig.style.setProperty('--bd-dark', s.body);
          fig.style.setProperty('--ac', s.accent);
          fig.style.setProperty('--ac-glow', s.accent + '55');
        }
      };
    });

    // Drag-to-rotate on the avatar stage
    const stage = app.querySelector<HTMLDivElement>('#avatar-stage');
    const figure = app.querySelector<HTMLDivElement>('#avatar-figure');
    if (stage && figure) {
      let dragging = false, lastX = 0;
      const applyRotation = () => {
        figure.style.transform = `translate(-50%,-50%) rotateY(${rotation}deg)`;
      };
      stage.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; stage.setPointerCapture(e.pointerId); });
      stage.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        rotation += (e.clientX - lastX) * 0.8;
        lastX = e.clientX;
        applyRotation();
      });
      stage.addEventListener('pointerup', () => { dragging = false; });
      // Gentle idle spin
      const idle = setInterval(() => {
        if (!dragging && document.body.contains(figure)) { rotation += 0.3; applyRotation(); }
        else if (!document.body.contains(figure)) clearInterval(idle);
      }, 50);
      applyRotation();
    }

    // Live validation (step 1)
    const handleEl = app.querySelector<HTMLInputElement>('#f-handle');
    if (handleEl) handleEl.addEventListener('input', () => {
      const hint = app.querySelector('#handle-hint')!;
      const v = handleEl.value.trim();
      if (!v) { hint.textContent = ''; return; }
      const ok = /^[a-zA-Z0-9_]{3,32}$/.test(v);
      hint.textContent = ok ? '✓ Available format' : 'Letters, numbers, underscores only.';
      hint.className = 'field-hint ' + (ok ? 'ok' : 'error');
    });
    const passEl = app.querySelector<HTMLInputElement>('#f-password');
    if (passEl) passEl.addEventListener('input', () => {
      const hint = app.querySelector('#password-hint')!;
      const v = passEl.value;
      if (!v) { hint.textContent = ''; return; }
      hint.textContent = v.length < 12 ? `${12 - v.length} more needed.` : '✓ Strong enough';
      hint.className = 'field-hint ' + (v.length < 12 ? 'error' : 'ok');
    });

    // Navigation
    app.querySelector('#back-btn')?.addEventListener('click', () => {
      collectStep(); step = Math.max(0, step - 1); renderStep();
    });
    app.querySelector('#next-btn')?.addEventListener('click', () => {
      if (!validateStep()) return;
      collectStep(); step = Math.min(4, step + 1); renderStep();
    });
    app.querySelector('#submit-btn')?.addEventListener('click', () => void submitAll());
  }

  function collectStep(): void {
    if (step === 1) {
      state.handle = (app.querySelector<HTMLInputElement>('#f-handle')!)?.value.trim().replace(/^@/, '') ?? state.handle;
      state.email = (app.querySelector<HTMLInputElement>('#f-email')!)?.value.trim() ?? state.email;
      state.password = (app.querySelector<HTMLInputElement>('#f-password')!)?.value ?? state.password;
    } else if (step === 2) {
      state.firstIrl = (app.querySelector<HTMLInputElement>('#f-first')!)?.value.trim() ?? state.firstIrl;
      state.lastIrl = (app.querySelector<HTMLInputElement>('#f-last')!)?.value.trim() ?? state.lastIrl;
      state.dob = (app.querySelector<HTMLInputElement>('#f-dob')!)?.value ?? state.dob;
      state.country = (app.querySelector<HTMLSelectElement>('#f-country')!)?.value ?? state.country;
    } else if (step === 3) {
      for (let i = 0; i < 3; i++) {
        state.sq[i].q = (app.querySelector<HTMLSelectElement>(`#f-sq${i}`)!)?.value ?? '';
        state.sq[i].a = (app.querySelector<HTMLInputElement>(`#f-sa${i}`)!)?.value.trim() ?? '';
      }
    } else if (step === 4) {
      state.terms = (app.querySelector<HTMLInputElement>('#f-terms')!)?.checked ?? false;
      state.news = (app.querySelector<HTMLInputElement>('#f-news')!)?.checked ?? false;
    }
  }

  function validateStep(): boolean {
    if (step === 1) {
      const h = (app.querySelector<HTMLInputElement>('#f-handle')!).value.trim().replace(/^@/, '');
      const e = (app.querySelector<HTMLInputElement>('#f-email')!).value.trim();
      const p = (app.querySelector<HTMLInputElement>('#f-password')!).value;
      if (!/^[a-zA-Z0-9_]{3,32}$/.test(h)) { setStatus('Handle must be 3–32 chars (letters, numbers, _).', 'error'); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setStatus('Enter a valid email.', 'error'); return false; }
      if (p.length < 12) { setStatus('Password needs 12+ characters.', 'error'); return false; }
    } else if (step === 2) {
      const dob = (app.querySelector<HTMLInputElement>('#f-dob')!).value;
      if (!dob) { setStatus('Date of birth is required.', 'error'); return false; }
    } else if (step === 3) {
      for (let i = 0; i < 3; i++) {
        const q = (app.querySelector<HTMLSelectElement>(`#f-sq${i}`)!).value;
        const a = (app.querySelector<HTMLInputElement>(`#f-sa${i}`)!).value.trim();
        if (!q || !a) { setStatus(`Complete security question ${i + 1}.`, 'error'); return false; }
      }
      const qs = [0, 1, 2].map(i => (app.querySelector<HTMLSelectElement>(`#f-sq${i}`)!).value);
      if (new Set(qs).size !== 3) { setStatus('Pick 3 different questions.', 'error'); return false; }
    }
    setStatus('', '');
    return true;
  }

  async function hashAnswer(answer: string): Promise<string> {
    const data = new TextEncoder().encode(answer.trim().toLowerCase());
    const hash = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function submitAll(): Promise<void> {
    collectStep();
    if (!state.terms) { setStatus('Please agree to the Terms to continue.', 'error'); return; }
    if (!captchaToken) { setStatus('Please complete the CAPTCHA to prove you\'re human.', 'error'); return; }
    const btn = app.querySelector<HTMLButtonElement>('#submit-btn')!;
    btn.disabled = true; btn.textContent = 'CREATING…';
    setStatus('Verifying you\'re human…', '');

    try {
      // Verify CAPTCHA server-side first
      const verifyRes = await client.functions.invoke('verify-captcha', {
        body: { token: captchaToken },
      });
      if (verifyRes.error || !verifyRes.data?.success) {
        setStatus('CAPTCHA verification failed. Please try again.', 'error');
        captchaToken = null;
        btn.disabled = false; btn.textContent = 'CREATE ACCOUNT ✦';
        return;
      }

      setStatus('Creating your account…', '');
      const confirmUrl = window.location.origin + '/confirmed.html';
      const { data, error } = await auth.signUp(state.email, state.password, confirmUrl);
      if (error) throw error;

      if (!data.session) {
        setStatus(`Check ${state.email} for a confirmation link.`, 'ok');
        btn.textContent = 'CHECK YOUR EMAIL ✓';
        return;
      }

      setStatus('Setting up your identity…', '');
      await auth.completeProfile({
        firstName: state.firstIrl, middleName: '', lastName: state.lastIrl,
        handle: state.handle, displayName: state.handle, nameVisibility: 'display_only',
      });

      const { data: { user } } = await client.auth.getUser();
      if (user) {
        await client.from('profiles').update({
          first_name_irl: state.firstIrl || null,
          last_name_irl: state.lastIrl || null,
          country_code: state.country || null,
          date_of_birth: state.dob || null,
          language: localeToLanguage(readLocalLocale()),
          avatar_style: avatarStyle,
        }).eq('id', user.id);

        setStatus('Securing your account…', '');
        await client.from('grid_security_questions').insert({
          user_id: user.id,
          q1_text: state.sq[0].q, q1_hash: await hashAnswer(state.sq[0].a),
          q2_text: state.sq[1].q, q2_hash: await hashAnswer(state.sq[1].a),
          q3_text: state.sq[2].q, q3_hash: await hashAnswer(state.sq[2].a),
        });
      }

      try { await auth.ensureStarterGrant(); } catch { /* non-fatal */ }

      setStatus('Welcome to the Grid! Taking you to the official entry…', 'ok');
      btn.textContent = 'WELCOME ✦';
      setTimeout(() => { window.location.href = '/enter.html'; }, 1400);

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Signup failed.';
      setStatus(msg.includes('already registered') ? 'Email already registered. Try logging in.' : msg, 'error');
      btn.disabled = false; btn.textContent = 'CREATE ACCOUNT ✦';
    }
  }

  // Boot
  renderStep();
}
