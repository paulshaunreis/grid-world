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
  const editor=document.createElement('div');
  editor.className='grid-landmark-editor';
  editor.hidden=true;
  root.insertBefore(editor,list);
  const closeEditor=()=>{editor.hidden=true;editor.replaceChildren();};
  const openEditor=(title:string, initial:string, onSave:(label:string)=>Promise<void>)=>{
    editor.hidden=false;
    editor.replaceChildren();
    const heading=document.createElement('strong'); heading.textContent=title;
    const input=document.createElement('input'); input.type='text'; input.value=initial; input.maxLength=80; input.setAttribute('aria-label','Destination name');
    const actions=document.createElement('div'); actions.className='grid-landmark-editor-actions';
    const cancel=document.createElement('button'); cancel.type='button'; cancel.textContent='CANCEL';
    const save=document.createElement('button'); save.type='button'; save.textContent='SAVE';
    const status=document.createElement('small'); status.className='grid-landmark-editor-status';
    cancel.addEventListener('click',closeEditor);
    save.addEventListener('click',async()=>{
      const label=input.value.trim();
      if(!label){status.textContent='Enter a name first.';input.focus();return;}
      save.disabled=true; cancel.disabled=true; status.textContent='Saving…';
      try{await onSave(label);closeEditor();}catch(error){console.warn('Landmark editor action failed.',error);status.textContent='Could not save that change.';save.disabled=false;cancel.disabled=false;}
    });
    input.addEventListener('keydown',event=>{if(event.key==='Enter')void save.click();if(event.key==='Escape')closeEditor();});
    actions.append(cancel,save);
    editor.append(heading,input,actions,status);
    input.focus(); input.select();
  };
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
      row.querySelector('[data-rename]')?.addEventListener('click',()=>{
        openEditor('RENAME DESTINATION',item.label,async label=>{await authority.rename(item.id,label);await refresh();});
      });
      row.querySelector('[data-delete]')?.addEventListener('click',()=>{
        openEditor('DELETE DESTINATION',item.label,async label=>{
          if(label!==item.label){throw new Error('Type the destination name exactly to confirm deletion.');}
          await authority.remove(item.id);await refresh();
        });
      });
      list.appendChild(row);
    }
  };

  const refresh=async()=>{
    try{render(await authority.list());}
    catch(error){console.warn('Landmark inventory sync unavailable.',error);list.innerHTML='<div class="grid-landmark-empty">Inventory sync unavailable.</div>';}
  };

  root.querySelector('[data-create]')?.addEventListener('click',()=>{
    openEditor('SAVE CURRENT LOCATION','My Waypoint',async label=>{
      window.dispatchEvent(new CustomEvent('grid:landmark-create-current',{detail:{label}}));
    });
  });
  root.querySelector('[data-close]')?.addEventListener('click',()=>root?.remove());
  void refresh();

  window.addEventListener('grid:landmark-created',()=>void refresh());
  window.addEventListener('grid:landmark-removed',()=>void refresh());
  return root;
}
