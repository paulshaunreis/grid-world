// Unified Grid World navigation — Paul's direction 2026-10-08.
// Extracted from home.html (concept-art UI): flat links, logo, search, JOIN.
// Grayscale-first; accent colors via src/theme/accent.css variables.
// Style picker mounted in nav. Skips injection if page already has .hw-nav.
//
// Usage: <script type="module" src="/src/nav.ts"></script>
import './theme/accent.css';
import { createAccentPicker } from './theme/accent';

const NAV_LINKS: Array<[string, string]> = [
  ['HOME', '/'],
  ['WORLDS', '/directory.html'],
  ['COMMUNITY', '/social.html'],
  ['MARKETPLACE', '/marketplace.html'],
  ['STORE', '/store.html'],
  ['GAMES', '/games.html'],
  ['VAULT', '/economics.html'],
  ['SUPPORT', '/docs.html'],
];

const NAV_CSS = `
.gw-nav{
  display:flex;align-items:center;gap:26px;
  padding:10px 22px;
  background:var(--gw-panel);
  border-bottom:1px solid var(--gw-border);
  position:sticky;top:0;z-index:50;
  backdrop-filter:blur(10px);
  font-family:'Segoe UI',system-ui,-apple-system,Roboto,Helvetica,Arial,sans-serif;
}
.gw-logo{display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:.14em;
  font-size:15px;color:var(--gw-text);text-decoration:none;flex:none}
.gw-logo img{width:34px;height:34px}
.gw-links{display:flex;gap:22px;margin-left:12px;flex:1;align-items:center}
.gw-links a{font-size:12px;letter-spacing:.1em;color:var(--gw-muted);
  padding:6px 2px;border-bottom:2px solid transparent;text-decoration:none;transition:color .15s}
.gw-links a:hover{color:var(--gw-text)}
.gw-links a.active{color:var(--accent-dim);border-bottom-color:var(--accent)}
.gw-search{
  width:34px;height:34px;display:grid;place-items:center;border-radius:50%;flex:none;
  border:1px solid var(--gw-border);color:var(--accent-dim);font-size:15px;text-decoration:none}
.gw-search:hover{border-color:var(--accent)}
.gw-join{
  padding:9px 26px;border-radius:20px;font-size:12px;font-weight:800;letter-spacing:.12em;flex:none;
  color:var(--on-accent);background:var(--accent-gradient);
  border:1px solid var(--accent-border);box-shadow:0 0 18px var(--accent-glow);
  text-decoration:none;transition:filter .15s}
.gw-join:hover{filter:brightness(1.08)}
@media(max-width:900px){.gw-links{display:none}}
`;

function buildNav(): HTMLElement {
  const path = window.location.pathname;
  const header = document.createElement('header');
  header.className = 'gw-nav';
  header.setAttribute('aria-label', 'Primary');
  const links = NAV_LINKS.map(([label, href], i) => {
    const active = path === href || (href === '/' && (path === '/' || path === '/index.html'));
    return `<a href="${href}" class="${active ? 'active' : ''}">${label}</a>`;
  }).join('');
  header.innerHTML =
    `<a class="gw-logo" href="/"><img src="/grid-world-logo.svg" alt="Grid World logo">GRID WORLD</a>` +
    `<nav class="gw-links" aria-label="Sections">${links}</nav>` +
    `<a class="gw-search" href="/directory.html" aria-label="Search" title="Search">⌕</a>` +
    `<a class="gw-join" href="/join.html">JOIN</a>`;
  header.appendChild(createAccentPicker());
  return header;
}

function injectNav(): void {
  // home.html renders its own .hw-nav via homepage.ts — don't double up.
  if (document.querySelector('.hw-nav')) return;
  if (document.querySelector('header.gw-nav')) return;
  if (!document.querySelector('#gw-nav-css')) {
    const style = document.createElement('style');
    style.id = 'gw-nav-css';
    style.textContent = NAV_CSS;
    document.head.appendChild(style);
  }
  document.body.insertBefore(buildNav(), document.body.firstChild);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectNav);
} else {
  injectNav();
}
