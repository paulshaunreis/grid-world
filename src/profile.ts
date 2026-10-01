import './profile.css';

type ProfileTheme = {
  preset: string;
  accent: string;
  background: string;
  density: 'compact' | 'balanced' | 'spacious';
  glow: boolean;
};

type ProfileLayout = {
  columns: 1 | 2 | 3;
  sections: string[];
};

type ProfileDraft = {
  displayName: string;
  handle: string;
  bio: string;
  status: string;
  theme: ProfileTheme;
  layout: ProfileLayout;
  favoriteEmoji: string;
};

const defaults: ProfileDraft = {
  displayName: 'Grid Traveler',
  handle: 'gridtraveler',
  bio: 'Explorer, creator, and resident of the ever-expanding Grid.',
  status: 'Exploring First Light ✦',
  theme: {
    preset: 'aurora',
    accent: '#48e7ff',
    background: 'nebula',
    density: 'balanced',
    glow: true,
  },
  layout: {
    columns: 2,
    sections: ['about', 'worlds', 'creations', 'gallery', 'communities', 'events'],
  },
  favoriteEmoji: '✨',
};

const key = 'grid-world:profile-draft';

function loadDraft(): ProfileDraft {
  try {
    const saved = localStorage.getItem(key);
    return saved ? { ...defaults, ...JSON.parse(saved) } : structuredClone(defaults);
  } catch {
    return structuredClone(defaults);
  }
}

let draft = loadDraft();
let following = localStorage.getItem('grid-world:profile-following') === 'true';

const app = document.querySelector<HTMLDivElement>('#profile-app')!;

const sectionLabels: Record<string, string> = {
  about: 'About Me',
  worlds: 'My Worlds',
  creations: 'Creations',
  gallery: 'Gallery',
  communities: 'Communities',
  events: 'Events',
};

function save() {
  localStorage.setItem(key, JSON.stringify(draft));
  const status = document.querySelector('#save-status');
  if (status) status.textContent = 'Saved locally · ready for Grid Identity';
}

function render() {
  app.innerHTML = `
    <header class="studio-header">
      <a class="brand" href="/"><span class="brand-mark">◇</span><span>GRID WORLD</span></a>
      <div class="studio-title"><span>PROFILE STUDIO</span><small>MAKE YOUR SPACE YOURS</small></div>
      <div class="studio-actions"><a href="/" class="ghost">BACK TO GRID</a><a href="/shop.html?shop=${draft.handle}" class="ghost">MY SHOP ↗</a><button id="save">SAVE PROFILE</button></div>
    </header>

    <main class="studio">
      <aside class="controls">
        <div class="eyebrow">IDENTITY</div>
        <h1>Build your space.</h1>
        <p class="intro">Bring back the creative freedom of classic personal profiles—without requiring code.</p>

        <label>Display name<input id="displayName" value="${escapeHtml(draft.displayName)}"></label>
        <label>Handle<input id="handle" value="@${escapeHtml(draft.handle)}"></label>
        <label>Status<input id="status" value="${escapeHtml(draft.status)}"></label>
        <label>About me<textarea id="bio">${escapeHtml(draft.bio)}</textarea></label>

        <div class="control-section">
          <div class="section-title">THEME</div>
          <div class="theme-grid">
            ${['aurora','neon','verdant','ember','void','crystal'].map(p => `<button class="theme-swatch ${draft.theme.preset===p?'selected':''}" data-theme="${p}"><span class="swatch ${p}"></span>${p}</button>`).join('')}
          </div>
        </div>

        <div class="control-section">
          <div class="section-title">LAYOUT</div>
          <div class="segmented">${([1,2,3] as const).map(c => `<button class="${draft.layout.columns===c?'selected':''}" data-columns="${c}">${c} column${c>1?'s':''}</button>`).join('')}</div>
        </div>

        <div class="control-section">
          <div class="section-title">PERSONAL TOUCH</div>
          <div class="emoji-row">${['✨','🌌','🚀','🌱','🎮','🎨','🔥','💜','👽','🪐','🌊','⚡'].map(e => `<button class="${draft.favoriteEmoji===e?'selected':''}" data-emoji="${e}">${e}</button>`).join('')}</div>
        </div>

        <div class="control-section">
          <div class="section-title">PROFILE MODULES</div>
          <div class="module-list">
            ${draft.layout.sections.map(section => `<button class="module" data-remove="${section}"><span>⠿</span>${sectionLabels[section]}<b>×</b></button>`).join('')}
          </div>
        </div>

        <div class="save-note" id="save-status">Draft loaded locally</div>
      </aside>

      <section class="preview-area">
        <div class="preview-toolbar"><span>LIVE PREVIEW</span><span>DESKTOP PROFILE · PUBLIC</span></div>
        <div class="profile-preview theme-${draft.theme.preset} ${draft.theme.glow?'glow':''}">
          <div class="profile-cover">
            <div class="cover-orbit"></div>
            <div class="profile-badge">${draft.favoriteEmoji}</div>
          </div>
          <div class="profile-main">
            <div class="identity-row">
              <div class="avatar">G</div>
              <div class="identity-copy"><h2>${escapeHtml(draft.displayName)}</h2><p>@${escapeHtml(draft.handle)} · ${escapeHtml(draft.status)}</p></div>
              <button class="follow ${following ? "following" : ""}" id="follow-button" type="button">${following ? "FOLLOWING" : "FOLLOW"}</button>
            </div>
            <div class="profile-grid columns-${draft.layout.columns}">
              ${draft.layout.sections.map(section => moduleMarkup(section, draft)).join('')}
            </div>
          </div>
        </div>
      </section>
    </main>
  `;

  bind();
}

function moduleMarkup(section: string, data: ProfileDraft): string {
  const content: Record<string,string> = {
    about: `<article class="module-card"><span class="module-label">ABOUT</span><h3>Who I am</h3><p>${escapeHtml(data.bio)}</p><div class="chips"><span>Explorer</span><span>Creator</span><span>${data.favoriteEmoji} Dreamer</span></div></article>`,
    worlds: `<article class="module-card"><span class="module-label">WORLDS</span><h3>Currently exploring</h3><div class="world-pill"><i></i><b>First Light</b><small>Online now</small></div><div class="world-pill"><i></i><b>Neon District</b><small>Visited 3h ago</small></div></article>`,
    creations: `<article class="module-card"><span class="module-label">CREATIONS</span><h3>Made in the Grid</h3><div class="creation-grid"><div>◈</div><div>◇</div><div>✦</div></div></article>`,
    gallery: `<article class="module-card"><span class="module-label">GALLERY</span><h3>Moments</h3><div class="gallery-grid"><div>🌌</div><div>🌲</div><div>🌃</div><div>🪐</div></div></article>`,
    communities: `<article class="module-card"><span class="module-label">COMMUNITIES</span><h3>Places I belong</h3><p>World Builders · First Light Residents · Grid Creators</p></article>`,
    events: `<article class="module-card"><span class="module-label">EVENTS</span><h3>Next up</h3><div class="event-row"><b>NEON NIGHTS</b><small>Tonight · Virtual</small></div><div class="event-row"><b>CREATOR CAMP</b><small>Saturday · Hybrid</small></div></article>`,
  };
  return content[section] ?? '';
}

function bind() {
  document.querySelector<HTMLInputElement>('#displayName')?.addEventListener('input', e => { draft.displayName=(e.target as HTMLInputElement).value; renderPreviewOnly(); });
  document.querySelector<HTMLInputElement>('#handle')?.addEventListener('input', e => { draft.handle=(e.target as HTMLInputElement).value.replace(/^@/,''); renderPreviewOnly(); });
  document.querySelector<HTMLInputElement>('#status')?.addEventListener('input', e => { draft.status=(e.target as HTMLInputElement).value; renderPreviewOnly(); });
  document.querySelector<HTMLTextAreaElement>('#bio')?.addEventListener('input', e => { draft.bio=(e.target as HTMLTextAreaElement).value; renderPreviewOnly(); });
  document.querySelector('#save')?.addEventListener('click', save);
  document.querySelector<HTMLButtonElement>('#follow-button')?.addEventListener('click', () => {
    following = !following;
    localStorage.setItem('grid-world:profile-following', String(following));
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-theme]').forEach(button => button.addEventListener('click', () => {
    draft.theme.preset = button.dataset.theme ?? 'aurora';
    render();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-columns]').forEach(button => button.addEventListener('click', () => {
    draft.layout.columns = Number(button.dataset.columns) as 1|2|3;
    render();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-emoji]').forEach(button => button.addEventListener('click', () => {
    draft.favoriteEmoji = button.dataset.emoji ?? '✨';
    render();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach(button => button.addEventListener('click', () => {
    const section = button.dataset.remove!;
    draft.layout.sections = draft.layout.sections.filter(item => item !== section);
    render();
  }));
}

function renderPreviewOnly() {
  const preview = document.querySelector('.profile-preview');
  if (!preview) return;
  const current = preview.outerHTML;
  const temp = document.createElement('div');
  temp.innerHTML = current;
  const next = document.createElement('div');
  next.innerHTML = `<div class="profile-preview theme-${draft.theme.preset} ${draft.theme.glow?'glow':''}">${temp.querySelector('.profile-preview')?.innerHTML ?? ''}</div>`;
  const identity = next.querySelector('.identity-copy');
  if (identity) identity.innerHTML = `<h2>${escapeHtml(draft.displayName)}</h2><p>@${escapeHtml(draft.handle)} · ${escapeHtml(draft.status)}</p>`;
  const about = next.querySelector('.module-card p');
  if (about) about.textContent = draft.bio;
  const shell = document.querySelector('.preview-area');
  if (shell) {
    const toolbar = shell.querySelector('.preview-toolbar');
    const fresh = document.createElement('div');
    fresh.innerHTML = next.innerHTML;
    shell.replaceChildren(toolbar!, fresh.firstElementChild!);
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
}

render();
