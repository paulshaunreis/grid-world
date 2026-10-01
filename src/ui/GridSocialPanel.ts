import type { GridSocialAuthority, GridSocialOrganization, GridFriendship } from '../social/GridSocialAuthority';

export function mountGridSocialPanel(authority:GridSocialAuthority):{open():void;close():void}{
  const style=document.createElement('style');
  style.textContent=`
    .gw-social{position:fixed;right:22px;top:78px;width:min(520px,calc(100vw - 28px));height:min(720px,calc(100vh - 100px));z-index:70;background:rgba(4,9,16,.97);border:1px solid rgba(72,231,255,.24);box-shadow:0 25px 100px rgba(0,0,0,.55);backdrop-filter:blur(20px);display:none;color:#eaf7ff;font:12px/1.4 'IBM Plex Mono',monospace}.gw-social.open{display:grid;grid-template-rows:auto auto 1fr}.gw-social-head{display:flex;justify-content:space-between;padding:16px;border-bottom:1px solid #ffffff12}.gw-social-kicker{font-size:8px;letter-spacing:.18em;color:#48e7ff}.gw-social-title{font:700 24px 'Space Grotesk',sans-serif;margin-top:4px}.gw-social-close{background:none;border:1px solid #ffffff18;color:#9eb0bd;padding:7px 10px}.gw-social-tabs{display:flex;overflow:auto;border-bottom:1px solid #ffffff12}.gw-social-tab{flex:0 0 auto;padding:12px 13px;border:0;border-right:1px solid #ffffff08;background:#ffffff03;color:#718596;font:700 9px 'IBM Plex Mono',monospace;letter-spacing:.08em}.gw-social-tab.active{color:#48e7ff;background:#48e7ff08}.gw-social-body{overflow:auto;padding:14px}.gw-social-toolbar{display:flex;gap:7px;margin-bottom:12px}.gw-social-toolbar input{flex:1;min-width:0;background:#070d15;border:1px solid #ffffff12;color:#fff;padding:9px}.gw-social-action{border:1px solid #48e7ff35;background:#48e7ff08;color:#48e7ff;padding:9px 11px;font:700 9px 'IBM Plex Mono',monospace}.gw-social-list{display:grid;gap:8px}.gw-social-card{padding:13px;border:1px solid #ffffff10;background:#ffffff03}.gw-social-card-head{display:flex;justify-content:space-between;gap:10px}.gw-social-card strong{font-family:'Space Grotesk',sans-serif;font-size:15px}.gw-social-card small{display:block;color:#718596;margin-top:3px}.gw-social-badge{color:#48e7ff;font-size:8px;letter-spacing:.12em}.gw-social-empty{padding:30px 10px;text-align:center;color:#667988}.gw-social-row-actions{display:flex;gap:6px;margin-top:10px}.gw-social-row-actions button{border:1px solid #ffffff12;background:#ffffff04;color:#b9c7d1;padding:6px 8px;font-size:9px}.gw-social-online{color:#78e0a1}.gw-social-pending{color:#ffc96b}`;
  document.head.appendChild(style);

  const panel=document.createElement('section');
  panel.className='gw-social';
  panel.setAttribute('aria-label','Grid World Social Manager');
  panel.innerHTML=`
    <header class="gw-social-head"><div><div class="gw-social-kicker">GRID WORLD // SOCIAL MANAGER</div><div class="gw-social-title">Connections</div></div><button class="gw-social-close" type="button">CLOSE</button></header>
    <nav class="gw-social-tabs" aria-label="Social categories">
      <button class="gw-social-tab active" data-social-tab="friends">FRIENDS</button><button class="gw-social-tab" data-social-tab="groups">GROUPS</button><button class="gw-social-tab" data-social-tab="guilds">GUILDS</button><button class="gw-social-tab" data-social-tab="teams">TEAMS</button><button class="gw-social-tab" data-social-tab="stores">STORES</button><button class="gw-social-tab" data-social-tab="npcs">NPCS</button>
    </nav>
    <main class="gw-social-body"><div class="gw-social-toolbar"><input id="gw-social-search" placeholder="Search connections..."><button class="gw-social-action" id="gw-social-refresh">SYNC</button></div><div class="gw-social-list" id="gw-social-list"></div></main>
  `;
  document.body.appendChild(panel);

  let active='friends';
  let friendships:GridFriendship[]=[];
  let organizations:GridSocialOrganization[]=[];

  const list=panel.querySelector<HTMLDivElement>('#gw-social-list')!;
  const search=panel.querySelector<HTMLInputElement>('#gw-social-search')!;

  function render(){
    const q=search.value.trim().toLowerCase();
    if(active==='friends'){
      const accepted=friendships.filter(x=>x.status==='accepted');
      const pending=friendships.filter(x=>x.status==='pending');
      const rows=[...accepted,...pending].filter(x=>(x.userId+' '+x.friendUserId+' '+x.status).toLowerCase().includes(q));
      list.innerHTML=rows.length?rows.map(x=>`<article class="gw-social-card"><div class="gw-social-card-head"><div><strong>USER ${x.userId===x.requestedBy?x.friendUserId:x.userId}</strong><small>${x.status==='accepted'?'Friend connection':'Friend request'}</small></div><span class="gw-social-badge ${x.status==='accepted'?'gw-social-online':'gw-social-pending'}">${x.status.toUpperCase()}</span></div><div class="gw-social-row-actions">${x.status==='pending'?'<button data-friend-action="accept" data-user="'+(x.userId===x.requestedBy?x.friendUserId:x.userId)+'">ACCEPT</button><button data-friend-action="block" data-user="'+(x.userId===x.requestedBy?x.friendUserId:x.userId)+'">BLOCK</button>':'<button data-friend-action="remove" data-user="'+(x.userId===x.requestedBy?x.friendUserId:x.userId)+'">REMOVE</button><button data-friend-action="message" data-user="'+(x.userId===x.requestedBy?x.friendUserId:x.userId)+'">MESSAGE</button>'}</div></article>`).join(''):'<div class="gw-social-empty">No connections match this view yet.</div>';
      return;
    }
    const kind=active.slice(0,-1).toUpperCase() as any;
    const rows=organizations.filter(o=>o.kind===kind && (o.name+' '+o.id).toLowerCase().includes(q));
    list.innerHTML=rows.length?rows.map(o=>`<article class="gw-social-card"><div class="gw-social-card-head"><div><strong>${o.name}</strong><small>${o.worldId??'Grid-wide'}</small></div><span class="gw-social-badge">${o.kind}</span></div><div class="gw-social-row-actions"><button data-org-action="open" data-org="${o.id}">OPEN</button><button data-org-action="members" data-org="${o.id}">MEMBERS</button></div></article>`).join(''):'<div class="gw-social-empty">No '+active+' are visible to this account yet.</div>';
  }

  async function sync(){
    try{friendships=await authority.listFriendRelationships();organizations=await authority.listOrganizations();render();}
    catch(error){list.innerHTML='<div class="gw-social-empty">Social sync is unavailable. Local world play can continue.</div>';console.error(error);}
  }

  panel.querySelectorAll<HTMLButtonElement>('[data-social-tab]').forEach(button=>button.addEventListener('click',()=>{active=button.dataset.socialTab??'friends';panel.querySelectorAll('[data-social-tab]').forEach(x=>x.classList.toggle('active',x===button));render();}));
  search.addEventListener('input',render);
  panel.querySelector('#gw-social-refresh')?.addEventListener('click',()=>sync());
  async function showOrganization(orgId:string,mode:'open'|'members'){
    const org=organizations.find(item=>item.id===orgId)??await authority.getOrganization(orgId);
    if(!org){list.innerHTML='<div class="gw-social-empty">Organization not found.</div>';return;}
    if(mode==='open'){
      const description=typeof org.metadata.description==='string'?org.metadata.description:'No description published yet.';
      const tags=Array.isArray(org.metadata.tags)?org.metadata.tags.join(' · '):'';
      list.innerHTML=`<article class="gw-social-card">
        <div class="gw-social-card-head"><div><strong>${org.name}</strong><small>${org.worldId??'Grid-wide'} · ${org.accessMode.toUpperCase()}</small></div><span class="gw-social-badge">${org.kind}</span></div>
        <p style="color:#9eb0bd;margin:12px 0">${description}</p>
        ${tags?`<small>TAGGED: ${tags}</small>`:''}
        <div class="gw-social-row-actions"><button data-org-action="members" data-org="${org.id}">VIEW MEMBERS</button><button data-org-action="back">BACK</button></div>
      </article>`;
      return;
    }
    try{
      const members=await authority.listMembers(org.id);
      list.innerHTML=`<article class="gw-social-card"><div class="gw-social-card-head"><div><strong>${org.name}</strong><small>Organization membership</small></div><span class="gw-social-badge">${members.length} ACTOR${members.length===1?'':'S'}</span></div>
        <div class="gw-social-list" style="margin-top:12px">${members.length?members.map(member=>`<div class="gw-social-card"><strong>${member.actorKind==='NPC'?'NPC':'USER'} ${member.actorId}</strong><small>${member.role} · ${member.joinedAt?new Date(member.joinedAt).toLocaleString():'joined'}</small></div>`).join(''):'<div class="gw-social-empty">No members are visible to this account.</div>'}</div>
        <div class="gw-social-row-actions"><button data-org-action="back">BACK</button></div>
      </article>`;
    }catch(error){list.innerHTML='<div class="gw-social-empty">Membership data is unavailable for this organization.</div>';console.error(error);}
  }

  panel.addEventListener('click',async event=>{
    const target=event.target as HTMLElement;
    const friendButton=target.closest<HTMLButtonElement>('button[data-friend-action]');
    if(friendButton){
      const user=friendButton.dataset.user;if(!user)return;
      try{
        if(friendButton.dataset.friendAction==='accept')await authority.respondToFriend(user,'accepted');
        else if(friendButton.dataset.friendAction==='block')await authority.respondToFriend(user,'blocked');
        else if(friendButton.dataset.friendAction==='remove')await authority.removeFriend(user);
        else if(friendButton.dataset.friendAction==='message')window.dispatchEvent(new CustomEvent('gridworld:message-user',{detail:{userId:user}}));
        else return;
        await sync();
      }catch(error){console.error(error);}
      return;
    }
    const orgButton=target.closest<HTMLButtonElement>('button[data-org-action]');
    if(orgButton){
      const action=orgButton.dataset.orgAction;
      if(action==='back'){render();return;}
      const orgId=orgButton.dataset.org;if(!orgId)return;
      if(action==='open'||action==='members')await showOrganization(orgId,action);
    }
  });

  const close=()=>panel.classList.remove('open');
  const open=()=>{panel.classList.add('open');void sync();};
  panel.querySelector('.gw-social-close')?.addEventListener('click',close);
  return {open,close};
}
