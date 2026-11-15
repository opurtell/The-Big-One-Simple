# Phase 4: Ship (needs Oscar)

**Status:** built 15/11/2026 (workflow + update prompt). On-phone checks are Oscar's.

## Steps (each needs Oscar's go-ahead)

1. Push `simple` to `opurtell/The-Big-One-Simple`.
2. Point the Pages workflow (`.github/workflows/static.yml`) at `simple`, or merge `simple` → `main`. *Recommend deploying from `simple`, so `main` stays a clean upstream mirror.*
3. Enable GitHub Pages (Settings → Pages → GitHub Actions).
4. Install on Oscar's phone from `opurtell.github.io/The-Big-One-Simple/` (Add to Home Screen).

## Acceptance criteria

- [ ] Loads offline after the first visit (airplane mode test).
- [ ] An update prompt appears after a new deploy.
- [ ] A mock arrest with someone who hasn't seen the app: every intervention logged correctly with no explanation, and the log is within a few seconds of the monitor's event times.
