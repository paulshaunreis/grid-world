import './profile.css';
import { searchCitizens, taggedName, citizenUrl, staffDisplayName, ensureSeedCitizens, type CitizenRecord } from './social/citizens';

const app = document.querySelector<HTMLDivElement>('#citizens-app')!;

let query = '';
let typeFilter: 'all' | 'citizen' | 'staff' = 'all';
let onlineOnly = false;

function esc(s: string): string {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}

function avatarFor(c: CitizenRecord): string {
  if (c.avatarUrl) return c.avatarUrl;
  if (c.username === 'aurora') return '/avatars/aurora.webp';
  if (c.userType) return `/avatars/type-${c.userType}.webp`;
  return '/avatars/default-avatar.webp';
}

function render() {
  ensureSeedCitizens();
  const results = searchCitizens(query, {
    type: typeFilter === 'all' ? undefined : typeFilter,
    onlineOnly: onlineOnly || undefined,
  });
  const onlineCount = results.filter(c=>c.onlineStatus==='online').length;

  app.innerHTML = `
    <header class="studio-header">
      <a class="brand" href="/"><span class="brand-mark">◇</span><span>GRID WORLD</span></a>
      <div class="studio-title"><span>CITIZEN DIRECTORY</span><small>THE YELLOW PAGES</small></div>
      <div class="studio-actions"><a href="/" class="ghost">BACK TO GRID</a></div>
    </header>
    <main class="profile-page">
      <div class="dir-search module-card">
        <span class="module-label">FIND CITIZENS</span>
        <div class="dir-search-row">
          <input id="dir-q" placeholder="Search by name… (try Name#1234)" value="${esc(query)}">
          <button id="dir-go" type="button">SEARCH</button>
        </div>
        <div class="dir-filters">
          ${(['all','citizen','staff'] as const).map(t=>`<button class="${typeFilter===t?'selected':''}" data-dir-type="${t}" type="button">${t.toUpperCase()}</button>`).join('')}
          <label class="dir-online"><input type="checkbox" id="dir-online" ${onlineOnly?'checked':''}> Online now</label>
        </div>
        <p class="dir-count">${results.length} citizen${results.length===1?'':'s'} · ${onlineCount} online</p>
      </div>
      <div class="dir-grid">
        ${results.length ? results.map(cardHtml).join('') : '<div class="module-card"><p>No citizens found. Try a different search.</p></div>'}
      </div>
    </main>`;
  bind();
}

function cardHtml(c: CitizenRecord): string {
  const isStaff = c.type === 'staff';
  const name = isStaff ? staffDisplayName(c) : c.displayName;
  const sub = isStaff ? (c.title ?? '') : taggedName(c);
  return `<a class="dir-card module-card" href="${citizenUrl(c)}">
    <span class="ub-avatar-wrap status-${c.onlineStatus ?? 'offline'}">
      <img class="ub-avatar dir-avatar" src="${esc(avatarFor(c))}" alt="${esc(name)}" loading="lazy">
      <span class="ub-status-dot"></span>
    </span>
    <div class="dir-card-info">
      <b>${esc(name)}</b>
      <small class="dir-tagged">${esc(sub)}</small>
      ${c.bio?`<p>${esc(c.bio.slice(0, 90))}${c.bio.length>90?'…':''}</p>`:''}
    </div>
    ${isStaff?'<span class="ub-staff">TEAM</span>':c.userTypeLabel?`<span class="ub-type">${esc(c.userTypeLabel)}</span>`:''}
  </a>`;
}

function bind() {
  const q = document.querySelector<HTMLInputElement>('#dir-q');
  const doSearch = () => { query = q?.value ?? ''; render(); const nq = document.querySelector<HTMLInputElement>('#dir-q'); if (nq) { nq.focus(); nq.setSelectionRange(nq.value.length, nq.value.length); } };
  document.querySelector<HTMLButtonElement>('#dir-go')?.addEventListener('click', doSearch);
  q?.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  // Live search as you type (debounced)
  let t: number | undefined;
  q?.addEventListener('input', () => { clearTimeout(t); t = window.setTimeout(() => { query = q.value; render(); const nq = document.querySelector<HTMLInputElement>('#dir-q'); if (nq) { nq.focus(); nq.setSelectionRange(nq.value.length, nq.value.length); } }, 300); });
  document.querySelectorAll<HTMLButtonElement>('[data-dir-type]').forEach(b=>b.addEventListener('click',()=>{
    typeFilter = b.dataset.dirType as typeof typeFilter; render();
  }));
  document.querySelector<HTMLInputElement>('#dir-online')?.addEventListener('change', e=>{
    onlineOnly = (e.target as HTMLInputElement).checked; render();
  });
}

render();
