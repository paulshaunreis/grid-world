export interface GridSyntheticElement {
  element_id:string;
  symbol:string;
  atomic_number:number;
  name:string;
  synthetic:true;
}

export interface GridTransmutationRecipe {
  id:string;
  inputs:Record<string,number>;
  output:GridSyntheticElement;
  energyCost:number;
  rarity:string;
}

export const GRID_SYNTHETIC_ELEMENTS:readonly GridSyntheticElement[]=[
  {element_id:'AURORIUM',symbol:'Ao',atomic_number:119,name:'Aurorium',synthetic:true},
  {element_id:'LUMINITE',symbol:'LuG',atomic_number:120,name:'Luminite',synthetic:true},
  {element_id:'VERDANIUM',symbol:'Vd',atomic_number:121,name:'Verdanium',synthetic:true},
];

export class GridElementTransmutationSystem {
  private recipes=new Map<string,GridTransmutationRecipe>();
  constructor(){
    this.recipes.set('STARFORGE-119',{id:'STARFORGE-119',inputs:{Au:1,Ag:1,C:2},output:GRID_SYNTHETIC_ELEMENTS[0],energyCost:120,rarity:'MYTHIC'});
    this.recipes.set('STARFORGE-120',{id:'STARFORGE-120',inputs:{Cu:2,Si:1,O:3},output:GRID_SYNTHETIC_ELEMENTS[1],energyCost:160,rarity:'MYTHIC'});
    this.recipes.set('STARFORGE-121',{id:'STARFORGE-121',inputs:{Fe:2,C:1,Si:1,O:2},output:GRID_SYNTHETIC_ELEMENTS[2],energyCost:190,rarity:'LEGENDARY'});
  }
  getRecipes(){return [...this.recipes.values()];}
}
