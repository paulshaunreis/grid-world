import { describe, expect, it } from 'vitest';
import { NPCMarketSystem } from '../src/world/NPCMarketSystem';

describe('NPC market', () => {
  it('lists produced goods and transfers Grid Coin on purchase', () => {
    const market = new NPCMarketSystem();
    market.seedBalance('buyer', 50);
    market.seedBalance('seller', 10);
    const listing = market.listProduced({
      id:'item-1', npcId:'producer', worldId:'GARDENS', kind:'HARVEST',
      name:'Fresh Harvest', category:'FOOD', quantity:3, quality:80, createdAt:1
    }, 'seller', 2);
    const trade = market.buy(listing.id, 'buyer', 2);
    expect(trade?.totalPrice).toBe(4);
    expect(market.getBalance('buyer')).toBe(46);
    expect(market.getBalance('seller')).toBe(14);
    expect(market.getListings('GARDENS')[0].quantity).toBe(1);
  });

  it('rejects purchases the buyer cannot afford', () => {
    const market = new NPCMarketSystem();
    market.seedBalance('buyer', 1);
    const listing = market.listProduced({
      id:'item-2', npcId:'producer', worldId:'HARBOR', kind:'CRAFT',
      name:'Handcrafted Component', category:'MATERIAL', quantity:1, quality:90, createdAt:1
    }, 'seller', 5);
    expect(market.buy(listing.id, 'buyer', 1)).toBeNull();
    expect(market.getListings('HARBOR')[0].quantity).toBe(1);
  });
});