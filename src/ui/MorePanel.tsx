// SPDX-License-Identifier: Apache-2.0
// The "More" list (DESIGN #6d): Matt's full med and treatment list, names only. It takes the
// place of the tiles, so the clock and cycle bar stay in view. Tap an item to log it and go
// straight back to the tiles. Three tabs, so nothing scrolls.

import { useEffect, useRef, useState } from 'react';
import { EXTRAS, type ExtraGroupId } from '../extras';

type Props = { counts: Map<string, number>; onPick: (name: string) => void; onClose: () => void };

export const MORE_IDLE_MS = 15000; // closes itself, so the tiles always come back
const FLASH_MS = 150;

// Upstream section colours: Medications = emerald, Airway = blue, Other Tx = neutral.
const THEME: Record<ExtraGroupId, { tab: string; on: string; item: string; given: string }> = {
  meds: { tab: 'border-emerald-200 bg-white text-emerald-900', on: 'border-emerald-600 bg-emerald-600 text-white', item: 'border-emerald-200 text-emerald-900', given: 'bg-[#daf3e5]' },
  airway: { tab: 'border-blue-200 bg-white text-blue-900', on: 'border-blue-600 bg-blue-600 text-white', item: 'border-blue-200 text-blue-900', given: 'bg-blue-50' },
  other: { tab: 'border-neutral-300 bg-white text-neutral-800', on: 'border-neutral-800 bg-neutral-800 text-white', item: 'border-neutral-300 text-neutral-800', given: 'bg-neutral-200' },
};

export function MorePanel({ counts, onPick, onClose }: Props) {
  const [tab, setTab] = useState<ExtraGroupId>('meds');
  const [picked, setPicked] = useState<string | null>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  // Idle close restarts on a tab change; a pick closes after the flash has shown.
  useEffect(() => {
    const id = setTimeout(() => close.current(), picked ? FLASH_MS : MORE_IDLE_MS);
    return () => clearTimeout(id);
  }, [tab, picked]);

  const group = EXTRAS.find((g) => g.id === tab)!;
  const c = THEME[tab];
  return (
    <section aria-label="More treatments" className="flex min-h-0 flex-1 flex-col gap-2.5">
      <div role="tablist" className="grid shrink-0 grid-cols-3 gap-2">
        {EXTRAS.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={g.id === tab}
            onClick={() => setTab(g.id)}
            className={`h-12 rounded-xl border-2 text-[19px] font-extrabold short:h-11 ${g.id === tab ? THEME[g.id].on : THEME[g.id].tab}`}
          >
            {g.title}
          </button>
        ))}
      </div>
      {/* Always 9 rows (6 on short phones, in 3 columns), so buttons are the same size on every tab. */}
      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-9 gap-2 short:grid-cols-3 short:grid-rows-6 short:gap-1.5">
        {group.items.map(({ label, name }) => {
          const n = counts.get(name) ?? 0;
          return (
            <button
              key={name}
              aria-label={name}
              onClick={() => {
                if (picked) return;
                setPicked(name);
                onPick(name);
              }}
              className={`relative flex min-h-0 items-center justify-between gap-1 overflow-hidden rounded-xl border-2 px-3 text-left text-[17px] leading-tight font-bold short:justify-center short:px-1 short:text-center short:text-[14px] ${c.item} ${n ? c.given : 'bg-white'}`}
            >
              <span>{label}</span>
              {n > 0 && <span className="shrink-0 text-[15px] font-extrabold tabular-nums">×{n}</span>}
              {picked === name && <span aria-hidden className="tile-flash pointer-events-none absolute inset-0" />}
            </button>
          );
        })}
      </div>
      <button onClick={onClose} className="h-14 shrink-0 rounded-[14px] bg-neutral-800 text-[19px] font-bold text-white short:h-12">
        Close
      </button>
    </section>
  );
}
