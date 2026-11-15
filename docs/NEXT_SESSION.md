# Next session

`CLAUDE.md` has the current state. This file is what to do next. Rewrite it at the end of every session.

## Start here

1. Phases 1–4 are merged into `simple`. Once Pages is enabled (see "Waiting on Oscar"), the app
   goes live at https://opurtell.github.io/The-Big-One-Simple/ and deploys on every push to `simple`.
   The first run (15/11/2026) passed lint, tests and build, then stopped at "Get Pages site failed":
   Pages wasn't enabled on the repo yet.
2. Nothing is planned beyond Phase 4. Next work comes from Oscar's phone testing and the mock arrest.

## Notes from Phase 4

- `.github/workflows/static.yml` now triggers on `simple` (not `main`), uses `npm ci`, and runs
  `npm run lint && npm test` before building, so a failing test blocks the deploy.
- `src/pwa.ts` registers the service worker and exposes `useUpdate()`. When a new deploy is waiting,
  only the Start screen shows "Update ready · Reload" (never mid-case). It also checks hourly.
- Checked in headless Chromium against `vite preview`: works offline after the first visit
  (Start now and tiles work with the network off), and after a rebuild the update bar shows on the
  Start screen, stays hidden during a case, and goes away after tapping it.
- Don't push an upstream sync to `origin/main`: upstream's workflow on `main` would redeploy Matt's app.

## Waiting on Oscar

- **Enable Pages:** repo Settings → Pages → Source: GitHub Actions. Then Settings → Environments →
  `github-pages` → Deployment branches: add `simple` if only `main` is allowed. Then Actions →
  Deploy to GitHub Pages → Run workflow on `simple`.
- **Install:** open the live URL in Safari on the phone → Share → Add to Home Screen.
- **Airplane mode test:** open the installed app once online, then turn on airplane mode and reopen it.
- **Update prompt:** after the next deploy, open the app on the Start screen (may need a close and reopen) and check "Update ready" appears.
- **Mock arrest** with someone who hasn't seen the app: every intervention logged with no explanation, and the log within a few seconds of the monitor's event times.
- On-phone checks from Phases 2–3: lock 5 min and unlock (elapsed and bar correct), screen stays awake, glanceable at 1 m in sun, and the copied log pastes cleanly into notes / ePCR.
