# Next session

`CLAUDE.md` has the current state. This file is what to do next. Rewrite it at the end of every session.

## Start here

1. Phase 1 is merged into `simple`: `src/clock.ts` (pure logic, tested), `src/log.ts`, `src/useCase.ts`, `src/tiles.ts`, and an unstyled `src/App.tsx`.
2. Build **Phase 2** from `docs/plans/phase-2-case-screen.md` and the mock-ups (https://claude.ai/artifact/4r2PuVubynxwN7yNUobAMy). Replace the case part of `App.tsx` with `src/ui/*` components; keep logic in `clock.ts`.

## Notes from Phase 1

- `useCase()` exposes `now` (re-rendered every 250 ms) plus actions: `startNow`, `startCatchup(elapsed, pattern?, priors?)`, `tap`, `tagShock`, `restartCycle`, `resync`, `undo`, `newCase`. All actions read `Date.now()` at the tap.
- `startCatchup` takes fractional seconds: pass `typed + (Date.now() - enteredAt)/1000` (DESIGN #14).
- Added `endCase(s, now)` (used by "New case" and the 3 h stale close); elapsed freezes at `endedAt`. Also `undoable(s)` for the Undo label and `isCatchup(s)` for "Start (catch-up)".
- `formatTime(sec, pad)`: `pad` gives `07:30` (log, elapsed); negative values read `+m:ss` (overtime).
- Log totals and before-app lines use clinical order (Shock, Adrenaline, Amiodarone, Disarm, IV/IO, LMA, ROSC) as in the DESIGN.md sample, not grid order.
- The service worker is registered in `main.tsx` with no update UI yet. The update prompt is Phase 4.

## Waiting on Oscar

- Nothing. Oscar gave permission (15/11/2026) for phase threads to push, open PRs into `simple` and merge them.
