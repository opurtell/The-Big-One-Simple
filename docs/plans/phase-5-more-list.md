# Phase 5: "More" list (full meds and treatments)

**Status:** approved by Oscar and built · 15/11/2026
**Mock-ups:** "1 · More: case screen" and "1 · More: list open" at https://claude.ai/artifact/BDgCr7JyLm9HNn2g83tSX2

## What changes

- **Bottom strip** becomes `Undo (half width) | More | Summary`. The seven tiles, bar and elapsed time don't move. More is there in arrest and in ROSC.
- **More** opens the list where the tiles are (same pattern as the checklists), with the clock, cycle bar or ROSC timer still on top.
- **Three tabs, no scrolling:** Meds (opens here) · Airway · Other. Two columns of buttons, one name each.
- **Tap an item:** it logs with the time, flashes, and the list closes back to the tiles. Undo then reads "Undo Calcium".
- **Close** button at the bottom. The list also closes by itself after 15 s without a tap, so the tiles always come back.
- Items already given show their count (`Calcium ×1`).

## The list (names only, no doses)

Ported from upstream `MEDICATIONS` (App.tsx L73) and the Airway / Other Tx sections (~L5741).

- **Meds (18):** Adrenaline infusion, Atropine, Calcium, Glucose 10%, Heparin, Ketamine, Ketamine infusion, Keppra, Lignocaine, Magnesium, Midazolam, Morph/midaz infusion, Naloxone, Saline, Ondansetron, Oxygen, Sodium bicarb, Sux.
- **Airway (5):** FONA, IGT, NPA, OPA, Suction.
- **Other (4):** Corpuls, Extrication, Pacing, Reassurance.

*Left out because a tile already logs them:* adrenaline push, amiodarone, LMA, ETT, IV access, IO access.
*Left out on purpose:* doses, failed attempts, free-text entry, catch-up steppers for these items.

## Code

- `src/extras.ts` (new): the three groups as data.
- `src/clock.ts`: `Entry.kind` gains `'extra'` with an `item` name. `logExtra()` reuses the tile path (double-tap guard, `before` snapshot for Undo). Never touches the cycle.
- `src/log.ts`: label, totals (after the tile totals, list order) and rows for extras.
- `src/ui/MorePanel.tsx` (new, ~70 lines) and a small edit to `src/ui/CaseScreen.tsx`.
- No file over 300 lines. Saved cases from the current version still load.

## Acceptance criteria

- [ ] On a 375 px screen the strip shows "Undo Adrenaline", "More" and "Summary" without clipping.
- [ ] The case screen is unchanged apart from the strip: same seven tiles, same sizes.
- [ ] More → Calcium logs `mm:ss  hh:mm:ss  Calcium`, the tiles are back in one tap, and Undo removes it.
- [ ] With the list open, the countdown is still visible and a bar tap still restarts the 2:00.
- [ ] Each tab fits without scrolling on a 375 × 667 screen, with every button at least 44 px high.
- [ ] The list closes itself after 15 s idle, and on re-arrest handling nothing is lost.
- [ ] The copied log lists extras in the totals line and in time order, with no doses anywhere.
- [ ] A double tap within 1 s logs once.
- [ ] Tests cover: log an extra, undo it, totals, copied text, loading a pre-Phase-5 saved case.

## Update the docs (with the code)

- `DECISIONS.md`: "15/11/2026: More list. A More button opens Matt's full med and treatment list as names only. Amends 'exactly seven tiles' (tiles unchanged, one strip button added). Rejected: post-ROSC tile swap, Mark-and-name-later, add from Summary."
- `DESIGN.md`: new #6d describing the More list, and the strip line in §2.
- `NEXT_SESSION.md`: phone check of the strip and list with gloves.
