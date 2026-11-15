# Decisions

Choices future sessions must respect. Newest first.

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
- **Why:** that's what keeps the cognitive load low, and it keeps the app clear of clinical-advice territory.
