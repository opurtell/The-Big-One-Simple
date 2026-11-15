// Phase 3 acceptance criteria that can be checked without a phone.
import { describe, expect, it } from 'vitest';
import { cycleRemaining, elapsedAt, resync, startCase, tap, undo } from './clock';
import { EMPTY, press, secondsNow, type Key } from './keypad';
import { formatLog } from './log';

const T0 = new Date(2026, 10, 15, 14, 32, 10).getTime();
const typed = (keys: Key[], at: number) => keys.reduce((v, k) => press(v, k, at), EMPTY);

describe('catch-up', () => {
  it('07:30 with 2 shocks + 1 adrenaline matches a stopwatch and logs "before app"', () => {
    const s = startCase(T0, secondsNow(typed(['7', '3', '0'], T0), T0), undefined, { shock: 2, adrenaline: 1 });
    expect(elapsedAt(s, T0 + 300_000)).toBe(450 + 300);
    const log = formatLog(s, T0);
    expect(log).toContain('before app · Shock ×2');
    expect(log).toContain('before app · Adrenaline ×1');
  });

  it("waiting 20 s between the last digit and Start doesn't lose them", () => {
    const v = typed(['7', '3', '0'], T0);
    const s = startCase(T0 + 20_000, secondsNow(v, T0 + 20_000));
    expect(elapsedAt(s, T0 + 20_000)).toBe(470);
  });

  it('07:30 + Evens → bar at 0:30; no pattern → 2:00', () => {
    expect(cycleRemaining(startCase(T0, 450, 'evens'), T0)).toBe(30);
    expect(cycleRemaining(startCase(T0, 450), T0)).toBe(120);
  });
});

describe('resync', () => {
  it('+0:12 from a fractional monitor time: elapsed jumps 12, bar stays, log and undo', () => {
    const s0 = tap(startCase(T0), 'shock', T0 + 60_000);
    const now = T0 + 100_400; // app shows 1:40
    const bar = cycleRemaining(s0, now);
    const s = resync(s0, 112.3, now); // typed 1:52 a moment ago
    expect(elapsedAt(s, now)).toBe(112);
    expect(cycleRemaining(s, now)).toBe(bar);
    expect(formatLog(s, now)).toContain('01:52  14:33:50  Resync +0:12');
    expect(undo(s)).toMatchObject({ pausedTime: s0.pausedTime, cycleStartElapsed: s0.cycleStartElapsed });
  });
});
