import { describe, expect, it } from 'vitest';
import { drugDue, restartCycle, startCase, tap, undo } from './clock';

const T0 = new Date(2026, 10, 15, 14, 32, 10).getTime();
const sec = (n: number) => T0 + n * 1000;

describe('drug countdowns (upstream timers)', () => {
  it('adrenaline is due 4:00 after the last dose and goes negative when overdue', () => {
    let s = startCase(T0);
    expect(drugDue(s, 'adrenaline', sec(10))).toBeNull();
    s = tap(s, 'adrenaline', sec(10));
    expect(drugDue(s, 'adrenaline', sec(10))).toBe(240);
    expect(drugDue(s, 'adrenaline', sec(250))).toBe(0);
    expect(drugDue(s, 'adrenaline', sec(264))).toBe(-14);
    s = tap(s, 'adrenaline', sec(300));
    expect(drugDue(s, 'adrenaline', sec(300))).toBe(240);
    s = undo(s);
    expect(drugDue(s, 'adrenaline', sec(300))).toBe(-50);
  });

  it('amiodarone is due 5:00 after the first dose and hidden after the second', () => {
    let s = startCase(T0);
    s = tap(s, 'amiodarone', sec(60));
    expect(drugDue(s, 'amiodarone', sec(120))).toBe(240);
    s = tap(s, 'amiodarone', sec(360));
    expect(drugDue(s, 'amiodarone', sec(400))).toBeNull();
  });

  it('counts catch-up doses: priors alone are unknown, a prior amiodarone is the first dose', () => {
    let s = startCase(T0, 300, undefined, { adrenaline: 2, amiodarone: 1 });
    expect(drugDue(s, 'adrenaline', sec(10))).toBeNull();
    expect(drugDue(s, 'amiodarone', sec(10))).toBeNull();
    s = tap(s, 'amiodarone', sec(20));
    expect(drugDue(s, 'amiodarone', sec(30))).toBeNull(); // that was the second dose
  });

  it('is hidden during ROSC and comes back on re-arrest if not yet overdue', () => {
    let s = startCase(T0);
    s = tap(s, 'adrenaline', sec(0));
    s = tap(s, 'rosc', sec(60));
    expect(drugDue(s, 'adrenaline', sec(90))).toBeNull();
    s = tap(s, 'disarm', sec(120));
    expect(drugDue(s, 'adrenaline', sec(120))).toBe(120);
  });

  it('stays hidden after re-arrest if it was already overdue (upstream wipe) until the next dose', () => {
    let s = startCase(T0);
    s = tap(s, 'adrenaline', sec(0));
    s = tap(s, 'rosc', sec(60));
    s = restartCycle(s, sec(400));
    expect(drugDue(s, 'adrenaline', sec(410))).toBeNull();
    s = tap(s, 'adrenaline', sec(420));
    expect(drugDue(s, 'adrenaline', sec(420))).toBe(240);
  });

  it('other tiles have no countdown', () => {
    const s = tap(startCase(T0), 'shock', sec(5));
    expect(drugDue(s, 'shock', sec(10))).toBeNull();
  });
});
