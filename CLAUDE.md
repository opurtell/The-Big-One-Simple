# The Big One: Simple

A simple fork of Matt Jones's cardiac arrest timer, **The Big One**. One screen: a 2-minute
cycle bar across the top, the monitor-synced elapsed time top right, and a grid of seven
big tiles (Adrenaline, Amiodarone, Shock, Disarm, Airway (LMA/ETT), IV/IO, ROSC). Tap a tile to log it. It keeps upstream's wall-clock time sync and its "catch up" start (enter
the monitor's elapsed time and what has already been given), and drops everything else.
**The goal is minimal cognitive load in the middle of an arrest.**

## Status

Phase 1 done (15/11/2026): pure, tested clock and case logic in `src/clock.ts`, log text in
`src/log.ts`, persistence and wake lock in `src/useCase.ts`.
Phase 2 done (15/11/2026): the real case screen in `src/ui/` (`CaseScreen`, `CycleBar`, `Tile`,
`ShockTag`).
Phase 3 done (15/11/2026): `StartScreen`, `CatchupScreen`, `ResyncSheet`, `LogScreen` and the shared
`Keypad` in `src/ui/` (keypad logic in `src/keypad.ts`); `src/App.tsx` is a thin screen switcher.
Phase 4 done (15/11/2026): Pages deploys from `simple` (`.github/workflows/static.yml`), and
`src/pwa.ts` gives offline support plus an "Update ready" bar on the Start screen only.
Goes live at https://opurtell.github.io/The-Big-One-Simple/ once Pages is enabled. `docs/NEXT_SESSION.md` says what's left.

## Read these first

1. `docs/BRIEF.md`: what this is, who uses it, and what it deliberately is not
2. `docs/PLAN.md`: the phases and the acceptance criteria
3. `docs/UPSTREAM.md`: how upstream's time sync and catch-up work, with line refs to port from
4. `docs/DECISIONS.md`: choices already made. Don't re-litigate them
4a. `docs/DESIGN.md`: detailed behaviour, colours and log format (locked 15/11/2026)
5. `docs/NEXT_SESSION.md`: the concrete next step
6. `docs/CLAUDE_PROJECT.md`: instructions for the matching Claude desktop project (keep it in sync with BRIEF)

## Repo layout

- This folder is a git clone of the fork **`opurtell/The-Big-One-Simple`** (`origin`; renamed
  from `The-Big-One` on 15/11/2026, and GitHub redirects the old URL).
  `upstream` = `MattJonesACTAS/The-Big-One` (Matt's original).
- **Work on the `simple` branch.** `main` mirrors upstream, so keep it clean so it can be
  fast-forwarded with `git fetch upstream && git checkout main && git merge --ff-only upstream/main`.
- To read the original while rewriting: `git show upstream/main:src/App.tsx | sed -n '2265,2400p'`.

## How we work

- **Port, don't reinvent, the timing logic.** It has handled real edge cases (screen lock,
  reload, backgrounded tab). `docs/UPSTREAM.md` maps exactly what to lift.
- **Every feature has to pass the cognitive-load test** in `docs/BRIEF.md`. If it adds a
  modal, a choice or a second screen during a case, it probably doesn't belong.
- **Write the phase plan before the phase** (`docs/plans/phase-N-<name>.md`) and get
  Oscar to approve it before writing code.
- **Done = acceptance criteria pass, `npm run build` and `npm run lint` are clean, and
  Oscar has used it on his phone.**
- At the end of a session, update the Status section above and `docs/NEXT_SESSION.md`.
- Record a decision in `docs/DECISIONS.md` as soon as the obvious approach is rejected.

## Things that will bite

1. **Never count seconds with `setInterval` increments.** Elapsed time is always
   `(Date.now() - startTime + pausedTime) / 1000`. The interval only triggers a re-render.
   Phones throttle or suspend timers when locked, and incrementing drifts minutes behind.
2. **Re-derive the time on `visibilitychange`** and on load from `localStorage`. A reload
   or killed tab mid-case must come back with the correct time and log.
3. **`vite.config.ts` has `base: '/The-Big-One-Simple/'`.** That matches the GitHub Pages path
   for the repo name. If the repo is renamed again, change it, or the deployed assets 404.
   Upstream's `main` still says `/The-Big-One/`, so watch for it when merging.
4. **The PWA uses `registerType: 'prompt'`**, so an old service worker keeps serving the old
   build until the user taps "Update ready" on the Start screen. Test fresh builds in a private window.
5. **Upstream code has `SPDX-License-Identifier: Apache-2.0` headers but no LICENSE file.**
   Keep the headers on files derived from upstream.
6. **This is clinical-adjacent.** It is a *log*, not decision support: no dose calculations,
   no prompts about what to give next. See `docs/BRIEF.md` non-goals. **One exception (15/11/2026):**
   upstream's adrenaline/amiodarone due-countdowns on their tiles (`drugDue` in `clock.ts`).
7. **Don't push an upstream sync to `origin/main`.** `main` has upstream's Pages workflow, which
   deploys on push to `main` and would replace the live app. See `docs/DECISIONS.md`.

## Unattended work: reversible only

Commit on `simple`, but don't push, open PRs against Matt's repo, enable GitHub Pages, or
deploy without Oscar's say-so. (Matt has OK'd the public fork.) Note those in `docs/NEXT_SESSION.md` under "Waiting on Oscar".

## Conventions

- Australian English in UI and docs ("amiodarone", "defibrillation"); DD/MM/YYYY dates.
- Keep upstream's stack: Vite 6, React 19, TypeScript, Tailwind 4, `vite-plugin-pwa`.
- Small files: the target is a few hundred lines total. No file over ~300 lines.
- Tile definitions live in one data file (`src/tiles.ts`), so the grid can change without touching logic.
- Comments explain *why*.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000/The-Big-One-Simple/
npm run build
npm run lint     # tsc --noEmit
npm test         # vitest (clock and log logic)
```
