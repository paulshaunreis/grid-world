import './profile.css';
import { mediaHubMarkup, bindMediaHub, stopPlayback } from './media/profileMedia';
import { getPermissions, permBadge, canTransfer, canGift, itemBadge, sendGift, acceptGift, declineGift, pendingGiftsFor, giftDialogMarkup } from './economy/gifting';
import { createClient } from '@supabase/supabase-js';
import { GridProfileAuthority, type GridProfileMedia, type GridArenaRanking, type GridProfileActivity } from './social/GridProfileAuthority';
import { GridWorldAuthority, type GridPersistentWorld } from './social/GridWorldAuthority';
import { GridSocialService } from './social/GridSocialService';
const profileSupabaseUrl=import.meta.env.VITE_SUPABASE_URL as string|undefined;
const profileSupabaseKey=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined;
const profileClient=profileSupabaseUrl&&profileSupabaseKey?createClient(profileSupabaseUrl,profileSupabaseKey):null;
const profileAuthority=profileClient?new GridProfileAuthority(profileClient):null;
const worldAuthority=profileClient?new GridWorldAuthority(profileClient):null;
const profileSocial=profileClient?new GridSocialService(profileClient):null;
let cloudMedia:GridProfileMedia[]=[];let cloudWorlds:GridPersistentWorld[]=[];let arenaRanking:GridArenaRanking|null=null;let cloudFeed:GridProfileActivity[]=[];let cloudLandmarks:import('./social/GridProfileAuthority').GridProfileLandmark[]=[];let cloudInventory:import('./social/GridProfileAuthority').GridPlayerInventoryItem[]=[];let cloudPosts:import('./social/GridProfileAuthority').GridProfilePost[]=[];
let mood='curious';
let liveProfile:{online:boolean;worldId?:string;regionId?:string;lastSeenAt?:string;friends:number;followers:number;following:number}|null=null;

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
  location: string;
  interests: string;
  userType: string;
  avatarUrl: string | null;
  onlineStatus: 'online' | 'away' | 'offline';
  theme: ProfileTheme;
  layout: ProfileLayout;
  favoriteEmoji: string;
};

const AVATAR_TYPES = [
  {id:'navigator',label:'Navigator',color:'#3e8eb8'},
  {id:'muse',label:'Muse',color:'#8f4fb2'},
  {id:'explorer',label:'Explorer',color:'#b86d31'},
  {id:'builder',label:'Builder',color:'#725239'},
  {id:'scholar',label:'Scholar',color:'#53699d'},
  {id:'sentinel',label:'Sentinel',color:'#8d7841'},
  {id:'wanderer',label:'Wanderer',color:'#477b5a'},
  {id:'artist',label:'Artist',color:'#a44376'},
  {id:'ranger',label:'Ranger',color:'#496844'},
  {id:'architect',label:'Architect',color:'#496f84'},
] as const;

function avatarFor(draft: Pick<ProfileDraft,'userType'|'avatarUrl'>): string {
  if (draft.avatarUrl) return draft.avatarUrl;
  const t = AVATAR_TYPES.find(x => x.id === draft.userType);
  return t ? `/avatars/type-${t.id}.webp` : '/avatars/default-avatar.webp';
}

type GalleryPiece = {
  id: string;
  url: string;
  kind: 'IMAGE' | 'VIDEO';
  title: string;
  description: string;
  tags: string[];
  likes: number;
  liked: boolean;
  createdAt: string;
};

const galleryKey = 'grid-world:profile-gallery';

function loadGallery(): GalleryPiece[] {
  try {
    const saved = localStorage.getItem(galleryKey);
    return saved ? JSON.parse(saved) as GalleryPiece[] : [];
  } catch { return []; }
}

function saveGallery(pieces: GalleryPiece[]) {
  localStorage.setItem(galleryKey, JSON.stringify(pieces));
}

let gallerySort: 'newest' | 'liked' = 'newest';
let galleryLightboxId: string | null = null;

function galleryMarkup(): string {
  const isOwner = !new URLSearchParams(location.search).get('handle');
  let pieces = loadGallery().slice();
  // Merge cloud media not yet in local gallery
  for (const m of cloudMedia) {
    if (!pieces.some(p => p.url === m.url)) {
      pieces.push({ id: m.id || crypto.randomUUID(), url: m.url, kind: m.kind, title: m.caption || 'Untitled', description: '', tags: [], likes: 0, liked: false, createdAt: m.created_at || new Date().toISOString() });
    }
  }
  pieces.sort((a,b) => gallerySort === 'liked' ? b.likes - a.likes : b.createdAt.localeCompare(a.createdAt));
  return `<article class="module-card gallery-card"><span class="module-label">GALLERY</span>
    <div class="gallery-head"><h3>Portfolio</h3>
      <div class="gallery-sort">${(['newest','liked'] as const).map(s=>`<button class="${gallerySort===s?'selected':''}" data-gallery-sort="${s}" type="button">${s==='newest'?'NEWEST':'MOST LIKED'}</button>`).join('')}</div>
    </div>
    ${isOwner?`<div class="gallery-upload">
      <input id="gallery-title" placeholder="Piece title…" maxlength="120">
      <textarea id="gallery-desc" placeholder="Description…" rows="2"></textarea>
      <input id="gallery-tags" placeholder="Tags (comma separated)…" maxlength="200">
      <div class="gallery-upload-row">
        <label class="gallery-file-label">📷 CHOOSE FILE <input id="gallery-file" type="file" accept="image/*,video/*" hidden></label>
        <span id="gallery-file-name" class="blog-image-name"></span>
        <button id="gallery-publish" type="button">UPLOAD</button>
      </div>
    </div>`:''}
    <div class="art-grid">
      ${pieces.length?pieces.map(p=>`<div class="art-thumb" data-art="${escapeHtml(p.id)}">
        ${p.kind==='VIDEO'?`<video src="${escapeHtml(p.url)}" muted preload="metadata"></video>`:`<img src="${escapeHtml(p.url)}" alt="${escapeHtml(p.title)}" loading="lazy">`}
        <div class="art-thumb-overlay"><b>${escapeHtml(p.title)}</b><span>♥ ${p.likes}</span></div>
      </div>`).join(''):'<p>No pieces yet. Upload your first work above.</p>'}
    </div>
    ${galleryLightboxId?galleryLightboxMarkup(pieces.find(p=>p.id===galleryLightboxId), isOwner):''}
  </article>`;
}

function galleryLightboxMarkup(p: GalleryPiece | undefined, isOwner: boolean): string {
  if (!p) return '';
  return `<div class="art-lightbox" id="art-lightbox">
    <div class="art-lightbox-backdrop" data-lightbox-close></div>
    <div class="art-lightbox-panel">
      <button class="art-lightbox-close" data-lightbox-close type="button">×</button>
      ${p.kind==='VIDEO'?`<video src="${escapeHtml(p.url)}" controls></video>`:`<img src="${escapeHtml(p.url)}" alt="${escapeHtml(p.title)}">`}
      <div class="art-lightbox-info">
        <div class="art-lightbox-head"><h3>${escapeHtml(p.title)}</h3>
          <button class="art-like ${p.liked?'liked':''}" data-art-like="${escapeHtml(p.id)}" type="button">♥ ${p.likes}</button>
        </div>
        <small class="art-date">${formatBlogDate(p.createdAt)}</small>
        ${p.description?`<p>${escapeHtml(p.description)}</p>`:''}
        ${p.tags.length?`<div class="chips">${p.tags.map(t=>`<span>#${escapeHtml(t)}</span>`).join('')}</div>`:''}
        ${isOwner?`<div class="blog-post-actions" style="margin-top:12px">
          <button data-art-edit="${escapeHtml(p.id)}" type="button">EDIT</button>
          <button data-art-delete="${escapeHtml(p.id)}" type="button">DELETE</button>
          ${canGift('art',p.id)?`<button data-gift-item="art" data-gift-id="${escapeHtml(p.id)}" data-gift-title="${escapeHtml(p.title)}" type="button">🎁 GIFT</button>`:''}
        </div>
        <div class="art-edit-form" hidden>
          <input class="art-edit-title" value="${escapeHtml(p.title)}" maxlength="120">
          <textarea class="art-edit-desc" rows="2">${escapeHtml(p.description)}</textarea>
          <input class="art-edit-tags" value="${escapeHtml(p.tags.join(', '))}" maxlength="200">
          <div class="blog-post-actions"><button data-art-save="${escapeHtml(p.id)}" type="button">SAVE</button><button data-art-cancel type="button">CANCEL</button></div>
        </div>`:''}
      </div>
    </div>
  </div>`;
}

async function publishGalleryPiece() {
  const title = document.querySelector<HTMLInputElement>('#gallery-title')?.value.trim() ?? '';
  const desc = document.querySelector<HTMLTextAreaElement>('#gallery-desc')?.value.trim() ?? '';
  const tagsRaw = document.querySelector<HTMLInputElement>('#gallery-tags')?.value ?? '';
  const file = document.querySelector<HTMLInputElement>('#gallery-file')?.files?.[0];
  if (!file) return;
  let url: string | null = null;
  const kind = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
  if (profileClient) {
    try {
      const {data:{user}} = await profileClient.auth.getUser();
      if (user) {
        const safe = file.name.replace(/[^A-Za-z0-9._-]/g,'_');
        const path = user.id+'/gallery/'+crypto.randomUUID()+'-'+safe;
        const up = await profileClient.storage.from('profile-media').upload(path, file, {upsert:false, contentType:file.type});
        if (!up.error) {
          url = profileClient.storage.from('profile-media').getPublicUrl(path).data.publicUrl;
          await profileClient.from('grid_profile_media').insert({user_id:user.id, kind, url, caption: title || file.name, metadata:{mime:file.type, size:file.size, description:desc, tags:tagsRaw.split(',').map(t=>t.trim()).filter(Boolean)}});
        }
      }
    } catch { /* fallback below */ }
  }
  if (!url) url = kind === 'IMAGE' ? await fileToDataUrl(file, 1600) : URL.createObjectURL(file);
  const piece: GalleryPiece = {
    id: crypto.randomUUID(), url, kind,
    title: title || 'Untitled', description: desc,
    tags: tagsRaw.split(',').map(t=>t.trim()).filter(Boolean),
    likes: 0, liked: false, createdAt: new Date().toISOString(),
  };
  const pieces = loadGallery(); pieces.push(piece); saveGallery(pieces);
  if (profileClient && profileAuthority) {
    try { const {data:{user}} = await profileClient.auth.getUser(); if (user) cloudMedia = await profileAuthority.media(user.id); } catch { /* local retained */ }
  }
  render();
}

type BlogPost = {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
};

const blogKey = 'grid-world:profile-blog';

function loadBlog(): BlogPost[] {
  try {
    const saved = localStorage.getItem(blogKey);
    return saved ? JSON.parse(saved) as BlogPost[] : [];
  } catch { return []; }
}

function saveBlog(posts: BlogPost[]) {
  localStorage.setItem(blogKey, JSON.stringify(posts));
}

const defaults: ProfileDraft = {
  displayName: 'Grid Traveler',
  handle: 'gridtraveler',
  bio: 'Explorer, creator, and resident of the ever-expanding Grid.',
  status: 'Exploring First Light ✦',
  location: '',
  interests: '',
  userType: 'explorer',
  avatarUrl: null,
  onlineStatus: 'online' as const,
  theme: {
    preset: 'aurora',
    accent: '#48e7ff',
    background: 'nebula',
    density: 'balanced',
    glow: true,
  },
  layout: {
    columns: 2,
    sections: ['about', 'blog', 'feed', 'mood', 'worlds', 'creations', 'gallery', 'communities', 'events', 'arena'],
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
  feed: 'Feed',
  mood: 'Mood',
  about: 'About Me',
  worlds: 'My Worlds',
  creations: 'Creations',
  gallery: 'Gallery',
  communities: 'Communities',
  events: 'Events',
  arena: 'Arena Ranking',
  blog: 'Blog',
};

async function save() {
  localStorage.setItem(key, JSON.stringify(draft));
  if(profileAuthority&&profileClient){try{const {data:{user}}=await profileClient.auth.getUser();if(user){await profileAuthority.save({handle:draft.handle,displayName:draft.displayName,bio:draft.bio,status:draft.status,mood,avatarUrl:draft.avatarUrl,theme:{...draft.theme,location:draft.location,interests:draft.interests,userType:draft.userType,onlineStatus:draft.onlineStatus},layout:draft.layout});cloudMedia=await profileAuthority.media(user.id);cloudPosts=await profileAuthority.posts(user.id);cloudFeed=await profileAuthority.activity(user.id);cloudLandmarks=await profileAuthority.landmarks(user.id);cloudWorlds=worldAuthority?await worldAuthority.listOwned(user.id):[];cloudInventory=await profileAuthority.inventory(user.id);arenaRanking=await profileAuthority.ranking(user.id);render();return;}}catch(error){console.warn('Cloud profile save unavailable; local profile retained.',error);}}
  const status=document.querySelector('#save-status');if(status)status.textContent='Saved locally · ready for Grid Identity';
}

let activeTab: 'overview' | 'gallery' | 'blog' | 'about' | 'music' = 'overview';
let editOpen = false;
const isOwnerView = () => {
  if (new URLSearchParams(location.search).get('handle')) return false;
  const m = location.pathname.match(/^\/user\/([A-Za-z0-9_.-]+)\/?$/);
  return !m;
};

function render() {
  const isOwner = isOwnerView();
  app.innerHTML = `
    <header class="studio-header">
      <a class="brand" href="/"><span class="brand-mark">◇</span><span>GRID WORLD</span></a>
      <div class="studio-title"><span>PROFILE</span></div>
      <div class="studio-actions">
        ${isOwner?'<button id="edit-toggle" type="button">'+(editOpen?'CLOSE EDITOR':'EDIT PROFILE')+'</button>':''}
        <a href="/" class="ghost">BACK TO GRID</a>
      </div>
    </header>

    <main class="profile-page theme-${draft.theme.preset} ${draft.theme.glow?'glow':''}">
      <section class="profile-hero">
        <div class="profile-cover"><div class="cover-orbit"></div><div class="profile-badge">${draft.favoriteEmoji}</div></div>
        <div class="identity-row">
          <div class="avatar-wrap status-${draft.onlineStatus}">
            <img class="avatar-img" src="${escapeHtml(avatarFor(draft))}" alt="${escapeHtml(draft.displayName)}">
            <span class="avatar-status-dot" title="${draft.onlineStatus}"></span>
            ${isOwner?`<button id="avatar-plus" class="avatar-plus" type="button" title="Upload profile picture">+</button><input id="avatar-file" type="file" accept="image/*" hidden>`:''}
          </div>
          <div class="identity-copy">
            <h2>${escapeHtml(draft.displayName)}</h2>
            <p>@${escapeHtml(draft.handle)} · ${escapeHtml(draft.status)}</p>
            ${draft.location?`<p class="identity-meta">📍 ${escapeHtml(draft.location)}</p>`:''}
          </div>
          ${isOwner?'':`<button class="follow ${following ? "following" : ""}" id="follow-button" type="button">${following ? "FOLLOWING" : "FOLLOW"}</button>`}
        </div>
      </section>

      <nav class="profile-tabs">
        ${(['overview','gallery','blog','about','music'] as const).map(t=>`<button class="${activeTab===t?'active':''}" data-tab="${t}" type="button">${t.toUpperCase()}</button>`).join('')}
      </nav>

      <section class="profile-tab-content">
        ${activeTab==='overview'?overviewMarkup():''}
        ${activeTab==='gallery'?galleryMarkup():''}
        ${activeTab==='blog'?blogMarkup():''}
        ${activeTab==='about'?aboutMarkup():''}
        ${activeTab==='music'?musicMarkup():''}
      </section>

      ${isOwner&&editOpen?editorMarkup():''}
    </main>
  `;

  bind();
}

function giftsInboxMarkup(): string {
  const isOwner = isOwnerView();
  if (!isOwner) return '';
  const pending = pendingGiftsFor(draft.handle || 'gridtraveler');
  if (!pending.length) return '';
  return `<article class="module-card"><span class="module-label">GIFTS</span><h3>🎁 Pending Gifts (${pending.length})</h3>
    ${pending.map(g=>`<div class="gift-inbox-row">
      <div><b>${escapeHtml(g.itemTitle)}</b><small>from @${escapeHtml(g.fromHandle)}${g.message ? ' — "' + escapeHtml(g.message) + '"' : ''}</small><div>${permBadge(g.permissions)}</div></div>
      <div class="gift-inbox-actions"><button data-gift-accept="${esc(g.id)}" type="button">ACCEPT</button><button data-gift-decline="${esc(g.id)}" type="button">DECLINE</button></div>
    </div>`).join('')}
  </article>`;
}

function esc(s: string): string { return escapeHtml(s); }

function overviewMarkup(): string {
  return `<div class="profile-grid columns-2">
    <article class="module-card"><span class="module-label">ABOUT</span><h3>Who I am</h3><p>${escapeHtml(draft.bio)}</p>
      <div class="chips"><span>${draft.onlineStatus==='online'?'● ONLINE':draft.onlineStatus==='away'?'● AWAY':'○ OFFLINE'}</span>${draft.location?`<span>📍 ${escapeHtml(draft.location)}</span>`:''}${draft.interests?`<span>✦ ${escapeHtml(draft.interests)}</span>`:''}<span>${draft.favoriteEmoji} ${escapeHtml(mood)}</span></div>
    </article>
    <article class="module-card"><span class="module-label">FEED</span><h3>Recent from the Grid</h3>${cloudFeed.length?cloudFeed.slice(0,5).map(p=>`<div class="event-row"><b>${escapeHtml(p.kind.replaceAll('_',' '))}</b><small>${escapeHtml(p.title)}${p.body?' · '+escapeHtml(p.body):''}</small></div>`).join(''):'<p>No public activity yet.</p>'}</article>
    <article class="module-card"><span class="module-label">WORLDS</span><h3>My Grid Worlds</h3>${cloudWorlds.length?cloudWorlds.slice(0,6).map(w=>`<div class="world-pill"><i></i><b>${escapeHtml(w.label)}</b><small>${escapeHtml(w.id)} · ${escapeHtml(w.tags.join(' · '))}</small></div>`).join(''):(cloudLandmarks.length?cloudLandmarks.slice(0,4).map(l=>`<div class="world-pill"><i></i><b>${escapeHtml(l.name)}</b><small>${escapeHtml(l.world_id)} · ${escapeHtml(l.region_id)}</small></div>`).join(''):'<p>No created worlds or saved destinations yet.</p>')}</article>
    <article class="module-card"><span class="module-label">COLLECTION</span><h3>Inventory</h3>${cloudInventory.length?cloudInventory.slice(0,5).map(i=>{return `<div class="event-row"><b>${escapeHtml(i.item_id)}</b>${itemBadge('inventory',i.item_id)}<small>x${i.quantity}</small>${isOwnerView()&&canGift('inventory',i.item_id)?`<button class="gift-btn" data-gift-item="inventory" data-gift-id="${escapeHtml(i.item_id)}" data-gift-title="${escapeHtml(i.item_id)}" type="button" title="Send as gift">🎁</button>`:''}</div>`;}).join(''):'<p>Collection is empty.</p>'}</article>
    ${arenaRanking?`<article class="module-card"><span class="module-label">ARENA</span><h3>Season ${escapeHtml(arenaRanking.season)}</h3><div class="event-row"><b>RATING ${arenaRanking.rating}</b><small>${arenaRanking.wins}W · ${arenaRanking.losses}L</small></div></article>`:`<article class="module-card"><span class="module-label">ARENA</span><h3>Unranked</h3><p>Enter an Arena season to establish a competitive record.</p></article>`}
    <article class="module-card"><span class="module-label">EVENTS</span><h3>Next up</h3><div class="event-row"><b>NEON NIGHTS</b><small>Tonight · Virtual</small></div><div class="event-row"><b>CREATOR CAMP</b><small>Saturday · Hybrid</small></div></article>
    ${giftsInboxMarkup()}
  </div>`;
}

function aboutMarkup(): string {
  return `<div class="profile-grid columns-2">
    <article class="module-card"><span class="module-label">ABOUT</span><h3>${escapeHtml(draft.displayName)}</h3><p>${escapeHtml(draft.bio)}</p></article>
    <article class="module-card"><span class="module-label">DETAILS</span><h3>Facts</h3>
      <div class="event-row"><b>LOCATION</b><small>${escapeHtml(draft.location||'—')}</small></div>
      <div class="event-row"><b>INTERESTS</b><small>${escapeHtml(draft.interests||'—')}</small></div>
      <div class="event-row"><b>MOOD</b><small>${escapeHtml(mood)}</small></div>
      <div class="event-row"><b>STATUS</b><small>${escapeHtml(draft.status)}</small></div>
      <div class="event-row"><b>CITIZEN TYPE</b><small>${escapeHtml((AVATAR_TYPES.find(t=>t.id===draft.userType)?.label)??'Explorer')}</small></div>
      ${liveProfile?.worldId?`<div class="event-row"><b>CURRENTLY IN</b><small>${escapeHtml(liveProfile.worldId)}${liveProfile.regionId?` · ${escapeHtml(liveProfile.regionId)}`:''}</small></div>`:''}
    </article>
  </div>`;
}

function musicMarkup(): string {
  return mediaHubMarkup(isOwnerView());
}

function editorMarkup(): string {
  return `<aside class="profile-editor">
    <div class="editor-head"><h3>Edit Profile</h3><button id="editor-save" type="button">SAVE</button></div>
    <div class="save-note" id="save-status">Changes save to your profile</div>
    <label>Display name<input id="displayName" value="${escapeHtml(draft.displayName)}"></label>
    <label>Handle<input id="handle" value="@${escapeHtml(draft.handle)}"></label>
    <label>Status<input id="status" value="${escapeHtml(draft.status)}"></label>
    <label>Mood<select id="mood">${['curious','calm','energized','focused','creative','social','adventurous','peaceful','determined','playful'].map(m=>`<option value="${m}" ${mood===m?'selected':''}>${m}</option>`).join('')}</select></label>
    <label>About me<textarea id="bio">${escapeHtml(draft.bio)}</textarea></label>
    <label>Location<input id="location" value="${escapeHtml(draft.location)}" placeholder="First Light, GridWorld"></label>
    <label>Interests<input id="interests" value="${escapeHtml(draft.interests)}" placeholder="World-building, synth music"></label>
    <div class="control-section"><div class="section-title">ONLINE STATUS</div>
      <div class="segmented status-pills">${(['online','away','offline'] as const).map(s=>`<button class="${draft.onlineStatus===s?'selected':''}" data-status="${s}" type="button"><span class="status-dot status-${s}"></span>${s.toUpperCase()}</button>`).join('')}</div>
    </div>
    <div class="control-section"><div class="section-title">CITIZEN TYPE</div>
      <div class="type-grid">${AVATAR_TYPES.map(t=>`<button class="type-card ${draft.userType===t.id?'selected':''}" data-usertype="${t.id}" title="${t.label}" type="button"><img src="/avatars/type-${t.id}.webp" alt="${t.label}" loading="lazy"><span>${t.label}</span></button>`).join('')}</div>
      ${draft.avatarUrl?'<button id="avatar-reset" class="ghost small" type="button" style="margin-top:8px">USE TYPE AVATAR INSTEAD</button>':''}
    </div>
    <div class="control-section"><div class="section-title">THEME</div>
      <div class="theme-grid">${['aurora','neon','verdant','ember','void','crystal'].map(p => `<button class="theme-swatch ${draft.theme.preset===p?'selected':''}" data-theme="${p}" type="button"><span class="swatch ${p}"></span>${p}</button>`).join('')}</div>
    </div>
    <div class="control-section"><div class="section-title">PERSONAL TOUCH</div>
      <div class="emoji-row">${['✨','🌌','🚀','🌱','🎮','🎨','🔥','💜','👽','🪐','🌊','⚡'].map(e => `<button class="${draft.favoriteEmoji===e?'selected':''}" data-emoji="${e}" type="button">${e}</button>`).join('')}</div>
    </div>
  </aside>`;
}
function moduleMarkup(section: string, data: ProfileDraft): string {
  const content: Record<string,string> = {
    feed: `<article class="module-card"><span class="module-label">FEED</span><h3>Recent from the Grid</h3>${cloudFeed.length?cloudFeed.slice(0,5).map(p=>`<div class="event-row"><b>${escapeHtml(p.kind.replaceAll('_',' '))}</b><small>${escapeHtml(p.title)}${p.body?' · '+escapeHtml(p.body):''}</small></div>`).join(''):'<p>No public activity yet.</p>'}</article>`,
    mood: `<article class="module-card"><span class="module-label">MOOD</span><h3>${escapeHtml(mood)}</h3><p>Current profile mood · ${escapeHtml(draft.status)}</p></article>`,
    about: `<article class="module-card"><span class="module-label">ABOUT</span><h3>Who I am</h3><p>${escapeHtml(data.bio)}</p><div class="chips"><span>${liveProfile?.online?'● ONLINE':'○ OFFLINE'}</span>${liveProfile?.worldId?`<span>${escapeHtml(liveProfile.worldId)}${liveProfile.regionId?` · ${escapeHtml(liveProfile.regionId)}`:''}</span>`:''}<span>Explorer</span><span>Creator</span><span>${data.favoriteEmoji} Dreamer</span></div></article>`,
    worlds: `<article class="module-card"><span class="module-label">WORLDS</span><h3>My Grid Worlds</h3>${cloudWorlds.length?cloudWorlds.slice(0,6).map(w=>`<div class="world-pill"><i></i><b>${escapeHtml(w.label)}</b><small>${escapeHtml(w.id)} · ${escapeHtml(w.tags.join(' · '))}</small></div>`).join(''):(cloudLandmarks.length?cloudLandmarks.slice(0,4).map(l=>`<div class="world-pill"><i></i><b>${escapeHtml(l.name)}</b><small>${escapeHtml(l.world_id)} · ${escapeHtml(l.region_id)}</small></div>`).join(''):'<p>No created worlds or saved destinations yet.</p>')}</article>`,
    creations: `<article class="module-card"><span class="module-label">CREATIONS</span><h3>Made in the Grid</h3>${cloudPosts.length?`<div class="event-row"><b>${cloudPosts.length} PUBLIC POSTS</b><small>Latest: ${escapeHtml(cloudPosts[0].body||'Grid creation')}</small></div>`:'<p>No public creations posted yet.</p>'}<div class="creation-grid"><div>◈</div><div>◇</div><div>✦</div></div></article>`,
    gallery: galleryMarkup(),
    communities: `<article class="module-card"><span class="module-label">COLLECTION</span><h3>Inventory</h3>${cloudInventory.length?cloudInventory.slice(0,5).map(i=>`<div class="event-row"><b>${escapeHtml(i.item_id)}</b><small>x${i.quantity}</small></div>`).join(''):'<p>Collection is empty.</p>'}</article>`,
    events: `<article class="module-card"><span class="module-label">EVENTS</span><h3>Next up</h3><div class="event-row"><b>NEON NIGHTS</b><small>Tonight · Virtual</small></div><div class="event-row"><b>CREATOR CAMP</b><small>Saturday · Hybrid</small></div></article>`,
    arena: arenaRanking?`<article class="module-card"><span class="module-label">ARENA</span><h3>Season ${escapeHtml(arenaRanking.season)}</h3><div class="event-row"><b>RATING ${arenaRanking.rating}</b><small>${arenaRanking.wins}W · ${arenaRanking.losses}L</small></div><div class="event-row"><b>MATCHES</b><small>${arenaRanking.matches}</small></div></article>`:`<article class="module-card"><span class="module-label">ARENA</span><h3>Unranked</h3><p>Enter an Arena season to establish a competitive record.</p></article>`,
    blog: blogMarkup(),
  };
  return content[section] ?? '';
}

function formatBlogDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' });
  } catch { return iso; }
}

function blogMarkup(): string {
  const posts = loadBlog().slice().sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  const isOwner = !new URLSearchParams(location.search).get('handle');
  return `<article class="module-card blog-card"><span class="module-label">BLOG</span><h3>Signal Log</h3>
    ${isOwner?`<div class="blog-composer">
      <input id="blog-title" placeholder="Post title…" maxlength="120">
      <textarea id="blog-body" placeholder="What's happening on the Grid?" rows="3"></textarea>
      <div class="blog-composer-row">
        <label class="blog-image-label">📷 <input id="blog-image" type="file" accept="image/*" hidden></label>
        <span id="blog-image-name" class="blog-image-name"></span>
        <button id="blog-publish" type="button">PUBLISH</button>
      </div>
    </div>`:''}
    <div class="blog-list">
      ${posts.length?posts.map(p=>`<div class="blog-post" data-post="${escapeHtml(p.id)}">
        ${p.imageUrl?`<img class="blog-post-image" src="${escapeHtml(p.imageUrl)}" alt="" loading="lazy">`:''}
        <div class="blog-post-head"><b>${escapeHtml(p.title)}</b><small>${formatBlogDate(p.createdAt)}</small></div>
        <p>${escapeHtml(p.body)}</p>
        ${isOwner?`<div class="blog-post-actions"><button data-blog-edit="${escapeHtml(p.id)}" type="button">EDIT</button><button data-blog-delete="${escapeHtml(p.id)}" type="button">DELETE</button></div>
        <div class="blog-edit-form" hidden>
          <input class="blog-edit-title" value="${escapeHtml(p.title)}" maxlength="120">
          <textarea class="blog-edit-body" rows="3">${escapeHtml(p.body)}</textarea>
          <div class="blog-post-actions"><button data-blog-save="${escapeHtml(p.id)}" type="button">SAVE</button><button data-blog-cancel type="button">CANCEL</button></div>
        </div>`:''}
      </div>`).join(''):'<p>No posts yet. Your signal starts here.</p>'}
    </div>
  </article>`;
}

async function publishBlogPost() {
  const titleEl = document.querySelector<HTMLInputElement>('#blog-title');
  const bodyEl = document.querySelector<HTMLTextAreaElement>('#blog-body');
  const imgEl = document.querySelector<HTMLInputElement>('#blog-image');
  const title = titleEl?.value.trim() ?? '';
  const body = bodyEl?.value.trim() ?? '';
  if (!title && !body) return;
  let imageUrl: string | null = null;
  const file = imgEl?.files?.[0];
  if (file) {
    imageUrl = await fileToDataUrl(file, 1200);
    if (profileClient) {
      try {
        const {data:{user}} = await profileClient.auth.getUser();
        if (user) {
          const safe = file.name.replace(/[^A-Za-z0-9._-]/g,'_');
          const path = user.id+'/blog/'+crypto.randomUUID()+'-'+safe;
          const up = await profileClient.storage.from('profile-media').upload(path, file, {upsert:false, contentType:file.type});
          if (!up.error) imageUrl = profileClient.storage.from('profile-media').getPublicUrl(path).data.publicUrl;
        }
      } catch { /* keep data URL fallback */ }
    }
  }
  const post: BlogPost = { id: crypto.randomUUID(), title: title || 'Untitled', body, imageUrl, createdAt: new Date().toISOString() };
  const posts = loadBlog(); posts.push(post); saveBlog(posts);
  if (profileClient && profileAuthority) {
    try {
      const {data:{user}} = await profileClient.auth.getUser();
      if (user) {
        const {data:dbPost} = await profileClient.from('grid_profile_posts').insert({user_id:user.id, body: title+'\n\n'+body, visibility:'public'}).select('*').single();
        if (dbPost && imageUrl && imageUrl.startsWith('http')) {
          await profileClient.from('grid_profile_media').insert({user_id:user.id, post_id:dbPost.id, kind:'IMAGE', url:imageUrl, caption:title, metadata:{blog:true}});
        }
        cloudPosts = await profileAuthority.posts(user.id);
      }
    } catch { /* local post retained */ }
  }
  render();
}

function fileToDataUrl(file: File, maxDim: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}

let giftDialogState: {kind:'inventory'|'track'|'album'|'art';id:string;title:string}|null = null;

function showGiftDialog(kind:'inventory'|'track'|'album'|'art', id:string, title:string) {
  giftDialogState = {kind,id,title};
  let overlay = document.querySelector('#gift-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'gift-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `<div class="gift-overlay-backdrop" data-gift-close></div>${giftDialogMarkup(kind,id,title)}`;
  overlay.querySelectorAll('[data-gift-close]').forEach(el=>el.addEventListener('click',()=>{
    overlay!.innerHTML=''; giftDialogState=null;
  }));
  overlay.querySelector('#gift-send')?.addEventListener('click',()=>{
    const to = (overlay!.querySelector<HTMLInputElement>('#gift-to')?.value??'').trim();
    const message = overlay!.querySelector<HTMLTextAreaElement>('#gift-message')?.value??'';
    const st = giftDialogState!;
    const current = getPermissions(st.kind, st.id);
    const nextPerms = {
      copy: (overlay!.querySelector<HTMLInputElement>('#gift-perm-copy')?.checked??false) && current.copy,
      modify: (overlay!.querySelector<HTMLInputElement>('#gift-perm-modify')?.checked??false) && current.modify,
      transfer: (overlay!.querySelector<HTMLInputElement>('#gift-perm-transfer')?.checked??false) && current.transfer,
    };
    const r = sendGift({fromHandle:draft.handle||'gridtraveler',toHandle:to,itemKind:st.kind,itemId:st.id,itemTitle:st.title,message,nextPerms});
    const err = overlay!.querySelector('#gift-error');
    if (!r.ok) { if(err){(err as HTMLElement).hidden=false;err.textContent=r.error;} return; }
    overlay!.innerHTML=''; giftDialogState=null;
    render();
  });
}

function bind() {
  // Tab switching
  document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(button => button.addEventListener('click', () => {
    activeTab = button.dataset.tab as typeof activeTab;
    render();
  }));
  // Editor drawer toggle
  document.querySelector<HTMLButtonElement>('#edit-toggle')?.addEventListener('click', () => {
    editOpen = !editOpen;
    render();
  });
  document.querySelector<HTMLButtonElement>('#editor-save')?.addEventListener('click', save);
  // Editor inputs update draft live
  document.querySelector<HTMLInputElement>('#displayName')?.addEventListener('input', e => { draft.displayName=(e.target as HTMLInputElement).value; });
  document.querySelector<HTMLInputElement>('#handle')?.addEventListener('input', e => { draft.handle=(e.target as HTMLInputElement).value.replace(/^@/,''); });
  document.querySelector<HTMLInputElement>('#status')?.addEventListener('input', e => { draft.status=(e.target as HTMLInputElement).value; });
  document.querySelector<HTMLSelectElement>('#mood')?.addEventListener('change', e => { mood=(e.target as HTMLSelectElement).value; });
  document.querySelector<HTMLTextAreaElement>('#bio')?.addEventListener('input', e => { draft.bio=(e.target as HTMLTextAreaElement).value; });
  document.querySelector<HTMLInputElement>('#location')?.addEventListener('input', e => { draft.location=(e.target as HTMLInputElement).value; });
  document.querySelector<HTMLInputElement>('#interests')?.addEventListener('input', e => { draft.interests=(e.target as HTMLInputElement).value; });
  document.querySelectorAll<HTMLButtonElement>('[data-status]').forEach(button => button.addEventListener('click', () => {
    draft.onlineStatus = button.dataset.status as ProfileDraft['onlineStatus'];
    localStorage.setItem(key, JSON.stringify(draft));
    render();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-usertype]').forEach(button => button.addEventListener('click', () => {
    draft.userType = button.dataset.usertype ?? 'explorer';
    localStorage.setItem(key, JSON.stringify(draft));
    render();
  }));

  // Avatar upload with + badge
  const avatarPlus = document.querySelector<HTMLButtonElement>('#avatar-plus');
  const avatarFile = document.querySelector<HTMLInputElement>('#avatar-file');
  avatarPlus?.addEventListener('click', () => avatarFile?.click());
  avatarFile?.addEventListener('change', async () => {
    const file = avatarFile.files?.[0];
    if (!file) return;
    const preview = document.querySelector<HTMLImageElement>('#avatar-preview');
    if (preview) preview.src = URL.createObjectURL(file);
    let savedUrl: string | null = null;
    if (profileClient) {
      try {
        const {data:{user}} = await profileClient.auth.getUser();
        if (user) {
          const safe = file.name.replace(/[^A-Za-z0-9._-]/g,'_');
          const path = user.id+'/avatar/'+crypto.randomUUID()+'-'+safe;
          const up = await profileClient.storage.from('profile-media').upload(path, file, {upsert:false, contentType:file.type});
          if (!up.error) savedUrl = profileClient.storage.from('profile-media').getPublicUrl(path).data.publicUrl;
        }
      } catch { /* fall through to data URL */ }
    }
    if (!savedUrl) savedUrl = await fileToDataUrl(file, 512);
    draft.avatarUrl = savedUrl;
    localStorage.setItem(key, JSON.stringify(draft));
    render();
  });
  document.querySelector<HTMLButtonElement>('#avatar-reset')?.addEventListener('click', () => {
    draft.avatarUrl = null;
    localStorage.setItem(key, JSON.stringify(draft));
    render();
  });

  // Blog handlers
  document.querySelector<HTMLButtonElement>('#blog-publish')?.addEventListener('click', publishBlogPost);
  document.querySelector<HTMLInputElement>('#blog-image')?.addEventListener('change', e => {
    const name = (e.target as HTMLInputElement).files?.[0]?.name ?? '';
    const label = document.querySelector('#blog-image-name');
    if (label) label.textContent = name;
  });
  document.querySelectorAll<HTMLButtonElement>('[data-blog-delete]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.blogDelete!;
    saveBlog(loadBlog().filter(p => p.id !== id));
    render();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-blog-edit]').forEach(button => button.addEventListener('click', () => {
    const form = button.closest('.blog-post')?.querySelector<HTMLElement>('.blog-edit-form');
    if (form) form.hidden = !form.hidden;
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-blog-cancel]').forEach(button => button.addEventListener('click', () => {
    const form = button.closest<HTMLElement>('.blog-edit-form');
    if (form) form.hidden = true;
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-blog-save]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.blogSave!;
    const card = button.closest('.blog-post');
    const title = card?.querySelector<HTMLInputElement>('.blog-edit-title')?.value.trim() ?? '';
    const body = card?.querySelector<HTMLTextAreaElement>('.blog-edit-body')?.value.trim() ?? '';
    const posts = loadBlog();
    const post = posts.find(p => p.id === id);
    if (post) { post.title = title || 'Untitled'; post.body = body; post.updatedAt = new Date().toISOString(); saveBlog(posts); }
    render();
  }));

  // Media hub (music tab)
  try { bindMediaHub(() => render(), { supabase: profileClient }); } catch(e) { console.warn('Media hub bind skipped', e); }

  // Gift dialog
  document.querySelectorAll<HTMLButtonElement>('[data-gift-item]').forEach(b => b.addEventListener('click', () => {
    const kind = b.dataset.giftItem as 'inventory'|'track'|'album'|'art';
    showGiftDialog(kind, b.dataset.giftId!, b.dataset.giftTitle!);
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-gift-accept]').forEach(b => b.addEventListener('click', () => {
    const r = acceptGift(b.dataset.giftAccept!);
    if (r.ok && !r.senderKeeps) {
      // No-copy: sender loses it — handled on sender side; recipient keeps the single instance
    }
    render();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-gift-decline]').forEach(b => b.addEventListener('click', () => {
    declineGift(b.dataset.giftDecline!); render();
  }));

  // Gallery handlers
  document.querySelectorAll<HTMLButtonElement>('[data-gallery-sort]').forEach(button => button.addEventListener('click', () => {
    gallerySort = button.dataset.gallerySort as 'newest' | 'liked';
    render();
  }));
  document.querySelector<HTMLButtonElement>('#gallery-publish')?.addEventListener('click', publishGalleryPiece);
  document.querySelector<HTMLInputElement>('#gallery-file')?.addEventListener('change', e => {
    const name = (e.target as HTMLInputElement).files?.[0]?.name ?? '';
    const label = document.querySelector('#gallery-file-name');
    if (label) label.textContent = name;
  });
  document.querySelectorAll<HTMLElement>('[data-art]').forEach(thumb => thumb.addEventListener('click', () => {
    galleryLightboxId = thumb.dataset.art ?? null;
    render();
  }));
  document.querySelectorAll<HTMLElement>('[data-lightbox-close]').forEach(el => el.addEventListener('click', () => {
    galleryLightboxId = null;
    render();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-art-like]').forEach(button => button.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = button.dataset.artLike!;
    let pieces = loadGallery();
    let piece = pieces.find(p => p.id === id);
    if (!piece) {
      // Cloud piece not yet tracked locally — adopt it
      const cloud = cloudMedia.find(m => (m.id || m.url) === id);
      if (cloud) {
        piece = { id: cloud.id || crypto.randomUUID(), url: cloud.url, kind: cloud.kind, title: cloud.caption || 'Untitled', description: '', tags: [], likes: 0, liked: false, createdAt: cloud.created_at || new Date().toISOString() };
        pieces.push(piece);
      }
    }
    if (piece) {
      piece.liked = !piece.liked;
      piece.likes = Math.max(0, piece.likes + (piece.liked ? 1 : -1));
      saveGallery(pieces);
    }
    galleryLightboxId = id;
    render();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-art-delete]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.artDelete!;
    saveGallery(loadGallery().filter(p => p.id !== id));
    galleryLightboxId = null;
    render();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-art-edit]').forEach(button => button.addEventListener('click', () => {
    const form = button.closest('.art-lightbox-info')?.querySelector<HTMLElement>('.art-edit-form');
    if (form) form.hidden = !form.hidden;
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-art-cancel]').forEach(button => button.addEventListener('click', () => {
    const form = button.closest<HTMLElement>('.art-edit-form');
    if (form) form.hidden = true;
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-art-save]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.artSave!;
    const info = button.closest('.art-lightbox-info');
    const title = info?.querySelector<HTMLInputElement>('.art-edit-title')?.value.trim() ?? '';
    const desc = info?.querySelector<HTMLTextAreaElement>('.art-edit-desc')?.value.trim() ?? '';
    const tags = info?.querySelector<HTMLInputElement>('.art-edit-tags')?.value ?? '';
    const pieces = loadGallery();
    const piece = pieces.find(p => p.id === id);
    if (piece) {
      piece.title = title || 'Untitled';
      piece.description = desc;
      piece.tags = tags.split(',').map(t=>t.trim()).filter(Boolean);
      saveGallery(pieces);
    }
    render();
  }));
  document.querySelector('#save')?.addEventListener('click', save);
  document.querySelector('#upload-media')?.addEventListener('click', async()=>{
    const input=document.querySelector<HTMLInputElement>('#profile-media');const files=[...(input?.files??[])];
    if(!files.length||!profileClient){return;}
    const {data:{user}}=await profileClient.auth.getUser();if(!user)return;
    try{
      const {data:post,error:postError}=await profileClient.from('grid_profile_posts').insert({user_id:user.id,body:'Profile media',visibility:'public'}).select('*').single();if(postError)throw postError;
      for(const file of files){const safe=file.name.replace(/[^A-Za-z0-9._-]/g,'_');const path=user.id+'/'+crypto.randomUUID()+'-'+safe;const up=await profileClient.storage.from('profile-media').upload(path,file,{upsert:false,contentType:file.type});if(up.error)throw up.error;const pub=profileClient.storage.from('profile-media').getPublicUrl(path).data.publicUrl;await profileClient.from('grid_profile_media').insert({user_id:user.id,post_id:post.id,kind:file.type.startsWith('video/')?'VIDEO':'IMAGE',url:pub,caption:file.name,metadata:{mime:file.type,size:file.size}});}await profileAuthority!.recordActivity({kind:'MEDIA_PUBLISH',title:'Published profile media',body:'Published '+files.length+' media item'+(files.length===1?'':'s')+' to the profile gallery.',metadata:{count:files.length,postId:post.id,types:files.map(file=>file.type)}});
      cloudMedia=await profileAuthority!.media(user.id);localStorage.setItem(key,JSON.stringify(draft));render();
    }catch(error){console.warn('Profile media upload failed.',error);}
  });
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
  document.querySelectorAll<HTMLElement>('[data-module-index]').forEach(item=>item.addEventListener('dragstart',e=>{(e as DragEvent).dataTransfer?.setData('text/plain',item.dataset.moduleIndex??'');}));
  document.querySelectorAll<HTMLElement>('[data-module-index]').forEach(item=>item.addEventListener('dragover',e=>e.preventDefault()));
  document.querySelectorAll<HTMLElement>('[data-module-index]').forEach(item=>item.addEventListener('drop',e=>{e.preventDefault();const from=Number((e as DragEvent).dataTransfer?.getData('text/plain'));const to=Number(item.dataset.moduleIndex);if(Number.isInteger(from)&&Number.isInteger(to)&&from!==to){const moved=draft.layout.sections.splice(from,1)[0];draft.layout.sections.splice(to,0,moved);render();}}));
}

async function hydrateCloudProfile(){if(!profileAuthority||!profileClient)return;try{const {data:{user}}=await profileClient.auth.getUser();if(!user)return;const profile=await profileAuthority.get(user.id);if(profile){const pt=(profile.profile_theme??{}) as Record<string,unknown>;draft={...draft,displayName:profile.display_name,handle:profile.handle,bio:profile.bio,status:profile.status,avatarUrl:profile.avatar_url??draft.avatarUrl,location:String(pt.location??draft.location),interests:String(pt.interests??draft.interests),userType:String(pt.userType??draft.userType),onlineStatus:((pt.onlineStatus as string)=='away'?'away':(pt.onlineStatus as string)=='offline'?'offline':'online'),theme:{...draft.theme,...profile.profile_theme},layout:{...draft.layout,...profile.profile_layout} as ProfileLayout};}cloudMedia=await profileAuthority.media(user.id);cloudPosts=await profileAuthority.posts(user.id);cloudLandmarks=await profileAuthority.landmarks(user.id);cloudInventory=await profileAuthority.inventory(user.id);liveProfile=profileSocial?await profileSocial.publicProfile(user.id):null;render();}catch(error){console.warn('Cloud profile load unavailable.',error);}}

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

void (async()=>{
  // Canonical clean URLs: /user/<username> (via render.yaml rewrite to /user.html)
  const pathMatch = location.pathname.match(/^\/user\/([A-Za-z0-9_.-]+)\/?$/);
  const handle=(pathMatch?.[1] ?? new URLSearchParams(location.search).get('handle') ?? '').replace(/^@/,'').trim();
  // Aurora's showcase profile lives at /aurora.html — canonical /user/aurora redirects there
  if (handle.toLowerCase() === 'aurora' && pathMatch) { location.replace('/aurora.html'); return; }
  if(profileAuthority&&handle){
    try{
      const cloud=await profileAuthority.byHandle(handle);
      if(cloud){
        const ct=(cloud.profile_theme??{}) as Record<string,unknown>;draft={...draft,displayName:cloud.display_name,handle:cloud.handle,bio:cloud.bio,status:cloud.status,avatarUrl:cloud.avatar_url??draft.avatarUrl,location:String(ct.location??''),interests:String(ct.interests??''),userType:String(ct.userType??'explorer'),onlineStatus:((ct.onlineStatus as string)=='away'?'away':(ct.onlineStatus as string)=='offline'?'offline':'online'),theme:{...draft.theme,...cloud.profile_theme},layout:{...draft.layout,...cloud.profile_layout} as ProfileLayout};
        mood=cloud.mood||'curious';cloudMedia=await profileAuthority.media(cloud.user_id);cloudFeed=await profileAuthority.activity(cloud.user_id);
        cloudPosts=await profileAuthority.posts(cloud.user_id);
        cloudLandmarks=await profileAuthority.landmarks(cloud.user_id);
        cloudWorlds=worldAuthority?await worldAuthority.listOwned(cloud.user_id):[];
        cloudInventory=await profileAuthority.inventory(cloud.user_id);
        liveProfile=profileSocial?await profileSocial.publicProfile(cloud.user_id):null;
        arenaRanking=await profileAuthority.ranking(cloud.user_id);
      }
    }catch(error){console.warn('Public Grid profile load unavailable.',error);}
    render();
    return;
  }
  if(profileAuthority){await hydrateCloudProfile();return;}
  render();
})();
