# Next session

`CLAUDE.md` has the current state. This file is what to do next. Rewrite it at the end of every session.

## Start here

1. Phases 1 and 2 are merged into `simple`. The case screen lives in `src/ui/` (`CaseScreen`, `CycleBar`, `Tile`, `ShockTag`).
2. Build **Phase 3** from `docs/plans/phase-3-catchup-resync-log.md` and the mock-ups (https://claude.ai/artifact/4r2PuVubynxwN7yNUobAMy): `Keypad`, `StartScreen`, `CatchupScreen`, `ResyncSheet`, `LogScreen` in `src/ui/`. Then `src/App.tsx` becomes a thin screen switcher.

## Notes from Phase 2

- `CaseScreen` takes the case, `now` and callbacks. `onResync` currently opens a placeholder input in `App.tsx`; swap it for `ResyncSheet`.
- The VF | pVT tag window is pure logic: `pendingShockTag(s, now)` in `clock.ts` (newest entry is a live Shock under 5 s old). Any later entry closes it, so the UI holds no tag state.
- Tile flash = `.tile-flash` in `index.css` (a 150 ms `backdrop-filter: invert(1)` overlay, replayed by a fresh React key).
- `short:` is a custom Tailwind variant (`max-height: 700px`) used to fit the iPhone SE (375×667) without scrolling. Undo / End case text is 16 px under 400 px wide so "Undo Shock (pVT)" fits.
- Added `@types/react` and `@types/react-dom`: before this, JSX wasn't type-checked at all.
- `index.html` viewport now has `viewport-fit=cover`; the screen pads with the safe-area insets.

## Waiting on Oscar

- On-phone checks for Phase 2 (can't be done in the cloud): lock for 5 min and unlock (elapsed and bar correct), the screen stays awake, and glanceability at 1 m in sun. Pages still deploys from `main` until Phase 4, so test with `npm run dev` on the local network for now.
- Oscar gave permission (15/11/2026) for phase threads to push, open PRs into `simple` and merge them.
