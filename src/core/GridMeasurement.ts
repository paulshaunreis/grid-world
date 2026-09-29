export const GRID_METERS_PER_UNIT = 1;
export const GRID_FEET_PER_UNIT = 3.28084;
export const GRID_INCHES_PER_UNIT = 39.3701;

export type GridUnit = 'grid' | 'm' | 'ft' | 'in';

export function gridLength(value: number, unit: GridUnit = 'grid'): number {
  if (unit === 'ft') return value * GRID_FEET_PER_UNIT;
  if (unit === 'in') return value * GRID_INCHES_PER_UNIT;
  return value;
}

export function formatGridLength(meters: number, preference: GridUnit = 'grid'): string {
  const value = preference === 'ft' ? meters * GRID_FEET_PER_UNIT
    : preference === 'in' ? meters * GRID_INCHES_PER_UNIT
    : meters;
  const label = preference === 'grid' ? 'GU' : preference;
  return `${Number(value.toFixed(preference === 'in' ? 0 : 2))} ${label}`;
}

export function explainGridLength(meters: number): string {
  return `${formatGridLength(meters, 'grid')} · ${formatGridLength(meters, 'm')} · ${formatGridLength(meters, 'ft')}`;
}

/** Grid World canonical measurement: 1 GU = 1 metre. */
export const GridMeasurement = {
  meters: (gu: number) => gu,
  feet: (gu: number) => gu * GRID_FEET_PER_UNIT,
  inches: (gu: number) => gu * GRID_INCHES_PER_UNIT,
  explain: explainGridLength,
};