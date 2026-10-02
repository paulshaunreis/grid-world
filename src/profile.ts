import './profile.css';
import { createClient } from '@supabase/supabase-js';
import { GridProfileAuthority, type GridProfileMedia, type GridArenaRanking } from './social/GridProfileAuthority';
import { GridSocialService } from './social/GridSocialService';
const profileSupabaseUrl=import.meta.env.VITE_SUPABASE_URL as string|undefined;
const profileSupabaseKey=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined;
const profileClient=profileSupabaseUrl&&profileSupabaseKey?createClient(profileSupabaseUrl,profileSupabaseKey):null;
const profileAuthority=profileClient?new GridProfileAuthority(profileClient):null;
const profileSocial=profileClient?new GridSocialService(profileClient):null;
let cloudMedia:GridProfileMedia[]=[];let arenaRanking:GridArenaRanking|null=null;let cloudLandmarks:import('./social/GridProfileAuthority').GridProfileLandmark[]=[];let cloudInventory:import('./social/GridProfileAuthority').GridPlayerInventoryItem[]=[];let cloudPosts:import('./social/GridProfileAuthority').GridProfilePost[]=[];
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
    sections: ['about', 'worlds', 'creations', 'gallery', 'communities', 'events', 'arena'],
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
  arena: 'Arena Ranking',
};

async function save() {
  localStorage.setItem(key, JSON.stringify(draft));
  if(profileAuthority&&profileClient){try{const {data:{user}}=await profileClient.auth.getUser();if(user){await profileAuthority.save({handle:draft.handle,displayName:draft.displayName,bio:draft.bio,status:draft.status,theme:draft.theme,layout:draft.layout});cloudMedia=await profileAuthority.media(user.id);cloudPosts=await profileAuthority.posts(user.id);cloudLandmarks=await profileAuthority.landmarks(user.id);cloudInventory=await profileAuthority.inventory(user.id);arenaRanking=await profileAuthority.ranking(user.id);render();return;}}catch(error){console.warn('Cloud profile save unavailable; local profile retained.',error);}}
  const status=document.querySelector('#save-status');if(status)status.textContent='Saved locally · ready for Grid Identity';
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

        <div class="control-section"><div class="section-title">MEDIA</div><label>Post image/video<input id="profile-media" type="file" accept="image/*,video/*" multiple></label><button id="upload-media" class="studio-upload" type="button">UPLOAD TO PROFILE</button></div>

        <div class="control-section">
          <div class="section-title">PROFILE MODULES</div>
          <div class="module-list">
            ${draft.layout.sections.map((section,index) => `<button class="module" draggable="true" data-module-index="${index}" data-remove="${section}"><span>⠿</span>${sectionLabels[section]}<b>×</b></button>`).join('')}
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
    about: `<article class="module-card"><span class="module-label">ABOUT</span><h3>Who I am</h3><p>${escapeHtml(data.bio)}</p><div class="chips"><span>${liveProfile?.online?'● ONLINE':'○ OFFLINE'}</span>${liveProfile?.worldId?`<span>${escapeHtml(liveProfile.worldId)}${liveProfile.regionId?` · ${escapeHtml(liveProfile.regionId)}`:''}</span>`:''}<span>Explorer</span><span>Creator</span><span>${data.favoriteEmoji} Dreamer</span></div></article>`,
    worlds: `<article class="module-card"><span class="module-label">WORLDS</span><h3>Grid destinations</h3>${cloudLandmarks.length?cloudLandmarks.slice(0,4).map(l=>`<div class="world-pill"><i></i><b>${escapeHtml(l.name)}</b><small>${escapeHtml(l.world_id)} · ${escapeHtml(l.region_id)}</small></div>`).join(''):'<p>No saved worlds or landmarks yet.</p>'}</article>`,
    creations: `<article class="module-card"><span class="module-label">CREATIONS</span><h3>Made in the Grid</h3>${cloudPosts.length?`<div class="event-row"><b>${cloudPosts.length} PUBLIC POSTS</b><small>Latest: ${escapeHtml(cloudPosts[0].body||'Grid creation')}</small></div>`:'<p>No public creations posted yet.</p>'}<div class="creation-grid"><div>◈</div><div>◇</div><div>✦</div></div></article>`,
    gallery: `<article class="module-card"><span class="module-label">GALLERY</span><h3>Moments</h3><div class="gallery-grid">${cloudMedia.length?cloudMedia.slice(0,8).map(m=>m.kind==='VIDEO'?`<video src="${escapeHtml(m.url)}" controls muted></video>`:`<img src="${escapeHtml(m.url)}" alt="${escapeHtml(m.caption||'Grid World post')}">`).join(''):'<div>🌌</div><div>🌲</div><div>🌃</div><div>🪐</div>'}</div></article>`,
    communities: `<article class="module-card"><span class="module-label">COLLECTION</span><h3>Inventory</h3>${cloudInventory.length?cloudInventory.slice(0,5).map(i=>`<div class="event-row"><b>${escapeHtml(i.item_id)}</b><small>x${i.quantity}</small></div>`).join(''):'<p>Collection is empty.</p>'}</article>`,
    events: `<article class="module-card"><span class="module-label">EVENTS</span><h3>Next up</h3><div class="event-row"><b>NEON NIGHTS</b><small>Tonight · Virtual</small></div><div class="event-row"><b>CREATOR CAMP</b><small>Saturday · Hybrid</small></div></article>`,
    arena: arenaRanking?`<article class="module-card"><span class="module-label">ARENA</span><h3>Season ${escapeHtml(arenaRanking.season)}</h3><div class="event-row"><b>RATING ${arenaRanking.rating}</b><small>${arenaRanking.wins}W · ${arenaRanking.losses}L</small></div><div class="event-row"><b>MATCHES</b><small>${arenaRanking.matches}</small></div></article>`:`<article class="module-card"><span class="module-label">ARENA</span><h3>Unranked</h3><p>Enter an Arena season to establish a competitive record.</p></article>`,
  };
  return content[section] ?? '';
}

function bind() {
  document.querySelector<HTMLInputElement>('#displayName')?.addEventListener('input', e => { draft.displayName=(e.target as HTMLInputElement).value; renderPreviewOnly(); });
  document.querySelector<HTMLInputElement>('#handle')?.addEventListener('input', e => { draft.handle=(e.target as HTMLInputElement).value.replace(/^@/,''); renderPreviewOnly(); });
  document.querySelector<HTMLInputElement>('#status')?.addEventListener('input', e => { draft.status=(e.target as HTMLInputElement).value; renderPreviewOnly(); });
  document.querySelector<HTMLTextAreaElement>('#bio')?.addEventListener('input', e => { draft.bio=(e.target as HTMLTextAreaElement).value; renderPreviewOnly(); });
  document.querySelector('#save')?.addEventListener('click', save);
  document.querySelector('#upload-media')?.addEventListener('click', async()=>{
    const input=document.querySelector<HTMLInputElement>('#profile-media');const files=[...(input?.files??[])];
    if(!files.length||!profileClient){return;}
    const {data:{user}}=await profileClient.auth.getUser();if(!user)return;
    try{
      const {data:post,error:postError}=await profileClient.from('grid_profile_posts').insert({user_id:user.id,body:'Profile media',visibility:'public'}).select('*').single();if(postError)throw postError;
      for(const file of files){const safe=file.name.replace(/[^A-Za-z0-9._-]/g,'_');const path=user.id+'/'+crypto.randomUUID()+'-'+safe;const up=await profileClient.storage.from('profile-media').upload(path,file,{upsert:false,contentType:file.type});if(up.error)throw up.error;const pub=profileClient.storage.from('profile-media').getPublicUrl(path).data.publicUrl;await profileClient.from('grid_profile_media').insert({user_id:user.id,post_id:post.id,kind:file.type.startsWith('video/')?'VIDEO':'IMAGE',url:pub,caption:file.name,metadata:{mime:file.type,size:file.size}});}
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

async function hydrateCloudProfile(){if(!profileAuthority||!profileClient)return;try{const {data:{user}}=await profileClient.auth.getUser();if(!user)return;const profile=await profileAuthority.get(user.id);if(profile){draft={...draft,displayName:profile.display_name,handle:profile.handle,bio:profile.bio,status:profile.status,theme:{...draft.theme,...profile.profile_theme},layout:{...draft.layout,...profile.profile_layout} as ProfileLayout};}cloudMedia=await profileAuthority.media(user.id);cloudPosts=await profileAuthority.posts(user.id);cloudLandmarks=await profileAuthority.landmarks(user.id);cloudInventory=await profileAuthority.inventory(user.id);liveProfile=profileSocial?await profileSocial.publicProfile(user.id):null;render();}catch(error){console.warn('Cloud profile load unavailable.',error);}}

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
  const handle=new URLSearchParams(location.search).get('handle')?.replace(/^@/,'').trim();
  if(profileAuthority&&handle){
    try{
      const cloud=await profileAuthority.byHandle(handle);
      if(cloud){
        draft={...draft,displayName:cloud.display_name,handle:cloud.handle,bio:cloud.bio,status:cloud.status,theme:{...draft.theme,...cloud.profile_theme},layout:{...draft.layout,...cloud.profile_layout} as ProfileLayout};
        cloudMedia=await profileAuthority.media(cloud.user_id);
        cloudPosts=await profileAuthority.posts(cloud.user_id);
        cloudLandmarks=await profileAuthority.landmarks(cloud.user_id);
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
