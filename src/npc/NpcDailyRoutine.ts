/**
 * NpcDailyRoutine — data-driven day-cycle routines for GridWorld NPCs.
 *
 * A routine template describes a typical day as a 24-hour clock: when an NPC
 * sleeps, works, and eats. Two consumers use it:
 *
 * - GridNpcBrain.chooseAction accepts a routinePhase bias, so the day's
 *   rhythm and the NPC's needs blend. Needs still win when extreme — a
 *   starving NPC eats at 3pm, a exhausted one rests at noon.
 * - NPCSocietySystem steers visual citizens: home to sleep at night, home
 *   for meals, workplace during work hours.
 *
 * Templates are plain data (see NPC_ROLE_ROUTINES) so Paul or ChatGPT can add
 * or tune roles without touching behavior code. All ranges support
 * wrap-around (e.g. a night-watch sleep block of 3 -> 11, or work of 12 -> 2).
 */

export type NpcRoutinePhase = 'sleep' | 'work' | 'meal' | 'leisure';

export interface NpcRoutineTemplate {
  name: string;
  /** 24h clock, inclusive start. Ranges wrap past midnight. */
  sleepStartHour: number;
  /** 24h clock, exclusive end. Ranges wrap past midnight. */
  sleepEndHour: number;
  workStartHour: number;
  workEndHour: number;
  /** Center of each meal; a window extends forward from it. */
  mealHours: readonly number[];
  mealWindowHours: number;
}

export const DEFAULT_NPC_ROUTINE: NpcRoutineTemplate = {
  name: 'dayworker',
  sleepStartHour: 21,
  sleepEndHour: 6,
  workStartHour: 8,
  workEndHour: 17,
  mealHours: [7, 12, 18],
  mealWindowHours: 1,
};

export const NPC_ROLE_ROUTINES: Record<string, Partial<NpcRoutineTemplate>> = {
  NAVIGATOR: { name: 'tide-shift', sleepStartHour: 20, sleepEndHour: 4, workStartHour: 5, workEndHour: 13, mealHours: [4.5, 9, 13.5] },
  GARDENER: { name: 'sun-shift', sleepStartHour: 20, sleepEndHour: 5, workStartHour: 6, workEndHour: 15, mealHours: [5.5, 11, 16] },
  ARTISAN: { name: 'studio-shift', sleepStartHour: 23, sleepEndHour: 7, workStartHour: 9, workEndHour: 18, mealHours: [8, 13, 19] },
  KEEPER: { name: 'night-watch', sleepStartHour: 3, sleepEndHour: 11, workStartHour: 12, workEndHour: 2, mealHours: [2.5, 11.5, 18] },
  RANGER: { name: 'dawn-patrol', sleepStartHour: 21, sleepEndHour: 5, workStartHour: 6, workEndHour: 16, mealHours: [5.5, 12, 17] },
};

export function resolveNpcRoutine(role?: string): NpcRoutineTemplate {
  const overrides = (role && NPC_ROLE_ROUTINES[role]) || {};
  return { ...DEFAULT_NPC_ROUTINE, ...overrides, mealHours: overrides.mealHours ?? DEFAULT_NPC_ROUTINE.mealHours };
}

function inWindow(hour: number, start: number, end: number): boolean {
  const h = ((hour % 24) + 24) % 24;
  const s = ((start % 24) + 24) % 24;
  const e = ((end % 24) + 24) % 24;
  if (s === e) return false;
  return s < e ? h >= s && h < e : h >= s || h < e;
}

export function routinePhaseFor(template: NpcRoutineTemplate, hourOfDay: number): NpcRoutinePhase {
  const window = Math.max(0.25, template.mealWindowHours);
  if (template.mealHours.some(meal => inWindow(hourOfDay, meal, meal + window))) return 'meal';
  if (inWindow(hourOfDay, template.sleepStartHour, template.sleepEndHour)) return 'sleep';
  if (inWindow(hourOfDay, template.workStartHour, template.workEndHour)) return 'work';
  return 'leisure';
}

export function hourOfDayFromDayFraction(fraction: number): number {
  return (((fraction % 1) + 1) % 1) * 24;
}
