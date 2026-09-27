import type { GridAction, GridEvent, GridScript } from './GridScript';

export interface GridPreviewStep {
  event: GridEvent;
  action: GridAction;
}

export interface GridPreviewResult {
  script: GridScript;
  steps: GridPreviewStep[];
}

export function previewGridScript(script: GridScript): GridPreviewResult {
  const steps: GridPreviewStep[] = [];
  for (const handler of script.handlers) {
    for (const action of handler.actions) steps.push({ event: handler.event, action });
  }
  return { script, steps };
}

export function formatPreviewAction(action: GridAction): string {
  switch (action.kind) {
    case 'call': return `${action.target}.${action.method}()`;
    case 'give_item': return `give player item "${action.item}"`;
    case 'play_sound': return `play sound "${action.asset}"`;
    case 'show': return `show "${action.message}"`;
  }
}
