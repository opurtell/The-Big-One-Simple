# Phase 2: Case screen

**Status:** draft, approve after Phase 1 · 15/11/2026
**Mock-ups:** "Case: running", "Case: overtime", "Case: ROSC".

## Components (each < 120 lines)

- `src/ui/CycleBar.tsx`: 3 looks. Running: emerald-100 track, emerald-500 fill at `remaining/120` width, big countdown. Overtime: solid red-600, white `+m:ss`. ROSC: grey dashed, "ROSC · m:ss ago". The whole bar is a button → `restartCycle`.
- `src/ui/Tile.tsx`: label (28 px, 800) + `×n · m:ss ago` (18 px). Label only when unused. Flash on tap (150 ms inverted colours, CSS only).
- `src/ui/ShockTag.tsx`: for 5 s after a Shock, the Shock tile shows "Shock ×n logged" + **VF | pVT** + a shrinking line. A tap calls `tagShock`. It closes on timeout or when any other tile is tapped (mock-up "Case: just after Shock").
- `src/ui/CaseScreen.tsx`: header (wall clock small grey left, elapsed 48 px right, tap → resync sheet), bar, 2×3 grid, full-width ROSC, Undo / End case strip.
- `src/index.css`: Matt's base (`bg-neutral-100`, system sans, `select-none`, no tap highlight, no overscroll) + `tabular-nums` on all times.

## Behaviour

- Undo button label = `Undo <newest item>`. Disabled (greyed) when there is nothing to undo.
- End case → log screen, no dialog (`status` stays `running` until "New case").
- The layout fills `100dvh` with no scrolling, using the safe-area insets.

## Acceptance criteria

- [ ] Matches the three mock-ups at 390×844 and still fits at 375×667 (iPhone SE) without scrolling.
- [ ] Tiles ≥ 25% of screen width. Elapsed and countdown are the largest text, readable at 1 m.
- [ ] Shock/Disarm restarts the bar, bar tap restarts it, ROSC stops it, and Shock after ROSC restarts it.
- [ ] After Shock, VF | pVT shows for 5 s without blocking other tiles. Tagging shows in the log, and ignoring it logs plain "Shock".
- [ ] Undo steps back through several taps one at a time, and its label is always right.
- [ ] Lock the phone for 5 min, then unlock: elapsed and countdown are correct, and the screen stayed awake while unlocked.
- [ ] Passes the cognitive-load test (BRIEF): no sentences, no in-case decisions, every mis-tap is one tap to fix.
