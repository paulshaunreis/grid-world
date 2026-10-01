import type { GridLandmarkAuthority, GridLandmarkItem } from '../social/GridLandmarkAuthority';
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
export function mountGridLandmarkInventory(authority:GridLandmarkAuthority){
 let root=document.getElementById('grid-landmark-inventory');if(root)return root;
 root=document.createElement('section');root.id='grid-landmark-inventory';root.className='grid-landmark-inventory';root.innerHTML='<header><strong>LANDMARKS / WAYPOINTS</strong><button data-close>×</button></header><div class="grid-landmark-list"></div>';document.body.appendChild(root);
 const list=root.querySelector('.grid-landmark-list') as HTMLElement;
 const render=(items:GridLandmarkItem[])=>{list.innerHTML='';if(!items.length){list.innerHTML='<div class="grid-landmark-empty">No saved destinations yet.</div>';return;}for(const item of items){const row=document.createElement('button');row.className='grid-landmark-row';row.innerHTML='<span class="grid-landmark-icon">'+(item.itemType==='LANDMARK'?'◆':'⌖')+'</span><span><b>'+esc(item.label)+'</b><small>'+item.itemType+'</small></span>';row.onclick=()=>window.dispatchEvent(new CustomEvent('grid:landmark-select',{detail:item}));list.appendChild(row);}};
 root.querySelector('[data-close]')?.addEventListener('click',()=>root?.remove());authority.list().then(render).catch(()=>{list.innerHTML='<div class="grid-landmark-empty">Inventory sync unavailable.</div>';});return root;
}