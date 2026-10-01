export interface GridCurrencyUnit{id:string;name:string;denomination:number;form:'COIN'|'BILL'|'TOKEN';material:string;condition:number;rarity:number;collectibility:number;}
export interface GridCurrencyQuote{unitId:string;faceValue:number;marketValue:number;liquidity:number;reasons:string[];}
export class GridCurrencyMarketSystem{
 quote(u:GridCurrencyUnit,demand:number,scarcity:number):GridCurrencyQuote{
  const multiplier=Math.max(.1,Math.min(8,.55+u.condition*.2+u.rarity*.25+u.collectibility*.2+demand*.15+scarcity*.15));
  return{unitId:u.id,faceValue:u.denomination,marketValue:u.denomination*multiplier,liquidity:Math.max(.05,Math.min(1,u.condition)),reasons:['condition','rarity','collectibility','demand','scarcity']};
 }
}