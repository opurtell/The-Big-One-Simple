// ROSC timer and post-ROSC checklists: ROSC mode, ticks, and that ticks never reach the log.
import { describe, expect, it } from 'vitest';
import { CHECKLISTS, checked, itemLabel, toggleCheck } from './checklists';
import { inRosc, parseCase, restartCycle, startCase, tap, tileStats, undo } from './clock';
import { formatLog } from './log';

const T0 = new Date(2026, 10, 15, 14, 32, 10).getTime();
const at = (sec: number) => T0 + sec * 1000;

describe('ROSC mode', () => {
  it('ROSC enters it; the ROSC timer counts from the tap', () => {
    const s = tap(startCase(T0), 'rosc', at(300));
    expect(inRosc(s)).toBe(true);
    expect(tileStats(s, 'rosc', at(372)).sinceLast).toBe(72);
  });

  it.each(['shock', 'disarm'] as const)('%s leaves it (re-arrest)', (id) => {
    const s = tap(tap(startCase(T0), 'rosc', at(300)), id, at(400));
    expect(inRosc(s)).toBe(false);
  });

  it('a bar tap leaves it, and Undo of ROSC leaves it too', () => {
    const s = tap(startCase(T0), 'rosc', at(300));
    expect(inRosc(restartCycle(s, at(400)))).toBe(false);
    expect(inRosc(undo(s))).toBe(false);
  });

  it('drugs and airway taps stay in ROSC', () => {
    const s = tap(tap(startCase(T0), 'rosc', at(300)), 'adrenaline', at(310));
    expect(inRosc(s)).toBe(true);
  });
});

describe('checklist ticks', () => {
  const rosc = tap(startCase(T0), 'rosc', at(300));

  it('toggle on, toggle off', () => {
    const on = toggleCheck(rosc, 'rosc', 'Confirm roles');
    expect(checked(on, 'rosc')).toEqual(['Confirm roles']);
    expect(checked(toggleCheck(on, 'rosc', 'Confirm roles'), 'rosc')).toEqual([]);
  });

  it('lists are kept apart', () => {
    const s = toggleCheck(rosc, 'phea', 'ECG');
    expect(checked(s, 'phea')).toEqual(['ECG']);
    expect(checked(s, 'rosc')).toEqual([]);
  });

  it('a new ROSC clears ROSC ticks but keeps PHEA ticks (upstream)', () => {
    let s = toggleCheck(toggleCheck(rosc, 'rosc', 'BGL'), 'phea', 'Suction');
    s = tap(tap(s, 'shock', at(400)), 'rosc', at(600));
    expect(checked(s, 'rosc')).toEqual([]);
    expect(checked(s, 'phea')).toEqual(['Suction']);
  });

  it("ticks aren't logged, aren't undone, and survive a reload", () => {
    const s = toggleCheck(rosc, 'rosc', 'BGL');
    expect(formatLog(s, at(400))).toBe(formatLog(rosc, at(400)));
    expect(undo(s).checks).toEqual(s.checks);
    expect(checked(parseCase(JSON.stringify(s))!, 'rosc')).toEqual(['BGL']);
  });

  it('cases saved before checklists load with no ticks', () => {
    expect(checked(parseCase(JSON.stringify(rosc))!, 'phea')).toEqual([]);
  });
});

describe('checklist content (ported from upstream)', () => {
  it('labels are unique within each list, so a tick maps to one row', () => {
    for (const { sections } of Object.values(CHECKLISTS)) {
      const labels = sections.flatMap((x) => x.items.map(itemLabel));
      expect(new Set(labels).size).toBe(labels.length);
    }
  });

  it('has upstream section counts: ROSC 4, PHEA 6', () => {
    expect(CHECKLISTS.rosc.sections).toHaveLength(4);
    expect(CHECKLISTS.phea.sections).toHaveLength(6);
  });
});
