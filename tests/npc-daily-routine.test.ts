import { strict as assert } from 'node:assert';
import {
  DEFAULT_NPC_ROUTINE,
  hourOfDayFromDayFraction,
  resolveNpcRoutine,
  routinePhaseFor,
} from '../src/npc/NpcDailyRoutine.ts';

assert.equal(hourOfDayFromDayFraction(0), 0);
assert.equal(hourOfDayFromDayFraction(0.5), 12);
assert.equal(hourOfDayFromDayFraction(1.25), 6);
assert.equal(hourOfDayFromDayFraction(-0.25), 18);

assert.equal(routinePhaseFor(DEFAULT_NPC_ROUTINE, 2), 'sleep');
assert.equal(routinePhaseFor(DEFAULT_NPC_ROUTINE, 5.99), 'sleep');
assert.equal(routinePhaseFor(DEFAULT_NPC_ROUTINE, 6), 'leisure');
assert.equal(routinePhaseFor(DEFAULT_NPC_ROUTINE, 10), 'work');
assert.equal(routinePhaseFor(DEFAULT_NPC_ROUTINE, 12.5), 'meal');
assert.equal(routinePhaseFor(DEFAULT_NPC_ROUTINE, 17), 'leisure');
assert.equal(routinePhaseFor(DEFAULT_NPC_ROUTINE, 18.5), 'meal');
assert.equal(routinePhaseFor(DEFAULT_NPC_ROUTINE, 21), 'sleep');

assert.equal(routinePhaseFor(DEFAULT_NPC_ROUTINE, 7), 'meal');
assert.equal(routinePhaseFor(DEFAULT_NPC_ROUTINE, 8), 'work');

assert.equal(resolveNpcRoutine('NAVIGATOR').workStartHour, 5);
assert.equal(resolveNpcRoutine('NAVIGATOR').name, 'tide-shift');
assert.deepEqual(resolveNpcRoutine('NAVIGATOR').mealHours, [4.5, 9, 13.5]);
assert.equal(resolveNpcRoutine('RANGER').name, 'dawn-patrol');
assert.equal(resolveNpcRoutine('UNKNOWN-ROLE').name, 'dayworker');
assert.equal(resolveNpcRoutine().name, 'dayworker');

const keeper = resolveNpcRoutine('KEEPER');
assert.equal(routinePhaseFor(keeper, 5), 'sleep');
assert.equal(routinePhaseFor(keeper, 11), 'leisure');
assert.equal(routinePhaseFor(keeper, 13), 'work');
assert.equal(routinePhaseFor(keeper, 23), 'work');
assert.equal(routinePhaseFor(keeper, 1), 'work');
assert.equal(routinePhaseFor(keeper, 2.75), 'meal');
assert.equal(routinePhaseFor(keeper, 4), 'sleep');

const navigator = resolveNpcRoutine('NAVIGATOR');
assert.equal(routinePhaseFor(navigator, 2), 'sleep');
assert.equal(routinePhaseFor(navigator, 10), 'work');
assert.equal(routinePhaseFor(navigator, 22), 'sleep');

console.log('npc-daily-routine: all assertions passed');
