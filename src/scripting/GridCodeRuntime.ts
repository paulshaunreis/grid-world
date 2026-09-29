import { parseGridCode } from '../core/GridCode';

export type GridCodeEvent = 'load' | 'interact' | 'enter' | 'exit' | 'timer';
export interface GridCodeAction { type: 'show'|'hide'|'notify'|'set'|'play'|'teleport'; target?: string; value?: string; }
export interface GridCodeProgram { events: Array<{event: GridCodeEvent; actions: GridCodeAction[]}>; }

const allowedTags = new Set(['House','Notify','Show','Hide','Play','Set']);
const allowedAttributes = new Set(['id','target','value','scale']);

export function compileGridCode(source: string): GridCodeProgram {
  const doc = parseGridCode(source);
  if (doc.diagnostics.length) throw new Error(doc.diagnostics.join(' '));
  for (const node of doc.root.children) {
    if (!allowedTags.has(node.tag)) throw new Error('Grid Code tag not allowed: <' + node.tag + '>');
    for (const key of Object.keys(node.attributes)) if (!allowedAttributes.has(key)) throw new Error('Grid Code attribute not allowed: ' + key);
    for (const child of node.children) {
      if (!allowedTags.has(child.tag)) throw new Error('Grid Code tag not allowed: <' + child.tag + '>');
      for (const key of Object.keys(child.attributes)) if (!allowedAttributes.has(key)) throw new Error('Grid Code attribute not allowed: ' + key);
    }
  }
  const events = doc.root.children.filter(n => n.tag.toLowerCase() === 'house').map(house => ({
    event: 'load' as const,
    actions: house.children.map(n => ({
      type: (n.tag.toLowerCase() === 'notify' ? 'notify' : n.tag.toLowerCase() === 'show' ? 'show' : n.tag.toLowerCase() === 'hide' ? 'hide' : n.tag.toLowerCase() === 'play' ? 'play' : 'set') as GridCodeAction['type'],
      target: n.attributes.target,
      value: n.attributes.value ?? n.text,
    })),
  }));
  return { events };
}