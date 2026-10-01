import * as THREE from 'three';
import { GRID_BUILD_LIBRARY, createGridBuildObject, getGridBuildDefinition, type GridBuildCategory } from './GridBuildLibrary';

export type GridBuildAction='PLACE'|'REMOVE'|'MOVE'|'ROTATE'|'SCALE';
export type GridBuildMode='BASIC'|'ADVANCED';
export interface GridBuildPreview{position:THREE.Vector3;rotation:THREE.Euler;scale:THREE.Vector3;valid:boolean;}

const TOOL_RECIPES=[
  {id:'grid-hammer',name:'Grid Hammer',materials:{'Grid Matter':6,'Metal':2},description:'Basic placement, move and rotate tool.'},
  {id:'grid-builder',name:'Grid Builder',materials:{'Grid Matter':12,'Metal':4,'Crystal Shard':2},description:'Advanced build tool with scaling and free rotation.'},
  {id:'grid-architect',name:'Grid Architect',materials:{'Grid Matter':24,'Metal':8,'Blueprint Scrap':3},description:'Multi-select, copy and blueprint tool.'},
] as const;

export class GridEasyBuildSystem{
  readonly root=new THREE.Group();
  private mode:GridBuildMode='BASIC';
  private action:GridBuildAction='PLACE';
  private selectedId='primitive-cube';
  private preview?:THREE.Object3D;
  private snap=.5;
  private attached=false;
  private readonly raycaster=new THREE.Raycaster();
  private readonly pointer=new THREE.Vector2();
  private camera?:THREE.Camera;
  private scene?:THREE.Scene;
  private dom?:HTMLElement;
  private panel?:HTMLElement;
  private inventory:Record<string,number>=JSON.parse(localStorage.getItem('grid-world:builder-materials')??'{}');
  private undoStack:THREE.Object3D[]=[];
  private clipboard?:THREE.Object3D;
  private rotation=0;
  private previewScale=1;
  private lastPointerEvent?:PointerEvent;
  private readonly starterMaterials:Record<string,number>={'Grid Matter':100,Metal:20,Wood:20,Crystal:10,Crystal\n Shard:10};

  constructor(){this.root.name='grid-easy-build';this.root.userData.gridBuildSystem=true;for(const[k,v]of Object.entries(this.starterMaterials))if(this.inventory[k]===undefined)this.inventory[k]=v;this.persistMaterials();}
  attach(camera:THREE.Camera,scene:THREE.Scene,dom:HTMLElement){if(this.attached)return;this.attached=true;this.camera=camera;this.scene=scene;this.dom=dom;dom.addEventListener('pointerdown',this.onPointerDown);dom.addEventListener('pointermove',this.onPointerMove);dom.addEventListener('wheel',this.onWheel,{passive:false});window.addEventListener('keydown',this.onKeyDown);}
  open(){this.panel?.classList.add('open');this.setEnabled(true);}
  close(){this.panel?.classList.remove('open');this.cancel();}
  setEnabled(enabled:boolean){this.root.userData.enabled=enabled;}
  setMode(mode:GridBuildMode){this.mode=mode;this.snap=mode==='BASIC'?0.5:0.125;if(this.panel)this.panel.dataset.mode=mode;}
  setAction(action:GridBuildAction){this.action=action;}
  select(id:string){if(!getGridBuildDefinition(id))return;this.selectedId=id;this.beginLibraryPreview();}
  beginLibraryPreview(){const object=createGridBuildObject(this.selectedId);if(!object)return;this.beginPreview(object);}
  beginPreview(object:THREE.Object3D){this.cancel();this.preview=object;this.rotation=0;this.previewScale=1;this.preview.userData.gridBuildPreview=true;this.preview.traverse(c=>c.userData.gridBuildPreview=true);this.preview.scale.setScalar(1);this.preview.traverse(c=>{if(c instanceof THREE.Mesh){const mats=Array.isArray(c.material)?c.material:[c.material];for(const m of mats){m.transparent=true;m.opacity=.42;}}});this.root.add(this.preview);return this.preview;}
  updatePreview(hit:THREE.Vector3,rotation=0,scale=1){if(!this.preview)return;const snap=(v:number)=>Math.round(v/this.snap)*this.snap;this.preview.position.set(snap(hit.x),snap(hit.y),snap(hit.z));this.preview.rotation.set(0,rotation,0);this.preview.scale.setScalar(Math.max(.125,Math.min(this.mode==='BASIC'?8:32,scale)));this.preview.userData.valid=hit.y>=0;}
  confirm(){if(!this.preview)return null;const def=getGridBuildDefinition(this.selectedId);if(!def)return null;if(!this.canAfford(def.materialCost))return null;this.spendMaterials(def.materialCost);const source=this.preview;const placed=source.clone(true);this.root.remove(source);this.preview=undefined;placed.userData={...placed.userData,gridBuildObject:true,gridBuildId:this.selectedId,buildAction:this.action,materialCost:def.materialCost};placed.traverse(c=>{if(c instanceof THREE.Mesh){const mats=Array.isArray(c.material)?c.material:[c.material];for(const m of mats){m.transparent=false;m.opacity=1;}}});this.root.add(placed);this.undoStack.push(placed);return placed;}
  cancel(remove=true){if(this.preview&&remove)this.root.remove(this.preview);this.preview=undefined;}
  undo(){const o=this.undoStack.pop();if(o)this.root.remove(o);}
  copySelected(object?:THREE.Object3D){const source=object??this.undoStack.at(-1);if(!source)return;this.clipboard=source.clone(true);}
  paste(){if(!this.clipboard)return null;const pasted=this.clipboard.clone(true);pasted.position.add(new THREE.Vector3(1,0,1));this.root.add(pasted);this.undoStack.push(pasted);return pasted;}
  private persistMaterials(){localStorage.setItem('grid-world:builder-materials',JSON.stringify(this.inventory));}
  private canAfford(cost:Record<string,number>){return Object.entries(cost).every(([k,v])=>(this.inventory[k]??0)>=v);}
  private spendMaterials(cost:Record<string,number>){for(const[k,v]of Object.entries(cost))this.inventory[k]=(this.inventory[k]??0)-v;this.persistMaterials();}
  addMaterials(materials:Record<string,number>){for(const[k,v]of Object.entries(materials))this.inventory[k]=(this.inventory[k]??0)+Math.max(0,v);this.persistMaterials();}
  materialInventory(){return {...this.inventory};}
  craftTool(id:string){const recipe=TOOL_RECIPES.find(r=>r.id===id);if(!recipe)return{ok:false,error:'Unknown tool'};for(const[k,v]of Object.entries(recipe.materials))if((this.inventory[k]??0)<v)return{ok:false,error:'Missing '+k};for(const[k,v]of Object.entries(recipe.materials))this.inventory[k]-=v;localStorage.setItem('grid-world:builder-materials',JSON.stringify(this.inventory));return{ok:true,tool:recipe};}
  recipes(){return TOOL_RECIPES;}
  mountPanel(host:HTMLElement){const panel=document.createElement('section');panel.className='grid-build-panel';panel.innerHTML='<div class="grid-build-head"><b>GRID BUILDER</b><button data-close>×</button></div><div class="grid-build-modes"><button data-mode="BASIC">BASIC</button><button data-mode="ADVANCED">ADVANCED</button></div><div class="grid-build-cats"></div><div class="grid-build-items"></div><div class="grid-build-actions"><button data-act="undo">UNDO</button><button data-act="copy">COPY</button><button data-act="paste">PASTE</button><button data-act="rotate">ROTATE</button></div><div class="grid-build-tools"><b>CRAFT BUILDER TOOLS</b><div data-recipes></div></div><div class="grid-build-foot">Basic: snap + surface-friendly placement · Advanced: free rotation + scale · Ctrl/Cmd+C/V supported</div>';host.appendChild(panel);this.panel=panel;
    const cats=panel.querySelector('.grid-build-cats')!;(['PRIMITIVE','STRUCTURE','FURNITURE','NATURE','UTILITY'] as GridBuildCategory[]).forEach(c=>{const b=document.createElement('button');b.textContent=c;b.onclick=()=>this.renderItems(c);cats.appendChild(b);});
    panel.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.onclick=()=>this.setMode(b.dataset.mode as GridBuildMode));
    panel.querySelector<HTMLButtonElement>('[data-close]')!.onclick=()=>this.close();
    panel.querySelector<HTMLButtonElement>('[data-act="undo"]')!.onclick=()=>this.undo();
    panel.querySelector<HTMLButtonElement>('[data-act="copy"]')!.onclick=()=>this.copySelected();
    panel.querySelector<HTMLButtonElement>('[data-act="paste"]')!.onclick=()=>this.paste();
    panel.querySelector<HTMLButtonElement>('[data-act="rotate"]')!.onclick=()=>this.setAction('ROTATE');
    const recipes=panel.querySelector('[data-recipes]')!;for(const r of TOOL_RECIPES){const b=document.createElement('button');b.textContent=r.name+' · '+Object.entries(r.materials).map(([k,v])=>k+' '+v).join(', ');b.onclick=()=>{const result=this.craftTool(r.id);b.title=result.ok?'Crafted':'Need more materials';};recipes.appendChild(b);}
    this.renderItems('PRIMITIVE');this.setEnabled(false);return panel;
  }
  private renderItems(category:GridBuildCategory){if(!this.panel)return;const box=this.panel.querySelector('.grid-build-items')!;box.innerHTML='';for(const d of GRID_BUILD_LIBRARY.filter(x=>x.category===category)){const b=document.createElement('button');b.textContent=d.name;b.title=d.description;b.onclick=()=>{this.select(d.id);this.setEnabled(true);};box.appendChild(b);}}
  private updatePointer(event:PointerEvent){if(!this.root.userData.enabled||!this.camera||!this.dom||!this.preview)return;const rect=this.dom.getBoundingClientRect();this.pointer.x=((event.clientX-rect.left)/rect.width)*2-1;this.pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;this.raycaster.setFromCamera(this.pointer,this.camera);const objects=this.scene?[...this.scene.children].filter(o=>o!==this.root):[];const hits=this.raycaster.intersectObjects(objects,true).filter(h=>!h.object.userData.gridBuildPreview&&!h.object.userData.gridBuildObject);const hit=hits[0];if(!hit){this.preview.userData.valid=false;return;}const n=hit.face?.normal?.clone().transformDirection(hit.object.matrixWorld)??new THREE.Vector3(0,1,0);this.updatePreview(hit.point,n.y>.6?this.rotation:this.rotation,this.previewScale);this.preview.userData.valid=hit.point.y>=0;}
  private onPointerMove=(event:PointerEvent)=>{this.lastPointerEvent=event;this.updatePointer(event);};
  private onPointerDown=(event:PointerEvent)=>{if(!this.root.userData.enabled||!this.camera||!this.dom||event.button!==0)return;if((event.target as HTMLElement).closest?.('button,input,textarea,a,select,.grid-build-panel'))return;this.lastPointerEvent=event;this.updatePointer(event);if(this.action==='PLACE'&&this.preview?.userData.valid)this.confirm();};
  private onWheel=(event:WheelEvent)=>{if(!this.root.userData.enabled||!this.preview)return;event.preventDefault();this.previewScale=Math.max(.125,Math.min(this.mode==='BASIC'?8:32,this.previewScale*(event.deltaY<0?1.08:.925)));if(this.lastPointerEvent)this.updatePointer(this.lastPointerEvent);};
  private onKeyDown=(event:KeyboardEvent)=>{if(!this.root.userData.enabled)return;if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='c'){event.preventDefault();this.copySelected();return;}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='v'){event.preventDefault();this.paste();return;}if(event.key.toLowerCase()==='r'){this.rotation+=Math.PI/12;if(this.lastPointerEvent)this.updatePointer(this.lastPointerEvent);return;}if(event.key==='Escape')this.cancel();if(event.key==='Enter'&&this.preview?.userData.valid)this.confirm();};
  get instructions(){return{basic:'Choose an object → move the ghost → click/tap to place. Snap is 0.5m and objects align to surfaces.',advanced:'Free rotation, finer snap, scale, copy/paste and multi-piece construction.',touch:'Tap place · drag aim · pinch scale · two-finger twist rotate',mouse:'Click place · R rotate · wheel scale · Ctrl/Cmd+C/V copy/paste',controller:'Stick aim · A place · B cancel · bumpers rotate'};}
}
