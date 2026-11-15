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
  - Readable at arm's length: the case timer is the largest thing on screen.
  - Works offline (PWA), keeps the screen awake, survives a reload or screen lock.
  - Portrait phone first, but it shouldn't break in landscape or on a tablet.

## Goals

1. **Case timer** synced to the monitor's elapsed time (wall-clock based, drift-free).
2. **Tile grid**: tap = log with a timestamp. Each tile shows its **count** and
   **time since the last one** (e.g. `×2 · 3:41 ago`).
3. **Catch up**: start a case with an elapsed time already on the monitor, plus counts of
   what's already been given (e.g. 2 shocks, 1 adrenaline).
4. **Resync** mid-case: enter the monitor's elapsed time to correct the clock.
5. **Undo** the last tap (a mis-tap must be one tap to fix).
6. **End case → log**: a plain chronological list (elapsed time + clock time + item) that can be
   copied as text for the ePCR.

## Non-goals

These are deliberately out of scope. They're the upstream app's job.

- Dose calculation, patient weight, adult/paed modes
- Rhythm-check prompts, forced-shock flows, "what's next" suggestions
- Checklists (Hs and Ts, ROSC, PHEA), vitals entry
- Tutorials, release notes, multiple timing modes
- Case history beyond the current and last case
- OCR (tesseract), AI (`@google/genai`), any backend

## The cognitive-load test (apply to every feature)

1. Can it be used without reading a sentence? (Labels, not instructions.)
2. Does it add a decision during a case? If yes, cut it or move it to before or after the case.
3. Is a mis-tap fixable in one tap?
4. Is it still glanceable from 1 m away?

## Open questions for Oscar

- **Rhythm-check / 2-minute cycle indicator:** leave it out entirely, or show a passive
  2:00 countdown ring with no prompts? It's not in the v1 scope until Oscar decides.
- **Final tile list.** Proposed default: Adrenaline, Amiodarone, Shock, Disarm, LMA,
  IV/IO, ETT? CPR start? ROSC? Should tiles be user-configurable in settings?
- **Name/URL.** Keep the repo name `The-Big-One` (Pages URL `opurtell.github.io/The-Big-One/`)
  or rename it, e.g. `The-Big-One-Simple`?
- **Matt.** Is he happy with a public fork? Upstream as a "simple mode", or stay separate?

## Success looks like

At a mock arrest, someone who has never seen the app logs every intervention correctly
with no explanation, and the end-of-case log matches the monitor's event times within a few seconds.
