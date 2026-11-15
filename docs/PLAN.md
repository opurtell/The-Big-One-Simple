# Plan

Each phase gets `docs/plans/phase-N-<name>.md` with acceptance criteria. Oscar approves it before code.

## Phase 1: Strip and skeleton

Replace upstream `src/` on the `simple` branch with a minimal app. Drop unused deps
(`docs/UPSTREAM.md`). Update the PWA manifest name to "The Big One: Simple" with the same icons.

- `src/tiles.ts`: tile list (id, label, colour)
- `src/clock.ts`: pure functions: `elapsedAt(state, now)`, `startCase(elapsed, now)`,
  `resync(state, elapsed, now)`, `formatMMSS`. **Unit-tested with Vitest**, because this is the
  part that must be right.
- `src/useCase.ts`: state, `localStorage` persistence, tick, visibility fix, wake lock
- `src/App.tsx`: start screen / case screen / log screen

**Accept:** builds and lints clean. Clock tests pass, including "elapsed is correct after a
simulated 10-minute suspension" and "reload restores the running case".

## Phase 2: Case screen

Big timer + tile grid (count + time since last) + Undo + End case. Resync is reached by
tapping the timer.

**Accept:** passes the cognitive-load test in BRIEF. Tiles ≥ 25% of width on a 375 px
screen. The timer is readable at 1 m. Undo reverses the last tap. Lock the phone for 5 min,
unlock, and the time is correct.

## Phase 3: Catch up + log

Catch-up screen (elapsed picker + prior-count steppers). End-of-case log with Copy as
text. The last case is viewable from the start screen.

**Accept:** catch up at 07:30 with 2 shocks + 1 adrenaline gives a timer that matches a
stopwatch started at 07:30, and the log shows the prior items as "before app".

## Phase 4: Ship (needs Oscar)

Decide the name/URL, enable GitHub Pages on the fork, push `simple` → `main` (or make Pages
deploy from `simple`), test on Oscar's phone, and tell Matt.
