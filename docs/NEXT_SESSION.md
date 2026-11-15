# Next session

`CLAUDE.md` has the current state. This file is what to do next. Rewrite it at the end of every session.

## Start here

1. Phases 1–3 are merged into `simple`. Every screen is real: Start, Catch up, Case (+ Resync sheet) and Log.
2. Build **Phase 4 (ship)** from `docs/plans/phase-4-ship.md`: point the Pages workflow (`.github/workflows/static.yml`) at `simple`, enable Pages, check offline + the update prompt.

## Notes from Phase 3

- `src/keypad.ts` is the pure microwave keypad (digits → seconds, display, `secondsNow`). `enteredAt` updates on every key, so the clock runs from the last key typed (DESIGN #14).
- **Resync is whole seconds:** `clock.resync` rounds the delta and adds it to both `pausedTime` and `cycleStartElapsed`, so the bar stays exactly put (no ±1 s flicker from fractions). The Resync sheet's delta is fixed at the last key typed, so it doesn't drift while the sheet is open.
- Catch-up's "Start at" button ticks live (typed time + seconds since the last key), so it shows the time the case will actually start at.
- `log.ts` now exports `totals()` and `logRows()`, shared by `LogScreen` and `formatLog`.
- Copy falls back to a hidden textarea + `execCommand('copy')` when the async clipboard isn't available (plain http on the local network). Button reads "Copied" / "Copy failed" for 2 s.
- Last case opens the same `LogScreen` read-only (Back + Copy, no New case).
- Catch-up fits the iPhone SE (375×667) with no scroll via `short:` sizes; it scrolls if it ever doesn't fit.

## Waiting on Oscar

- On-phone checks for Phases 2–3 (can't be done in the cloud): lock 5 min and unlock (elapsed and bar correct), screen stays awake, glanceable at 1 m in sun, and the copied log pastes cleanly into a notes app / ePCR.
- Pages still deploys from `main` until Phase 4, so test with `npm run dev` on the local network for now.
- Oscar gave permission (15/11/2026) for phase threads to push, open PRs into `simple` and merge them.
