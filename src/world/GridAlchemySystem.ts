import { GRID_MINERAL_CHEMISTRY, getMineralChemistry } from './GridChemistrySystem';
import type { GridMineralKind } from './GridMineralSystem';

export interface GridAlchemyRecipe { id:string; inputs:Partial<Record<GridMineralKind,number>>; output?:GridMineralKind; catalystElements:readonly string[]; energy:number; }

export const GRID_ALCHEMY_RECIPES: readonly GridAlchemyRecipe[] = [
  {id:'aurel-purification',inputs:{GRID_CUPRIX:3,GRID_ARGENT:1},output:'GRID_AUREL',catalystElements:['S','O'],energy:30},
  {id:'prismatic-quartz',inputs:{GRID_QUARTZ:2,GRID_AMETHYST:1},output:'GRID_CITRINE',catalystElements:['Si','O'],energy:18},
  {id:'crystal-fusion',inputs:{GRID_QUARTZ:2,GRID_FLUORITE:1},output:'GRID_TOPAZ',catalystElements:['Si','F','Al'],energy:24},
];

export class GridAlchemySystem {
  private readonly recipes = new Map(GRID_ALCHEMY_RECIPES.map(r=>[r.id,r]));
  canAttempt(recipeId:string, inventory:Partial<Record<GridMineralKind,number>>){
    const r=this.recipes.get(recipeId); if(!r)return false;
    return Object.entries(r.inputs).every(([kind,n]) => (inventory[kind as GridMineralKind]??0)>=Number(n));
  }
  inspectMineral(kind:GridMineralKind){
    const chemistry=getMineralChemistry(kind);
    return { ...chemistry, elements: chemistry.elements.map(symbol=>GRID_MINERAL_CHEMISTRY[kind] ? symbol : symbol) };
  }
  attempt(recipeId:string, inventory:Partial<Record<GridMineralKind,number>>, energyAvailable:number){
    const r=this.recipes.get(recipeId);
    if(!r || !this.canAttempt(recipeId,inventory) || energyAvailable<r.energy) return {ok:false,reason:'requirements'};
    if(!r.output) return {ok:false,reason:'no-output'};
    for(const [kind,n] of Object.entries(r.inputs)) inventory[kind as GridMineralKind]=(inventory[kind as GridMineralKind]??0)-Number(n);
    inventory[r.output]=(inventory[r.output]??0)+1;
    return {ok:true,output:r.output,energySpent:r.energy};
  }
  getRecipes(){ return [...this.recipes.values()]; }
}
