# Decisions

Choices future sessions must respect. Newest first.

## 15/11/2026: Resync re-bases earlier entries (Oscar)

- **Decision:** a resync shifts the elapsed time of every entry logged before it by the resync
  delta, so the whole log matches the monitor. Clock times never change. The log header's start
  time moves to the monitor's zero. "Before app" entries are untouched. Resyncs add up; Undo
  reverses one. Amends DESIGN #18 (which shifted only elapsed time from the resync onwards).
- **Why:** the ePCR wants one elapsed timeline that matches the monitor. Before this, entries
  before a resync were on the app's old timeline, and drug countdowns jumped by the delta.

## 15/11/2026: Adrenaline and amiodarone countdowns (Oscar)

- **Decision:** the Adrenaline and Amiodarone tiles show when the next dose is due, using Matt's
  upstream timers as is: adrenaline 4:00 after the last dose, amiodarone 5:00 after the first dose
  and gone after the second. The tile's second line reads `×2 · due 3:12`, then `due +0:14` once
  overdue. From 30 s out the tile turns red and pulses (upstream's colours). Hidden when the last
  dose was "before app" (time unknown), during ROSC, and after re-arrest if it was already overdue
  by then (upstream's "wipe"). Derived from the log, so Undo and resync just work.
- **Rejected:** upstream's two-tap "Disregard?" dismiss (adds a decision mid-case); a separate
  timer row (wouldn't fit an iPhone SE without scrolling).
- **Why:** Oscar wants the same timing cues as Matt's app. This **amends "A log, not decision
  support"** below for these two timers only: still no doses, weight, prompts, sounds or pop-ups.

## 15/11/2026: Optional IV / IO and LMA / ETT tags; LMA tile becomes "Airway" (Oscar)

- **Decision:** IV/IO and the airway tile get the same optional 5 s split as Shock: **IV | IO** and **LMA | ETT**. The LMA tile is relabelled **Airway** (log: "Airway (ETT)"). Ignored = untagged.
- **Why:** records the route and device with no extra decision, and keeps seven tiles. One shared component and `TILE_TAGS` list in `src/tiles.ts`.

## 15/11/2026: Optional VF / pVT tag on Shock (Oscar)

- **Decision:** Shock logs and restarts the bar at once. For 5 s the tile offers **VF | pVT**. Tapping one is optional, and if it's ignored the log says "Shock".
- **Rejected:** a required pop-up (it adds a modal and a decision to every shock), and two separate Shock tiles (8 tiles, and a choice before every shock).
- **Why:** it records the rhythm without blocking the shock, and ignoring it does no harm.

## 15/11/2026: Design details locked (Oscar)

- **Decision:** the 25 behaviour, look and log decisions in `docs/DESIGN.md`. The highlights:
  multi-step Undo, End case opens the log with no confirm, Matt's light theme and drug colours,
  a microwave-style time keypad, plain-text Copy, and one "Last case" kept.
- **Amends "Layout and tiles":** Matt's evens/odds/half-evens/half-odds patterns are allowed,
  as an **optional choice on the catch-up screen only**, to line the bar up with a cycle already
  running. "Start now" still has no pattern choice.
- **Rejected:** a confirm dialog on End case, sound, a dark theme, editing the log in the app.
- **Why:** each passes the cognitive-load test, and matching Matt's look keeps the two apps familiar.

## 15/11/2026: Layout and tiles (Oscar)

- **Decision:** a 2-minute cycle bar across the top, the monitor-synced elapsed time top
  right, and exactly seven tiles: Adrenaline, Amiodarone, Shock, Disarm, LMA, IV/IO, ROSC.
  The bar restarts on Shock/Disarm (or a tap on the bar) and stops on ROSC.
- **Rejected:** no cycle timer at all, and upstream's evens/odds rhythm-interval patterns
  (an extra choice before every case).
- **Why:** the 2-min cycle is the one timer everyone watches. Tying it to the shock/disarm
  tap needs no setup.

## 15/11/2026: Repo renamed to The-Big-One-Simple

- **Decision:** `opurtell/The-Big-One` → `opurtell/The-Big-One-Simple`, and Vite `base` changed to match.
- **Why:** avoids confusion with Matt's app, and gives it its own Pages URL. Matt is OK with the fork.

## 15/11/2026: Rewrite the UI, port the clock

- **Decision:** write a new small `src/` and port only the time-sync and catch-up logic from upstream.
- **Rejected:** trimming upstream's 5,930-line `App.tsx` down. The timing code is entangled
  with modes, rhythm checks and the tutorial, so deleting around it is slower and riskier than lifting it out.
- **Why:** the target is a few hundred lines that one person can hold in their head.

## 15/11/2026: Fork on GitHub, work on the `simple` branch

- **Decision:** fork to `opurtell/The-Big-One`, keep `main` as a clean mirror of upstream,
  and do all work on `simple`.
- **Rejected:** a separate new repo (it loses the link to Matt's history and credit), or
  rewriting `main` (it can't track upstream any more).
- **Why:** keeps attribution and the option of offering it upstream as a "simple mode".

## 15/11/2026: Same stack as upstream

- **Decision:** Vite + React 19 + TS + Tailwind 4 + vite-plugin-pwa, deployed by the existing
  GitHub Pages workflow. Add Vitest for the clock tests.
- **Rejected:** a no-build static page. It would be simpler, but it diverges from upstream and loses the PWA plugin.
- **Why:** easy to port code both ways with Matt.

## 15/11/2026: A log, not decision support

- **Decision:** no doses, no weight, no prompts about what to give or when.
- **Amended 15/11/2026:** adrenaline and amiodarone due-countdowns on their tiles (see above).
- **Why:** that's what keeps the cognitive load low, and it keeps the app clear of clinical-advice territory.

## 15/11/2026: Deploy Pages from `simple`

- **Decision:** `.github/workflows/static.yml` deploys on push to `simple` (plus manual runs), and
  type-checks and runs the tests before building.
- **Rejected:** merging `simple` into `main` (then `main` can't mirror upstream any more).
- **Why:** `main` stays a clean upstream mirror. **Catch:** `main` still carries upstream's own
  workflow that deploys on push to `main`, so pushing an upstream sync to `origin/main` would replace
  the live app with Matt's (with the wrong `base`, so broken). Sync `main` locally only, or re-run the
  `simple` deploy straight after.

## 15/11/2026: Update prompt only on the Start screen

- **Decision:** when a new deploy is waiting, the Start screen shows a small blue "Update ready ·
  Reload" bar. Nothing appears during a case or on the log. The app also checks for a new deploy hourly.
- **Rejected:** a toast or modal wherever you are (adds a thing to read mid-arrest), and silent
  auto-update (could reload mid-case).
- **Why:** passes the cognitive-load test. A reload is safe anyway because state is in `localStorage`.

## 15/11/2026: Top padding clears the iOS status-bar blur

- **Decision:** every screen's top padding is `max(Npx, safe-area-inset-top + 24px)`, not just the inset.
- **Why:** installed on iOS, a blurred band extends below the status bar and was cutting into the
  elapsed time. 24 px moves the time clear of it. Android and desktop (inset 0) are unchanged.

## 15/11/2026: "End case" button renamed "Summary" (Oscar)

- **Decision:** the case-screen button that opens the log reads **Summary**. Behaviour is unchanged:
  it opens the log with "Back to case", and the case only closes on "New case".
- **Why:** "End case" read as final, but the case keeps running until "New case". "Summary" says what the tap shows.

## 15/11/2026: ROSC timer and ROSC / PHEA checklists (Oscar)

- **Decision:** in ROSC the cycle bar shows the time since ROSC as the main timer, and the ROSC
  tile's slot becomes two buttons, "ROSC checklist" and "PHEA checklist", that open Matt's adult
  checklists in place of the tiles (DESIGN #5a, #5b). Ticks are not logged.
- **Amends:** "A log, not decision support" and the non-goal "no checklists": these two checklists
  are allowed, post-ROSC only, ported unchanged from upstream (no paediatric variants).
- **Rejected:** logging ticks (Matt's app doesn't, and it would bloat the ePCR log); a modal
  overlay hiding the ROSC timer.
- **Why:** Oscar asked for them; after ROSC the cognitive-load budget is bigger, and the tiles stay
  one tap away (Close, or a re-arrest closes it automatically).

