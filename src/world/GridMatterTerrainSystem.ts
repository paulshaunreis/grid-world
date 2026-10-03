import * as THREE from 'three';
import { getWorlds } from './GridWorldRegistry';

export type GridMatterEditMode = 'CARVE' | 'BUILD' | 'RAISE' | 'LOWER' | 'SMOOTH' | 'FLATTEN';

/** A persisted Grid Matter unit, intentionally distinct from conventional voxel terminology. */

type MatterKey = string;

type WorldMatterState = {
  id: string;
  size: number;
  height: number;
  cells: Set<MatterKey>;
  mesh: THREE.Group;
  material: THREE.MeshStandardMaterial;
};

const keyOf = (x:number,y:number,z:number) => `${x},${y},${z}`;

export class GridMatterTerrainSystem {
  /** Grid Matter is the editable physical substrate beneath a Grid world. */
  readonly root = new THREE.Group();
  private readonly worlds = new Map<string, WorldMatterState>();
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private activeWorldId: string | null = null;
  private mode: GridMatterEditMode = 'CARVE';
  private enabled = false;
  private brushRadius = 0;
  private brushStrength = 1;
  private pointerPainting = false;
  private readonly storageKey = 'grid-world:grid-matter-terrain-v1';

  constructor(private readonly camera: THREE.Camera, private readonly dom: HTMLElement) {
    this.root.name = 'grid-grid-matter-terrain';
    this.root.visible = false;
    this.rebuild();
    this.dom.addEventListener('pointerdown', this.onPointerDown);
    this.dom.addEventListener('pointermove', this.onPointerMove);
    this.dom.addEventListener('pointerup', this.onPointerUp);
    this.dom.addEventListener('pointercancel', this.onPointerUp);
    window.addEventListener('keydown', this.onKeyDown);
  }

  rebuild() {
    for (const world of getWorlds()) {
      if (this.worlds.has(world.id)) continue;
      const size = 1;
      const height = 5;
      const state: WorldMatterState = {
        id: world.id, size, height, cells: new Set(), mesh: new THREE.Group(),
        material: new THREE.MeshStandardMaterial({ color: world.color, roughness: .88, metalness: .04 })
      };
      state.mesh.name = 'grid-matter-' + world.id.toLowerCase();
      state.mesh.position.copy(world.center);
      state.mesh.userData.gridObjectKind = 'grid-matter-terrain';
      state.mesh.userData.worldId = world.id;

      const saved = this.loadWorld(world.id);
      if (saved) state.cells = new Set(saved);
      for (let x=-10;x<=10;x++) for (let z=-10;z<=10;z++) {
        const h = Math.max(1, Math.round(2.5 + Math.sin(x*.42)*.65 + Math.cos(z*.35)*.55));
        if (!saved) for (let y=0;y<h;y++) state.cells.add(keyOf(x,y,z));
      }
      this.worlds.set(world.id,state);
      this.rebuildMesh(state);
      this.root.add(state.mesh);
    }
  }

  setActiveWorld(worldId:string|null) { this.activeWorldId = worldId; }
  setEnabled(enabled:boolean) { this.enabled = enabled; this.root.visible = enabled; }
  setMode(mode:GridMatterEditMode) { this.mode = mode; }
  getMode() { return this.mode; }
  setBrushRadius(radius:number) { this.brushRadius = Math.max(0, Math.min(4, Math.floor(radius))); }
  getBrushRadius() { return this.brushRadius; }
  setBrushStrength(strength:number) { this.brushStrength = Math.max(1, Math.min(3, Math.floor(strength))); }
  getBrushStrength() { return this.brushStrength; }

  private rebuildMesh(state:WorldMatterState) {
    state.mesh.clear();
    const geometry = new THREE.BoxGeometry(state.size,state.size,state.size);
    const cells = [...state.cells];
    for (const key of cells) {
      const [x,y,z] = key.split(',').map(Number);
      const cube = new THREE.Mesh(geometry,state.material);
      cube.position.set(x+.5,y+.5,z+.5);
      cube.userData.gridObjectKind='grid-matter';
      cube.userData.worldId=state.id;
      cube.userData.gridMatter={x,y,z};
      cube.userData.interactable=true;
      state.mesh.add(cube);
    }
  }

  private worldPointToCell(state:WorldMatterState, point:THREE.Vector3) {
    const local = point.clone().sub(state.mesh.position);
    return {x:Math.floor(local.x/state.size),y:Math.floor(local.y/state.size),z:Math.floor(local.z/state.size)};
  }

  private edit(point:THREE.Vector3, normal:THREE.Vector3) {
    if (!this.enabled || !this.activeWorldId) return;
    const state=this.worlds.get(this.activeWorldId);
    if (!state) return;
    const local=point.clone().sub(state.mesh.position);
    let x=Math.floor(local.x/state.size), y=Math.floor(local.y/state.size), z=Math.floor(local.z/state.size);
    const center = { x, y, z };
    const radius = this.brushRadius;
    const offsets:number[][] = [];
    for (let ox=-radius; ox<=radius; ox++) {
      for (let oy=-radius; oy<=radius; oy++) {
        for (let oz=-radius; oz<=radius; oz++) {
          if (Math.sqrt(ox*ox + oy*oy + oz*oz) <= radius + 0.01) offsets.push([ox,oy,oz]);
        }
      }
    }
    const bx=Math.floor((local.x+normal.x*.55)/state.size);
    const by=Math.floor((local.y+normal.y*.55)/state.size);
    const bz=Math.floor((local.z+normal.z*.55)/state.size);
    const addAt = (x:number,y:number,z:number) => { if (y >= 0) state.cells.add(keyOf(x,y,z)); };
    const removeAt = (x:number,y:number,z:number) => { if (y > 0) state.cells.delete(keyOf(x,y,z)); };
    const applyBuild = () => {
      for (let pass=0; pass<this.brushStrength; pass++) for (const [ox,oy,oz] of offsets) addAt(bx+ox,by+oy,bz+oz);
    };
    const applyCarve = () => {
      for (let pass=0; pass<this.brushStrength; pass++) for (const [ox,oy,oz] of offsets) removeAt(center.x+ox,center.y+oy,center.z+oz);
    };
    if (this.mode==='BUILD' || this.mode==='RAISE') {
      applyBuild();
    } else if (this.mode==='CARVE' || this.mode==='LOWER') {
      applyCarve();
    } else if (this.mode==='FLATTEN') {
      const planeY = center.y;
      for (const [ox,oy,oz] of offsets) {
        const x=center.x+ox, z=center.z+oz;
        for (const key of [...state.cells]) {
          const [cx,cy,cz]=key.split(',').map(Number);
          if (cx===x && cz===z && cy>planeY) state.cells.delete(key);
        }
        if (this.brushStrength > 1) for (let y=0;y<planeY;y++) addAt(x,y,z);
      }
    } else if (this.mode==='SMOOTH') {
      const snapshot=new Set(state.cells);
      for (const [ox,oy,oz] of offsets) {
        const x=center.x+ox,y=center.y+oy,z=center.z+oz;
        let neighbors=0;
        for (const [dx,dy,dz] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]) if (snapshot.has(keyOf(x+dx,y+dy,z+dz))) neighbors++;
        if (neighbors >= 4) addAt(x,y,z);
        else if (neighbors <= 2) removeAt(x,y,z);
      }
    }
    this.rebuildMesh(state);
    this.saveWorld(state);
  }

  private saveWorld(state:WorldMatterState) {
    try {
      const all = JSON.parse(localStorage.getItem(this.storageKey) ?? '{}') as Record<string,string[]>;
      all[state.id] = [...state.cells];
      localStorage.setItem(this.storageKey, JSON.stringify(all));
    } catch { /* persistence is best-effort */ }
  }

  private loadWorld(worldId:string):string[]|null {
    try {
      const all = JSON.parse(localStorage.getItem(this.storageKey) ?? '{}') as Record<string,string[]>;
      return Array.isArray(all[worldId]) ? all[worldId] : null;
    } catch { return null; }
  }

  private paintFromPointer(event:PointerEvent) {
    const rect=this.dom.getBoundingClientRect();
    this.pointer.x=((event.clientX-rect.left)/rect.width)*2-1;
    this.pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;
    this.raycaster.setFromCamera(this.pointer,this.camera);
    const state=this.activeWorldId ? this.worlds.get(this.activeWorldId) : null;
    if (!state) return;
    const hits=this.raycaster.intersectObjects(state.mesh.children,false);
    const hit=hits[0];
    if (!hit) return;
    const normal=hit.face?.normal?.clone().transformDirection(hit.object.matrixWorld) ?? new THREE.Vector3(0,1,0);
    this.edit(hit.point,normal);
  }

  private onPointerDown=(event:PointerEvent)=>{
    if (!this.enabled || event.button!==0 || event.target!==this.dom) return;
    if ((event.target as HTMLElement).closest?.('button,input,textarea,a,select')) return;
    if (event.shiftKey) this.mode='BUILD';
    else this.mode='CARVE';
    this.pointerPainting=true;
    this.paintFromPointer(event);
  };

  private onPointerMove=(event:PointerEvent)=>{
    if (!this.pointerPainting || !this.enabled) return;
    this.paintFromPointer(event);
  };

  private onPointerUp=()=>{
    this.pointerPainting=false;
  };

  private onKeyDown=(event:KeyboardEvent)=>{
    if (event.key.toLowerCase()==='g') {
      this.enabled=!this.enabled;
      this.root.visible=this.enabled;
      this.dom.dataset.voxelEdit=this.enabled?'on':'off';
    }
    if (event.key.toLowerCase()==='b') this.mode='BUILD';
    if (event.key.toLowerCase()==='c') this.mode='CARVE';
    if (event.key.toLowerCase()==='r') this.mode='RAISE';
    if (event.key.toLowerCase()==='l') this.mode='LOWER';
    if (event.key.toLowerCase()==='s') this.mode='SMOOTH';
    if (event.key.toLowerCase()==='f') this.mode='FLATTEN';
    if (event.key === '[') this.setBrushRadius(this.brushRadius - 1);
    if (event.key === ']') this.setBrushRadius(this.brushRadius + 1);
  };

  serializeWorld(worldId = this.activeWorldId): string[] {
    if (!worldId) return [];
    const state = this.worlds.get(worldId);
    return state ? [...state.cells] : [];
  }

  restoreWorld(worldId: string, cells: unknown) {
    const state = this.worlds.get(worldId);
    if (!state || !Array.isArray(cells)) return;
    const valid = cells.filter(v => typeof v === 'string' && /^-?\\d+,-?\\d+,-?\\d+$/.test(v as string)) as string[];
    state.cells = new Set(valid);
    this.rebuildMesh(state);
    this.saveWorld(state);
  }

  dispose() {
    this.dom.removeEventListener('pointerdown',this.onPointerDown);
    this.dom.removeEventListener('pointermove',this.onPointerMove);
    this.dom.removeEventListener('pointerup',this.onPointerUp);
    this.dom.removeEventListener('pointercancel',this.onPointerUp);
    window.removeEventListener('keydown',this.onKeyDown);
  }
}
