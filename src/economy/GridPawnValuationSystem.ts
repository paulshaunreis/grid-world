export interface PawnFactors{rarity:number;condition:number;provenance:number;demand:number;age:number;authenticity:number;liquidity:number;seasonality:number;}
export interface PawnQuote{baseValue:number;marketValue:number;offerValue:number;confidence:number;factors:PawnFactors;currencyId:string;expiresAt:number;}
export class GridPawnValuationSystem{
 quote(baseValue:number,factors:PawnFactors,currencyId='GRID'):PawnQuote{
  const f={...factors}; const weighted=(f.rarity*.18+f.condition*.16+f.provenance*.12+f.demand*.18+f.age*.07+f.authenticity*.14+f.liquidity*.08+f.seasonality*.07);
  const marketValue=Math.max(0,baseValue*(0.45+weighted*0.55)); const offerValue=marketValue*0.72;
  const confidence=Math.max(0,Math.min(1,(f.authenticity+f.condition+f.provenance+f.liquidity)/4));
  return {baseValue,marketValue,offerValue,confidence,factors:f,currencyId,expiresAt:Date.now()+86400000};
 }
}