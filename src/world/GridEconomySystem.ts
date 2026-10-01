import * as THREE from 'three';

export type GridEconomyWorldKind='BAZAAR'|'BANK'|'VAULT';

export interface GridEconomyWorld {
  id:string;
  label:string;
  kind:GridEconomyWorldKind;
  description:string;
  center:THREE.Vector3;
}

export const GRID_ECONOMY_WORLDS: readonly GridEconomyWorld[]=[
  {id:'GRID_BAZAAR',label:'GRID BAZAAR',kind:'BAZAAR',description:'The persistent trading city where users and NPC merchants buy and sell Grid assets.',center:new THREE.Vector3(0,6,72)},
  {id:'GRID_OMNI_BANK',label:'GRID WORLD OMNI BANK',kind:'BANK',description:'The protected financial world for wallets, ledgers, exchanges and account services.',center:new THREE.Vector3(72,10,72)},
  {id:'GRID_WORLD_VAULT',label:'GRID WORLD VAULT',kind:'VAULT',description:'A secure storage world where mined materials and synthesized assets are held under authoritative ownership.',center:new THREE.Vector3(-72,10,72)},
];
