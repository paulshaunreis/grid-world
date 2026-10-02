import type { GridLandmarkAuthority, GridLandmarkItem } from '../social/GridLandmarkAuthority';

const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));

export function mountGridLandmarkInventory(authority:GridLandmarkAuthority){
  let root=document.getElementById('grid-landmark-inventory');
  if(root)return root;

  root=document.createElement('section');
  root.id='grid-landmark-inventory';
  root.className='grid-landmark-inventory';
  root.innerHTML='<header><div><strong>LANDMARKS / WAYPOINTS</strong><small>Saved destinations</small></div><div class="grid-landmark-head-actions"><button data-create title="Save current location">＋</button><button data-close title="Close">×</button></div></header><div class="grid-landmark-list"></div>';
  document.body.appendChild(root);

  const list=root.querySelector('.grid-landmark-list') as HTMLElement;
  const render=(items:GridLandmarkItem[])=>{
    list.innerHTML='';
    if(!items.length){
      list.innerHTML='<div class="grid-landmark-empty"><b>No saved destinations yet.</b><span>Use ＋ to save your current location.</span></div>';
      return;
    }
    for(const item of items){
      const row=document.createElement('article');
      row.className='grid-landmark-row'+(item.pinned?' pinned':'');
      row.innerHTML=
        '<button class="grid-landmark-main" data-use title="Select destination">'+
        '<span class="grid-landmark-icon">'+(item.itemType==='LANDMARK'?'◆':'⌖')+'</span>'+
        '<span><b>'+esc(item.label)+'</b><small>'+esc(item.itemType)+(item.pinned?' · PINNED':'')+'</small></span></button>'+
        '<div class="grid-landmark-actions">'+
        '<button data-pin title="'+(item.pinned?'Unpin':'Pin')+'">'+(item.pinned?'★':'☆')+'</button>'+
        '<button data-rename title="Rename">✎</button>'+
        '<button data-delete title="Delete">×</button></div>';

      row.querySelector('[data-use]')?.addEventListener('click',()=>{
        window.dispatchEvent(new CustomEvent('grid:landmark-select',{detail:item}));
      });
      row.querySelector('[data-pin]')?.addEventListener('click',async()=>{
        try{await authority.setPinned(item.id,!item.pinned);await refresh();}
        catch(error){console.warn('Landmark pin update failed.',error);}
      });
      row.querySelector('[data-rename]')?.addEventListener('click',async()=>{
        const label=window.prompt('Rename destination',item.label);
        if(label===null)return;
        try{await authority.rename(item.id,label);await refresh();}
        catch(error){console.warn('Landmark rename failed.',error);}
      });
      row.querySelector('[data-delete]')?.addEventListener('click',async()=>{
        if(!window.confirm('Delete '+item.label+' from your saved destinations?'))return;
        try{await authority.remove(item.id);await refresh();}
        catch(error){console.warn('Landmark delete failed.',error);}
      });
      list.appendChild(row);
    }
  };

  const refresh=async()=>{
    try{render(await authority.list());}
    catch(error){console.warn('Landmark inventory sync unavailable.',error);list.innerHTML='<div class="grid-landmark-empty">Inventory sync unavailable.</div>';}
  };

  root.querySelector('[data-create]')?.addEventListener('click',()=>{
    window.dispatchEvent(new CustomEvent('grid:landmark-create-current'));
  });
  root.querySelector('[data-close]')?.addEventListener('click',()=>root?.remove());
  void refresh();

  window.addEventListener('grid:landmark-created',()=>void refresh());
  window.addEventListener('grid:landmark-removed',()=>void refresh());
  return root;
}
