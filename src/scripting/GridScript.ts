export type GridEvent = 'player enters' | 'player leaves' | 'player interacts';

export type GridAction =
  | { kind: 'call'; target: string; method: string }
  | { kind: 'give_item'; recipient: 'player'; item: string }
  | { kind: 'play_sound'; asset: string }
  | { kind: 'show'; message: string };

export interface GridScript {
  objectName: string;
  handlers: Array<{ event: GridEvent; actions: GridAction[] }>;
}

export interface GridScriptDiagnostic {
  line: number;
  message: string;
  severity: 'error' | 'warning';
}

const EVENT_MAP: Record<string, GridEvent> = {
  enters: 'player enters',
  leaves: 'player leaves',
  interacts: 'player interacts',
};

const CALLS: Record<string, { target: string; method: string }> = {
  'door.open': { target: 'door', method: 'open' },
  'door.close': { target: 'door', method: 'close' },
};

function unquote(value: string, line: number, diagnostics: GridScriptDiagnostic[]) {
  if (!value.startsWith('"') || !value.endsWith('"')) {
    diagnostics.push({ line, severity: 'error', message: 'Expected a quoted string.' });
    return value;
  }
  return value.slice(1, -1);
}

export function parseGridScript(source: string): {
  script?: GridScript;
  diagnostics: GridScriptDiagnostic[];
} {
  const diagnostics: GridScriptDiagnostic[] = [];
  const lines = source.replace(/\r/g, '').split('\n');
  let objectName: string | undefined;
  let currentHandler: GridScript['handlers'][number] | undefined;
  const handlers: GridScript['handlers'] = [];

  lines.forEach((raw, index) => {
    const line = index + 1;
    const text = raw.trim();
    if (!text) return;

    if (!objectName) {
      const match = text.match(/^object\s+(".+")$/);
      if (!match) {
        diagnostics.push({ line, severity: 'error', message: 'The script must begin with object "Name".' });
        return;
      }
      objectName = unquote(match[1], line, diagnostics);
      return;
    }

    const eventMatch = text.match(/^when\s+player\s+(enters|leaves|interacts):$/);
    if (eventMatch) {
      currentHandler = { event: EVENT_MAP[eventMatch[1]], actions: [] };
      handlers.push(currentHandler);
      return;
    }

    if (!currentHandler) {
      diagnostics.push({ line, severity: 'error', message: 'Add a player event before defining an action.' });
      return;
    }

    const call = text.match(/^(door)\.(open|close)\(\)$/);
    if (call) {
      const key = `${call[1]}.${call[2]}`;
      currentHandler.actions.push({ kind: 'call', ...CALLS[key] });
      return;
    }

    const give = text.match(/^give\s+player\s+item\s+(".+")$/);
    if (give) {
      currentHandler.actions.push({ kind: 'give_item', recipient: 'player', item: unquote(give[1], line, diagnostics) });
      return;
    }

    const sound = text.match(/^play\s+sound\s+(".+")$/);
    if (sound) {
      currentHandler.actions.push({ kind: 'play_sound', asset: unquote(sound[1], line, diagnostics) });
      return;
    }

    const show = text.match(/^show\s+(".+")$/);
    if (show) {
      currentHandler.actions.push({ kind: 'show', message: unquote(show[1], line, diagnostics) });
      return;
    }

    diagnostics.push({ line, severity: 'error', message: 'Unknown action. Grid Script does not execute arbitrary code.' });
  });

  if (!objectName) return { diagnostics };
  if (handlers.length === 0) diagnostics.push({ line: lines.length, severity: 'error', message: 'Add at least one player event.' });

  return diagnostics.some(d => d.severity === 'error')
    ? { diagnostics }
    : { script: { objectName, handlers }, diagnostics };
}

export const GRID_SCRIPT_CAPABILITIES = {
  detect_players: ['player enters', 'player leaves', 'player interacts'],
  play_audio: ['play_sound'],
  economy_transaction: ['give_item'],
  object_control: ['door.open', 'door.close'],
  ui_feedback: ['show'],
} as const;

export function analyzeCapabilities(script: GridScript): string[] {
  const capabilities = new Set<string>();
  for (const handler of script.handlers) {
    for (const action of handler.actions) {
      if (action.kind === 'play_sound') capabilities.add('play_audio');
      if (action.kind === 'give_item') capabilities.add('economy_transaction');
      if (action.kind === 'show') capabilities.add('ui_feedback');
      if (action.kind === 'call') capabilities.add('object_control');
    }
    capabilities.add('detect_players');
  }
  return [...capabilities];
}
