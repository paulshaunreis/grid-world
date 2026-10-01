export type GridShopType='PLAYER'|'NPC'|'PAWN'|'FOOD'|'CRAFT'|'ARMORY'|'GENERAL'|'ART'|'MOUNT'|'MAGIC'|'TECH'|'COLLECTIBLES';
export type GridShopStatus='NEW'|'FEATURED'|'OPEN'|'CLOSED';
export interface GridShopAppearance{theme:string;logoUrl?:string;bannerUrl?:string;accent:string;layout:'showcase'|'market'|'gallery'|'terminal';customCssToken?:string;}
export interface GridShop{id:string;ownerId:string;worldId?:string;name:string;slug:string;type:GridShopType;status:GridShopStatus;description:string;appearance:GridShopAppearance;featuredUntil?:number;createdAt:number;}
export class GridShopSystem{
 private shops=new Map<string,GridShop>();
 create(input:Omit<GridShop,'createdAt'|'status'> & {status?:GridShopStatus}){const shop:GridShop={...input,status:input.status??'OPEN',createdAt:Date.now()};this.shops.set(shop.id,shop);return shop;}
 updateAppearance(id:string,appearance:Partial<GridShopAppearance>){const s=this.shops.get(id);if(!s)return false;s.appearance={...s.appearance,...appearance};return true;}
 setStatus(id:string,status:GridShopStatus){const s=this.shops.get(id);if(!s)return false;s.status=status;return true;}
 byOwner(ownerId:string){return [...this.shops.values()].filter(s=>s.ownerId===ownerId);}
 featured(now=Date.now()){return [...this.shops.values()].filter(s=>s.status==='FEATURED'&&(!s.featuredUntil||s.featuredUntil>now));}
 newShops(limit=24){return [...this.shops.values()].sort((a,b)=>b.createdAt-a.createdAt).slice(0,limit);}
 npc(worldId?:string){return [...this.shops.values()].filter(s=>s.type==='NPC'&&(!worldId||s.worldId===worldId));}
 link(shop:GridShop){return '/shop/'+encodeURIComponent(shop.slug);}
 snapshot(){return [...this.shops.values()].map(s=>({...s,appearance:{...s.appearance}}));}
}