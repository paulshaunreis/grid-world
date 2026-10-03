import * as THREE from 'three';
import { GRID_BUILD_LIBRARY, createGridBuildObject, getGridBuildDefinition, type GridBuildCategory } from './GridBuildLibrary';

export type GridBuildAction='PLACE'|'REMOVE'|'MOVE'|'ROTATE'|'SCALE';
export type GridBuildMode='BASIC'|'ADVANCED';
export type GridBuildAccessRole='owner'|'viewer'|'builder'|'editor'|'admin'|null;
export interface GridBuildPreview{position:THREE.Vector3;rotation:THREE.Euler;scale:THREE.Vector3;valid:boolean;}
export interface GridRemoteBuild{objectId:string;definitionId:string;position:[number,number,number];rotation:[number,number,number];scale:[number,number,number];ownerUserId:string;}

const TOOL_RECIPES=[
  {id:'grid-hammer',name:'Grid Hammer',materials:{'Grid Matter':6,'Metal':2},description:'Basic placement, move and rotate tool.',maxUses:80},
  {id:'grid-builder',name:'Grid Builder',materials:{'Grid Matter':12,'Metal':4,'Crystal Shard':2},description:'Advanced build tool with scaling and free rotation.',maxUses:120},
  {id:'grid-architect',name:'Grid Architect',materials:{'Grid Matter':24,'Metal':8,'Blueprint Scrap':3},description:'Multi-select, copy and blueprint tool.',maxUses:180},
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
  private selectedObject?:THREE.Object3D;
  private selectedObjects = new Set<THREE.Object3D>();
  private groupId = '';
  private editStart?:{position:THREE.Vector3;rotation:THREE.Euler;scale:THREE.Vector3};
  private rotation=0;
  private previewScale=1;
  private lastPointerEvent?:PointerEvent;
  private ownerUserId='';
  private accessRole:GridBuildAccessRole=null;
  private readonly starterMaterials:Record<string,number>={'Grid Matter':100,Metal:20,Wood:20,Crystal:10,'Crystal Shard':10};
  private tools:Array<{instanceId:string;recipeId:string;name:string;usesRemaining:number;maxUses:number}> = JSON.parse(localStorage.getItem('grid-world:builder-tools') ?? '[]');

  constructor(){this.root.name='grid-easy-build';this.root.userData.gridBuildSystem=true;for(const[k,v]of Object.entries(this.starterMaterials))if(this.inventory[k]===undefined)this.inventory[k]=v;this.persistMaterials();}
  attach(camera:THREE.Camera,scene:THREE.Scene,dom:HTMLElement){if(this.attached)return;this.attached=true;this.camera=camera;this.scene=scene;this.dom=dom;dom.addEventListener('pointerdown',this.onPointerDown);dom.addEventListener('pointermove',this.onPointerMove);dom.addEventListener('wheel',this.onWheel,{passive:false});window.addEventListener('keydown',this.onKeyDown);}
  open(){this.panel?.classList.add('open');this.setEnabled(this.canBuild());this.updateAccessUI();}
  close(){this.panel?.classList.remove('open');this.cancel();}
  setEnabled(enabled:boolean){this.root.userData.enabled=enabled;}
  setOwnerUserId(userId:string){this.ownerUserId=userId;}
  setAccessRole(role:GridBuildAccessRole){this.accessRole=role;this.root.userData.accessRole=role??'none';this.root.userData.canBuild=this.canBuild();this.root.userData.canEditAll=this.canEditAll();this.updateAccessUI();}
  getAccessRole(){return this.accessRole;}
  private canBuild(){return this.accessRole==='owner'||this.accessRole==='builder'||this.accessRole==='editor'||this.accessRole==='admin';}
  private canEditAll(){return this.accessRole==='owner'||this.accessRole==='editor'||this.accessRole==='admin';}
  private canEditObject(object?:THREE.Object3D){if(!object)return false;if(this.canEditAll())return true;return this.accessRole==='builder'&&String(object.userData.ownerUserId??'')===this.ownerUserId;}
  private updateAccessUI(){if(!this.panel)return;const editable=this.canBuild();this.panel.dataset.role=this.accessRole??'none';this.panel.querySelectorAll<HTMLButtonElement>('button[data-build-action]').forEach(button=>{button.disabled=!editable;});const badge=this.panel.querySelector<HTMLElement>('[data-role-badge]');if(badge)badge.textContent='ROLE · '+(this.accessRole??'NONE').toUpperCase();this.panel.querySelector<HTMLElement>('[data-role-note]')?.replaceChildren(document.createTextNode(editable?'Build permissions active.':'Viewer access · build editing is disabled.'));}
  getSelectedObjectId():string|undefined { return this.selectedObject?.userData?.gridBuildObjectId ?? this.selectedObject?.userData?.gridBuildId; }
  setMode(mode:GridBuildMode){this.mode=mode;this.snap=mode==='BASIC'?0.5:0.125;if(this.panel)this.panel.dataset.mode=mode;}
  setAction(action:GridBuildAction){this.action=action;this.updateSelectionUI();}
  private selectPlaced(object?:THREE.Object3D, additive=false){
    if (!additive) this.selectedObjects.clear();
    if (object) this.selectedObjects.add(object);
    this.selectedObject=object;
    this.editStart=object?{position:object.position.clone(),rotation:object.rotation.clone(),scale:object.scale.clone()}:undefined;
    this.updateSelectionUI();
  }
  private selection(){return [...this.selectedObjects].filter(o=>o.parent===this.root&&this.canEditObject(o));}
  private applyToSelection(fn:(o:THREE.Object3D)=>void){const objects=this.selection();if(!objects.length)return;objects.forEach(fn);this.updateSelectionUI();}
  private groupSelection(){
    const objects=this.selection();
    if(objects.length<2)return;
    const id=this.groupId||crypto.randomUUID();
    this.groupId=id;
    objects.forEach(o=>{o.userData.gridBuildGroupId=id;});
    this.updateSelectionUI();
  }
  private clearGroup(){this.selection().forEach(o=>delete o.userData.gridBuildGroupId);this.groupId='';this.updateSelectionUI();}
  private alignSelection(axis:'x'|'y'|'z'){
    const objects=this.selection();if(objects.length<2)return;
    const value=objects.reduce((sum,o)=>sum+o.position[axis],0)/objects.length;
    objects.forEach(o=>{o.position[axis]=Math.round(value/this.snap)*this.snap;});
    this.updateSelectionUI();
  }
  private findPlacedHit(event:PointerEvent, additive=false){if(!this.camera||!this.dom)return;const rect=this.dom.getBoundingClientRect();this.pointer.x=((event.clientX-rect.left)/rect.width)*2-1;this.pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;this.raycaster.setFromCamera(this.pointer,this.camera);const hits=this.raycaster.intersectObjects(this.root.children,true).filter(h=>h.object.userData.gridBuildObject);const hit=hits[0];if(!hit)return;let o:THREE.Object3D=hit.object;while(o.parent&&o.parent!==this.root)o=o.parent;if(o.parent===this.root)this.selectPlaced(o,additive);}
  private removeSelected(){
    const objects=this.selection();if(!objects.length)return;
    objects.forEach(o=>{this.root.remove(o);this.undoStack=this.undoStack.filter(x=>x!==o);});
    this.selectedObjects.clear();this.selectedObject=undefined;this.editStart=undefined;this.updateSelectionUI();
  }
  private moveSelected(dx:number,dz:number){this.applyToSelection(o=>{o.position.x=Math.round((o.position.x+dx)/this.snap)*this.snap;o.position.z=Math.round((o.position.z+dz)/this.snap)*this.snap;});}
  private rotateSelected(){this.applyToSelection(o=>{o.rotation.y+=Math.PI/12;});}
  private scaleSelected(factor:number){this.applyToSelection(o=>{const s=Math.max(.125,Math.min(this.mode==='BASIC'?8:32,o.scale.x*factor));o.scale.setScalar(s);});}
  private updateSelectionUI(){if(this.panel){this.panel.dataset.selection=this.selectedObjects.size?'selected':'none';this.panel.querySelector<HTMLElement>('[data-selection-count]')?.replaceChildren(document.createTextNode(String(this.selectedObjects.size)));}this.root.userData.buildStateVersion=Number(this.root.userData.buildStateVersion??0)+1;}

  select(id:string){if(!getGridBuildDefinition(id))return;this.selectedId=id;this.beginLibraryPreview();}
  beginLibraryPreview(){const object=createGridBuildObject(this.selectedId);if(!object)return;this.beginPreview(object);}
  beginPreview(object:THREE.Object3D){this.cancel();this.preview=object;this.rotation=0;this.previewScale=1;this.preview.userData.gridBuildPreview=true;this.preview.traverse(c=>c.userData.gridBuildPreview=true);this.preview.scale.setScalar(1);this.preview.traverse(c=>{if(c instanceof THREE.Mesh){const mats=Array.isArray(c.material)?c.material:[c.material];for(const m of mats){m.transparent=true;m.opacity=.42;}}});this.root.add(this.preview);return this.preview;}
  updatePreview(hit:THREE.Vector3,rotation=0,scale=1){if(!this.preview)return;const snap=(v:number)=>Math.round(v/this.snap)*this.snap;this.preview.position.set(snap(hit.x),snap(hit.y),snap(hit.z));this.preview.rotation.set(0,rotation,0);this.preview.scale.setScalar(Math.max(.125,Math.min(this.mode==='BASIC'?8:32,scale)));this.preview.userData.valid=hit.y>=0;}
  confirm(){if(!this.canBuild()||!this.preview)return null;const def=getGridBuildDefinition(this.selectedId);if(!def)return null;if(!this.canAfford(def.materialCost))return null;this.spendMaterials(def.materialCost);const source=this.preview;const placed=source.clone(true);this.root.remove(source);this.preview=undefined;placed.userData={...placed.userData,gridBuildObject:true,gridBuildId:this.selectedId,gridBuildObjectId:crypto.randomUUID(),buildAction:this.action,materialCost:def.materialCost,ownerUserId:this.ownerUserId};placed.traverse(c=>{if(c instanceof THREE.Mesh){const mats=Array.isArray(c.material)?c.material:[c.material];for(const m of mats){m.transparent=false;m.opacity=1;}}});this.root.add(placed);this.undoStack.push(placed);this.selectPlaced(placed);return placed;}
  cancel(remove=true){if(this.preview&&remove)this.root.remove(this.preview);this.preview=undefined;}
  undo(){const o=this.undoStack.at(-1);if(!o||!this.canEditObject(o))return;this.undoStack.pop();this.root.remove(o);if(this.selectedObject===o)this.selectPlaced();}
  copySelected(object?:THREE.Object3D){const source=object??this.selectedObject??this.undoStack.at(-1);if(!source||!this.canEditObject(source))return;this.clipboard=source.clone(true);}
  paste(){if(!this.canBuild()||!this.clipboard)return null;const pasted=this.clipboard.clone(true);pasted.userData={...pasted.userData,gridBuildObjectId:crypto.randomUUID(),ownerUserId:this.ownerUserId,gridBuildGroupId:undefined};pasted.position.add(new THREE.Vector3(1,0,1));this.root.add(pasted);this.undoStack.push(pasted);this.selectPlaced(pasted);return pasted;}
  private persistMaterials(){localStorage.setItem('grid-world:builder-materials',JSON.stringify(this.inventory));}
  private persistTools(){localStorage.setItem('grid-world:builder-tools',JSON.stringify(this.tools));}
  toolInventory(){return this.tools.map(tool=>({...tool}));}
  useTool(recipeId:string, amount=1){
    const tool=this.tools.find(item=>item.recipeId===recipeId && item.usesRemaining>0);
    if(!tool) return {ok:false,error:'No usable '+recipeId+' available.'};
    tool.usesRemaining=Math.max(0,tool.usesRemaining-Math.max(1,amount));
    this.persistTools();
    return {ok:true,tool:{...tool}};
  }
  private canAfford(cost:Record<string,number>){return Object.entries(cost).every(([k,v])=>(this.inventory[k]??0)>=v);}
  private spendMaterials(cost:Record<string,number>){for(const[k,v]of Object.entries(cost))this.inventory[k]=(this.inventory[k]??0)-v;this.persistMaterials();}
  addMaterials(materials:Record<string,number>){for(const[k,v]of Object.entries(materials))this.inventory[k]=(this.inventory[k]??0)+Math.max(0,v);this.persistMaterials();}
  materialInventory(){return {...this.inventory};}
  craftTool(id:string){
    const recipe=TOOL_RECIPES.find(r=>r.id===id);
    if(!recipe)return{ok:false,error:'Unknown tool'};
    for(const[k,v]of Object.entries(recipe.materials))if((this.inventory[k]??0)<v)return{ok:false,error:'Missing '+k};
    for(const[k,v]of Object.entries(recipe.materials))this.inventory[k]-=v;
    this.persistMaterials();
    const tool={instanceId:crypto.randomUUID(),recipeId:recipe.id,name:recipe.name,usesRemaining:recipe.maxUses,maxUses:recipe.maxUses};
    this.tools.push(tool); this.persistTools();
    return{ok:true,tool:{...tool,recipe}};
  }
  recipes(){return TOOL_RECIPES;}
  mountPanel(host:HTMLElement){const panel=document.createElement('section');panel.className='grid-build-panel';panel.innerHTML='<div class="grid-build-head"><b>GRID BUILDER</b><button data-close>×</button></div><div data-role-badge>ROLE · NONE</div><div data-role-note>Viewer access · build editing is disabled.</div><div class="grid-build-selection">SELECTED · <span data-selection-count>0</span></div><div class="grid-build-modes"><button data-mode="BASIC">BASIC</button><button data-mode="ADVANCED">ADVANCED</button></div><div class="grid-build-cats"></div><div class="grid-build-items"></div><div class="grid-build-actions"><button data-build-action data-act="undo">UNDO</button><button data-build-action data-act="copy">COPY</button><button data-build-action data-act="paste">PASTE</button><button data-build-action data-act="rotate">ROTATE</button><button data-build-action data-act="delete">DELETE</button><button data-build-action data-act="move">MOVE</button><button data-build-action data-act="align-x">ALIGN X</button><button data-build-action data-act="align-y">ALIGN Y</button><button data-build-action data-act="align-z">ALIGN Z</button><button data-build-action data-act="group">GROUP</button><button data-build-action data-act="ungroup">UNGROUP</button><button data-build-action data-act="scale-up">SCALE +</button><button data-build-action data-act="scale-down">SCALE −</button></div><div class="grid-build-tools"><b>CRAFT BUILDER TOOLS</b><div data-recipes></div></div><div class="grid-build-foot">Basic: snap + surface-friendly placement · Advanced: free rotation + scale · Ctrl/Cmd+C/V supported</div>';host.appendChild(panel);this.panel=panel;
    const cats=panel.querySelector('.grid-build-cats')!;(['PRIMITIVE','STRUCTURE','FURNITURE','NATURE','UTILITY'] as GridBuildCategory[]).forEach(c=>{const b=document.createElement('button');b.textContent=c;b.onclick=()=>this.renderItems(c);cats.appendChild(b);});
    panel.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.onclick=()=>this.setMode(b.dataset.mode as GridBuildMode));
    panel.querySelector<HTMLButtonElement>('[data-close]')!.onclick=()=>this.close();
    panel.querySelector<HTMLButtonElement>('[data-act="undo"]')!.onclick=()=>this.undo();
    panel.querySelector<HTMLButtonElement>('[data-act="copy"]')!.onclick=()=>this.copySelected();
    panel.querySelector<HTMLButtonElement>('[data-act="paste"]')!.onclick=()=>this.paste();
    panel.querySelector<HTMLButtonElement>('[data-act="rotate"]')!.onclick=()=>this.selectedObject?this.rotateSelected():this.setAction('ROTATE');
    panel.querySelector<HTMLButtonElement>('[data-act="delete"]')!.onclick=()=>this.removeSelected();
    panel.querySelector<HTMLButtonElement>('[data-act="move"]')!.onclick=()=>{this.setAction('MOVE');};
    panel.querySelector<HTMLButtonElement>('[data-act="align-x"]')!.onclick=()=>this.alignSelection('x');
    panel.querySelector<HTMLButtonElement>('[data-act="align-y"]')!.onclick=()=>this.alignSelection('y');
    panel.querySelector<HTMLButtonElement>('[data-act="align-z"]')!.onclick=()=>this.alignSelection('z');
    panel.querySelector<HTMLButtonElement>('[data-act="group"]')!.onclick=()=>this.groupSelection();
    panel.querySelector<HTMLButtonElement>('[data-act="ungroup"]')!.onclick=()=>this.clearGroup();
    panel.querySelector<HTMLButtonElement>('[data-act="scale-up"]')!.onclick=()=>this.scaleSelected(1.125);
    panel.querySelector<HTMLButtonElement>('[data-act="scale-down"]')!.onclick=()=>this.scaleSelected(.888888);
    const recipes=panel.querySelector('[data-recipes]')!;for(const r of TOOL_RECIPES){const b=document.createElement('button');b.textContent=r.name+' · '+Object.entries(r.materials).map(([k,v])=>k+' '+v).join(', ')+' · '+r.maxUses+' uses';b.onclick=()=>{const result=this.craftTool(r.id);b.title=result.ok?'Crafted '+r.name+' · '+r.maxUses+' uses':'Need more materials';};recipes.appendChild(b);}
    this.renderItems('PRIMITIVE');this.setEnabled(false);this.updateAccessUI();return panel;
  }
  private renderItems(category:GridBuildCategory){if(!this.panel)return;const box=this.panel.querySelector('.grid-build-items')!;box.innerHTML='';for(const d of GRID_BUILD_LIBRARY.filter(x=>x.category===category)){const b=document.createElement('button');b.textContent=d.name;b.title=d.description;b.onclick=()=>{if(!this.canBuild())return;this.select(d.id);this.setEnabled(true);};box.appendChild(b);}}
  private updatePointer(event:PointerEvent){if(!this.root.userData.enabled||!this.camera||!this.dom||!this.preview)return;const rect=this.dom.getBoundingClientRect();this.pointer.x=((event.clientX-rect.left)/rect.width)*2-1;this.pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;this.raycaster.setFromCamera(this.pointer,this.camera);const objects=this.scene?[...this.scene.children].filter(o=>o!==this.root):[];const hits=this.raycaster.intersectObjects(objects,true).filter(h=>!h.object.userData.gridBuildPreview&&!h.object.userData.gridBuildObject);const hit=hits[0];if(!hit){this.preview.userData.valid=false;return;}const n=hit.face?.normal?.clone().transformDirection(hit.object.matrixWorld)??new THREE.Vector3(0,1,0);this.updatePreview(hit.point,n.y>.6?this.rotation:this.rotation,this.previewScale);this.preview.userData.valid=hit.point.y>=0;}
  private onPointerMove=(event:PointerEvent)=>{this.lastPointerEvent=event;this.updatePointer(event);};
  private onPointerDown=(event:PointerEvent)=>{if(!this.root.userData.enabled||!this.canBuild()||!this.camera||!this.dom||event.button!==0)return;if((event.target as HTMLElement).closest?.('button,input,textarea,a,select,.grid-build-panel'))return;this.lastPointerEvent=event;this.updatePointer(event);if(this.action==='PLACE'&&this.preview?.userData.valid)this.confirm();else if(!this.preview){this.findPlacedHit(event,event.shiftKey);}};
  private onWheel=(event:WheelEvent)=>{if(!this.root.userData.enabled||!this.preview)return;event.preventDefault();this.previewScale=Math.max(.125,Math.min(this.mode==='BASIC'?8:32,this.previewScale*(event.deltaY<0?1.08:.925)));if(this.lastPointerEvent)this.updatePointer(this.lastPointerEvent);};
  private onKeyDown=(event:KeyboardEvent)=>{if(!this.root.userData.enabled||!this.canBuild())return;if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='c'){event.preventDefault();this.copySelected();return;}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='v'){event.preventDefault();this.paste();return;}if(event.key.toLowerCase()==='r'){this.rotation+=Math.PI/12;if(this.lastPointerEvent)this.updatePointer(this.lastPointerEvent);return;}if(event.key==='Delete'||event.key==='Backspace'){this.removeSelected();return;}if(event.key==='Escape'){this.cancel();this.selectPlaced();return;}if(this.selectedObject&&!this.preview){if(event.key.toLowerCase()==='r'){this.rotateSelected();return;}if(event.key==='ArrowUp'){this.moveSelected(0,-this.snap);return;}if(event.key==='ArrowDown'){this.moveSelected(0,this.snap);return;}if(event.key==='ArrowLeft'){this.moveSelected(-this.snap,0);return;}if(event.key==='ArrowRight'){this.moveSelected(this.snap,0);return;}}if(event.key==='Enter'&&this.preview?.userData.valid)this.confirm();};

  serialize(){return this.undoStack.map((o,i)=>({objectId:String(o.userData.gridBuildObjectId??crypto.randomUUID()),id:String(o.userData.gridBuildId??'primitive-cube'),position:[o.position.x,o.position.y,o.position.z],rotation:[o.rotation.x,o.rotation.y,o.rotation.z],scale:[o.scale.x,o.scale.y,o.scale.z],ownerUserId:String(o.userData.ownerUserId??this.ownerUserId),groupId:typeof o.userData.gridBuildGroupId==='string'?o.userData.gridBuildGroupId:undefined,index:i}));}
  restore(objects:unknown){this.undoStack.forEach(o=>this.root.remove(o));this.undoStack=[];if(!Array.isArray(objects))return;for(const raw of objects){if(!raw||typeof raw!=='object')continue;const x=raw as Record<string,unknown>;const id=typeof x.id==='string'?x.id:'';if(!getGridBuildDefinition(id))continue;const o=createGridBuildObject(id);if(!o)continue;o.userData.gridBuildObjectId=typeof x.objectId==='string'?x.objectId:crypto.randomUUID();const p=Array.isArray(x.position)?x.position.map(Number):[];const r=Array.isArray(x.rotation)?x.rotation.map(Number):[];const s=Array.isArray(x.scale)?x.scale.map(Number):[];if(p.length===3&&p.every(Number.isFinite))o.position.set(p[0],p[1],p[2]);if(r.length===3&&r.every(Number.isFinite))o.rotation.set(r[0],r[1],r[2]);if(s.length===3&&s.every(Number.isFinite))o.scale.set(s[0],s[1],s[2]);o.userData={...o.userData,gridBuildObject:true,gridBuildId:id,gridBuildObjectId:o.userData.gridBuildObjectId,ownerUserId:typeof x.ownerUserId==='string'?x.ownerUserId:'',gridBuildGroupId:typeof x.groupId==='string'?x.groupId:undefined,restored:true};this.root.add(o);this.undoStack.push(o);}}
  applyRemoteBuild(change:GridRemoteBuild|null,type:'INSERT'|'UPDATE'|'DELETE'){if(!change)return;const existing=this.undoStack.find(o=>String(o.userData.gridBuildObjectId)===change.objectId);if(type==='DELETE'){if(existing){this.root.remove(existing);this.undoStack=this.undoStack.filter(o=>o!==existing);if(this.selectedObject===existing)this.selectPlaced();}return;}const apply=(o:THREE.Object3D)=>{o.userData={...o.userData,gridBuildObject:true,gridBuildId:change.definitionId,gridBuildObjectId:change.objectId,ownerUserId:change.ownerUserId,gridBuildGroupId:typeof (change as any).groupId==='string'?(change as any).groupId:undefined,remote:true};o.position.set(...change.position);o.rotation.set(...change.rotation);o.scale.set(...change.scale);};if(existing){apply(existing);}else{const o=createGridBuildObject(change.definitionId);if(!o)return;apply(o);this.root.add(o);this.undoStack.push(o);}}
  get instructions(){return{basic:'Choose an object → move the ghost → click/tap to place. Snap is 0.5m and objects align to surfaces.',advanced:'Free rotation, finer snap, multi-selection, alignment, logical grouping, scale, copy/paste and multi-piece construction.',touch:'Tap place · drag aim · pinch scale · two-finger twist rotate',mouse:'Click place · R rotate · wheel scale · Ctrl/Cmd+C/V copy/paste',controller:'Stick aim · A place · B cancel · bumpers rotate'};}
}
