import * as THREE from 'three';
export type GridBuildAction='PLACE'|'REMOVE'|'MOVE'|'ROTATE'|'SCALE';
export interface GridBuildPreview{position:THREE.Vector3;rotation:number;scale:number;valid:boolean;}
export class GridEasyBuildSystem{
 readonly root=new THREE.Group(); private mode:GridBuildAction='PLACE'; private preview?:THREE.Mesh; private snap=.5;
 constructor(){this.root.name='grid-easy-build';}
 setMode(mode:GridBuildAction){this.mode=mode;}
 beginPreview(geometry:THREE.BufferGeometry,material:THREE.Material){if(this.preview)this.root.remove(this.preview);this.preview=new THREE.Mesh(geometry,material);this.preview.userData={gridBuildPreview:true};this.root.add(this.preview);return this.preview;}
 updatePreview(hit:THREE.Vector3,rotation=0,scale=1){if(!this.preview)return;const snap=(v:number)=>Math.round(v/this.snap)*this.snap;this.preview.position.set(snap(hit.x),snap(hit.y),snap(hit.z));this.preview.rotation.y=rotation;this.preview.scale.setScalar(scale);this.preview.userData.valid=hit.y>=0;}
 confirm(){if(!this.preview)return null;const placed=this.preview.clone();placed.userData={gridBuildObject:true,buildAction:this.mode};this.root.add(placed);return placed;}
 cancel(){if(this.preview){this.root.remove(this.preview);this.preview=undefined;}}
 get instructions(){return{touch:'Tap to place • drag to aim • two-finger twist to rotate • pinch to scale',mouse:'Click to place • drag to aim • R to rotate • wheel to scale',controller:'Aim with stick • A place • B cancel • bumpers rotate'};}
}