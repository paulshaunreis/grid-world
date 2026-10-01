import * as THREE from 'three';
import { createStarterPBRMaterial } from '../engine/GridPBRLibrary';

export type GridBuildCategory = 'PRIMITIVE'|'STRUCTURE'|'FURNITURE'|'NATURE'|'UTILITY';
export type GridBuildPrimitive = 'CUBE'|'SPHERE'|'CYLINDER'|'CONE'|'TORUS'|'PLANE';

export interface GridBuildDefinition {
  id:string; name:string; category:GridBuildCategory; description:string;
  materialCost:Record<string,number>; snap:number; tags:string[];
  create:()=>THREE.Object3D;
}

const mat=(kind:string,color:string)=>createStarterPBRMaterial(kind as any,{color,roughness:.72,metalness:.16});
const mark=(o:THREE.Object3D,id:string,def:GridBuildDefinition)=>{
  o.userData.gridBuildObject=true;o.userData.gridBuildId=id;o.userData.gridMaterialCost=def.materialCost;
  o.userData.gridBuildTags=def.tags;o.traverse(c=>{if(c instanceof THREE.Mesh)c.castShadow=true;});
  return o;
};

function primitive(id:GridBuildPrimitive){
  const geometry={
    CUBE:new THREE.BoxGeometry(1,1,1), SPHERE:new THREE.SphereGeometry(.55,24,16),
    CYLINDER:new THREE.CylinderGeometry(.5,.5,1,24), CONE:new THREE.ConeGeometry(.55,1,24),
    TORUS:new THREE.TorusGeometry(.45,.14,12,32), PLANE:new THREE.PlaneGeometry(1,1)
  }[id];
  return new THREE.Mesh(geometry,mat('technical','#47677c'));
}

const definitions:GridBuildDefinition[]=[
  ...(['CUBE','SPHERE','CYLINDER','CONE','TORUS','PLANE'] as GridBuildPrimitive[]).map(id=>({
    id:'primitive-'+id.toLowerCase(),name:id[0]+id.slice(1).toLowerCase(),category:'PRIMITIVE' as const,
    description:'Universal Grid construction primitive.',materialCost:{'Grid Matter':1},snap:.5,tags:['primitive','starter'],
    create:()=>primitive(id)
  })),
  {id:'wall-panel',name:'Wall Panel',category:'STRUCTURE',description:'Snap-ready modular wall section.',materialCost:{'Grid Matter':2},snap:.5,tags:['wall','structural'],create:()=>new THREE.Mesh(new THREE.BoxGeometry(2.5,2.8,.18),mat('stone','#60727c'))},
  {id:'floor-panel',name:'Floor Panel',category:'STRUCTURE',description:'Modular floor tile for rooms, decks and platforms.',materialCost:{'Grid Matter':2},snap:.5,tags:['floor','structural'],create:()=>new THREE.Mesh(new THREE.BoxGeometry(2.5,.16,2.5),mat('stone','#596b72'))},
  {id:'roof-panel',name:'Roof Panel',category:'STRUCTURE',description:'Lightweight roof segment.',materialCost:{'Grid Matter':2},snap:.5,tags:['roof','structural'],create:()=>new THREE.Mesh(new THREE.BoxGeometry(2.6,.18,2.6),mat('metal','#354955'))},
  {id:'column',name:'Column',category:'STRUCTURE',description:'Universal architectural support.',materialCost:{'Grid Matter':2},snap:.5,tags:['support','structural'],create:()=>new THREE.Mesh(new THREE.CylinderGeometry(.28,.34,3,16),mat('stone','#6d7476'))},
  {id:'arch',name:'Arch',category:'STRUCTURE',description:'Freestanding doorway arch.',materialCost:{'Grid Matter':5},snap:.5,tags:['door','structural'],create:()=>{
    const g=new THREE.Group();const m=mat('stone','#69747b');
    const a=new THREE.Mesh(new THREE.BoxGeometry(.3,2.8,.35),m),b=a.clone(),t=new THREE.Mesh(new THREE.BoxGeometry(2.4,.3,.35),m);
    a.position.x=-1.05;b.position.x=1.05;t.position.y=1.25;g.add(a,b,t);return g;
  }},
  {id:'stairs',name:'Stair Flight',category:'STRUCTURE',description:'Simple modular stair flight.',materialCost:{'Grid Matter':4},snap:.5,tags:['stairs','structural'],create:()=>{
    const g=new THREE.Group(),m=mat('stone','#667277');for(let i=0;i<6;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(1.5,.3,.55),m);s.position.set(0,.15+i*.3,i*.45);g.add(s);}return g;
  }},
  {id:'platform',name:'Platform',category:'STRUCTURE',description:'Raised building platform.',materialCost:{'Grid Matter':3},snap:.5,tags:['platform'],create:()=>new THREE.Mesh(new THREE.BoxGeometry(3,.22,3),mat('metal','#425b68'))},
  {id:'bench',name:'Bench',category:'FURNITURE',description:'Simple universal seating.',materialCost:{'Wood':2,'Grid Matter':1},snap:.25,tags:['seat'],create:()=>{
    const g=new THREE.Group(),m=mat('wood','#765a42');const s=new THREE.Mesh(new THREE.BoxGeometry(1.6,.16,.45),m),l=new THREE.Mesh(new THREE.BoxGeometry(1.35,.7,.12),m);s.position.y=.75;l.position.set(0,.38,.12);g.add(s,l);return g;
  }},
  {id:'lamp',name:'Lamp',category:'UTILITY',description:'Basic light fixture.',materialCost:{'Metal':1,'Crystal':1},snap:.25,tags:['light'],create:()=>new THREE.Mesh(new THREE.SphereGeometry(.28,16,12),mat('glass','#79e9ff'))},
  {id:'tree',name:'Starter Tree',category:'NATURE',description:'Starter living-world tree placeholder.',materialCost:{'Wood':2},snap:.5,tags:['flora','living'],create:()=>{
    const g=new THREE.Group(),tr=new THREE.Mesh(new THREE.CylinderGeometry(.16,.25,1.5,10),mat('wood','#5f4b3b')),c=new THREE.Mesh(new THREE.IcosahedronGeometry(.9,1),mat('foliage','#4f8b64'));c.position.y=1.65;g.add(tr,c);return g;
  }},
  {id:'beacon',name:'Grid Beacon',category:'UTILITY',description:'Construction marker and navigation light.',materialCost:{'Metal':2,'Crystal':2},snap:.5,tags:['beacon','utility'],create:()=>{
    const g=new THREE.Group(),m=mat('metal','#294452'),gl=mat('glass','#64e8ff');const b=new THREE.Mesh(new THREE.CylinderGeometry(.28,.4,.4,16),m),c=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,1.3,12),gl);c.position.y=.82;g.add(b,c);return g;
  }}
];

export const GRID_BUILD_LIBRARY=definitions.map(d=>Object.freeze(d));
export const getGridBuildDefinition=(id:string)=>GRID_BUILD_LIBRARY.find(d=>d.id===id);
export const createGridBuildObject=(id:string)=>{
  const d=getGridBuildDefinition(id); if(!d) return null;
  return mark(d.create(),d.id,d);
};
export const gridBuildCategories=()=>[...new Set(GRID_BUILD_LIBRARY.map(d=>d.category))];
