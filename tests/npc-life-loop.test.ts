import { strict as assert } from 'node:assert';
import { createNPCProfile, profileSummary } from '../src/world/NPCProfile';
import { NPCRelationshipNetwork } from '../src/world/NPCRelationshipSystem';

const mara = createNPCProfile({
  id: 'npc.mara', displayName: 'Mara', role: 'NAVIGATOR', archetype: 'pathfinder', world: 'HARBOR',
  gender: 'female', traits: ['curious', 'steady'], skills: { navigation: 7, trade: 3 },
  occupation: { title: 'Navigator', workplaceId: 'harbor-pier', progression: 2 },
  home: { world: 'HARBOR', x: 22, y: 0, z: -24 },
});
assert.equal(mara.level, 1);
assert.deepEqual(profileSummary(mara).traits, ['curious', 'steady']);
assert.equal(profileSummary(mara).relationshipCount, 0);

const network = new NPCRelationshipNetwork();
network.connect('npc.mara', 'npc.iven', 'friend', .25);
const meeting = network.interact('npc.mara', 'npc.iven', .08, .04);
assert.equal(meeting.meetings, 1);
assert.equal(meeting.familiarity, .04);
assert.equal(meeting.trust, .04);
network.setRivalry('npc.mara', 'npc.rook', .8);
assert.equal(network.get('npc.mara', 'npc.rook')?.kind, 'rival');
assert.equal(network.get('npc.mara', 'npc.rook')?.rivalry, .8);
assert.equal(network.forNPC('npc.mara').length, 2);

console.log('npc-life-loop: all assertions passed');
