// GridWorld Profile Media Hub — SoundCloud-style tracks, albums, videos with GWC monetization.
// Phase 1: full data model, upload, playback, likes, play counts, sell/buy UI.
// Phase 2 (queued): full on-chain GWC payment flow via bazaar authority.

export type MediaTrack = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  audioUrl: string;
  coverArt: string | null;
  duration: number;
  playCount: number;
  likes: number;
  liked: boolean;
  price: number;       // GWC price, 0 = free
  forSale: boolean;
  albumId: string | null;
  createdAt: string;
};

export type MediaAlbum = {
  id: string;
  title: string;
  description: string;
  coverArt: string | null;
  price: number;       // GWC price, 0 = free
  forSale: boolean;
  createdAt: string;
};

export type MediaPurchase = {
  id: string;
  itemId: string;
  itemType: 'track' | 'album';
  title: string;
  price: number;
  sellerHandle: string;
  createdAt: string;
};

const tracksKey = 'grid-world:media-tracks';
const albumsKey = 'grid-world:media-albums';
const purchasesKey = 'grid-world:media-purchases';
const salesKey = 'grid-world:media-sales';

export function loadTracks(): MediaTrack[] {
  try { return JSON.parse(localStorage.getItem(tracksKey) ?? '[]'); } catch { return []; }
}
export function saveTracks(t: MediaTrack[]) { localStorage.setItem(tracksKey, JSON.stringify(t)); }
export function loadAlbums(): MediaAlbum[] {
  try { return JSON.parse(localStorage.getItem(albumsKey) ?? '[]'); } catch { return []; }
}
export function saveAlbums(a: MediaAlbum[]) { localStorage.setItem(albumsKey, JSON.stringify(a)); }
export function loadPurchases(): MediaPurchase[] {
  try { return JSON.parse(localStorage.getItem(purchasesKey) ?? '[]'); } catch { return []; }
}
export function savePurchases(p: MediaPurchase[]) { localStorage.setItem(purchasesKey, JSON.stringify(p)); }
export function loadSales(): MediaPurchase[] {
  try { return JSON.parse(localStorage.getItem(salesKey) ?? '[]'); } catch { return []; }
}
export function saveSales(s: MediaPurchase[]) { localStorage.setItem(salesKey, JSON.stringify(s)); }

function esc(s: string): string {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}

function fmtDuration(sec: number): string {
  if (!sec || !isFinite(sec)) return '--:--';
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2,'0')}`;
}

function fmtDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}); }
  catch { return iso; }
}

// Deterministic pseudo-waveform from track id (visual only; real analysis in Phase 2)
function waveformBars(id: string, n = 48): number[] {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const bars: number[] = [];
  for (let i = 0; i < n; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    bars.push(0.25 + (h % 100) / 100 * 0.75);
  }
  return bars;
}

let currentAudio: HTMLAudioElement | null = null;
let currentTrackId: string | null = null;

export function stopPlayback() {
  currentAudio?.pause();
  currentAudio = null;
  currentTrackId = null;
}

export function mediaHubMarkup(isOwner: boolean): string {
  const tracks = loadTracks().slice().sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  const albums = loadAlbums().slice().sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  const sales = loadSales();
  const totalEarnings = sales.reduce((s,p)=>s+p.price,0);
  const totalPlays = tracks.reduce((s,t)=>s+t.playCount,0);

  return `<article class="module-card media-hub"><span class="module-label">MUSIC</span>
    <div class="gallery-head"><h3>Soundtrack</h3>
      <div class="media-stats"><span>▶ ${totalPlays.toLocaleString()} plays</span><span>◈ ${totalEarnings.toLocaleString()} GWC earned</span></div>
    </div>

    ${albums.length?`<div class="media-section"><div class="media-section-title">ALBUMS</div><div class="album-grid">
      ${albums.map(a=>{const atracks=tracks.filter(t=>t.albumId===a.id);return `<div class="album-card">
        ${a.coverArt?`<img src="${esc(a.coverArt)}" alt="${esc(a.title)}">`:`<div class="album-cover-placeholder">♪</div>`}
        <div class="album-info"><b>${esc(a.title)}</b><small>${atracks.length} track${atracks.length===1?'':'s'}</small>
        ${a.forSale&&a.price>0?`<button class="media-buy" data-buy-album="${esc(a.id)}" type="button">BUY · ${a.price} GWC</button>`:`<span class="media-free">FREE</span>`}
        </div></div>`;}).join('')}
    </div></div>`:''}

    <div class="media-section"><div class="media-section-title">TRACKS</div>
      <div class="track-list">
        ${tracks.length?tracks.map(t=>trackRow(t, isOwner)).join(''):'<p>No tracks yet. Upload your first transmission.</p>'}
      </div>
    </div>

    ${isOwner?`<div class="media-upload">
      <div class="media-section-title">UPLOAD TRACK</div>
      <input id="media-title" placeholder="Track title…" maxlength="120">
      <textarea id="media-desc" placeholder="Description…" rows="2"></textarea>
      <input id="media-tags" placeholder="Tags (comma separated)…">
      <div class="media-upload-row">
        <label class="gallery-file-label">🎵 AUDIO <input id="media-audio" type="file" accept="audio/*" hidden></label>
        <label class="gallery-file-label">🖼 COVER <input id="media-cover" type="file" accept="image/*" hidden></label>
        <span id="media-file-name" class="blog-image-name"></span>
      </div>
      <div class="media-upload-row">
        <label class="media-sell-label"><input id="media-forsale" type="checkbox"> Sell this track</label>
        <input id="media-price" type="number" min="1" placeholder="Price (GWC)" style="width:130px" disabled>
        <select id="media-album"><option value="">No album</option>${albums.map(a=>`<option value="${esc(a.id)}">${esc(a.title)}</option>`).join('')}<option value="__new__">+ New album…</option></select>
      </div>
      <div class="media-upload-row" id="media-new-album-row" hidden>
        <input id="media-new-album" placeholder="New album title…" style="flex:1">
      </div>
      <button id="media-publish" type="button">PUBLISH TRACK</button>
      <div class="media-upload-row" style="margin-top:12px">
        <input id="media-album-title" placeholder="New album title…" style="flex:1">
        <input id="media-album-price" type="number" min="0" placeholder="Album price (GWC, 0=free)" style="width:170px">
        <button id="media-album-create" type="button" class="ghost small">CREATE ALBUM</button>
      </div>
    </div>`:''}

    ${isOwner&&sales.length?`<div class="media-section"><div class="media-section-title">SALES HISTORY</div>
      ${sales.slice().reverse().map(s=>`<div class="event-row"><b>${esc(s.title)}</b><small>${esc(s.itemType)} · ${fmtDate(s.createdAt)}</small><span class="media-earned">+${s.price} GWC</span></div>`).join('')}
    </div>`:''}

    <div class="audio-player-bar" id="audio-player-bar" hidden>
      <button id="ap-toggle" type="button">⏸</button>
      <div class="ap-info"><b id="ap-title">—</b><small id="ap-time">0:00 / 0:00</small></div>
      <div class="ap-progress"><div class="ap-progress-fill" id="ap-progress-fill"></div></div>
      <button id="ap-close" type="button">×</button>
      <audio id="ap-audio"></audio>
    </div>
  </article>`;
}

function trackRow(t: MediaTrack, isOwner: boolean): string {
  const bars = waveformBars(t.id);
  const playing = currentTrackId === t.id;
  return `<div class="track-row" data-track="${esc(t.id)}">
    <button class="track-play ${playing?'playing':''}" data-track-play="${esc(t.id)}" type="button">${playing?'⏸':'▶'}</button>
    ${t.coverArt?`<img class="track-cover" src="${esc(t.coverArt)}" alt="">`:`<div class="track-cover track-cover-placeholder">♪</div>`}
    <div class="track-main">
      <div class="track-head"><b>${esc(t.title)}</b><small>${fmtDate(t.createdAt)}</small></div>
      <div class="track-waveform">${bars.map(b=>`<span style="height:${Math.round(b*100)}%"></span>`).join('')}</div>
      <div class="track-meta"><span>▶ ${t.playCount}</span><button class="track-like ${t.liked?'liked':''}" data-track-like="${esc(t.id)}" type="button">♥ ${t.likes}</button>
      ${t.tags.slice(0,3).map(tag=>`<span class="track-tag">#${esc(tag)}</span>`).join('')}</div>
    </div>
    <div class="track-side">
      <small>${fmtDuration(t.duration)}</small>
      ${t.forSale&&t.price>0
        ? (isOwner?`<span class="media-price-tag">◈ ${t.price} GWC</span>`:`<button class="media-buy" data-buy-track="${esc(t.id)}" type="button">BUY · ${t.price}</button>`)
        : `<span class="media-free">FREE</span>`}
      ${isOwner?`<button class="track-delete" data-track-delete="${esc(t.id)}" type="button" title="Delete">×</button>`:''}
    </div>
  </div>`;
}

function fileToDataUrl(file: File, maxDim = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function publishTrack(opts: { supabase: any }) {
  const title = (document.querySelector<HTMLInputElement>('#media-title')?.value ?? '').trim();
  const desc = (document.querySelector<HTMLTextAreaElement>('#media-desc')?.value ?? '').trim();
  const tagsRaw = document.querySelector<HTMLInputElement>('#media-tags')?.value ?? '';
  const audioFile = document.querySelector<HTMLInputElement>('#media-audio')?.files?.[0];
  const coverFile = document.querySelector<HTMLInputElement>('#media-cover')?.files?.[0];
  if (!audioFile) return;

  const audioUrl = await fileToDataUrl(audioFile);
  const coverArt = coverFile ? await fileToDataUrl(coverFile, 600) : null;
  const duration = await getAudioDuration(audioFile);

  const forSale = document.querySelector<HTMLInputElement>('#media-forsale')?.checked ?? false;
  const price = Math.max(0, Number(document.querySelector<HTMLInputElement>('#media-price')?.value ?? 0));

  let albumId: string | null = document.querySelector<HTMLSelectElement>('#media-album')?.value || null;
  if (albumId === '__new__') {
    const albumTitle = (document.querySelector<HTMLInputElement>('#media-new-album')?.value ?? '').trim() || 'Untitled Album';
    const album: MediaAlbum = { id: crypto.randomUUID(), title: albumTitle, description: '', coverArt, price: 0, forSale: false, createdAt: new Date().toISOString() };
    const albums = loadAlbums(); albums.push(album); saveAlbums(albums);
    albumId = album.id;
  } else if (!albumId) albumId = null;

  const track: MediaTrack = {
    id: crypto.randomUUID(), title: title || audioFile.name.replace(/\.[^.]+$/,''),
    description: desc, tags: tagsRaw.split(',').map(t=>t.trim()).filter(Boolean),
    audioUrl, coverArt, duration, playCount: 0, likes: 0, liked: false,
    price: forSale ? price : 0, forSale: forSale && price > 0, albumId,
    createdAt: new Date().toISOString(),
  };
  const tracks = loadTracks(); tracks.push(track); saveTracks(tracks);

  // Supabase: attempt insert into grid_media_tracks (table may not exist yet — Phase 2)
  try {
    if (opts.supabase) {
      await opts.supabase.from('grid_media_tracks').insert({
        title: track.title, description: track.description, tags: track.tags,
        audio_url: audioUrl.startsWith('http') ? audioUrl : null,
        cover_art_url: coverArt?.startsWith('http') ? coverArt : null,
        duration: Math.round(duration), price_gwc: track.price, for_sale: track.forSale,
        album_id: albumId,
      });
    }
  } catch { /* Phase 2: table pending */ }
}

function getAudioDuration(file: File): Promise<number> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const a = new Audio();
    a.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(a.duration || 0); };
    a.onerror = () => { URL.revokeObjectURL(url); resolve(0); };
    a.src = url;
  });
}

export function createAlbum() {
  const title = (document.querySelector<HTMLInputElement>('#media-album-title')?.value ?? '').trim();
  if (!title) return;
  const price = Math.max(0, Number(document.querySelector<HTMLInputElement>('#media-album-price')?.value ?? 0));
  const album: MediaAlbum = { id: crypto.randomUUID(), title, description: '', coverArt: null, price, forSale: price > 0, createdAt: new Date().toISOString() };
  const albums = loadAlbums(); albums.push(album); saveAlbums(albums);
}

export function buyItem(id: string, kind: 'track' | 'album', sellerHandle: string) {
  const tracks = loadTracks(), albums = loadAlbums();
  const item = kind === 'track' ? tracks.find(t=>t.id===id) : albums.find(a=>a.id===id);
  if (!item || !item.forSale || item.price <= 0) return false;
  // Phase 1: record purchase locally. Phase 2: GWC transfer via bazaar authority.
  // TODO(phase-2): call GridCombatAuthority / bazaar purchase flow for real GWC settlement.
  const purchase: MediaPurchase = {
    id: crypto.randomUUID(), itemId: id, itemType: kind,
    title: item.title, price: item.price, sellerHandle, createdAt: new Date().toISOString(),
  };
  const purchases = loadPurchases(); purchases.push(purchase); savePurchases(purchases);
  return true;
}

export function recordSale(p: MediaPurchase) {
  const sales = loadSales(); sales.push(p); saveSales(sales);
}

export function bindMediaHub(onUpdate: () => void, opts: { supabase: any }) {
  // Upload wiring
  document.querySelector<HTMLInputElement>('#media-forsale')?.addEventListener('change', e => {
    const price = document.querySelector<HTMLInputElement>('#media-price');
    if (price) price.disabled = !(e.target as HTMLInputElement).checked;
  });
  document.querySelector<HTMLSelectElement>('#media-album')?.addEventListener('change', e => {
    const row = document.querySelector('#media-new-album-row');
    if (row) (row as HTMLElement).hidden = (e.target as HTMLSelectElement).value !== '__new__';
  });
  document.querySelector<HTMLInputElement>('#media-audio')?.addEventListener('change', e => {
    const n = (e.target as HTMLInputElement).files?.[0]?.name ?? '';
    const l = document.querySelector('#media-file-name'); if (l) l.textContent = n;
  });
  document.querySelector<HTMLButtonElement>('#media-publish')?.addEventListener('click', async () => {
    await publishTrack(opts); onUpdate();
  });
  document.querySelector<HTMLButtonElement>('#media-album-create')?.addEventListener('click', () => {
    createAlbum(); onUpdate();
  });

  // Playback
  document.querySelectorAll<HTMLButtonElement>('[data-track-play]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.trackPlay!;
    const track = loadTracks().find(t=>t.id===id);
    if (!track) return;
    const bar = document.querySelector('#audio-player-bar');
    if (currentTrackId === id && currentAudio) {
      // Toggle
      if (currentAudio.paused) { currentAudio.play(); b.textContent = '⏸'; }
      else { currentAudio.pause(); b.textContent = '▶'; }
      syncPlayerUI();
      return;
    }
    stopPlayback();
    const audio = new Audio(track.audioUrl);
    currentAudio = audio; currentTrackId = id;
    // Play count
    const tracks = loadTracks();
    const t = tracks.find(x=>x.id===id);
    if (t) { t.playCount++; saveTracks(tracks); }
    // Player bar
    const title = document.querySelector('#ap-title');
    if (title) title.textContent = track.title;
    if (bar) (bar as HTMLElement).hidden = false;
    const apAudio = document.querySelector<HTMLAudioElement>('#ap-audio');
    audio.ontimeupdate = () => syncPlayerUI();
    audio.onended = () => { stopPlayback(); onUpdate(); };
    void audio.play();
    onUpdate();
  }));

  document.querySelector<HTMLButtonElement>('#ap-toggle')?.addEventListener('click', () => {
    if (!currentAudio) return;
    if (currentAudio.paused) void currentAudio.play(); else currentAudio.pause();
    syncPlayerUI(); onUpdate();
  });
  document.querySelector<HTMLButtonElement>('#ap-close')?.addEventListener('click', () => {
    stopPlayback();
    const bar = document.querySelector('#audio-player-bar');
    if (bar) (bar as HTMLElement).hidden = true;
    onUpdate();
  });

  // Likes
  document.querySelectorAll<HTMLButtonElement>('[data-track-like]').forEach(b => b.addEventListener('click', (e) => {
    e.stopPropagation();
    const tracks = loadTracks();
    const t = tracks.find(x=>x.id===b.dataset.trackLike);
    if (t) { t.liked = !t.liked; t.likes = Math.max(0, t.likes + (t.liked?1:-1)); saveTracks(tracks); }
    onUpdate();
  }));

  // Delete
  document.querySelectorAll<HTMLButtonElement>('[data-track-delete]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.trackDelete!;
    if (currentTrackId === id) stopPlayback();
    saveTracks(loadTracks().filter(t=>t.id!==id));
    onUpdate();
  }));

  // Buy
  document.querySelectorAll<HTMLButtonElement>('[data-buy-track]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.buyTrack!;
    const track = loadTracks().find(t=>t.id===id);
    if (track && buyItem(id, 'track', 'owner')) {
      recordSale({ id: crypto.randomUUID(), itemId: id, itemType: 'track', title: track.title, price: track.price, sellerHandle: 'owner', createdAt: new Date().toISOString() });
    }
    onUpdate();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-buy-album]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.buyAlbum!;
    const album = loadAlbums().find(a=>a.id===id);
    if (album && buyItem(id, 'album', 'owner')) {
      recordSale({ id: crypto.randomUUID(), itemId: id, itemType: 'album', title: album.title, price: album.price, sellerHandle: 'owner', createdAt: new Date().toISOString() });
    }
    onUpdate();
  }));
}

function syncPlayerUI() {
  const toggle = document.querySelector('#ap-toggle');
  const time = document.querySelector('#ap-time');
  const fill = document.querySelector('#ap-progress-fill');
  if (currentAudio) {
    if (toggle) toggle.textContent = currentAudio.paused ? '▶' : '⏸';
    if (time) time.textContent = `${fmtDuration(currentAudio.currentTime)} / ${fmtDuration(currentAudio.duration)}`;
    if (fill && currentAudio.duration) (fill as HTMLElement).style.width = `${(currentAudio.currentTime/currentAudio.duration)*100}%`;
  }
}
