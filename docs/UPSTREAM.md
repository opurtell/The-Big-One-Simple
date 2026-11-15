# Upstream reference: what to port

Line numbers are for `upstream/main` at commit `793ccff` (15/11/2026). Read them with
`git show upstream/main:src/App.tsx | sed -n 'A,Bp'`.

Upstream layout: `src/App.tsx` (5,930 lines, almost everything), `src/types.ts` (state
shape), `InteractiveTutorial.tsx` and `TutorialOverlay.tsx` (drop them), `releaseNotes.ts`
(drop it), `index.css` (Tailwind and custom classes like `btn-base`).

## Time sync (port this exactly)

The clock is never counted. It is derived from three state fields:

| Field | Meaning |
|---|---|
| `startTime` | `Date.now()` when the clock was last (re)based |
| `pausedTime` | ms of elapsed time already accrued at `startTime` (catch-up / resync offset) |
| `startClockTime` | wall-clock ms when the arrest started = `now - elapsed*1000`. Used for clock times in the log |

`elapsedSeconds = floor((Date.now() - startTime + pausedTime) / 1000)`

- **Tick**, `App.tsx:1604-1616`: a 1 s `setInterval` recomputes elapsed from the formula.
  (Upstream also drives rhythm-check logic here. Drop that.)
- **Drift fix on wake**, `App.tsx:1051-1065`: on `visibilitychange` back to visible, recompute.
- **Persistence**, `App.tsx:1338`: the whole state is written to `localStorage['theBigOneState']`
  on every change, and restored on load (`App.tsx:797-808` decides whether a saved case is
  still running). Use a different key (e.g. `theBigOneSimpleState`) so the two apps can
  coexist on one origin.
- **Wake lock**, `App.tsx:1736-1760`: `navigator.wakeLock.request('screen')`, re-acquired on
  visibility change.

## Catch up (simplify)

Upstream: a multi-step modal (`catchupStep` 1→6→2→3→7→4). It covers the mode, rhythm interval,
weight, prior counts, and then elapsed time via `ElapsedTimePicker`.

The core is `handleCatchupStart`, `App.tsx:2266-2395`:

1. `adjustedElapsed = hrs*3600 + mins*60 + secs` from the picker.
2. **Add the time spent on the picker screen**: `elapsedTimestamp` is set when the user
   presses Start (`App.tsx:3596`), and `adjustedElapsed += (Date.now() - elapsedTimestamp)/1000`.
   Keep this idea. Better still, timestamp the moment the elapsed time is *entered*, so a slow
   tap on Start doesn't lose seconds.
3. `startTime = now`, `pausedTime = adjustedElapsed*1000`, `startClockTime = now - adjustedElapsed*1000`.
4. Prior interventions are pushed as treatments with `prior: true`, `elapsed: 0`, clock = start
   clock (`pushPrior`). Their exact times are unknown, so the log shows them as "before app".

**Simple version:** one screen with an elapsed time picker (mm:ss, hours rarely needed) and
the same tile grid with − / + steppers for prior counts. Then Start. "Start now" (elapsed 0)
is the big default button. Catch up is the secondary one.

## Resync mid-case

`App.tsx:4196-4226` (Recalibrate Elapsed Time → Done): set `elapsedSeconds = staged`,
`startTime = Date.now()`, `pausedTime = staged*1000`. Upstream doesn't shift `startClockTime`.
Decide whether the simple version should, so that clock times of *future* entries follow
the monitor. Existing log entries keep their recorded elapsed values.

## 2-minute cycle (simplified from upstream's rhythm check)

Upstream: `rhythmCheckTarget`, `rhythmInterval` (evens/odds/half-*, `calcNextIntervalTarget`
~`App.tsx:2250-2262`), overtime, delay and pause states, plus forced-shock overlays.
**Simple version:** store `cycleStartElapsed` only. `remaining = 120 - (elapsed - cycleStartElapsed)`.
If it's negative, show it as red overtime. Set it to the current elapsed on a Shock/Disarm
tap or a bar tap. Set it to `null` on ROSC (bar hidden or greyed). On resync, shift it by
the same delta as the clock so the bar doesn't jump. Undoing a Shock/Disarm restores the
previous `cycleStartElapsed`, so store it on the log entry.

## Treatment record

`src/types.ts` `Treatment`: `{ name, elapsed, round, clock, clockSeconds, prior?, ... }`.
Simple version: `{ id, tile, elapsed, at (wall ms), prior? }`. Derive the display strings at render.

## Drop entirely

Timing modes (`elapsed`/`log`/`minimal`), the rhythm interval patterns and the delay/pause logic, forced shock,
CPR rounds, adrenaline/amiodarone "wipe" timers, dose functions (`getAdrenalinePushDose`,
`getAmiodaroneDose`), weight/paed, checklists, vitals, tutorial, release notes, Android
back-button stack handling (`App.tsx:1400-1540`, overkill with one screen), previous-cases list.

## Dependencies to drop

`@google/genai`, `tesseract.js`, `express`, `dotenv`, `motion`, `@types/express`, `tsx`.
Keep: `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`,
`vite-plugin-pwa`, `lucide-react` (only if icons are used), `typescript`.
