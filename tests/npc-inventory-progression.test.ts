import { strict as assert } from 'node:assert';
import { createNPCProfile } from '../src/world/NPCProfile';
import { NPCInventorySystem } from '../src/world/NPCInventorySystem';
import { NPCJobProgressionSystem } from '../src/world/NPCJobProgressionSystem';

const profile=createNPCProfile({
 id:'npc.test',displayName:'Test',role:'ARTISAN',archetype:'artisan',world:'ARTS',gender:'unspecified',
 traits:['maker'],skills:{crafting:1},occupation:{title:'ARTISAN',progression:0},home:{world:'ARTS',x:0,y:0,z:0}
});
const inventory=new NPCInventorySystem();
assert.equal(inventory.seed(profile).length,3);
inventory.add(profile,{id:'test-mat',name:'Test Material',category:'MATERIAL',quality:50},2);
assert.equal(profile.inventory.find(i=>i.id==='test-mat')?.quantity,2);
assert.equal(inventory.remove(profile,'test-mat',1),true);
assert.equal(profile.inventory.find(i=>i.id==='test-mat')?.quantity,1);

const progression=new NPCJobProgressionSystem();
progression.award(profile,100);
assert.equal(profile.level,2);
assert.equal(profile.occupation.progression,1);
assert.equal(progression.skillFor(profile).name,'crafting');
assert(profile.skills.crafting>1);
console.log('npc-inventory-progression: all assertions passed');
