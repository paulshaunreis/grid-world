import type { NPCInventoryItem, NPCProfileRecord } from './NPCProfile';

const ROLE_LOADOUTS: Record<string, NPCInventoryItem[]> = {
  NAVIGATOR: [
    { id:'navigation-compass', name:'Navigation Compass', category:'TOOL', quantity:1, quality:70, equipped:true },
    { id:'route-chart', name:'Route Chart', category:'QUEST', quantity:1, quality:55 },
    { id:'travel-ration', name:'Travel Ration', category:'FOOD', quantity:2, quality:50 },
  ],
  GARDENER: [
    { id:'garden-shears', name:'Garden Shears', category:'TOOL', quantity:1, quality:65, equipped:true },
    { id:'seed-packet', name:'Native Seed Packet', category:'MATERIAL', quantity:3, quality:60 },
    { id:'fresh-fruit', name:'Fresh Fruit', category:'FOOD', quantity:2, quality:70 },
  ],
  ARTISAN: [
    { id:'maker-kit', name:'Maker Kit', category:'TOOL', quantity:1, quality:72, equipped:true },
    { id:'crafting-metal', name:'Crafting Metal', category:'MATERIAL', quantity:3, quality:55 },
    { id:'blueprint-scrap', name:'Blueprint Scrap', category:'BLUEPRINT', quantity:1, quality:45 },
  ],
  KEEPER: [
    { id:'keeper-key', name:'Keeper Key', category:'KEY', quantity:1, quality:80, equipped:true },
    { id:'repair-kit', name:'Repair Kit', category:'TOOL', quantity:2, quality:60 },
    { id:'rations', name:'Rations', category:'FOOD', quantity:2, quality:50 },
  ],
  RANGER: [
    { id:'field-knife', name:'Field Tool', category:'TOOL', quantity:1, quality:68, equipped:true },
    { id:'fiber-bundle', name:'Field Fiber', category:'MATERIAL', quantity:3, quality:55 },
    { id:'trail-ration', name:'Trail Ration', category:'FOOD', quantity:2, quality:55 },
  ],
};

export class NPCInventorySystem {
  seed(profile: NPCProfileRecord) {
    if (profile.inventory.length) return profile.inventory;
    profile.inventory = (ROLE_LOADOUTS[profile.role] ?? []).map(item => ({ ...item, id: profile.id + ':' + item.id }));
    return profile.inventory;
  }

  add(profile: NPCProfileRecord, item: Omit<NPCInventoryItem, 'quantity'>, quantity = 1) {
    const existing = profile.inventory.find(entry => entry.id === item.id);
    if (existing) existing.quantity += quantity;
    else profile.inventory.push({ ...item, quantity });
    return profile.inventory;
  }

  remove(profile: NPCProfileRecord, itemId: string, quantity = 1) {
    const item = profile.inventory.find(entry => entry.id === itemId);
    if (!item || item.quantity < quantity) return false;
    item.quantity -= quantity;
    if (item.quantity === 0) profile.inventory = profile.inventory.filter(entry => entry !== item);
    return true;
  }

  snapshot(profile: NPCProfileRecord) {
    return profile.inventory.map(item => ({ ...item }));
  }
}
