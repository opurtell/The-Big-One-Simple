# Design decisions

**Date:** 15/11/2026 · Agreed with Oscar in a brainstorm session.
This builds on `BRIEF.md` (goals, non-goals, the cognitive-load test) and `DECISIONS.md` (the settled layout, tiles and stack). It records *how* the app behaves and looks. The implementation plan and mock-ups come next.

## 1. Taps during a case

| # | Decision | Why |
|---|---|---|
| 1 | **Multi-step Undo.** Each tap removes the newest remaining entry. The button names it: "Undo Shock". | A mis-tap is one tap to fix, with no guessing what will go. |
| 2 | **Double-tap guard.** A second tap on the same tile within 1 s is ignored. | Gloved double-taps. Anything slower is a real tap, and Undo covers it. |
| 3 | **Feedback:** the tile flashes plus a short `navigator.vibrate`. No sound. | iOS web apps can't vibrate, so the flash is the main cue. |
| 4 | **End case has no confirm dialog.** It opens the log, with a big "Back to case" button. The case is final only when "New case" is tapped. | Reversible in one tap, with nothing to read. |
| 5 | **ROSC stops the bar.** A later Shock, Disarm or bar tap restarts it. There's no re-arrest tile. | The existing tiles already mean re-arrest. |
| 6a | **Optional VF / pVT tag on Shock** (added 15/11/2026). Shock logs and restarts the bar immediately. For 5 s the Shock tile splits into **VF \| pVT**, with a shrinking line along the bottom. Tap one to tag the shock, or tap the other to change it. If it's ignored or another tile is tapped, the tile goes back to normal and the log says "Shock". Not a modal: the other tiles keep working. | It records the rhythm without blocking the shock or adding a decision you have to make. |
| 6 | **A bar tap restarts the 2:00.** It's logged as "Cycle restart" and can be undone. | Undo behaves the same for every action. |

## 2. Layout and look (matched to Matt's app)

**Theme:** Matt's light theme: `bg-neutral-100` page, white cards, black status bar (`#000`), emerald accent, Inter / system sans.

**Grid (portrait, 2 columns):**

```
[ 2-min bar: countdown ······················ ]   clock (small, top left) · elapsed (top right)
[ Shock      ] [ Disarm     ]
[ Adrenaline ] [ Amiodarone ]
[ IV/IO      ] [ LMA        ]
[ ROSC (full width)         ]
[ Undo ]       [ End case ]      ← thin strip
```

*Shock and Disarm sit nearest the bar they restart. ROSC is wide, so it's easy to see and hard to hit by accident.*

**Colours** (source: upstream `App.tsx`)

| Tile | Fill / text | Upstream source |
|---|---|---|
| Adrenaline | `#daf3e5` / `text-emerald-900` | adrenaline drug timer (~L3109) |
| Amiodarone | `bg-purple-100` / `text-purple-900` | amiodarone drug timer (~L3138), the ICP-drug convention |
| Shock | `bg-red-100` / `text-red-700` | shock = red in summary stats (L5022) |
| Disarm | white / `text-blue-600` | "Disarmed" stat colour (L5023). Kept separate from airway |
| IV/IO, LMA | `bg-blue-50` / `text-blue-900` | "Airway and access" group (~L3676) |
| ROSC | `bg-emerald-600` / white | Matt's primary emerald. Solid so it doesn't look like Adrenaline |
| 2-min bar | `emerald-500` draining fill, then solid `red-600` + white text in overtime | countdown ring (~L2900) |

*Red appears in two forms: a pale Shock tile and a solid overtime bar. They're different enough to read at a glance.*

| # | Decision |
|---|---|
| 10 | Times show as `mm:ss`, then `h:mm:ss` after 60 min. |
| 11 | A tile that hasn't been used shows only its label. After use: `×2 · 3:41 ago`. Adrenaline and Amiodarone show `×2 · due 3:12` instead (upstream timers, red + pulse from 30 s out; see DECISIONS.md 15/11/2026). |
| 12 | The PWA manifest locks to portrait. In a browser it still works in landscape, just not designed for it. |

## 3. Time entry

| # | Decision |
|---|---|
| 13 | **One keypad** for catch-up and resync. It fills from the right like a microwave: `7`,`3`,`0` → `07:30`. |
| 14 | **The catch-up clock starts when the last digit is typed**, not when Start is pressed (an improvement on upstream's `elapsedTimestamp`). |
| 15 | **Catch-up has an optional cycle pattern:** a chip row with **Evens · Odds · Half evens · Half odds**. If one is picked, `cycleStartElapsed = calcNextIntervalTarget(elapsed, pattern) - 120` (port upstream L2252 as is). If none is picked, the bar starts a fresh 2:00. After that, every Shock/Disarm restarts the bar from the tap; it doesn't snap back to the pattern. **Catch-up only:** "Start now" has no pattern choice. |
| 16 | Catch-up prior counts: − / + steppers on 6 tiles (all except ROSC). Logged as "before app". |
| 17 | Wall-clock time is shown small and grey, top left. |
| 18 | **Resync** changes only elapsed time. Log clock times are always the phone's real time (`at`), so `startClockTime` isn't shifted. A resync is logged as "Resync +0:12". `cycleStartElapsed` shifts by the same delta, so the bar doesn't jump. |

## 4. Log, export and returning to the app

| # | Decision |
|---|---|
| 19 | **Log layout:** header (date DD/MM/YYYY, start clock time, total duration) → totals (`Shock ×3 (VF 2, pVT 1), Adrenaline ×2…`). Tagged shocks read `Shock (VF)` / `Shock (pVT)` → chronological lines `elapsed · clock · item`. Before-app items come first: `before app · Shock ×2`. |
| 20 | **Export:** one "Copy" button (plain text to the clipboard). |
| 21 | Undone entries are deleted from the log, not crossed out. |
| 22 | **Last case:** one case kept, viewable from the start screen, until the next case starts. |
| 23 | **Reopening:** a running case resumes immediately. If nothing was tapped for 3 h, it's closed and saved as "Last case". |
| 24 | The elapsed clock keeps running after ROSC. Only End case stops it. |
| 25 | The log can't be edited in the app. Corrections happen in the ePCR. |

## Example copied log

```
The Big One: Simple, 15/11/2026
Start 14:32:10 · Duration 24:15
Shock ×3 · Adrenaline ×2 · Amiodarone ×1 · Disarm ×1 · IV/IO ×1 · LMA ×1 · ROSC ×1

before app · Shock ×1
before app · Adrenaline ×1
07:30  14:39:40  Start (catch-up)
08:05  14:40:15  IV/IO
09:31  14:41:41  Shock (VF)
...
```
