import type { GridGamepadLike, InputPlatform } from './InputPlatform';

export type GridControlMode = 'KEYBOARD' | 'CONTROLLER' | 'TOUCH';

export class Input {
  private readonly keys = new Set<string>();
  private mode: GridControlMode = 'KEYBOARD';
  private readonly axes = { x: 0, y: 0, lookX: 0, lookY: 0 };
  private readonly buttons = new Set<string>();
  private unsubscribePlatform: (() => void) | null;

  constructor(private readonly platform: InputPlatform) {
    this.unsubscribePlatform = platform.subscribe({
      keyDown: code => {
        this.keys.add(code);
        if (code.startsWith('Key') || code.startsWith('Arrow')) this.mode = 'KEYBOARD';
      },
      keyUp: code => this.keys.delete(code),
      gamepadConnected: () => { this.mode = 'CONTROLLER'; },
    });
  }

  dispose() {
    this.unsubscribePlatform?.();
    this.unsubscribePlatform = null;
    this.keys.clear();
    this.buttons.clear();
  }

  setMode(mode: GridControlMode) { this.mode = mode; }
  get controlMode() { return this.mode; }
  setMove(x: number, y: number) {
    this.axes.x = Math.max(-1, Math.min(1, x));
    this.axes.y = Math.max(-1, Math.min(1, y));
  }
  setLook(x: number, y: number) { this.axes.lookX = x; this.axes.lookY = y; }
  press(action: string) { this.buttons.add(action); }
  release(action: string) { this.buttons.delete(action); }
  isActionDown(action: string) { return this.buttons.has(action); }
  axisX() { return this.axes.x; }
  axisY() { return this.axes.y; }
  lookX() { return this.axes.lookX; }
  lookY() { return this.axes.lookY; }

  private activeGamepad(): GridGamepadLike | null {
    return Array.from(this.platform.getGamepads()).find((pad): pad is GridGamepadLike => pad !== null) ?? null;
  }

  isDown(code: string) {
    if (this.keys.has(code)) return true;
    const pad = this.activeGamepad();
    if (!pad) return false;
    const map: Record<string, string> = {
      KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down',
      KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
      Space: 'jump', ShiftLeft: 'sprint',
    };
    const action = map[code];
    if (action === 'up') return pad.axes[1] < -0.28;
    if (action === 'down') return pad.axes[1] > 0.28;
    if (action === 'left') return pad.axes[0] < -0.28;
    if (action === 'right') return pad.axes[0] > 0.28;
    if (action === 'jump') return !!pad.buttons[0]?.pressed;
    if (action === 'sprint') return !!pad.buttons[10]?.pressed;
    return false;
  }

  moveVector() {
    if (this.mode === 'TOUCH' || this.mode === 'CONTROLLER') return { x: this.axisX(), y: this.axisY() };
    return { x: Number(this.isDown('KeyD')) - Number(this.isDown('KeyA')), y: Number(this.isDown('KeyW')) - Number(this.isDown('KeyS')) };
  }

  update() {
    if (this.mode !== 'CONTROLLER') return;
    const pad = this.activeGamepad();
    if (!pad) return;
    const deadZone = (value: number) => Math.abs(value) < 0.14 ? 0 : value;
    this.axes.x = deadZone(pad.axes[0] || 0);
    this.axes.y = -deadZone(pad.axes[1] || 0);
    this.axes.lookX = deadZone(pad.axes[2] || 0);
    this.axes.lookY = deadZone(pad.axes[3] || 0);
  }
}
