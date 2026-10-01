import * as THREE from 'three';
import { getWorlds } from './GridWorldRegistry';

export type GridMatterEditMode = 'CARVE' | 'BUILD';

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
  private enabled = true;
  private readonly storageKey = 'grid-world:grid-matter-terrain-v1';

  constructor(private readonly camera: THREE.Camera, private readonly dom: HTMLElement) {
    this.root.name = 'grid-grid-matter-terrain';
    this.rebuild();
    this.dom.addEventListener('pointerdown', this.onPointerDown);
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
  setEnabled(enabled:boolean) { this.enabled = enabled; }
  setMode(mode:GridMatterEditMode) { this.mode = mode; }
  getMode() { return this.mode; }

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
    if (this.mode==='BUILD') {
      x=Math.floor((local.x+normal.x*.55)/state.size);
      y=Math.floor((local.y+normal.y*.55)/state.size);
      z=Math.floor((local.z+normal.z*.55)/state.size);
      state.cells.add(keyOf(x,y,z));
    } else {
      const key=keyOf(x,y,z);
      if (state.cells.has(key) && y>0) state.cells.delete(key);
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

  private onPointerDown=(event:PointerEvent)=>{
    if (!this.enabled || event.button!==0 || event.target!==this.dom) return;
    if ((event.target as HTMLElement).closest?.('button,input,textarea,a,select')) return;
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
    if (event.shiftKey) this.mode='BUILD';
    else this.mode='CARVE';
    this.edit(hit.point,normal);
  };

  private onKeyDown=(event:KeyboardEvent)=>{
    if (event.key.toLowerCase()==='g') {
      this.enabled=!this.enabled;
      this.dom.dataset.voxelEdit=this.enabled?'on':'off';
    }
    if (event.key.toLowerCase()==='b') this.mode='BUILD';
    if (event.key.toLowerCase()==='c') this.mode='CARVE';
  };

  dispose() {
    this.dom.removeEventListener('pointerdown',this.onPointerDown);
    window.removeEventListener('keydown',this.onKeyDown);
  }
}
