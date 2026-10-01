import * as THREE from 'three';
import { connectWorld, getWorlds, registerNetworkWorld, type GridWorldDefinition, type GridWorldEvent } from './GridWorldRegistry';
import { deriveWorldDNA, type WorldDNA } from './WorldDNA';

export interface GridWorldCreationRequest {
  name: string;
  description: string;
  tags?: string[];
  center?: { x: number; y?: number; z: number };
  event?: GridWorldEvent;
  resourceKind?: string;
  connectTo?: string[];
}

export interface GridWorldFactoryResult {
  world: GridWorldDefinition;
  dna: WorldDNA;
  inferredTags: string[];
  connectedWorlds: string[];
}

/** GRID WORLD FACTORY 0.1 — descriptions become registry data + World DNA. */
const TAG_KEYWORDS: Record<string, string[]> = {
  water:['water','ocean','sea','river','lake','tidal','reef','aquatic','island','coast','underwater'],
  growth:['garden','forest','jungle','tree','plant','bloom','grove','living','canopy','verdant','nature'],
  ancient:['ancient','ruin','temple','citadel','relic','stone','empire','archive','monument'],
  art:['art','gallery','museum','music','dance','creative','artist','stage','theater','studio'],
  wildlife:['wild','wildlife','frontier','beast','animal','savanna','wilderness','migration','herd'],
  ecology:['ecology','ecosystem','flora','fauna','biosphere','living'],
  commerce:['market','trade','commerce','port','city','merchant','bazaar','economy'],
  culture:['culture','festival','community','society','tradition'],
  aerial:['sky','floating','airborne','cloud','aerial','levitating'],
  cloud:['cloud','cloudsea','cloud sea','sky'],
  living:['living city','living architecture','grown architecture','world tree','biomorphic'],
  systems:['machine','technical','technology','network','grid','digital','mechanical','cyber'],
  navigation:['navigation','voyage','sail','harbor','transit','gateway'],
  migration:['migration','migratory','seasonal'],
  keeper:['guardian','keeper','sanctuary','watch','protector'],
  market:['market','trade','merchant','commerce','bazaar'],
  canopy:['canopy','treetop','tree city','forest canopy'],
};

const EVENT_BY_TAG: Array<[string, GridWorldEvent]> = [
  ['water','tide'],['growth','bloom'],['wildlife','migration'],['art','market'],
  ['commerce','market'],['ancient','aurora'],['systems','storm'],
];

function slug(value:string) {
  return value.normalize('NFKD').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').toUpperCase().slice(0,24) || 'WORLD';
}

function inferTags(text:string, explicit:readonly string[] = []) {
  const source=text.toLowerCase();
  const tags=new Set(explicit.map(tag=>tag.toLowerCase().trim()).filter(Boolean));
  for (const [tag,words] of Object.entries(TAG_KEYWORDS)) if (words.some(word=>source.includes(word))) tags.add(tag);
  if (!tags.size) tags.add('ecology');
  return [...tags];
}

function colorFromName(name:string) {
  let hash=0; for (const char of name) hash=((hash<<5)-hash+char.charCodeAt(0))|0;
  return new THREE.Color().setHSL((Math.abs(hash)%360)/360,.62,.62).getHex();
}

function secondaryColor(primary:number) {
  const color=new THREE.Color(primary); color.offsetHSL(0,-.18,-.24); return color.getHex();
}

function chooseCenter(existing:readonly GridWorldDefinition[], requested?:{x:number;y?:number;z:number}) {
  if (requested) return new THREE.Vector3(requested.x,requested.y??0,requested.z);
  const radius=62, angle=existing.length*2.399963;
  return new THREE.Vector3(Math.cos(angle)*radius,existing.length%4===0?6:0,Math.sin(angle)*radius);
}

function chooseEvent(tags:readonly string[], requested?:GridWorldEvent) {
  if (requested) return requested;
  for (const [tag,event] of EVENT_BY_TAG) if (tags.includes(tag)) return event;
  return 'quiet' as GridWorldEvent;
}

export function createWorldFromDescription(request:GridWorldCreationRequest):GridWorldFactoryResult {
  const name=request.name.trim(), description=request.description.trim();
  if (!name) throw new Error('A world name is required.');
  if (!description) throw new Error('Describe the world before creating it.');
  const inferredTags=inferTags(name+' '+description,request.tags);
  const baseId=slug(name), existingIds=new Set(getWorlds().map(world=>world.id));
  let id=baseId, suffix=2; while(existingIds.has(id)) id=baseId+'-'+suffix++;
  const center=chooseCenter(getWorlds(),request.center);
  const primary=colorFromName(name), event=chooseEvent(inferredTags,request.event);
  const resourceKind=request.resourceKind?.trim().toUpperCase() || id+'_RESOURCE';
  const dna=deriveWorldDNA(inferredTags);
  const gateId='gate-'+id.toLowerCase();
  const world=registerNetworkWorld({
    id,label:name.toUpperCase(),description,center,color:primary,secondary:secondaryColor(primary),
    resourceKind,tags:inferredTags,event,gateId,enabled:true,
  },request.connectTo??[]);
  const connectedWorlds=(request.connectTo??[]).filter(destination=>getWorlds().some(candidate=>candidate.id===destination));
  return {world,dna,inferredTags,connectedWorlds};
}

export function connectFactoryWorldToAll(result:GridWorldFactoryResult) {
  for (const world of getWorlds()) {
    if (world.id===result.world.id) continue;
    connectWorld(result.world.id,world.id);
    connectWorld(world.id,result.world.id);
  }
  return getWorlds().length-1;
}
