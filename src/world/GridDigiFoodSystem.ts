export interface GridDigiFood{ id:string;name:string;energy:number;hydration:number;buffs:string[];visualKey:string;quality:number;freshness:number;recipeTags:string[]; }
export class GridDigiFoodSystem{
 private foods=new Map<string,GridDigiFood>();
 create(food:GridDigiFood){this.foods.set(food.id,food);return food;}
 defaults(){return[
 this.create({id:'aurora-noodle-bowl',name:'Aurora Noodle Bowl',energy:28,hydration:12,buffs:['focus'],visualKey:'food-aurora-noodles',quality:1,freshness:1,recipeTags:['noodle','vegetable']}),
 this.create({id:'crystal-fruit',name:'Crystal Fruit',energy:16,hydration:32,buffs:['clarity'],visualKey:'food-crystal-fruit',quality:1,freshness:1,recipeTags:['fruit','crystal']}),
 this.create({id:'ember-stew',name:'Ember Stew',energy:42,hydration:8,buffs:['warmth','stamina'],visualKey:'food-ember-stew',quality:1,freshness:1,recipeTags:['stew','spice']}),
 this.create({id:'sky-tea',name:'Sky Tea',energy:8,hydration:38,buffs:['calm','focus'],visualKey:'food-sky-tea',quality:1,freshness:1,recipeTags:['tea','aether']})
 ];}}
