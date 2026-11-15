// SPDX-License-Identifier: Apache-2.0
// Holds the case, persists it on every change, and keeps the screen awake while a case
// runs. Time is never counted here: the interval only re-renders (see clock.ts).

import { useCallback, useEffect, useState } from 'react';
import { toggleCheck, type ChecklistId } from './checklists';
import * as clock from './clock';
import type { CaseState, Pattern } from './clock';
import type { Tag, TileId } from './tiles';

export const STATE_KEY = 'theBigOneSimpleState';
export const LAST_KEY = 'theBigOneSimpleLastCase';

function read(key: string): CaseState | null {
  try {
    return clock.parseCase(localStorage.getItem(key));
  } catch {
    return null; // storage blocked (private mode): the app still works, just without persistence
  }
}

function write(key: string, s: CaseState | null) {
  try {
    if (s) localStorage.setItem(key, JSON.stringify(s));
    else localStorage.removeItem(key);
  } catch {
    /* storage full or blocked: nothing more to do */
  }
}

/** Restores a saved case. One untouched for 3 h is closed into "Last case" (DESIGN #23). */
function restore(now: number): { current: CaseState | null; last: CaseState | null } {
  const saved = read(STATE_KEY);
  const last = read(LAST_KEY);
  if (saved && saved.status === 'running' && !clock.isStale(saved, now)) return { current: saved, last };
  if (saved) {
    const lastAt = saved.entries[saved.entries.length - 1]?.at ?? now;
    const closed = clock.endCase(saved, Math.min(now, lastAt));
    write(LAST_KEY, closed);
    write(STATE_KEY, null);
    return { current: null, last: closed };
  }
  return { current: null, last };
}

function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const wakeLock = (navigator as Navigator & { wakeLock?: { request(t: 'screen'): Promise<WakeLockSentinel> } }).wakeLock;
    if (!wakeLock) return;
    let sentinel: WakeLockSentinel | null = null;
    let stopped = false;
    const acquire = async () => {
      if (stopped || sentinel || document.visibilityState !== 'visible') return;
      try {
        const lock = await wakeLock.request('screen');
        if (stopped) return void lock.release().catch(() => {});
        sentinel = lock;
        lock.addEventListener('release', () => {
          if (sentinel === lock) sentinel = null;
        });
      } catch {
        /* refused by the phone: nothing more to do */
      }
    };
    // The phone drops the lock whenever the page is hidden, so take it again on return.
    const onVisible = () => void acquire();
    acquire();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      document.removeEventListener('visibilitychange', onVisible);
      sentinel?.release().catch(() => {});
      sentinel = null;
    };
  }, [active]);
}

const buzz = () => {
  try {
    navigator.vibrate?.(30); // iOS web apps can't vibrate; the tile flash is the main cue
  } catch {
    /* unsupported */
  }
};

export function useCase() {
  const [init] = useState(() => restore(Date.now()));
  const [current, setCurrent] = useState<CaseState | null>(init.current);
  const [last, setLast] = useState<CaseState | null>(init.last);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => write(STATE_KEY, current), [current]);
  useEffect(() => write(LAST_KEY, last), [last]);

  // Re-render only. Phones throttle timers when locked, so nothing is counted here.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    const onVisible = () => setNow(Date.now());
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  useWakeLock(current?.status === 'running');

  // Every action reads Date.now() at the moment of the tap, not the last render's `now`.
  const update = useCallback((fn: (s: CaseState, t: number) => CaseState) => {
    const t = Date.now();
    setNow(t);
    setCurrent((s) => (s ? fn(s, t) : s));
  }, []);

  const begin = useCallback((elapsed = 0, pattern?: Pattern, priors?: Partial<Record<TileId, number>>) => {
    const t = Date.now();
    setNow(t);
    setLast(null); // one Last case, kept until the next case starts (DESIGN #22)
    setCurrent(clock.startCase(t, elapsed, pattern, priors));
  }, []);

  const newCase = useCallback(() => {
    if (current) setLast(clock.endCase(current, Date.now()));
    setCurrent(null);
  }, [current]);

  return {
    now,
    current,
    last,
    startNow: () => begin(0),
    startCatchup: begin,
    tap: (id: TileId) => {
      buzz();
      update((s, t) => clock.tap(s, id, t));
    },
    tagEntry: (entryId: string, tag: Tag) => update((s) => clock.tagEntry(s, entryId, tag)),
    toggleCheck: (list: ChecklistId, label: string) => update((s) => toggleCheck(s, list, label)),
    restartCycle: () => update((s, t) => clock.restartCycle(s, t)),
    resync: (monitorElapsed: number) => update((s, t) => clock.resync(s, monitorElapsed, t)),
    undo: () => update((s) => clock.undo(s)),
    newCase,
  };
}
