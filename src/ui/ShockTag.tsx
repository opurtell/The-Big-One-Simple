// For 5 s after a Shock, the Shock tile offers an optional VF | pVT tag (DESIGN #6a).
// The shock is already logged and the bar restarted; ignoring this leaves plain "Shock".
// Not a modal: every other tile keeps working, and tapping one closes this.

import { useState } from 'react';
import { SHOCK_TAG_MS, type Entry, type Rhythm } from '../clock';

type Props = { shock: Entry; count: number; onTag: (rhythm: Rhythm) => void };

const RHYTHMS: Rhythm[] = ['VF', 'pVT'];

export function ShockTag({ shock, count, onTag }: Props) {
  // Read once: the shrinking line is a CSS animation started part-way through if the
  // screen re-mounts (e.g. back from the log), so it always ends at shock + 5 s.
  const [delay] = useState(() => shock.at - Date.now());
  return (
    <div className="flex min-h-0 flex-col gap-1.5 rounded-[18px] bg-red-700 p-1.5">
      <span className="text-center text-[15px] font-bold leading-tight text-white">Shock ×{count} logged</span>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-1.5">
        {RHYTHMS.map((r) => {
          const picked = shock.rhythm === r;
          const other = shock.rhythm !== undefined && !picked;
          return (
            <button
              key={r}
              aria-pressed={picked}
              onClick={() => onTag(r)}
              className={`rounded-xl text-[26px] font-extrabold ${
                picked ? 'bg-red-950 text-white ring-4 ring-white ring-inset' : 'bg-white text-red-700'
              } ${other ? 'opacity-60' : ''}`}
            >
              {r}
            </button>
          );
        })}
      </div>
      <div aria-hidden className="h-1 overflow-hidden rounded-sm bg-white/35">
        <div
          className="shock-countdown h-1 bg-white"
          style={{ animationDuration: `${SHOCK_TAG_MS}ms`, animationDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}
