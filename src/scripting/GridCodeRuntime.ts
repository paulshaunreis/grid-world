import { parseGridCode, GridCodeNode } from '../core/GridCode';

export type GridCodeEvent = 'load' | 'interact' | 'enter' | 'exit' | 'timer';

export type GridCodeActionType =
  | 'show' | 'hide' | 'notify' | 'set' | 'play' | 'teleport'
  | 'summon' | 'quarantine' | 'preserveEvidence' | 'rateLimit'
  | 'degrade' | 'rollback' | 'reward' | 'measure' | 'profile' | 'permission';

export interface GridCodeAction {
  type: GridCodeActionType;
  target?: string;
  value?: string;
}

export interface GridCodeEventBlock {
  event: GridCodeEvent;
  actions: GridCodeAction[];
}

export interface GridCodeProgram {
  id?: string;
  events: GridCodeEventBlock[];
  capabilities: string[];
}

const allowedTags = new Set([
  'House', 'System', 'On', 'Notify', 'Show', 'Hide', 'Play', 'Set',
  'Teleport', 'Summon', 'Quarantine', 'PreserveEvidence', 'RateLimit',
  'Degrade', 'Rollback', 'Reward', 'Measure', 'Profile', 'Permission',
]);

const allowedAttributes = new Set([
  'id', 'target', 'value', 'scale', 'event', 'type', 'amount', 'reason',
  'seconds', 'capability',
]);

const actionMap: Record<string, GridCodeActionType> = {
  notify: 'notify', show: 'show', hide: 'hide', play: 'play', set: 'set',
  teleport: 'teleport', summon: 'summon', quarantine: 'quarantine',
  preserveevidence: 'preserveEvidence', ratelimit: 'rateLimit',
  degrade: 'degrade', rollback: 'rollback', reward: 'reward',
  measure: 'measure', profile: 'profile', permission: 'permission',
};

const eventNames = new Set<GridCodeEvent>(['load', 'interact', 'enter', 'exit', 'timer']);

function validateNode(node: GridCodeNode): void {
  if (!allowedTags.has(node.tag)) throw new Error('Grid Code tag not allowed: <' + node.tag + '>');
  for (const key of Object.keys(node.attributes)) {
    if (!allowedAttributes.has(key)) throw new Error('Grid Code attribute not allowed: ' + key);
  }
  for (const child of node.children) validateNode(child);
}

function actionFromNode(node: GridCodeNode): GridCodeAction | null {
  const type = actionMap[node.tag.toLowerCase()];
  if (!type) return null;
  return { type, target: node.attributes.target, value: node.attributes.value ?? node.text };
}

function collectActions(nodes: GridCodeNode[]): GridCodeAction[] {
  return nodes.flatMap(node => {
    const action = actionFromNode(node);
    return action ? [action] : [];
  });
}

export function compileGridCode(source: string): GridCodeProgram {
  const doc = parseGridCode(source);
  if (doc.diagnostics.length) throw new Error(doc.diagnostics.join(' '));
  for (const node of doc.root.children) validateNode(node);

  const events: GridCodeEventBlock[] = [];
  const capabilities = new Set<string>();

  const addEvent = (event: GridCodeEvent, actions: GridCodeAction[]) => {
    if (actions.length) events.push({ event, actions });
    for (const action of actions) {
      if (action.type === 'summon') capabilities.add('world.npc.summon');
      if (action.type === 'quarantine') capabilities.add('security.quarantine');
      if (action.type === 'preserveEvidence') capabilities.add('security.evidence');
      if (action.type === 'rateLimit') capabilities.add('security.rate-limit');
      if (action.type === 'degrade') capabilities.add('world.degrade');
      if (action.type === 'rollback') capabilities.add('world.rollback');
      if (action.type === 'reward') capabilities.add('economy.reward');
      if (action.type === 'permission') capabilities.add('object.permission');
      if (action.type === 'teleport') capabilities.add('world.teleport');
    }
  };

  for (const rootNode of doc.root.children) {
    if (rootNode.tag.toLowerCase() === 'house') addEvent('load', collectActions(rootNode.children));

    for (const child of rootNode.children) {
      if (child.tag.toLowerCase() !== 'on') continue;
      const eventName = child.attributes.event as GridCodeEvent | undefined;
      if (!eventName || !eventNames.has(eventName)) {
        throw new Error('Grid Code event must be one of load, interact, enter, exit, timer.');
      }
      addEvent(eventName, collectActions(child.children));
    }
  }

  return {
    id: doc.root.children.find(node => node.attributes.id)?.attributes.id,
    events,
    capabilities: [...capabilities],
  };
}
