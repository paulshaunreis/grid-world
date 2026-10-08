/* Grid World style picker — Paul's direction 2026-10-08.
 * 11 styles: Grayscale (default), Red, Orange, Yellow, Green, Blue, Indigo,
 * Violet, Pink, Black (dark), White (light).
 *
 * Windows-Settings quality: clean swatch picker, instant preview,
 * persists across sessions via localStorage key "gridworld:accent".
 *
 * Import on any page: `import '/src/theme/accent.ts'` (+ accent.css).
 * Full palettes live in accent.css — this module only handles state + UI.
 */

export interface AccentTheme {
  id: string;
  name: string;
  /** CSS background for the swatch dot (shows primary + secondary). */
  swatch: string;
}

export const ACCENT_KEY = 'gridworld:accent';

export const ACCENT_THEMES: AccentTheme[] = [
  { id: 'grayscale', name: 'Grayscale', swatch: 'linear-gradient(135deg,#e8ebef 0%,#e8ebef 50%,#6a7078 50%,#6a7078 100%)' },
  { id: 'red',       name: 'Red',       swatch: 'linear-gradient(135deg,#ff5252 0%,#ff5252 50%,#ff9a5c 50%,#ff9a5c 100%)' },
  { id: 'orange',    name: 'Orange',    swatch: 'linear-gradient(135deg,#ff8c2e 0%,#ff8c2e 50%,#ffc44d 50%,#ffc44d 100%)' },
  { id: 'yellow',    name: 'Yellow',    swatch: 'linear-gradient(135deg,#ffd23e 0%,#ffd23e 50%,#ffed9e 50%,#ffed9e 100%)' },
  { id: 'green',     name: 'Green',     swatch: 'linear-gradient(135deg,#4de86a 0%,#4de86a 50%,#2dd4bf 50%,#2dd4bf 100%)' },
  { id: 'blue',      name: 'Blue',      swatch: 'linear-gradient(135deg,#4ceaff 0%,#4ceaff 50%,#6f9dff 50%,#6f9dff 100%)' },
  { id: 'indigo',    name: 'Indigo',    swatch: 'linear-gradient(135deg,#6f7dff 0%,#6f7dff 50%,#b48bff 50%,#b48bff 100%)' },
  { id: 'violet',    name: 'Violet',    swatch: 'linear-gradient(135deg,#b48bff 0%,#b48bff 50%,#ff7fd8 50%,#ff7fd8 100%)' },
  { id: 'pink',      name: 'Pink',      swatch: 'linear-gradient(135deg,#ff4fd8 0%,#ff4fd8 50%,#ff8c6e 50%,#ff8c6e 100%)' },
  { id: 'black',     name: 'Black',     swatch: 'linear-gradient(135deg,#f0f0f0 0%,#f0f0f0 50%,#0a0a0a 50%,#0a0a0a 100%)' },
  { id: 'white',     name: 'White',     swatch: 'linear-gradient(135deg,#23272e 0%,#23272e 50%,#ffffff 50%,#ffffff 100%)' },
];

export function currentAccent(): string {
  try {
    const saved = localStorage.getItem(ACCENT_KEY);
    if (saved && ACCENT_THEMES.some(t => t.id === saved)) return saved;
  } catch { /* storage unavailable */ }
  return 'grayscale';
}

/* ---------- 3D engine bridge (Paul 2026-10-08) ----------
 * The website's style picker also drives the 3D world's HUD accents.
 * The engine reads localStorage key "grid-world:hud-theme" and sets
 * `data-hud-theme` on <html> (see src/main.ts, src/ui/grid-themes.css).
 * This maps each website accent to the closest engine HUD theme so the
 * 3D world's UI follows the website choice. One direction only
 * (website -> 3D) to avoid loops; the in-world HUD picker still works
 * independently when the player is inside the 3D world. */
export const HUD_THEME_KEY = 'grid-world:hud-theme';

export const ACCENT_TO_HUD: Record<string, string> = {
  grayscale: 'white',   /* Ghost White — neutral */
  red:       'crimson',  /* Crimson Core */
  orange:    'amber',    /* Amber Signal */
  yellow:    'amber',    /* Amber Signal (closest warm) */
  green:     'emerald',  /* Emerald Circuit */
  blue:      'cyan',     /* Cyan Pulse — engine default */
  indigo:    'indigo',   /* Indigo Night */
  violet:    'violet',   /* Violet Rift */
  pink:      'magenta',  /* Magenta Bloom */
  black:     'white',    /* subtle on dark */
  white:     'white',    /* Ghost White */
};

/** Sync the 3D engine's HUD theme to match the website accent choice. */
export function syncHudTheme(accentId: string): void {
  const hud = ACCENT_TO_HUD[accentId] ?? 'white';
  /* dataset.hudTheme -> data-hud-theme attribute (matches grid-themes.css selectors) */
  document.documentElement.dataset.hudTheme = hud;
  try { localStorage.setItem(HUD_THEME_KEY, hud); } catch { /* ignore */ }
}

export function applyAccent(id: string): void {
  if (!ACCENT_THEMES.some(t => t.id === id)) id = 'grayscale';
  document.documentElement.dataset.accent = id;
  try { localStorage.setItem(ACCENT_KEY, id); } catch { /* ignore */ }
  syncHudTheme(id);
  document.dispatchEvent(new CustomEvent('gridworld:accent-change', { detail: id }));
}

/** Renders the style picker. Returns the element for nav mounting. */
export function createAccentPicker(): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'gw-accent-picker';
  const render = () => {
    const active = ACCENT_THEMES.find(t => t.id === currentAccent())!;
    wrap.innerHTML =
      `<button type="button" class="gw-accent-dot" title="Interface style: ${active.name}" aria-label="Change interface style" aria-haspopup="true">` +
      `<span style="background:${active.swatch}"></span></button>` +
      `<div class="gw-accent-menu" hidden role="menu" aria-label="Interface styles">` +
      ACCENT_THEMES.map(t =>
        `<button type="button" role="menuitemradio" aria-checked="${t.id === active.id}" data-accent-id="${t.id}" title="${t.name}">` +
        `<span class="sw" style="background:${t.swatch}"></span>${t.name}</button>`
      ).join('') + `</div>`;
    const dot = wrap.querySelector<HTMLButtonElement>('.gw-accent-dot')!;
    const menu = wrap.querySelector<HTMLDivElement>('.gw-accent-menu')!;
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.hidden = !menu.hidden;
    });
    menu.querySelectorAll<HTMLButtonElement>('[data-accent-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        applyAccent(btn.dataset.accentId!);
        menu.hidden = true;
        render();
      });
    });
  };
  render();
  document.addEventListener('click', () => {
    const menu = wrap.querySelector<HTMLDivElement>('.gw-accent-menu');
    if (menu) menu.hidden = true;
  });
  document.addEventListener('gridworld:accent-change', render);
  return wrap;
}

/* Auto-apply saved style as early as possible to avoid a flash. */
applyAccent(currentAccent());
