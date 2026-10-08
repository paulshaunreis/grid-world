// Shared Grid World navigation with dropdown menus.
// Used by all pages via <script type="module" src="/src/nav.ts"></script>
// Paul's request 2026-10-08: dropdowns with clean transitions, no broken links.

interface NavItem { label: string; href: string; }
interface NavGroup { label: string; href?: string; children: NavItem[]; }

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'WORLD',
    children: [
      { label: 'Play', href: '/play.html' },
      { label: 'Enter', href: '/enter.html' },
      { label: 'Avatars', href: '/avatars.html' },
      { label: 'Games', href: '/games.html' },
    ],
  },
  {
    label: 'MARKET',
    children: [
      { label: 'Marketplace', href: '/marketplace.html' },
      { label: 'Shop', href: '/shop.html' },
      { label: 'Economics', href: '/economics.html' },
      { label: 'Classifieds', href: '/classifieds.html' },
    ],
  },
  {
    label: 'CREATE',
    children: [
      { label: 'Studio', href: '/grid-world-studio.html' },
      { label: 'Textures', href: '/textures.html' },
      { label: 'Sound', href: '/sound.html' },
      { label: 'Docs', href: '/docs.html' },
    ],
  },
  {
    label: 'COMMUNITY',
    children: [
      { label: 'Social', href: '/social.html' },
      { label: 'Meetups', href: '/meetups.html' },
      { label: 'Directory', href: '/directory.html' },
      { label: 'Omni', href: '/omni.html' },
    ],
  },
  {
    label: 'MEMBERSHIP',
    href: '/membership.html',
    children: [],
  },
];

const NAV_CSS = `
.grid-global-nav nav{display:flex;align-items:center;gap:4px}
.nav-drop{position:relative}
.nav-drop>button,.nav-drop>a.nav-top{background:none;border:none;cursor:pointer;
  font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.08em;color:rgba(230,245,255,.75);
  padding:10px 14px;border-radius:6px;transition:all .18s;text-decoration:none;display:inline-block}
.nav-drop>button:hover,.nav-drop>a.nav-top:hover{color:#fff;background:rgba(0,229,255,.08)}
.nav-drop>button::after{content:' ▾';font-size:10px;opacity:.6}
.nav-menu{position:absolute;top:calc(100% + 8px);left:0;min-width:200px;z-index:1000;
  background:rgba(8,18,34,.98);border:1px solid rgba(100,220,255,.18);border-radius:10px;
  padding:8px;box-shadow:0 20px 60px rgba(0,0,0,.5),0 0 30px rgba(0,229,255,.06);
  backdrop-filter:blur(20px);
  opacity:0;transform:translateY(-8px) scale(.98);pointer-events:none;
  transition:opacity .22s cubic-bezier(.2,.9,.3,1),transform .22s cubic-bezier(.2,.9,.3,1)}
.nav-drop:hover .nav-menu,.nav-drop:focus-within .nav-menu{opacity:1;transform:none;pointer-events:auto}
.nav-menu a{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:6px;
  font:500 13px system-ui;color:rgba(230,245,255,.8);text-decoration:none;transition:all .15s}
.nav-menu a:hover{background:rgba(0,229,255,.1);color:#fff;transform:translateX(3px)}
.nav-menu a::before{content:'→';font-size:11px;color:rgba(0,229,255,.5);transition:color .15s}
.nav-menu a:hover::before{color:#00e5ff}
`;

function buildNav(): string {
  return NAV_GROUPS.map(g => {
    if (!g.children.length && g.href) {
      return `<div class="nav-drop"><a class="nav-top" href="${g.href}">${g.label}</a></div>`;
    }
    return `<div class="nav-drop"><button type="button" aria-haspopup="true">${g.label}</button>` +
      `<div class="nav-menu" role="menu">` +
      g.children.map(c => `<a href="${c.href}" role="menuitem">${c.label}</a>`).join('') +
      `</div></div>`;
  }).join('');
}

function injectNav(): void {
  // Inject dropdown CSS once
  if (!document.querySelector('#nav-dropdown-css')) {
    const style = document.createElement('style');
    style.id = 'nav-dropdown-css';
    style.textContent = NAV_CSS;
    document.head.appendChild(style);
  }
  // Replace nav contents on every page with grid-global-nav
  document.querySelectorAll<HTMLElement>('header.grid-global-nav nav').forEach(nav => {
    nav.innerHTML = buildNav();
  });
}

// Run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectNav);
} else {
  injectNav();
}
