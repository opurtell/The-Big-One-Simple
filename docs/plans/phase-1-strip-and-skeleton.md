# Phase 1: Strip and skeleton

**Status:** awaiting Oscar's approval · 15/11/2026
**Inputs:** `docs/DESIGN.md`, `docs/UPSTREAM.md`, the mock-ups (Claude artifact "Big One Simple mock-ups").

## Goal

Replace upstream `src/` with a minimal app whose clock and case logic is pure, unit-tested and persisted. The UI is a bare placeholder; it gets styled in Phase 2.

## Steps

1. **Prune.** On `simple`: delete `InteractiveTutorial.tsx`, `TutorialOverlay.tsx`, `releaseNotes.ts`, and old `App.tsx`/`types.ts`. Remove deps `@google/genai`, `tesseract.js`, `express`, `dotenv`, `motion`, `@types/express`, `tsx`, `lucide-react`. Add `vitest`. Script: `"test": "vitest run"`.
2. **Manifest.** Name "The Big One: Simple", short name "Big One Simple", `orientation: 'portrait'`, same icons, `theme_color #000000`, `background_color #f5f5f5`. Keep `registerType: 'prompt'`.
3. **`src/tiles.ts`** (~40 lines): the 7 tiles in grid order, each `{ id, label, bg, fg, border, resetsCycle, stopsCycle, inCatchup }`, with colours from DESIGN.md §2.
4. **`src/clock.ts`** (~150 lines, pure, no React). State and functions below.
5. **`src/log.ts`** (~60 lines): `formatLog(state): string` in the DESIGN.md §4 format.
6. **`src/useCase.ts`** (~120 lines): holds state; writes `localStorage['theBigOneSimpleState']` on every change; restores on load (closing a stale case into `theBigOneSimpleLastCase`); a 250 ms interval that **only re-renders**; recomputes on `visibilitychange`; holds a Wake Lock while a case runs (re-acquired on visible); `navigator.vibrate(30)` on taps where supported.
7. **`src/App.tsx`**: switches between `start | catchup | case | log` and renders unstyled buttons so the logic can be clicked through.

## State shape

```ts
type ClockSnap = { startTime: number; pausedTime: number; cycleStartElapsed: number | null };
type Entry = {
  id: string;
  kind: TileId | 'start' | 'cycle' | 'resync';
  elapsed: number;      // seconds, monitor-aligned at time of tap
  at: number;           // wall ms (log clock column)
  prior?: number;       // catch-up count; shown as "before app"
  delta?: number;       // resync seconds
  rhythm?: 'VF' | 'pVT'; // optional Shock tag
  before: ClockSnap;    // restored by Undo
};
type CaseState = ClockSnap & {
  status: 'running' | 'ended';
  startClockTime: number; // wall ms at elapsed 0
  entries: Entry[];
  endedAt?: number;
};
```

*Each entry keeps the clock as it was before the tap, so one `undo()` reverses any tap, resync or bar restart the same way.*

## `clock.ts` functions

| Function | Does |
|---|---|
| `elapsedAt(s, now)` | `floor((now - startTime + pausedTime) / 1000)` |
| `startCase(now, elapsed = 0, pattern?, priors?)` | builds state. `pattern` sets `cycleStartElapsed = nextPatternTarget(elapsed, pattern) - 120`, otherwise `elapsed` |
| `nextPatternTarget(elapsed, pattern)` | upstream `calcNextIntervalTarget` (App.tsx L2252) ported as is |
| `tap(s, tileId, now)` | adds an entry. Shock/Disarm set `cycleStartElapsed = elapsed`, ROSC sets `null`. Ignored if the same tile was tapped < 1000 ms ago |
| `tagShock(s, entryId, rhythm)` | sets or changes `rhythm` on that Shock entry in place (not a new entry, so Undo still removes the whole shock) |
| `restartCycle(s, now)` | adds a `cycle` entry and sets `cycleStartElapsed = elapsed` |
| `resync(s, monitorElapsed, now)` | `delta = monitor - elapsed`. Sets `startTime = now`, `pausedTime = monitor*1000`, shifts `cycleStartElapsed` by `delta`, adds a `resync` entry |
| `undo(s)` | pops the newest non-prior, non-start entry and restores its `before` |
| `cycleRemaining(s, now)` | `120 - (elapsed - cycleStartElapsed)`, or `null` after ROSC |
| `tileStats(s, tileId, now)` | `{ count, sinceLast }` (prior counts included, `sinceLast` ignores priors) |
| `isStale(s, now)` | last entry `at` > 3 h ago |
| `formatTime(sec)` | `m:ss` / `mm:ss`, `h:mm:ss` from 60 min. Overtime shown `+m:ss` |

## Acceptance criteria

- [ ] `npm run build`, `npm run lint` and `npm test` are clean.
- [ ] No file over ~300 lines. `src/` is under ~600 lines before Phase 2 UI.
- [ ] Tests pass for:
  - elapsed is correct after a simulated 10-min suspension (fake `now`, no ticks)
  - reload restores the running case (serialise → parse → same elapsed)
  - Shock resets the cycle, and Undo restores the previous `cycleStartElapsed`
  - resync doesn't jump the cycle bar (`cycleRemaining` unchanged across resync)
  - Undo after resync restores the old clock
  - double tap within 1 s is ignored, 1.1 s is logged
  - catch-up 07:30 + Evens → `cycleRemaining` = 30 s; Odds → 90 s; none → 120 s
  - ROSC → `cycleRemaining` null; a following Shock restarts it at 120
  - `tagShock` sets and changes VF/pVT. Undo after tagging removes the shock
  - stale case (> 3 h) detected
  - `formatLog` matches the DESIGN.md sample
