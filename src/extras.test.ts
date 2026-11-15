import { describe, expect, it } from 'vitest';
import { cycleRemaining, extraCounts, logExtra, parseCase, startCase, tap, undo, undoable } from './clock';
import { EXTRAS, EXTRA_NAMES } from './extras';
import { entryLabel, extraTotals, formatLog } from './log';

const T0 = new Date(2026, 10, 15, 14, 32, 10).getTime();

describe('More list', () => {
  it('holds 18 meds, 5 airway and 4 other items, with no duplicates', () => {
    expect(EXTRAS.map((g) => g.items.length)).toEqual([18, 5, 4]);
    expect(new Set(EXTRA_NAMES).size).toBe(27);
  });

  it('leaves out what a tile already logs', () => {
    for (const n of ['Adrenaline push', 'Amiodarone', 'LMA', 'ETT', 'IV access', 'IO access']) expect(EXTRA_NAMES).not.toContain(n);
  });

  it('logs an item with its time and leaves the cycle bar alone', () => {
    const s0 = startCase(T0);
    const s = logExtra(s0, 'Calcium', T0 + 65_000);
    const e = s.entries[s.entries.length - 1];
    expect(e).toMatchObject({ kind: 'extra', item: 'Calcium', elapsed: 65, at: T0 + 65_000 });
    expect(cycleRemaining(s, T0 + 65_000)).toBe(cycleRemaining(s0, T0 + 65_000));
    expect(entryLabel(e)).toBe('Calcium');
  });

  it('ignores a double tap within 1 s, per item', () => {
    let s = logExtra(startCase(T0), 'Calcium', T0 + 5000);
    s = logExtra(s, 'Calcium', T0 + 5600);
    s = logExtra(s, 'Magnesium', T0 + 5700);
    s = logExtra(s, 'Calcium', T0 + 7000);
    expect([...extraCounts(s)]).toEqual([['Calcium', 2], ['Magnesium', 1]]);
  });

  it('is undone like a tile tap', () => {
    const s0 = tap(startCase(T0), 'shock', T0 + 1000);
    const s = logExtra(s0, 'Ketamine', T0 + 9000);
    expect(entryLabel(undoable(s)!)).toBe('Ketamine');
    expect(undo(s)).toEqual(s0);
  });

  it('shows in the totals (list order, after the tiles) and in time order in the copied log', () => {
    let s = tap(startCase(T0), 'shock', T0 + 10_000);
    s = logExtra(s, 'Sodium bicarbonate', T0 + 20_000);
    s = logExtra(s, 'Calcium', T0 + 30_000);
    expect(extraTotals(s)).toEqual(['Calcium ×1', 'Sodium bicarbonate ×1']);
    const text = formatLog(s, T0 + 60_000);
    expect(text).toContain('Shock ×1 · Calcium ×1 · Sodium bicarbonate ×1');
    expect(text).toContain('00:20  14:32:30  Sodium bicarbonate\n00:30  14:32:40  Calcium');
    expect(text).not.toMatch(/\d\s?(mg|mcg|mL)\b/);
  });

  it('still loads a case saved before the More list existed', () => {
    const old = tap(startCase(T0), 'adrenaline', T0 + 3000);
    const s = parseCase(JSON.stringify(old))!;
    expect(extraTotals(s)).toEqual([]);
    expect(logExtra(s, 'Oxygen', T0 + 9000).entries).toHaveLength(3);
  });
});
