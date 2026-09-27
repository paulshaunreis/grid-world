export class Input {
  private keys = new Set<string>();
  constructor() {
    addEventListener('keydown', e => this.keys.add(e.code));
    addEventListener('keyup', e => this.keys.delete(e.code));
  }
  isDown(code: string) { return this.keys.has(code); }
}
