import { describe, expect, it } from 'vitest';
import {
  cycleRemaining, elapsedAt, formatTime, isStale, nextPatternTarget, parseCase, pendingTag, resync,
  restartCycle, startCase, tagEntry, tap, tileStats, undo, undoable,
} from './clock';

const T0 = new Date(2026, 10, 15, 14, 32, 10).getTime();
const sec = (n: number) => T0 + n * 1000;

describe('elapsed time', () => {
  it('is correct after a simulated 10-min suspension (no ticks)', () => {
    const s = startCase(T0);
    expect(elapsedAt(s, sec(600))).toBe(600);
    expect(elapsedAt(s, sec(600.9))).toBe(600);
  });

  it('survives a reload (serialise, parse, same elapsed)', () => {
    let s = startCase(T0, 90);
    s = tap(s, 'adrenaline', sec(30));
    const back = parseCase(JSON.stringify(s));
    expect(back).toEqual(s);
    expect(elapsedAt(back!, sec(700))).toBe(elapsedAt(s, sec(700)));
    expect(elapsedAt(back!, sec(700))).toBe(790);
  });

  it('rejects malformed saved state', () => {
    expect(parseCase(null)).toBeNull();
    expect(parseCase('{bad')).toBeNull();
    expect(parseCase('{"startTime":1}')).toBeNull();
  });
});

describe('2-min cycle', () => {
  it('Shock resets the cycle, and Undo restores the previous cycleStartElapsed', () => {
    let s = startCase(T0);
    expect(cycleRemaining(s, sec(100))).toBe(20);
    s = tap(s, 'shock', sec(100));
    expect(s.cycleStartElapsed).toBe(100);
    expect(cycleRemaining(s, sec(100))).toBe(120);
    s = undo(s);
    expect(s.cycleStartElapsed).toBe(0);
    expect(cycleRemaining(s, sec(130))).toBe(-10); // overtime
  });

  it('Disarm and a bar tap restart it too, and a bar tap can be undone', () => {
    let s = tap(startCase(T0), 'disarm', sec(50));
    expect(s.cycleStartElapsed).toBe(50);
    s = restartCycle(s, sec(80));
    expect(s.cycleStartElapsed).toBe(80);
    s = undo(s);
    expect(s.cycleStartElapsed).toBe(50);
  });

  it('ROSC stops it, and a following Shock restarts it at 120', () => {
    let s = tap(startCase(T0), 'rosc', sec(200));
    expect(cycleRemaining(s, sec(250))).toBeNull();
    s = tap(s, 'shock', sec(300));
    expect(cycleRemaining(s, sec(300))).toBe(120);
  });

  it('catch-up 07:30 with a pattern lines the bar up', () => {
    expect(cycleRemaining(startCase(T0, 450, 'evens'), T0)).toBe(30);
    expect(cycleRemaining(startCase(T0, 450, 'odds'), T0)).toBe(90);
    expect(cycleRemaining(startCase(T0, 450), T0)).toBe(120);
    expect(nextPatternTarget(450, 'half-evens')).toBe(510);
    expect(nextPatternTarget(450, 'half-odds')).toBe(570);
  });
});

describe('resync', () => {
  it("doesn't jump the cycle bar", () => {
    let s = tap(startCase(T0), 'shock', sec(60));
    const before = cycleRemaining(s, sec(100));
    s = resync(s, 112, sec(100)); // monitor is 12 s ahead
    expect(elapsedAt(s, sec(100))).toBe(112);
    expect(cycleRemaining(s, sec(100))).toBe(before);
    expect(cycleRemaining(s, sec(110))).toBe(before! - 10);
    expect(s.entries.at(-1)).toMatchObject({ kind: 'resync', delta: 12 });
  });

  it('Undo after resync restores the old clock', () => {
    const s0 = tap(startCase(T0), 'shock', sec(60));
    const s = undo(resync(s0, 50, sec(100)));
    expect(elapsedAt(s, sec(200))).toBe(200);
    expect(s.cycleStartElapsed).toBe(60);
    expect(s.entries).toEqual(s0.entries);
  });
});

describe('taps and undo', () => {
  it('ignores a double tap within 1 s and logs one at 1.1 s', () => {
    let s = tap(startCase(T0), 'adrenaline', sec(10));
    expect(tap(s, 'adrenaline', sec(10.9))).toBe(s);
    s = tap(s, 'adrenaline', sec(11.1));
    expect(tileStats(s, 'adrenaline', sec(12)).count).toBe(2);
    // A different tile isn't guarded
    expect(tap(s, 'shock', sec(11.2)).entries).toHaveLength(s.entries.length + 1);
  });

  it('tagEntry sets and changes VF/pVT, and Undo after tagging removes the shock', () => {
    let s = tap(startCase(T0), 'shock', sec(30));
    const id = s.entries.at(-1)!.id;
    s = tagEntry(s, id, 'VF');
    expect(s.entries.at(-1)!.tag).toBe('VF');
    s = tagEntry(s, id, 'pVT');
    expect(s.entries.at(-1)!.tag).toBe('pVT');
    expect(s.entries.filter((e) => e.kind === 'shock')).toHaveLength(1);
    s = undo(s);
    expect(s.entries.some((e) => e.kind === 'shock')).toBe(false);
  });

  it("can't undo the start or before-app entries", () => {
    const s = startCase(T0, 300, undefined, { shock: 2 });
    expect(undoable(s)).toBeUndefined();
    expect(undo(s)).toBe(s);
  });

  it('counts priors but ignores them for time since last', () => {
    let s = startCase(T0, 300, undefined, { adrenaline: 1 });
    expect(tileStats(s, 'adrenaline', sec(10))).toEqual({ count: 1, sinceLast: null });
    s = tap(s, 'adrenaline', sec(20));
    expect(tileStats(s, 'adrenaline', sec(241))).toEqual({ count: 2, sinceLast: 221 });
  });
});

describe('stale case', () => {
  it('is detected after 3 h with no taps', () => {
    const s = tap(startCase(T0), 'shock', sec(60));
    expect(isStale(s, sec(60 + 3 * 3600 - 1))).toBe(false);
    expect(isStale(s, sec(60 + 3 * 3600 + 1))).toBe(true);
  });
});

describe('formatTime', () => {
  it('formats m:ss, mm:ss, h:mm:ss and overtime', () => {
    expect(formatTime(221)).toBe('3:41');
    expect(formatTime(450, true)).toBe('07:30');
    expect(formatTime(3725)).toBe('1:02:05');
    expect(formatTime(-14)).toBe('+0:14');
  });
});

describe('tag window', () => {
  it('offers IV | IO and LMA | ETT the same way, and rejects tags from another tile', () => {
    let s = tap(startCase(T0), 'ivio', sec(40));
    const iv = s.entries.at(-1)!.id;
    expect(pendingTag(s, sec(44.9))?.kind).toBe('ivio');
    expect(pendingTag(s, sec(45))).toBeUndefined();
    expect(tagEntry(s, iv, 'VF')).toBe(s);
    s = tagEntry(s, iv, 'IO');
    expect(s.entries.at(-1)!.tag).toBe('IO');
    s = tap(s, 'lma', sec(50));
    expect(pendingTag(s, sec(50))?.kind).toBe('lma');
    s = tagEntry(s, s.entries.at(-1)!.id, 'ETT');
    expect(s.entries.at(-1)!.tag).toBe('ETT');
    expect(undo(s).entries.at(-1)!.tag).toBe('IO');
  });

  it('is not offered for untagged tiles', () => {
    expect(pendingTag(tap(startCase(T0), 'adrenaline', sec(10)), sec(10))).toBeUndefined();
  });

  it('loads a saved case whose Shock tag was stored as rhythm', () => {
    const s = tap(startCase(T0), 'shock', sec(30));
    const old = { ...s, entries: s.entries.map((e) => (e.kind === 'shock' ? { ...e, rhythm: 'VF' } : e)) };
    const back = parseCase(JSON.stringify(old))!;
    expect(back.entries.at(-1)!.tag).toBe('VF');
    expect('rhythm' in back.entries.at(-1)!).toBe(false);
  });


  it('offers the tag for 5 s after a Shock, then closes', () => {
    const s = tap(startCase(T0), 'shock', sec(60));
    expect(pendingTag(s, sec(60))?.kind).toBe('shock');
    expect(pendingTag(s, sec(64.9))).toBeDefined();
    expect(pendingTag(s, sec(65))).toBeUndefined();
  });

  it('closes when any other tile or a bar tap follows, and stays open after tagging', () => {
    let s = tap(startCase(T0), 'shock', sec(60));
    const id = s.entries[s.entries.length - 1].id;
    s = tagEntry(s, id, 'VF');
    expect(pendingTag(s, sec(62))?.tag).toBe('VF');
    expect(pendingTag(tap(s, 'adrenaline', sec(62)), sec(62))).toBeUndefined();
    expect(pendingTag(restartCycle(s, sec(62)), sec(62))).toBeUndefined();
  });

  it('is never offered for "before app" shocks', () => {
    expect(pendingTag(startCase(T0, 90, undefined, { shock: 2 }), T0)).toBeUndefined();
  });
});

describe('ROSC then re-arrest', () => {
  it('Shock after ROSC restarts the bar', () => {
    let s = tap(startCase(T0), 'rosc', sec(300));
    expect(cycleRemaining(s, sec(310))).toBeNull();
    s = tap(s, 'shock', sec(400));
    expect(cycleRemaining(s, sec(400))).toBe(120);
  });
});
