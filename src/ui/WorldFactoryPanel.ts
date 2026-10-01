import type { GridWorldFactoryResult } from '../world/WorldFactory';

export interface WorldFactoryPanelOptions {
  onCreate: (name:string,description:string)=>GridWorldFactoryResult;
}

export function mountWorldFactoryPanel(options:WorldFactoryPanelOptions) {
  const button=document.createElement('button');
  button.className='toolbar-button';
  button.type='button';
  button.textContent='WORLD FACTORY';
  document.body.appendChild(button);

  const panel=document.createElement('div');
  panel.style.cssText='position:fixed;inset:0;z-index:80;display:none;place-items:center;background:rgba(2,6,12,.68);backdrop-filter:blur(12px);';
  panel.innerHTML='<div style="width:min(620px,92vw);padding:24px;border:1px solid rgba(100,220,255,.35);background:rgba(8,14,25,.94);box-shadow:0 0 60px rgba(40,190,255,.12);font-family:system-ui;color:#e9f7ff"><div style="letter-spacing:.18em;font-size:12px;opacity:.7">GRID WORLD FACTORY 0.1</div><h2 style="margin:8px 0">Describe a world.</h2><p style="opacity:.72">The Grid derives its DNA, ecology, architecture, transit language and living-world identity. There is no fixed world count.</p><input id="gwf-name" placeholder="World name" style="box-sizing:border-box;width:100%;padding:12px;margin:8px 0;background:#09111d;color:#fff;border:1px solid #29485b"><textarea id="gwf-description" placeholder="Describe the world: its landscape, life, culture, architecture, atmosphere..." style="box-sizing:border-box;width:100%;height:150px;padding:12px;margin:8px 0;background:#09111d;color:#fff;border:1px solid #29485b"></textarea><div id="gwf-status" style="min-height:42px;margin:10px 0;opacity:.8"></div><div style="display:flex;gap:10px;justify-content:flex-end"><button id="gwf-close" type="button">Close</button><button id="gwf-create" type="button">CREATE WORLD</button></div></div>';
  document.body.appendChild(panel);

  const name=panel.querySelector<HTMLInputElement>('#gwf-name')!;
  const description=panel.querySelector<HTMLTextAreaElement>('#gwf-description')!;
  const status=panel.querySelector<HTMLElement>('#gwf-status')!;

  const close=()=>{panel.style.display='none';};
  button.addEventListener('click',()=>{panel.style.display='grid';name.focus();});
  panel.querySelector<HTMLButtonElement>('#gwf-close')!.addEventListener('click',close);
  panel.addEventListener('click',event=>{if(event.target===panel) close();});
  panel.querySelector<HTMLButtonElement>('#gwf-create')!.addEventListener('click',()=>{
    try {
      const result=options.onCreate(name.value,description.value);
      status.innerHTML='<b>WORLD CREATED</b><br>'+result.world.label+' · '+result.inferredTags.join(' · ')+'<br>Event: '+result.world.event+' · Resource: '+result.world.resourceKind+'<br><span style="opacity:.65">The world is now part of the open Grid registry.</span>';
      name.value=''; description.value='';
    } catch(error) {
      status.textContent=error instanceof Error ? error.message : 'World creation failed.';
    }
  });

  return {open:()=>{panel.style.display='grid';name.focus();},close};
}
