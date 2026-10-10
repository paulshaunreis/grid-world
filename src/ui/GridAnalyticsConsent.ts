import {
  disableGridAnalytics,
  enableGridAnalytics,
  isGridAnalyticsConfigured,
} from '../analytics';

const CONSENT_KEY = 'grid-world:anonymous-analytics-consent';
const STYLE_ID = 'grid-analytics-consent-styles';

type ConsentChoice = 'allow' | 'deny' | null;

function readChoice(): ConsentChoice {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'allow' || value === 'deny' ? value : null;
  } catch {
    return null;
  }
}

function saveChoice(choice: Exclude<ConsentChoice, null>): void {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // If preference storage is unavailable, this choice lasts only for this page.
  }
}

/**
 * Shows analytics consent only when analytics is configured and no choice exists.
 * The returned function lets the Settings dock reopen the choice at any time.
 */
export function mountGridAnalyticsConsent(onChoice: (allowed: boolean) => void): () => void {
  let overlay: HTMLDivElement | null = null;

  const applyChoice = (choice: ConsentChoice, notify = false) => {
    if (choice === 'allow') {
      if (enableGridAnalytics()) {
        if (notify) onChoice(true);
      } else {
        disableGridAnalytics();
        if (notify) onChoice(false);
      }
    } else if (choice === 'deny') {
      disableGridAnalytics();
      if (notify) onChoice(false);
    }
  };

  const close = () => {
    overlay?.remove();
    overlay = null;
  };

  const open = () => {
    if (overlay) return;
    const choice = readChoice();
    const configured = isGridAnalyticsConfigured();
    const isAllowed = choice === 'allow';
    const isDenied = choice === 'deny';
    const dialog = document.createElement('div');
    dialog.className = 'grid-analytics-consent-backdrop';
    dialog.innerHTML = `
      <section class="grid-analytics-consent" role="dialog" aria-modal="true" aria-labelledby="grid-analytics-title">
        <p class="grid-analytics-kicker">PRIVACY SETTINGS</p>
        <h2 id="grid-analytics-title">Optional anonymous analytics</h2>
        <p>Grid World can count game sessions and the first game interaction to understand whether the experience is working.</p>
        <p>Analytics does not include your display name, age, chat, world details, page address, or text you enter. Requests go to PostHog, where Grid World is configured to drop IP addresses.</p>
        <p class="grid-analytics-state">${!configured ? 'Analytics is currently unavailable.' : isAllowed ? 'Your current choice: allowed.' : isDenied ? 'Your current choice: off.' : 'Analytics stays off unless you choose to allow it.'}</p>
        <div class="grid-analytics-actions">
          ${configured ? '<button type="button" data-analytics-allow>Allow anonymous analytics</button>' : ''}
          <button type="button" data-analytics-deny>${isAllowed ? 'Turn analytics off' : isDenied ? 'Keep analytics off' : 'No thanks'}</button>
          <button type="button" data-analytics-close>${isAllowed || isDenied ? 'Close' : 'Not now'}</button>
        </div>
      </section>`;
    overlay = dialog;
    document.body.append(dialog);

    dialog.querySelector<HTMLButtonElement>('[data-analytics-allow]')?.addEventListener('click', () => {
      saveChoice('allow');
      applyChoice('allow', true);
      close();
    });
    dialog.querySelector<HTMLButtonElement>('[data-analytics-deny]')?.addEventListener('click', () => {
      saveChoice('deny');
      applyChoice('deny', true);
      close();
    });
    dialog.querySelector<HTMLButtonElement>('[data-analytics-close]')?.addEventListener('click', close);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) close();
    });
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
    dialog.querySelector<HTMLButtonElement>('button')?.focus();
  };

  if (readChoice() === 'allow') applyChoice('allow', true);
  else if (readChoice() === 'deny') applyChoice('deny', true);
  else if (isGridAnalyticsConfigured()) open();

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .grid-analytics-consent-backdrop{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:20px;background:rgba(1,7,14,.84);backdrop-filter:blur(8px);font-family:Arial,sans-serif}
      .grid-analytics-consent{width:min(520px,100%);padding:24px;color:#e8f6ff;background:#081421;border:1px solid rgba(116,221,255,.5);box-shadow:0 24px 80px rgba(0,0,0,.55)}
      .grid-analytics-consent h2{margin:0 0 14px;font-size:22px}
      .grid-analytics-consent p{line-height:1.5;color:#bfd2df}
      .grid-analytics-consent .grid-analytics-kicker{color:#7de7ff;font:700 11px monospace;letter-spacing:.16em}
      .grid-analytics-consent .grid-analytics-state{font-size:13px;color:#8faaba}
      .grid-analytics-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
      .grid-analytics-actions button{min-height:42px;padding:10px 14px;color:#e8f6ff;background:#102537;border:1px solid rgba(116,221,255,.45);cursor:pointer}
      .grid-analytics-actions button:focus-visible{outline:2px solid #7de7ff;outline-offset:2px}
      .grid-analytics-actions button[data-analytics-allow]{color:#06121b;background:#7de7ff;font-weight:700}
    `;
    document.head.append(style);
  }

  return open;
}
