import * as THREE from 'three';

export type GridGuardStance='PATROL'|'ESCORT'|'DEFEND'|'SEARCH'|'RESPOND'|'HOLD';
export interface GridGuardUnit { id:string; name:string; role:'SCOUT'|'GUARD'|'CAPTAIN'|'COMMANDER'; world:string; members:string[]; stance:GridGuardStance; formation:'line'|'wedge'|'ring'|'column'; target?:string; }

export class GridGuardCommandSystem {
  readonly root=new THREE.Group();
  private units=new Map<string,GridGuardUnit>();
  constructor(){this.root.name='grid-omni-guard-command';}
  registerSquad(id:string,name:string,world:string,members:string[],stance:GridGuardStance='PATROL'){this.units.set(id,{id,name,role:'CAPTAIN',world,members,stance,formation:'wedge'});return this.units.get(id)!;}
  registerArmy(id:string,name:string,world:string,members:string[]){this.units.set(id,{id,name,role:'COMMANDER',world,members,stance:'DEFEND',formation:'column'});return this.units.get(id)!;}
  command(id:string,command:Partial<Pick<GridGuardUnit,'stance'|'formation'|'target'>>){const unit=this.units.get(id);if(!unit)return false;Object.assign(unit,command);this.root.userData.lastCommand={unit:id,...command,time:Date.now()};return true;}
  unitsForWorld(world:string){return [...this.units.values()].filter(x=>x.world===world);}
  snapshot(){return [...this.units.values()].map(x=>({...x,members:[...x.members]}));}
  ensureDefaults(world:string){
    const squadId='guard-squad:'+world;
    if(!this.units.has(squadId)) this.registerSquad(squadId,world+' Sentinel Squad',world,['guard-1','guard-2','guard-3','guard-4']);
    const armyId='guard-army:'+world;
    if(!this.units.has(armyId)) this.registerArmy(armyId,world+' Omni Defense',world,['squad-alpha','squad-beta','squad-gamma']);
  }
}
