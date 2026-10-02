import type { NPCProfileRecord } from './NPCProfile';
import type { NPCProducedItem } from './NPCProductionSystem';
import { marketplaceItemMetadata, type GridMarketplaceItemMetadata } from '../economy/GridMarketplaceItem';

export interface NPCMarketListing {
  id:string;
  sellerId:string;
  worldId:string;
  itemId:string;
  itemName:string;
  category:NPCProducedItem['category'];
  quantity:number;
  unitPrice:number;
  currency:'GRID_COIN';
  quality:number;
  metadata:GridMarketplaceItemMetadata;
  createdAt:number;
}

export interface NPCMarketTrade {
  id:string;
  listingId:string;
  buyerId:string;
  sellerId:string;
  quantity:number;
  totalPrice:number;
  currency:'GRID_COIN';
  createdAt:number;
}

export class NPCMarketSystem {
  private listings = new Map<string,NPCMarketListing>();
  private trades:NPCMarketTrade[] = [];
  private balances = new Map<string,number>();

  constructor(){
    // NPCs use simulated Grid Coin balances until player/economy persistence is connected.
  }

  seedMerchant(profile:NPCProfileRecord, startingBalance=100){
    if(!this.balances.has(profile.id)) this.balances.set(profile.id,startingBalance);
  }

  listProduced(item:NPCProducedItem, sellerId:string, unitPrice:number){
    const id=item.id+':listing';
    const listing:NPCMarketListing={
      id,sellerId,worldId:item.worldId,itemId:item.id,itemName:item.name,
      category:item.category,quantity:item.quantity,unitPrice:Math.max(.01,unitPrice),
      currency:'GRID_COIN',quality:item.quality,metadata:marketplaceItemMetadata(item.id,item.quality),createdAt:Date.now()
    };
    this.listings.set(id,listing);
    return listing;
  }

  buy(listingId:string,buyerId:string,quantity=1){
    const listing=this.listings.get(listingId);
    if(!listing || quantity<1 || quantity>listing.quantity || buyerId===listing.sellerId) return null;
    const total=Number((quantity*listing.unitPrice).toFixed(2));
    const balance=this.balances.get(buyerId) ?? 0;
    if(balance<total) return null;
    this.balances.set(buyerId,balance-total);
    this.balances.set(listing.sellerId,(this.balances.get(listing.sellerId) ?? 0)+total);
    listing.quantity-=quantity;
    if(listing.quantity===0) this.listings.delete(listingId);
    const trade:NPCMarketTrade={id:listingId+':trade:'+Date.now(),listingId,buyerId,sellerId:listing.sellerId,quantity,totalPrice:total,currency:'GRID_COIN',createdAt:Date.now()};
    this.trades.push(trade);
    this.trades=this.trades.slice(-256);
    return trade;
  }

  restockFromProduction(item:NPCProducedItem, sellerId:string){
    const price=Math.max(.25,Number((item.quality*.08).toFixed(2)));
    return this.listProduced(item,sellerId,price);
  }

  getListings(worldId?:string){
    return [...this.listings.values()].filter(item=>!worldId || item.worldId===worldId).map(item=>({...item}));
  }

  getTrades(limit=25){ return this.trades.slice(-limit).map(item=>({...item})); }
  getBalance(profileId:string){ return this.balances.get(profileId) ?? 0; }
  seedBalance(profileId:string,amount:number){
    // Seeding is initialization, not a refill operation. A citizen who legitimately
    // spends down to zero must stay at zero until a real sale/award replenishes them.
    if(!this.balances.has(profileId)) this.balances.set(profileId,Math.max(0,amount));
    return this.getBalance(profileId);
  }
}