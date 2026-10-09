// Grid World navigation loader — Paul's direction 2026-10-08.
// Mounts the single shared GlobalNav (with dropdown topics) and runs the
// closed-development access gate. Replaces the old flat .gw-nav injection.
//
// Usage: <script type="module" src="/src/nav.ts"></script>
import './theme/accent.css';
import { createAccentPicker } from './theme/accent';
import { requireAccess, getAccessLevel } from './auth/accessGate';
import { mountGlobalNav } from './components/GlobalNav';

function init(): void {
  // home.html renders its own .hw-nav via homepage.ts — don't double up.
  if (document.querySelector('.hw-nav')) return;
  mountGlobalNav();
  // Mount the accent/style picker into the new nav.
  const nav = document.querySelector('header.gw-global-nav');
  if (nav && !nav.querySelector('.site-theme-picker')) {
    const picker = createAccentPicker();
    picker.classList.add('site-theme-picker');
    nav.appendChild(picker);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Closed-development gate (Paul 2026-10-08): signed-in users without
// team/approved status are redirected to /beta.html on member pages.
// Public pages and signed-out visitors are unaffected. RLS is the real
// enforcement; this is the UX layer.
requireAccess().catch(() => {});
// Expose the access level for pages that want to show badges.
getAccessLevel().then(level => {
  (window as any).__gridAccessLevel = level;
  document.documentElement.dataset.access = level;
}).catch(() => {});
