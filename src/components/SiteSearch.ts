// SiteSearch — global search for the GridWorld header (Paul 2026-10-09).
// A search button in the top nav opens a glassmorphic overlay panel with
// live-filtered results across pages, regions, marketplace items, games, and citizens.
import { searchCitizens, taggedName, citizenUrl, staffDisplayName } from '../social/citizens';
//
// Design: matches the vibrant dashboard — dark glass, cyan accent highlights,
// rounded corners, pill shapes. Uses the grayscale-first accent system
// (--accent, --gw-*) so it recolors with the user's accent choice.

export interface SearchEntry {
  kind: 'page' | 'region' | 'item' | 'game' | 'citizen';
  title: string;
  sub: string;
  href: string;
  keywords: string;
}

const KIND_LABEL: Record<SearchEntry['kind'], string> = {
  page: 'Pages',
  region: 'Regions',
  item: 'Marketplace',
  game: 'Games',
  citizen: 'Citizens',
};

const INDEX: SearchEntry[] = [
  // ---------- Pages ----------
  { kind:'page', title:'Grid World — Home', sub:'Worlds Without Limits — the main hub', href:'/', keywords:'home index main start' },
  { kind:'page', title:'Grid World Marketplace', sub:'Buy and sell Grid World originals', href:'/marketplace.html', keywords:'marketplace market shop buy sell items' },
  { kind:'page', title:'Grid World Games', sub:'Grid Monsters, Grid Duel, Grid Dice and more', href:'/games.html', keywords:'games play grid monsters duel dice solitaire poker chess checkers racing puzzles arena' },
  { kind:'page', title:'Play — First Light', sub:'Enter the 3D world at First Light', href:'/play.html', keywords:'play 3d world first light enter grid' },
  { kind:'page', title:'Enter Grid World', sub:'Sign in to your Grid World account', href:'/enter.html', keywords:'enter sign in login account' },
  { kind:'page', title:'Join Grid World', sub:'Create your Grid World account', href:'/join.html', keywords:'join sign up register create account' },
  { kind:'page', title:'GridWorld Beta Program', sub:'Apply for closed beta access', href:'/beta.html', keywords:'beta apply access tester' },
  { kind:'page', title:'Profile Studio', sub:'Customize your Grid World profile', href:'/profile.html', keywords:'profile avatar customize identity' },
  { kind:'page', title:'Shop Studio', sub:'Creator storefront tools', href:'/shop.html', keywords:'shop store sell storefront' },
  { kind:'page', title:'Classifieds', sub:'Community listings', href:'/classifieds.html', keywords:'classifieds listings ads' },
  { kind:'page', title:'Safe Meetups', sub:'Plan safe community meetups', href:'/meetups.html', keywords:'meetups events community gather' },
  { kind:'page', title:'Economics', sub:'Grid World economy and GWC', href:'/economics.html', keywords:'economics economy gwc currency money' },
  { kind:'page', title:'Documentation', sub:'Guides and reference docs', href:'/docs.html', keywords:'docs documentation help guide reference' },
  { kind:'page', title:'Grid World People', sub:'Staff directory and team', href:'/directory.html', keywords:'directory staff team people' },
  { kind:'page', title:'Grid Omni Sound', sub:'Sound and music systems', href:'/sound.html', keywords:'sound music audio soundtrack' },
  { kind:'page', title:'Grid Omni Security', sub:'Safety and security systems', href:'/omni.html', keywords:'omni security safety map' },
  { kind:'page', title:'Avatar Concepts', sub:'Avatar design concepts', href:'/avatars.html', keywords:'avatars concepts characters design' },
  { kind:'page', title:'Grid World Studio', sub:'Creator studio and build tools', href:'/grid-world-studio.html', keywords:'studio build create tools' },
  { kind:'page', title:'PBR Library', sub:'Physically-based rendering texture library', href:'/textures.html', keywords:'textures pbr materials library' },
  { kind:'page', title:'Social Manager', sub:'Social features and connections', href:'/social.html', keywords:'social friends community connect' },
  { kind:'page', title:'Membership', sub:'Membership tiers and benefits', href:'/membership.html', keywords:'membership tiers subscribe benefits' },
  { kind:'page', title:'Email Confirmed', sub:'Account confirmation', href:'/confirmed.html', keywords:'confirmed email verified' },
  { kind:'page', title:'Recover Account', sub:'Account recovery', href:'/recover.html', keywords:'recover password reset account' },
  { kind:'page', title:'Concept Home', sub:'The original Grid World concept', href:'/home.html', keywords:'concept home original' },
  { kind:'page', title:'Grid World Store', sub:'Official merchandise (coming soon)', href:'/store.html', keywords:'store merch merchandise' },
  { kind:'page', title:'Game', sub:'Grid World game client', href:'/game.html', keywords:'game client' },
  { kind:'page', title:'Systems Health', sub:'Diagnostics and system status', href:'/diagnostics.html', keywords:'diagnostics health status systems' },
  // ---------- Regions ----------
  { kind:'region', title:'First Light', sub:'Entry World — where every journey begins', href:'/play.html', keywords:'first light entry world hub arrival home spawn' },
  { kind:'region', title:'Tideline', sub:'Ocean World — tides, wildlife, exploration', href:'/play.html', keywords:'tideline ocean water tides harbors moons' },
  { kind:'region', title:'Crown', sub:'Celestial Citadel — signals, guardians, mystery', href:'/play.html', keywords:'crown celestial citadel monuments ringed world' },
  { kind:'region', title:'Verdant', sub:'Floating Gardens — ecology, bloom, companionship', href:'/play.html', keywords:'verdant gardens floating ecology alien moons' },
  { kind:'region', title:'Muse', sub:'Art Realm — gatherings and arenas', href:'/play.html', keywords:'muse art realm geometry color expression social' },
  { kind:'region', title:'Frontier', sub:'Ancient Wilds — migration, territory, survival', href:'/play.html', keywords:'frontier wilds ancient trees survival danger' },
  { kind:'region', title:'Neon District', sub:'Signal City — in development', href:'/#dashboard', keywords:'neon district signal city night' },
  { kind:'region', title:'Crystal Caverns', sub:'Glass Deep — in development', href:'/#dashboard', keywords:'crystal caverns glass deep' },
  { kind:'region', title:'Iron Wastes', sub:'Rust Belt — in development', href:'/#dashboard', keywords:'iron wastes rust belt salvage' },
  { kind:'region', title:'Skybound Isles', sub:'Floating Archipelago — in development', href:'/#dashboard', keywords:'skybound isles floating archipelago clouds' },
  // ---------- Marketplace items ----------
  { kind:'item', title:'Aurora Crystal', sub:'Luminous environmental accent — 15 GWC', href:'/marketplace.html', keywords:'aurora crystal luminous nature environment' },
  { kind:'item', title:'Wayfinder Lamp', sub:'Navigation lamp for paths and plazas — free', href:'/marketplace.html', keywords:'wayfinder lamp decor light navigation' },
  { kind:'item', title:'Profile Prism', sub:'Floating inspection prism — free', href:'/marketplace.html', keywords:'profile prism social identity' },
  { kind:'item', title:'Creator Bench', sub:'Workbench for creator spaces — 25 GWC', href:'/marketplace.html', keywords:'creator bench workbench build' },
  { kind:'item', title:'Gallery Plinth', sub:'Display pedestal for creator art — 10 GWC', href:'/marketplace.html', keywords:'gallery plinth display art pedestal' },
  { kind:'item', title:'Signal Beacon', sub:'Programmable signal primitive — 60 GWC', href:'/marketplace.html', keywords:'signal beacon utility programmable' },
  { kind:'item', title:'Portal Arch', sub:'Gateway primitive for region links — 120 GWC', href:'/marketplace.html', keywords:'portal arch gateway world travel' },
  { kind:'item', title:'Eco Planter', sub:'Living planter primitive — 8 GWC', href:'/marketplace.html', keywords:'eco planter nature living plant' },
  { kind:'item', title:'Survey Drone', sub:'Diagnostic and discovery drone — 90 GWC', href:'/marketplace.html', keywords:'survey drone utility diagnostic' },
  { kind:'item', title:'Waypoint Sign', sub:'Navigation and accessibility marker — 5 GWC', href:'/marketplace.html', keywords:'waypoint sign navigation marker' },
  { kind:'item', title:'Aurora Wayfinder Sphere', sub:'Navigation sphere for landmarks — 420 GWC', href:'/marketplace.html', keywords:'wayfinder sphere navigation landmarks' },
  { kind:'item', title:'Safe Grid Script Cube', sub:'Starter logic cube for scripting — 560 GWC', href:'/marketplace.html', keywords:'script cube logic creator tools safe' },
  { kind:'item', title:'Discovery Spark', sub:'Discovery marker for quests — 180 GWC', href:'/marketplace.html', keywords:'discovery spark exploration quest' },
  { kind:'item', title:'Lorekeeper Archive Orb', sub:'Archive object for world memory — 640 GWC', href:'/marketplace.html', keywords:'lorekeeper archive orb lore history' },
  { kind:'item', title:'First-Principles Cube', sub:'Modular building primitive — 120 GWC', href:'/marketplace.html', keywords:'first principles cube building modular' },
  { kind:'item', title:'Sentinel Shield Token', sub:'Safety marker for protected zones — 300 GWC', href:'/marketplace.html', keywords:'sentinel shield token safety protection' },
  { kind:'item', title:'Region Cartographer Tile', sub:'Map tile for region planning — 350 GWC', href:'/marketplace.html', keywords:'cartographer tile map region planning' },
  { kind:'item', title:'Paradox Prism', sub:'Test object for conflicting conditions — 730 GWC', href:'/marketplace.html', keywords:'paradox prism logic test' },
  { kind:'item', title:'Welcome Lantern', sub:'Welcome object for community spaces — 240 GWC', href:'/marketplace.html', keywords:'welcome lantern social community' },
  { kind:'item', title:'Strategy Board', sub:'Modular board for teams and quests — 310 GWC', href:'/marketplace.html', keywords:'strategy board planning teams quests' },
  { kind:'item', title:'Guardian Halo', sub:'Protective marker for safe spaces — 330 GWC', href:'/marketplace.html', keywords:'guardian halo safety protection accessibility' },
  { kind:'item', title:'Ethics Beacon', sub:'Reminder for safety and consent — 275 GWC', href:'/marketplace.html', keywords:'ethics beacon safety autonomy consent' },
  // ---------- Games ----------
  { kind:'game', title:'Grid Monsters', sub:'Creature battles in-world and web', href:'/games.html', keywords:'grid monsters creature battle pets' },
  { kind:'game', title:'Grid Duel', sub:'Head-to-head duels', href:'/games.html', keywords:'grid duel pvp battle versus' },
  { kind:'game', title:'Grid Dice', sub:'Dice games of chance', href:'/games.html', keywords:'grid dice chance luck' },
  { kind:'game', title:'Grid Solitaire', sub:'Classic solitaire, Grid style', href:'/games.html', keywords:'grid solitaire cards classic' },
  { kind:'game', title:'Grid Poker', sub:'Social poker, no real money', href:'/games.html', keywords:'grid poker cards social' },
  { kind:'game', title:'Grid Chess', sub:'Chess on the Grid', href:'/games.html', keywords:'grid chess strategy board' },
  { kind:'game', title:'Grid Checkers', sub:'Checkers on the Grid', href:'/games.html', keywords:'grid checkers board' },
  { kind:'game', title:'Grid Racing', sub:'High-speed grid racing', href:'/games.html', keywords:'grid racing speed vehicles' },
  { kind:'game', title:'Grid Puzzles', sub:'Brain-teasing puzzles', href:'/games.html', keywords:'grid puzzles brain teaser' },
  { kind:'game', title:'Grid Arena', sub:'Arena combat events', href:'/games.html', keywords:'grid arena combat events tournament' },
];

const SEARCH_CSS = `
/* Site search — matches the vibrant dashboard aesthetic (Paul 2026-10-09) */
.gw-search-btn{display:flex;align-items:center;justify-content:center;flex:none;
  width:38px;height:38px;border-radius:50%;cursor:pointer;
  background:rgba(var(--accent-rgb),.08);border:1px solid rgba(var(--accent-rgb),.32);
  color:rgba(220,240,255,.85);transition:background .15s,box-shadow .15s,color .15s}
.gw-search-btn:hover{background:rgba(var(--accent-rgb),.18);color:#fff;
  box-shadow:0 0 18px rgba(var(--accent-rgb),.35)}
.gw-search-btn svg{width:17px;height:17px}
.gw-search-overlay{position:fixed;top:0;left:0;right:0;z-index:200;
  display:flex;justify-content:center;padding:76px 16px 16px;pointer-events:none;
  opacity:0;visibility:hidden;transition:opacity .18s,visibility .18s}
.gw-search-overlay.open{opacity:1;visibility:visible;pointer-events:auto}
.gw-search-panel{width:min(620px,100%);max-height:min(70vh,560px);display:flex;flex-direction:column;
  background:var(--gw-panel-2);border:1px solid rgba(var(--accent-rgb),.32);border-radius:16px;
  box-shadow:0 24px 70px rgba(0,0,0,.6),0 0 40px rgba(var(--accent-rgb),.16);
  backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);overflow:hidden}
.gw-search-input-row{display:flex;align-items:center;gap:10px;padding:14px 16px;
  border-bottom:1px solid rgba(var(--accent-rgb),.18)}
.gw-search-input-row svg{width:18px;height:18px;flex:none;color:var(--accent)}
.gw-search-input{flex:1;background:none;border:none;outline:none;font-family:inherit;
  font-size:16px;color:#fff;letter-spacing:.02em}
.gw-search-input::placeholder{color:rgba(220,240,255,.4)}
.gw-search-hint{font-size:11px;color:rgba(220,240,255,.4);letter-spacing:.06em;white-space:nowrap}
.gw-search-hint kbd{border:1px solid rgba(var(--accent-rgb),.3);border-radius:4px;
  padding:1px 6px;font-family:inherit;font-size:10px}
.gw-search-results{overflow-y:auto;padding:8px}
.gw-search-group-label{font-size:10px;font-weight:700;letter-spacing:.16em;
  color:var(--accent);padding:12px 12px 6px;text-transform:uppercase}
.gw-search-row{display:flex;align-items:center;gap:12px;width:100%;text-align:left;
  background:none;border:none;cursor:pointer;font-family:inherit;
  padding:10px 12px;border-radius:10px;color:#fff;text-decoration:none;
  transition:background .12s}
.gw-search-row:hover,.gw-search-row.selected{background:rgba(var(--accent-rgb),.14)}
.gw-search-row-icon{flex:none;width:34px;height:34px;border-radius:10px;display:flex;
  align-items:center;justify-content:center;font-size:15px;
  background:rgba(var(--accent-rgb),.1);border:1px solid rgba(var(--accent-rgb),.22)}
.gw-search-row-text{flex:1;min-width:0}
.gw-search-row-title{font-size:14px;font-weight:600;letter-spacing:.02em;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis}
.gw-search-row-sub{font-size:12px;color:rgba(220,240,255,.55);white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis}
.gw-search-empty{padding:28px 16px;text-align:center;color:rgba(220,240,255,.5);font-size:14px}
.gw-search-backdrop{position:fixed;inset:0;z-index:199;background:rgba(0,0,0,.45);
  opacity:0;visibility:hidden;transition:opacity .18s,visibility .18s}
.gw-search-backdrop.open{opacity:1;visibility:visible}
@media(max-width:900px){
  .gw-search-overlay{padding:68px 12px 12px}
  .gw-search-panel{max-height:80vh}
  .gw-search-hint{display:none}
}
/* white (light) theme */
html[data-accent="white"] .gw-search-btn{color:rgba(20,25,35,.7);
  background:rgba(20,25,35,.05);border-color:rgba(20,25,35,.18)}
html[data-accent="white"] .gw-search-btn:hover{color:#16191e;background:rgba(20,25,35,.1)}
html[data-accent="white"] .gw-search-panel{background:#ffffff;border-color:rgba(20,25,35,.14)}
html[data-accent="white"] .gw-search-input{color:#16191e}
html[data-accent="white"] .gw-search-input::placeholder{color:rgba(20,25,35,.4)}
html[data-accent="white"] .gw-search-row{color:#16191e}
html[data-accent="white"] .gw-search-row:hover,html[data-accent="white"] .gw-search-row.selected{background:rgba(20,25,35,.06)}
html[data-accent="white"] .gw-search-row-sub{color:rgba(20,25,35,.55)}
html[data-accent="white"] .gw-search-empty{color:rgba(20,25,35,.5)}
html[data-accent="white"] .gw-search-group-label{color:var(--accent)}
`;

const KIND_ICON: Record<SearchEntry['kind'], string> = {
  page: '📄',
  region: '🌐',
  item: '💎',
  game: '🎮',
  citizen: '👤',
};

function scoreEntry(entry: SearchEntry, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const title = entry.title.toLowerCase();
  const sub = entry.sub.toLowerCase();
  const kw = entry.keywords.toLowerCase();
  if (title === q) return 100;
  if (title.startsWith(q)) return 80;
  if (title.includes(q)) return 60;
  if (kw.split(' ').some((w) => w.startsWith(q))) return 40;
  if (sub.includes(q)) return 30;
  if (kw.includes(q)) return 20;
  // multi-word: all words must appear somewhere
  const words = q.split(/\s+/);
  if (words.length > 1 && words.every((w) => (title + ' ' + sub + ' ' + kw).includes(w))) return 50;
  return 0;
}

export function searchIndex(query: string, limit = 12): SearchEntry[] {
  const q = query.trim();
  if (q.length < 2) return [];
  const staticResults = INDEX.map((e) => ({ e, s: scoreEntry(e, q) }))
    .filter((r) => r.s > 0);
  // Citizens from the directory
  let citizenResults: { e: SearchEntry; s: number }[] = [];
  try {
    citizenResults = searchCitizens(q).slice(0, 5).map((c) => {
      const name = c.type === 'staff' ? staffDisplayName(c) : c.displayName;
      const sub = c.type === 'staff' ? `${c.title ?? 'Staff'} · TEAM` : `${taggedName(c)}${c.userTypeLabel ? ` · ${c.userTypeLabel}` : ''}`;
      const e: SearchEntry = { kind: 'citizen', title: name, sub, href: citizenUrl(c), keywords: `${c.username} ${c.displayName} ${taggedName(c)}` };
      return { e, s: 60 };
    });
  } catch { /* citizens unavailable */ }
  return [...staticResults, ...citizenResults]
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((r) => r.e);
}

let cssInjected = false;
function ensureCss(): void {
  if (cssInjected || document.querySelector('#gw-search-css')) return;
  const style = document.createElement('style');
  style.id = 'gw-search-css';
  style.textContent = SEARCH_CSS;
  document.head.appendChild(style);
  cssInjected = true;
}

const MAGNIFIER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>';

/** Build the search button element for the nav. */
export function buildSearchButton(): HTMLElement {
  ensureCss();
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'gw-search-btn';
  btn.setAttribute('aria-label', 'Search Grid World');
  btn.title = 'Search ( / )';
  btn.innerHTML = MAGNIFIER;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    openSearch();
  });
  return btn;
}

let overlay: HTMLElement | null = null;
let backdrop: HTMLElement | null = null;
let input: HTMLInputElement | null = null;
let resultsEl: HTMLElement | null = null;
let selectedIdx = -1;
let currentResults: SearchEntry[] = [];

function renderResults(): void {
  if (!resultsEl || !input) return;
  const q = input.value;
  currentResults = searchIndex(q);
  selectedIdx = currentResults.length > 0 ? 0 : -1;

  if (q.trim().length < 2) {
    resultsEl.innerHTML = '<div class="gw-search-empty">Type to search pages, regions, items, games, and citizens…</div>';
    return;
  }
  if (currentResults.length === 0) {
    resultsEl.innerHTML = `<div class="gw-search-empty">No results for “${escapeHtml(q)}”. Try another search.</div>`;
    return;
  }

  let html = '';
  let lastKind: SearchEntry['kind'] | '' = '';
  currentResults.forEach((r, i) => {
    if (r.kind !== lastKind) {
      html += `<div class="gw-search-group-label">${KIND_LABEL[r.kind]}</div>`;
      lastKind = r.kind;
    }
    html += `<a class="gw-search-row${i === selectedIdx ? ' selected' : ''}" href="${r.href}" data-idx="${i}">
      <span class="gw-search-row-icon">${KIND_ICON[r.kind]}</span>
      <span class="gw-search-row-text">
        <span class="gw-search-row-title">${escapeHtml(r.title)}</span><br>
        <span class="gw-search-row-sub">${escapeHtml(r.sub)}</span>
      </span>
    </a>`;
  });
  resultsEl.innerHTML = html;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function updateSelection(): void {
  resultsEl?.querySelectorAll('.gw-search-row').forEach((row, i) => {
    row.classList.toggle('selected', i === selectedIdx);
  });
  const sel = resultsEl?.querySelector('.gw-search-row.selected') as HTMLElement | null;
  sel?.scrollIntoView({ block: 'nearest' });
}

export function openSearch(): void {
  ensureCss();
  if (!overlay) {
    backdrop = document.createElement('div');
    backdrop.className = 'gw-search-backdrop';
    backdrop.addEventListener('click', closeSearch);
    document.body.appendChild(backdrop);

    overlay = document.createElement('div');
    overlay.className = 'gw-search-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Search Grid World');
    overlay.innerHTML = `
      <div class="gw-search-panel">
        <div class="gw-search-input-row">
          ${MAGNIFIER}
          <input class="gw-search-input" type="text" placeholder="Search pages, regions, items, games…" aria-label="Search" autocomplete="off" spellcheck="false">
          <span class="gw-search-hint"><kbd>esc</kbd> to close</span>
        </div>
        <div class="gw-search-results"></div>
      </div>`;
    document.body.appendChild(overlay);
    input = overlay.querySelector('.gw-search-input')!;
    resultsEl = overlay.querySelector('.gw-search-results')!;
    input.addEventListener('input', renderResults);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentResults.length) {
          selectedIdx = (selectedIdx + 1) % currentResults.length;
          updateSelection();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentResults.length) {
          selectedIdx = (selectedIdx - 1 + currentResults.length) % currentResults.length;
          updateSelection();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const target = selectedIdx >= 0 ? currentResults[selectedIdx] : currentResults[0];
        if (target) {
          closeSearch();
          window.location.href = target.href;
        }
      }
    });
    // Hover updates keyboard selection.
    resultsEl.addEventListener('mousemove', (e) => {
      const row = (e.target as HTMLElement).closest('.gw-search-row') as HTMLElement | null;
      if (row?.dataset.idx !== undefined) {
        selectedIdx = Number(row.dataset.idx);
        updateSelection();
      }
    });
  }
  overlay.classList.add('open');
  backdrop?.classList.add('open');
  if (input) {
    input.value = '';
    renderResults();
    setTimeout(() => input?.focus(), 30);
  }
}

export function closeSearch(): void {
  overlay?.classList.remove('open');
  backdrop?.classList.remove('open');
}

/** Global keyboard shortcuts: "/" focuses search, Escape closes. */
export function initSearchShortcuts(): void {
  document.addEventListener('keydown', (e) => {
    const tag = (e.target as HTMLElement).tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;
    if (e.key === 'Escape') {
      closeSearch();
      return;
    }
    if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      openSearch();
    }
  });
}
