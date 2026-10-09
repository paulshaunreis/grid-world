// GlobalNav — the ONE shared navigation for every GridWorld page (Paul 2026-10-08).
// Replaces the old double-nav problem: static .grid-global-nav headers in HTML
// plus nav.ts's injected .gw-nav plus page-level <nav> injections.
//
// Usage: import { mountGlobalNav } from './components/GlobalNav'; mountGlobalNav();
// Or via the legacy loader: <script type="module" src="/src/nav.ts"></script>
// (nav.ts now delegates here).
//
// Design: glass UI tokens (bg #050812, accent #48eaff, Space Grotesk).
// Top-level topics open dropdown menus on hover (desktop) and tap (mobile).
// Mobile gets a hamburger that opens a full menu panel.

export interface NavItem {
  label: string;
  href: string;
}

export interface NavTopic {
  label: string;
  items: NavItem[];
}

const NAV_TOPICS: NavTopic[] = [
  {
    label: 'WORLD',
    items: [
      { label: 'Play', href: '/play.html' },
      { label: 'Regions', href: '/directory.html' },
      { label: 'Map', href: '/omni.html' },
      { label: 'Enter the Grid', href: '/enter.html' },
    ],
  },
  {
    label: 'MARKET',
    items: [
      { label: 'Marketplace', href: '/marketplace.html' },
      { label: 'Shop', href: '/shop.html' },
      { label: 'Merch Store', href: '/store.html' },
      { label: 'Economy', href: '/economics.html' },
    ],
  },
  {
    label: 'CREATE',
    items: [
      { label: 'Studio', href: '/grid-world-studio.html' },
      { label: 'Avatars', href: '/avatars.html' },
      { label: 'Textures', href: '/textures.html' },
      { label: 'Sound', href: '/sound.html' },
    ],
  },
  {
    label: 'COMMUNITY',
    items: [
      { label: 'Staff Directory', href: '/directory.html' },
      { label: 'Profiles', href: '/profile.html' },
      { label: 'Social', href: '/social.html' },
      { label: 'Meetups', href: '/meetups.html' },
      { label: 'Docs', href: '/docs.html' },
    ],
  },
  {
    label: 'PLAY',
    items: [
      { label: 'Games', href: '/games.html' },
      { label: 'Grid Cards', href: '/games.html' },
      { label: 'Game', href: '/game.html' },
    ],
  },
];

const NAV_CSS = `
/* Vibrant nav — Paul 2026-10-08 concept art: deep navy, electric cyan, glowing JOIN pill */
.gw-global-nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:20px;
  padding:0 22px;min-height:60px;background:rgba(10,22,40,.96);
  border-bottom:1px solid rgba(0,212,255,.28);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  box-shadow:0 4px 28px rgba(0,0,0,.4),0 1px 0 rgba(0,212,255,.12);
  font-family:'Space Grotesk',system-ui,sans-serif}
.gw-global-nav .gw-brand{display:flex;align-items:center;gap:8px;font-weight:800;font-size:15px;
  letter-spacing:.16em;color:#fff;text-decoration:none;flex:none;
  text-shadow:0 0 18px rgba(0,212,255,.5)}
.gw-global-nav .gw-brand:hover{color:#fff}
.gw-topics{display:flex;align-items:stretch;gap:2px;flex:1;height:60px}
.gw-topic{position:relative;display:flex;align-items:center}
.gw-topic>button{background:none;border:none;cursor:pointer;font-family:inherit;
  font-size:11px;font-weight:700;letter-spacing:.14em;color:rgba(220,240,255,.78);
  padding:8px 14px;height:100%;transition:color .15s,text-shadow .15s}
.gw-topic>button:hover,.gw-topic.open>button{color:#00d4ff;text-shadow:0 0 14px rgba(0,212,255,.6)}
.gw-topic>button::after{content:' ▾';font-size:9px;opacity:.6}
.gw-dropdown{position:absolute;top:100%;left:0;min-width:220px;padding:8px;
  background:rgba(13,27,51,.98);border:1px solid rgba(0,212,255,.32);border-radius:12px;
  box-shadow:0 18px 50px rgba(0,0,0,.55),0 0 28px rgba(0,212,255,.14);
  opacity:0;visibility:hidden;transform:translateY(-6px);transition:opacity .16s,transform .16s,visibility .16s}
.gw-topic:hover .gw-dropdown,.gw-topic.open .gw-dropdown{opacity:1;visibility:visible;transform:translateY(0)}
.gw-dropdown a{display:block;padding:10px 14px;border-radius:8px;color:rgba(225,242,255,.85);
  text-decoration:none;font-size:13px;letter-spacing:.04em;transition:background .12s,color .12s}
.gw-dropdown a:hover{background:rgba(0,212,255,.14);color:#fff}
.gw-dropdown a.gw-active{color:#00d4ff}
.gw-join{flex:none;padding:11px 26px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.12em;
  color:#04121a;background:linear-gradient(135deg,#00d4ff,#0090ff);text-decoration:none;
  box-shadow:0 0 26px rgba(0,212,255,.55),inset 0 1px 0 rgba(255,255,255,.4);transition:filter .15s,box-shadow .15s;white-space:nowrap}
.gw-join:hover{filter:brightness(1.12);box-shadow:0 0 40px rgba(0,212,255,.75),inset 0 1px 0 rgba(255,255,255,.45)}
.gw-hamburger{display:none;flex:none;background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.4);
  border-radius:10px;color:#fff;font-size:18px;padding:6px 12px;cursor:pointer}
.gw-mobile-panel{display:none}
@media(max-width:900px){
  .gw-topics{display:none}
  .gw-hamburger{display:block}
  .gw-global-nav.mobile-open .gw-mobile-panel{display:block;position:absolute;top:100%;left:0;right:0;
    background:rgba(10,22,40,.99);border-bottom:1px solid rgba(0,212,255,.28);padding:12px 18px 18px;
    max-height:70vh;overflow:auto;box-shadow:0 20px 50px rgba(0,0,0,.5)}
  .gw-mobile-topic{margin-bottom:6px}
  .gw-mobile-topic>button{width:100%;text-align:left;background:none;border:none;cursor:pointer;
    font-family:inherit;font-size:12px;font-weight:700;letter-spacing:.14em;color:#fff;
    padding:12px 4px;border-bottom:1px solid rgba(0,212,255,.14)}
  .gw-mobile-topic .gw-mobile-links{display:none;padding:4px 0 8px}
  .gw-mobile-topic.open .gw-mobile-links{display:block}
  .gw-mobile-links a{display:block;padding:9px 12px;color:rgba(225,242,255,.8);
    text-decoration:none;font-size:14px}
  .gw-mobile-links a:hover{color:#00d4ff}
}
`;

function isActive(href: string): boolean {
  const path = window.location.pathname;
  if (href === '/') return path === '/' || path === '/index.html' || path === '/home.html';
  return path === href;
}

function buildNav(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'gw-global-nav';
  header.setAttribute('aria-label', 'Primary');

  const topicsHtml = NAV_TOPICS.map(
    (t) => `
    <div class="gw-topic">
      <button type="button" aria-haspopup="true">${t.label}</button>
      <div class="gw-dropdown" role="menu">
        ${t.items
          .map(
            (i) =>
              `<a href="${i.href}" role="menuitem" class="${isActive(i.href) ? 'gw-active' : ''}">${i.label}</a>`
          )
          .join('')}
      </div>
    </div>`
  ).join('');

  const mobileHtml = NAV_TOPICS.map(
    (t) => `
    <div class="gw-mobile-topic">
      <button type="button">${t.label} ▾</button>
      <div class="gw-mobile-links">
        ${t.items.map((i) => `<a href="${i.href}">${i.label}</a>`).join('')}
      </div>
    </div>`
  ).join('');

  header.innerHTML =
    `<a class="gw-brand" href="/">◇ GRID WORLD</a>` +
    `<nav class="gw-topics" aria-label="Sections">${topicsHtml}</nav>` +
    `<a class="gw-join" href="/join.html">JOIN GRID</a>` +
    `<button class="gw-hamburger" type="button" aria-label="Menu">☰</button>` +
    `<div class="gw-mobile-panel">${mobileHtml}</div>`;

  // Desktop: tap toggles for touch devices (hover covers mouse).
  header.querySelectorAll('.gw-topic > button').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const topic = (btn as HTMLElement).closest('.gw-topic')!;
      const wasOpen = topic.classList.contains('open');
      header.querySelectorAll('.gw-topic.open').forEach((t) => t.classList.remove('open'));
      if (!wasOpen) topic.classList.add('open');
    });
  });
  document.addEventListener('click', () => {
    header.querySelectorAll('.gw-topic.open').forEach((t) => t.classList.remove('open'));
  });

  // Mobile: hamburger + accordion topics.
  const hamburger = header.querySelector('.gw-hamburger')!;
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    header.classList.toggle('mobile-open');
  });
  header.querySelectorAll('.gw-mobile-topic > button').forEach((btn) => {
    btn.addEventListener('click', () => {
      (btn as HTMLElement).closest('.gw-mobile-topic')!.classList.toggle('open');
    });
  });

  return header;
}

let cssInjected = false;
function ensureCss(): void {
  if (cssInjected || document.querySelector('#gw-global-nav-css')) return;
  const style = document.createElement('style');
  style.id = 'gw-global-nav-css';
  style.textContent = NAV_CSS;
  document.head.appendChild(style);
  cssInjected = true;
}

/** Remove any legacy nav headers, then mount the single GlobalNav. */
export function mountGlobalNav(): void {
  ensureCss();
  // Never double-mount.
  if (document.querySelector('header.gw-global-nav')) return;
  // Remove legacy navs: static .grid-global-nav headers and old .gw-nav injections.
  document.querySelectorAll('header.grid-global-nav, header.gw-nav').forEach((el) => el.remove());
  document.body.insertBefore(buildNav(), document.body.firstChild);
}
