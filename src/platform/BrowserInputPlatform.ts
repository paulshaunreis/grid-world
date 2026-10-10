import type { GridGamepadLike, InputPlatform, InputPlatformHandlers } from '../core/InputPlatform';

/** Browser implementation of Grid input events and gamepad discovery. */
export class BrowserInputPlatform implements InputPlatform {
  subscribe(handlers: InputPlatformHandlers): () => void {
    const onKeyDown = (event: KeyboardEvent) => handlers.keyDown(event.code);
    const onKeyUp = (event: KeyboardEvent) => handlers.keyUp(event.code);
    const onGamepadConnected = () => handlers.gamepadConnected();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('gamepadconnected', onGamepadConnected);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('gamepadconnected', onGamepadConnected);
    };
  }

  getGamepads(): ArrayLike<GridGamepadLike | null> {
    return Array.from(navigator.getGamepads?.() ?? []) as Array<GridGamepadLike | null>;
  }
}
