// SPDX-License-Identifier: Apache-2.0
// Pure clock and case logic. No React, no timers: every function takes `now` (wall ms),
// so time is always derived from the wall clock and never counted (ported from upstream
// App.tsx time sync; see docs/UPSTREAM.md).

import { TILE_BY_ID, isTileId, type TileId } from './tiles';

export const CYCLE_SECONDS = 120;
export const DOUBLE_TAP_MS = 1000;
export const STALE_MS = 3 * 60 * 60 * 1000;
export const SHOCK_TAG_MS = 5000;

export type Pattern = 'evens' | 'odds' | 'half-evens' | 'half-odds';
export type Rhythm = 'VF' | 'pVT';

export type ClockSnap = { startTime: number; pausedTime: number; cycleStartElapsed: number | null };

export type Entry = {
  id: string;
  kind: TileId | 'start' | 'cycle' | 'resync';
  elapsed: number; // seconds, monitor-aligned at time of tap
  at: number; // wall ms (log clock column)
  prior?: number; // catch-up count; shown as "before app"
  delta?: number; // resync seconds
  rhythm?: Rhythm; // optional Shock tag
  before: ClockSnap; // restored by Undo
};

export type CaseState = ClockSnap & {
  status: 'running' | 'ended';
  startClockTime: number; // wall ms at elapsed 0
  entries: Entry[];
  endedAt?: number;
};

let idSeq = 0;
const newId = (now: number) => `${now.toString(36)}-${(idSeq++).toString(36)}`;

const snap = (s: CaseState): ClockSnap => ({
  startTime: s.startTime,
  pausedTime: s.pausedTime,
  cycleStartElapsed: s.cycleStartElapsed,
});

/** Seconds on the monitor. Frozen at `endedAt` once the case is closed. */
export function elapsedAt(s: ClockSnap & { endedAt?: number }, now: number): number {
  const t = s.endedAt ?? now;
  return Math.floor((t - s.startTime + s.pausedTime) / 1000);
}

/** Upstream `calcNextIntervalTarget` (App.tsx L2252), ported as is. */
export function nextPatternTarget(elapsedSecs: number, pattern: Pattern): number {
  const offsets: Record<Pattern, number> = { evens: 0, odds: 60, 'half-evens': 30, 'half-odds': 90 };
  const period = CYCLE_SECONDS;
  const phase = (((elapsedSecs - offsets[pattern]) % period) + period) % period;
  return elapsedSecs + (period - phase);
}

/**
 * Starts a case. `elapsed` may be fractional: catch-up passes the typed monitor time plus
 * the seconds since the last digit was typed, so a slow tap on Start loses nothing.
 */
export function startCase(
  now: number,
  elapsed = 0,
  pattern?: Pattern,
  priors: Partial<Record<TileId, number>> = {},
): CaseState {
  const whole = Math.floor(elapsed);
  const cycleStartElapsed = pattern ? nextPatternTarget(whole, pattern) - CYCLE_SECONDS : whole;
  const startClockTime = now - elapsed * 1000;
  const clock: ClockSnap = { startTime: now, pausedTime: elapsed * 1000, cycleStartElapsed };
  const entries: Entry[] = [];
  for (const [kind, count] of Object.entries(priors)) {
    if (!isTileId(kind) || !count || count < 1) continue;
    entries.push({ id: newId(now), kind, elapsed: 0, at: startClockTime, prior: count, before: clock });
  }
  entries.push({ id: newId(now), kind: 'start', elapsed: whole, at: now, before: clock });
  return { ...clock, status: 'running', startClockTime, entries };
}

/** True if this case began as a catch-up (monitor time already running, or priors entered). */
export const isCatchup = (s: CaseState) =>
  s.entries.some((e) => e.prior) || (s.entries.find((e) => e.kind === 'start')?.elapsed ?? 0) > 0;

export function tap(s: CaseState, tileId: TileId, now: number): CaseState {
  const last = [...s.entries].reverse().find((e) => e.kind === tileId && !e.prior);
  if (last && now - last.at < DOUBLE_TAP_MS) return s; // gloved double-tap
  const elapsed = elapsedAt(s, now);
  const tile = TILE_BY_ID[tileId];
  const cycleStartElapsed = tile.stopsCycle ? null : tile.resetsCycle ? elapsed : s.cycleStartElapsed;
  const entry: Entry = { id: newId(now), kind: tileId, elapsed, at: now, before: snap(s) };
  return { ...s, cycleStartElapsed, entries: [...s.entries, entry] };
}

/** Sets or changes the rhythm on a Shock in place, so one Undo still removes the whole shock. */
export function tagShock(s: CaseState, entryId: string, rhythm: Rhythm): CaseState {
  if (!s.entries.some((e) => e.id === entryId && e.kind === 'shock')) return s;
  return { ...s, entries: s.entries.map((e) => (e.id === entryId ? { ...e, rhythm } : e)) };
}

export function restartCycle(s: CaseState, now: number): CaseState {
  const elapsed = elapsedAt(s, now);
  const entry: Entry = { id: newId(now), kind: 'cycle', elapsed, at: now, before: snap(s) };
  return { ...s, cycleStartElapsed: elapsed, entries: [...s.entries, entry] };
}

/**
 * Re-bases elapsed time onto what the monitor shows. The cycle start shifts by the same
 * delta so the bar doesn't jump. Log clock times stay the phone's real time (DESIGN #18).
 */
export function resync(s: CaseState, monitorElapsed: number, now: number): CaseState {
  // Whole seconds only (the monitor shows whole seconds). Shifting both the clock and the
  // cycle start by the same integer keeps the bar exactly where it was.
  const delta = Math.round(monitorElapsed - (now - s.startTime + s.pausedTime) / 1000);
  const entry: Entry = {
    id: newId(now), kind: 'resync', elapsed: elapsedAt(s, now) + delta, at: now, delta, before: snap(s),
  };
  return {
    ...s,
    pausedTime: s.pausedTime + delta * 1000,
    cycleStartElapsed: s.cycleStartElapsed === null ? null : s.cycleStartElapsed + delta,
    entries: [...s.entries, entry],
  };
}

/** The newest entry Undo would remove, or undefined (priors and Start can't be undone). */
export function undoable(s: CaseState): Entry | undefined {
  const last = s.entries[s.entries.length - 1];
  return last && last.kind !== 'start' && !last.prior ? last : undefined;
}

export function undo(s: CaseState): CaseState {
  const last = undoable(s);
  if (!last) return s;
  return { ...s, ...last.before, entries: s.entries.slice(0, -1) };
}

/** Closes the case ("New case"). Elapsed freezes at `now`. */
export function endCase(s: CaseState, now: number): CaseState {
  return s.status === 'ended' ? s : { ...s, status: 'ended', endedAt: now };
}

/**
 * The Shock the VF | pVT tag is offered for: the newest entry, if it's a live Shock under
 * 5 s old. Any later entry (another tile, bar tap, resync) closes the tag (DESIGN #6a).
 */
export function pendingShockTag(s: CaseState, now: number): Entry | undefined {
  const last = s.entries[s.entries.length - 1];
  if (s.status !== 'running' || !last || last.kind !== 'shock' || last.prior) return undefined;
  return now - last.at < SHOCK_TAG_MS ? last : undefined;
}

/** Seconds left in the 2-min cycle (negative = overtime), or null after ROSC. */
export function cycleRemaining(s: CaseState, now: number): number | null {
  if (s.cycleStartElapsed === null) return null;
  return CYCLE_SECONDS - (elapsedAt(s, now) - s.cycleStartElapsed);
}

export function tileStats(s: CaseState, tileId: TileId, now: number) {
  let count = 0;
  let lastElapsed: number | null = null;
  for (const e of s.entries) {
    if (e.kind !== tileId) continue;
    if (e.prior) count += e.prior;
    else {
      count += 1;
      lastElapsed = e.elapsed;
    }
  }
  // Priors have no known time, so they don't count towards "time since last".
  const sinceLast = lastElapsed === null ? null : Math.max(0, elapsedAt(s, now) - lastElapsed);
  return { count, sinceLast };
}

export function isStale(s: CaseState, now: number): boolean {
  const last = s.entries[s.entries.length - 1];
  return now - (last?.at ?? s.startTime) > STALE_MS;
}

/**
 * `m:ss` (or `mm:ss` with pad), `h:mm:ss` from 60 min. A negative value is cycle
 * overtime and reads `+m:ss`.
 */
export function formatTime(sec: number, pad = false): string {
  const sign = sec < 0 ? '+' : '';
  const t = Math.abs(Math.floor(sec));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const ss = String(t % 60).padStart(2, '0');
  if (h > 0) return `${sign}${h}:${String(m).padStart(2, '0')}:${ss}`;
  return `${sign}${pad ? String(m).padStart(2, '0') : m}:${ss}`;
}

/** Parses saved JSON back into a case, or null if it's missing or malformed. */
export function parseCase(raw: string | null): CaseState | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    const ok =
      s &&
      typeof s.startTime === 'number' &&
      typeof s.pausedTime === 'number' &&
      typeof s.startClockTime === 'number' &&
      (s.status === 'running' || s.status === 'ended') &&
      Array.isArray(s.entries);
    return ok ? (s as CaseState) : null;
  } catch {
    return null;
  }
}
