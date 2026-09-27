import type { GridAction, GridScript } from './GridScript';

export interface GridRuntimeContext {
  openDoor?: () => void;
  closeDoor?: () => void;
  giveItem?: (item: string) => void;
  playSound?: (asset: string) => void;
  show?: (message: string) => void;
}

export interface GridRuntimeLimits {
  maxActionsPerEvent: number;
}

export class GridScriptRuntime {
  constructor(
    private readonly context: GridRuntimeContext,
    private readonly limits: GridRuntimeLimits = { maxActionsPerEvent: 16 },
  ) {}

  dispatch(script: GridScript, event: 'player enters' | 'player leaves' | 'player interacts') {
    const handler = script.handlers.find(candidate => candidate.event === event);
    if (!handler) return;

    if (handler.actions.length > this.limits.maxActionsPerEvent) {
      throw new Error('Grid Script action quota exceeded.');
    }

    for (const action of handler.actions) this.execute(action);
  }

  private execute(action: GridAction) {
    switch (action.kind) {
      case 'call':
        if (action.target === 'door' && action.method === 'open') this.context.openDoor?.();
        if (action.target === 'door' && action.method === 'close') this.context.closeDoor?.();
        break;
      case 'give_item':
        this.context.giveItem?.(action.item);
        break;
      case 'play_sound':
        this.context.playSound?.(action.asset);
        break;
      case 'show':
        this.context.show?.(action.message);
        break;
    }
  }
}
