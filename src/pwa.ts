// Offline support and the update prompt (Phase 4).
// A new deploy is only offered on the Start screen, never mid-case: StartScreen shows a
// small "Update ready" bar, and tapping it reloads into the new version. Case state is in
// localStorage, so a reload is always safe anyway.

import { useSyncExternalStore } from 'react';
import { registerSW } from 'virtual:pwa-register';

let ready = false;
let apply: (() => void) | null = null;
const listeners = new Set<() => void>();

export function startPwa() {
  try {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        ready = true;
        listeners.forEach((l) => l());
      },
      // Installed PWAs can stay open for days, so look for a new deploy every hour too.
      onRegisteredSW(_url, r) {
        if (r) setInterval(() => r.update().catch(() => {}), 60 * 60 * 1000);
      },
    });
    apply = () => void updateSW(true);
  } catch (err) {
    console.error('PWA registration failed (non-fatal):', err);
  }
}

const subscribe = (l: () => void) => (listeners.add(l), () => void listeners.delete(l));

/** Returns a reload function when a new version is waiting, otherwise null. */
export function useUpdate(): (() => void) | null {
  const isReady = useSyncExternalStore(subscribe, () => ready);
  return isReady && apply ? apply : null;
}
