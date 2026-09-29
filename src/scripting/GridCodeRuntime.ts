import { parseGridCode } from '../core/GridCode';

export type GridCodeEvent = 'load' | 'interact' | 'enter' | 'exit' | 'timer';
export interface GridCodeAction { type: 'show'|'hide'|'notify'|'set'|'play'|'teleport'; target?: string; value?: string; }
export interface GridCodeProgram { events: Array<{event: GridCodeEvent; actions: GridCodeAction[]}>; }

export function compileGridCode(source: string): GridCodeProgram {
  const doc = parseGridCode(source);
  if (doc.diagnostics.length) throw new Error(doc.diagnostics.join(' '));
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