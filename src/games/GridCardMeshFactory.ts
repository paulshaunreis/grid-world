import * as THREE from 'three';
import type {GridCard} from './GridDuelSystem';
export function createGridCardMesh(card:GridCard){
 const g=new THREE.Group(); g.name='grid-card-'+card.id;
 const cardMesh=new THREE.Mesh(new THREE.BoxGeometry(1.2,.08,1.7),new THREE.MeshStandardMaterial({metalness:.35,roughness:.4}));
 cardMesh.userData={gridCard:true,cardId:card.id}; g.add(cardMesh);
 if(card.type==='MONSTER'){
  const avatar=new THREE.Mesh(new THREE.IcosahedronGeometry(.45,2),new THREE.MeshStandardMaterial({emissiveIntensity:.8,metalness:.2,roughness:.35}));
  avatar.position.y=.7; avatar.userData={gridSummonedMonster:true,sourceCardId:card.id}; g.add(avatar);
 }
 return g;
}