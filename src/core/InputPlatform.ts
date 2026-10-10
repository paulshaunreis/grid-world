export interface GridGamepadButtonLike {
  pressed: boolean;
}

export interface GridGamepadLike {
  axes: ArrayLike<number>;
  buttons: ArrayLike<GridGamepadButtonLike | null>;
}

export interface InputPlatformHandlers {
  keyDown(code: string): void;
  keyUp(code: string): void;
  gamepadConnected(): void;
}

/** Platform capabilities needed by Grid input; no DOM types leak into Input. */
export interface InputPlatform {
  subscribe(handlers: InputPlatformHandlers): () => void;
  getGamepads(): ArrayLike<GridGamepadLike | null>;
}
