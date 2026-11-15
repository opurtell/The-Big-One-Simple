# The Big One: Simple. Brief

**Date:** 15/11/2026

## The one-sentence brief

A paramedic at a cardiac arrest, phone propped on the kit bag, can glance at it to see how
long the arrest has gone and when each intervention was last given, and can log a new one
with a single tap and no reading.

## The problem

The full app (upstream, `MattJonesACTAS/The-Big-One`) is good, but it does a lot: three
timing modes, rhythm-check prompts, weight-based doses, checklists (reversibles, ROSC,
PHEA), vitals, a tutorial, and case history. Mid-arrest, each extra choice or modal costs
attention. Some users just want a stopwatch and a tally of what's been done.

## Who uses it, and where

- **Primary:** a paramedic or a team member acting as scribe at an arrest. The phone is on
  the floor or in a hand, gloved fingers, bright sun or a dark room, under stress and noise.
- **Secondary:** arriving at an arrest already in progress (a second crew or a supervisor)
  and catching up from what the first crew says and what the monitor shows.
- **Design consequences:**
  - One screen during a case. No modals except Undo and End case.
  - Tiles are big (≥ 25% of screen width), high contrast, with one word each and no icons-only tiles.
  - Readable at arm's length: the 2-minute countdown and the elapsed time are the largest text on screen.
  - Works offline (PWA), keeps the screen awake, survives a reload or screen lock.
  - Portrait phone first, but it shouldn't break in landscape or on a tablet.

## Goals

1. **Synced elapsed time, top right**: the case clock, synced to the monitor's elapsed time
   (wall-clock based, drift-free). Tap it to resync.
2. **2-minute cycle bar across the top**: a full-width bar that drains over 2:00, with the
   countdown shown on it. At 0:00 it turns red and counts up the overtime (`+0:14`). It's
   passive: no modal, no sound, no prompt. It restarts when Shock or Disarm is tapped (that
   tap *is* the rhythm check). Tapping the bar itself also restarts it. ROSC stops it.
3. **Tile grid** of exactly seven tiles: **Adrenaline, Amiodarone, Shock, Disarm, LMA,
   IV/IO, ROSC**. Tapping a tile logs it with a timestamp. Each tile shows its **count** and
   **time since the last one** (e.g. `×2 · 3:41 ago`).
4. **Catch up**: start a case with an elapsed time already on the monitor, plus counts of
   what's already been given (e.g. 2 shocks, 1 adrenaline).
5. **Resync** mid-case: enter the monitor's elapsed time to correct the clock.
6. **Undo** the last tap (a mis-tap must be one tap to fix).
7. **End case → log**: a plain chronological list (elapsed time + clock time + item) that can be
   copied as text for the ePCR.

## Non-goals

These are deliberately out of scope. They're the upstream app's job.

- Dose calculation, patient weight, adult/paed modes
- Rhythm-check *prompts*, forced-shock flows, "what's next" suggestions (the 2-min bar is
  a passive indicator only)
- Checklists (Hs and Ts, ROSC, PHEA), vitals entry
- Tutorials, release notes, multiple timing modes
- Case history beyond the current and last case
- OCR (tesseract), AI (`@google/genai`), any backend

## The cognitive-load test (apply to every feature)

1. Can it be used without reading a sentence? (Labels, not instructions.)
2. Does it add a decision during a case? If yes, cut it or move it to before or after the case.
3. Is a mis-tap fixable in one tap?
4. Is it still glanceable from 1 m away?

## Settled (15/11/2026)

- **Layout:** the 2-minute bar is across the top, the synced elapsed time is top right, and the tile grid fills the rest.
- **Tiles:** the seven above, fixed. They aren't user-configurable in v1.
- **Name:** the repo is `opurtell/The-Big-One-Simple`. Pages URL: `opurtell.github.io/The-Big-One-Simple/`.
- **Matt** is happy with the public fork.

## Still open (sensible defaults are in place, so confirm when building)

- Should catch-up also take "time into the current 2-min cycle"? Default: no. The bar starts a
  fresh 2:00 at catch-up, and the first Shock/Disarm tap realigns it.
- Should the small top-left area show the wall-clock time (e.g. 14:32)? Default: yes, small and grey.

## Success looks like

At a mock arrest, someone who has never seen the app logs every intervention correctly
with no explanation, and the end-of-case log matches the monitor's event times within a few seconds.
