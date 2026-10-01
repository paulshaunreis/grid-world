import * as THREE from 'three';
import type { EcologyWorld } from './CreatureEcologySystem';
import type { SocietySnapshot } from './NPCSocietySystem';
import type { LocalStory } from './RelationshipStorySystem';
import { QuestSystem, type Quest } from './QuestSystem';
import { getWorld, getWorlds } from './GridWorldRegistry';
import { deriveWorldDNA } from './WorldDNA';

type GeneratedQuestSeed = Omit<Quest,'progress'|'status'>;

function worldContext(world:EcologyWorld) {
  const definition=getWorld(world);
  if(!definition) {
    return { giver:'Grid Guide', position:[0,0] as [number,number], tags:[] as string[], dna:deriveWorldDNA([]) };
  }
  return {
    giver:(definition.label || world)+' Guide',
    position:[definition.center.x,definition.center.z] as [number,number],
    tags:[...(definition.tags ?? [])],
    dna:deriveWorldDNA(definition.tags ?? []),
  };
}

function eventMission(world:EcologyWorld,event:string) {
  const context=worldContext(world);
  const tags=context.tags;
  if(event==='MIGRATION_WAVE') return ['Track the Migration Wave','A habitat migration has become a visible world event. Follow the moving group and learn why the route changed.','Follow the active migration route and observe the movement.'];
  if(event==='POLLINATOR_BLOOM') return ['Protect the Pollinator Bloom','Pollinator activity is reshaping the living world. Visit the bloom route and observe the changes.','Reach the active flowering route and document the pollinator surge.'];
  if(event==='POPULATION_BOOM') return ['Study a Population Boom','One species is expanding rapidly. Observe the habitat before the balance changes again.','Locate the expanding population and record its habitat.'];
  if(event==='POPULATION_COLLAPSE') return ['Investigate the Population Collapse','A local population has fallen sharply. Trace the food-web pressure without disturbing the habitat.','Reach the affected habitat and investigate the ecological signal.'];
  if(event==='NEW_SPECIES') return ['Meet the New Form','A new evolutionary form has appeared. Find it, observe its traits, and record its lineage.','Locate the newly emerged species and add it to your field guide.'];
  if(event==='SEASONAL_SHIFT') return ['Witness the Seasonal Shift','The season has changed the rhythm of this world. Explore the living systems while they adapt.','Visit the active ecological route during the new season.'];
  if(event==='BLOOM' || tags.includes('growth')) return ['Cultivate the Living Route','Help the local growth network flourish and learn what the world is becoming.','Reach the active growth route and investigate the living environment.'];
  if(event==='MIGRATION' || tags.includes('wildlife')) return ['Follow the Wild Signal','A movement pattern is changing across the local habitat. Track it without disturbing the creatures.','Follow the active wildlife route and document the migration signal.'];
  if(event==='TIDE' || tags.includes('water')) return ['Trace the Moving Water','The world is responding to a change in its water system. Find the source and observe the effects.','Reach the active water route and trace the environmental signal.'];
  if(event==='MARKET' || tags.includes('art') || tags.includes('culture')) return ['Carry the Creative Signal','Artists, makers, and visitors are changing the local rhythm. Follow the signal through the district.','Visit the active cultural route and discover what is changing.'];
  if(event==='AURORA' || tags.includes('ancient')) return ['Read the Ancient Signal','A dormant system has awakened. Follow its clues and record what the world reveals.','Reach the active landmark route and read the environmental signal.'];
  if(tags.includes('aerial') || tags.includes('cloud')) return ['Map the High Paths','The upper world has opened another route. Explore the vertical settlement and locate its living connections.','Reach the elevated route and map one new connection.'];
  return ['Study the Local World','A new world is developing its own patterns of life, work, and movement. Explore and observe them.','Reach the world activity route and record what you discover.'];
}

/**
 * Turns simulation signals into authored-feeling missions.
 * The generator is deliberately deterministic: the same world signal creates
 * one stable mission instead of flooding the player with procedural noise.
 */
export class DynamicQuestSystem {
  readonly root = new THREE.Group();
  private timer = 7;
  private serial = 0;
  private seenStoryIds = new Set<string>();
  private lastEvent = 'QUIET';

  constructor(private quests:QuestSystem) {
    this.root.name='grid-dynamic-quests';
  }

  private add(seed:GeneratedQuestSeed) {
    if (this.quests.addDynamicQuest(seed)) {
      this.root.userData.latestQuest=seed.id;
      return true;
    }
    return false;
  }

  update(
    delta:number,
    world:EcologyWorld,
    event:string,
    _phase:string,
    society:SocietySnapshot,
    story:LocalStory|null,
    playerX:number,
    playerZ:number,
    consequence?: {kind:string;text:string;world:EcologyWorld}|null,
  ): boolean {
    let changed=false;
    const consequenceKind=consequence?.world===world ? consequence.kind.toUpperCase() : '';
    const ecologyMissionKinds=new Set(['MIGRATION_WAVE','POLLINATOR_BLOOM','POPULATION_BOOM','POPULATION_COLLAPSE','NEW_SPECIES','SEASONAL_SHIFT']);
    const normalized=ecologyMissionKinds.has(consequenceKind) ? consequenceKind : event.toUpperCase();
    this.timer-=delta;

    // World events create temporary-feeling but persistent mission offers.
    // The mission remains in the player's journal once accepted.
    if (normalized!=='QUIET' && normalized!==this.lastEvent) {
      const context=worldContext(world);
      const [title,description,objective]=eventMission(world,normalized);
      this.serial++;
      if(this.add({
        id:'dynamic-event-'+world.toLowerCase()+'-'+this.serial,
        title,
        description,
        type:'WORLD_EVENT',
        world,
        target:1,
        reward:110+this.serial%4*25,
        giver:context.giver,
        objective,
        objectivePosition:context.position,
      })) changed=true;
      this.lastEvent=normalized;
    }

    // A local story can become a mission: this makes NPC relationships matter
    // to the player's path instead of existing only as background simulation.
    if (story && !this.seenStoryIds.has(story.id)) {
      this.seenStoryIds.add(story.id);
      const context=worldContext(story.world);
      const giver=story.participants[0] ?? context.giver;
      const position=context.position;
      this.serial++;
      if(this.add({
        id:'dynamic-story-'+story.id,
        title:'Follow the Story',
        description:story.text,
        type:'DISCOVER',
        world:story.world,
        target:1,
        reward:90+(story.kind==='DISCOVERY'?40:0),
        giver,
        objective:'Visit the place where this local story is unfolding and record what you learn.',
        objectivePosition:position,
        targetId:'story:'+story.id,
      })) changed=true;
    }

    // Society pressure creates a small civic mission when a world is unusually active.
    if (this.timer<=0) {
      this.timer=18;
      if (society.talking>=3) {
        const context=worldContext(world);
        this.serial++;
        if(this.add({
          id:'dynamic-social-'+world.toLowerCase()+'-'+this.serial,
          title:'Listen to the Neighborhood',
          description:'Several citizens are talking at once. Learn what the neighborhood is coordinating.',
          type:'MEET',
          world,
          target:2,
          reward:120,
          giver:context.giver,
          objective:'Meet 2 local citizens and learn what they are coordinating.',
          objectivePosition:context.position,
        })) changed=true;
      } else if (society.working>=4) {
        const context=worldContext(world);
        this.serial++;
        if(this.add({
          id:'dynamic-work-'+world.toLowerCase()+'-'+this.serial,
          title:'Lend a Hand',
          description:'The local work crews are active. Find the current work and help move it forward.',
          type:'BUILD',
          world,
          target:1,
          reward:130,
          giver:context.giver,
          objective:'Visit the local work route and inspect what is being built.',
          objectivePosition:context.position,
        })) changed=true;
      }
    }

    this.root.userData.world=world;
    this.root.userData.event=normalized;
    const context=worldContext(world);
    this.root.userData.playerDistance=Math.round(Math.hypot(playerX-context.position[0],playerZ-context.position[1]));
    this.root.userData.worldCount=getWorlds().length;
    return changed;
  }
}
