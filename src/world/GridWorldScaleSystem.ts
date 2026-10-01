export interface GridWorldScale{worldId:string;radius:number;regions:number;hubs:number;landmarkBudget:number;architectureTier:'COLOSSAL';}
export class GridWorldScaleSystem{
 static readonly DEFAULT_RADIUS=100000; static readonly DEFAULT_REGIONS=256; static readonly DEFAULT_HUBS=32; static readonly DEFAULT_LANDMARK_BUDGET=4096;
 scale(worldId:string):GridWorldScale{return{worldId,radius:GridWorldScaleSystem.DEFAULT_RADIUS,regions:GridWorldScaleSystem.DEFAULT_REGIONS,hubs:GridWorldScaleSystem.DEFAULT_HUBS,landmarkBudget:GridWorldScaleSystem.DEFAULT_LANDMARK_BUDGET,architectureTier:'COLOSSAL'};}
}