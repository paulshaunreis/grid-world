export function createHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return "grid_" + (h >>> 0).toString(16).padStart(8, "0");
}

export function createStableId(namespace: string, seed: string): string {
  return createHash(namespace + ":" + seed);
}
