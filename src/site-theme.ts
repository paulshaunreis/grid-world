/* GridWorld site theme picker — Aurora, 2026-10-02.
 * Reads the SAME localStorage key the game uses (`grid-world:hud-theme`),
 * so a theme chosen in-world applies on-site and vice versa — same origin,
 * one choice, everywhere. Injects a swatch picker into .grid-global-nav. */

const THEME_KEY = 'grid-world:hud-theme';
const THEMES: Array<{ id: string; name: string; rgb: string }> = [
  { id: 'cyan', name: 'Cyan Pulse', rgb: '44,232,255' },
  { id: 'violet', name: 'Violet Rift', rgb: '165,105,255' },
  { id: 'magenta', name: 'Magenta Bloom', rgb: '255,74,190' },
  { id: 'emerald', name: 'Emerald Circuit', rgb: '60,255,180' },
  { id: 'amber', name: 'Amber Signal', rgb: '255,190,70' },
  { id: 'white', name: 'Ghost White', rgb: '235,245,255' },
  { id: 'crimson', name: 'Crimson Core', rgb: '255,70,90' },
  { id: 'azure', name: 'Azure Depth', rgb: '70,140,255' },
  { id: 'lime', name: 'Lime Wire', rgb: '170,255,60' },
  { id: 'indigo', name: 'Indigo Night', rgb: '120,110,255' },
];

function currentTheme(): string {
  const saved = localStorage.getItem(THEME_KEY);
  return THEMES.some(t => t.id === saved) ? saved! : 'cyan';
}

function applyTheme(id: string) {
  document.documentElement.dataset.hudTheme = id;
  localStorage.setItem(THEME_KEY, id);
}

function mountPicker() {
  const nav = document.querySelector('.grid-global-nav');
  if (!nav || nav.querySelector('.gw-theme-picker')) return;

  const wrap = document.createElement('div');
  wrap.className = 'gw-theme-picker';
  const active = THEMES.find(t => t.id === currentTheme())!;
  wrap.innerHTML =
    `<button type="button" class="gw-theme-dot" title="Interface theme: ${active.name}" aria-label="Change interface theme">` +
    `<span style="background:rgb(${active.rgb})"></span></button>` +
    `<div class="gw-theme-menu" hidden>` +
    THEMES.map(t =>
      `<button type="button" data-theme="${t.id}" title="${t.name}" aria-label="${t.name}">` +
      `<span style="background:rgb(${t.rgb})"></span>${t.id === currentTheme() ? ' ●' : ''}</button>`
    ).join('') +
    `</div>`;

  const dot = wrap.querySelector<HTMLButtonElement>('.gw-theme-dot')!;
  const menu = wrap.querySelector<HTMLDivElement>('.gw-theme-menu')!;
  dot.addEventListener('click', () => { menu.hidden = !menu.hidden; });
  document.addEventListener('click', e => {
    if (!wrap.contains(e.target as Node)) menu.hidden = true;
  });
  menu.addEventListener('click', e => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-theme]');
    if (!btn) return;
    const theme = THEMES.find(t => t.id === btn.dataset.theme)!;
    applyTheme(theme.id);
    dot.title = `Interface theme: ${theme.name}`;
    dot.querySelector('span')!.style.background = `rgb(${theme.rgb})`;
    menu.hidden = true;
  });

  const join = nav.querySelector('.grid-nav-join');
  nav.insertBefore(wrap, join ?? null);
}

applyTheme(currentTheme());
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountPicker);
} else {
  mountPicker();
}
