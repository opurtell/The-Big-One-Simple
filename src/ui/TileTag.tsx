// For 5 s after a tap on a tagged tile, that tile offers an optional two-way tag:
// VF | pVT on Shock, IV | IO on IV/IO, LMA | ETT on Airway (DESIGN #6a-c).
// The entry is already logged; ignoring this leaves it untagged ("Shock", "IV/IO").
// Not a modal: every other tile keeps working, and tapping one closes this.

import { useState } from 'react';
import { TAG_MS, type Entry } from '../clock';
import { TILE_BY_ID, tagsFor, type Tag, type TileId } from '../tiles';

type Props = { entry: Entry & { kind: TileId }; count: number; onTag: (tag: Tag) => void };

// Same layout for every tile; only the colour follows the tile (Shock red, the rest blue).
const STYLE: Partial<Record<TileId, { panel: string; idle: string; picked: string }>> = {
  shock: { panel: 'bg-red-700', idle: 'bg-white text-red-700', picked: 'bg-red-950' },
};
const BLUE = { panel: 'bg-blue-800', idle: 'bg-white text-blue-900', picked: 'bg-blue-950' };

export function TileTag({ entry, count, onTag }: Props) {
  // Read once: the shrinking line is a CSS animation started part-way through if the
  // screen re-mounts (e.g. back from the log), so it always ends at tap + 5 s.
  const [delay] = useState(() => entry.at - Date.now());
  const style = STYLE[entry.kind] ?? BLUE;
  return (
    <div className={`flex min-h-0 flex-col gap-1.5 rounded-[18px] p-1.5 ${style.panel}`}>
      <span className="text-center text-[15px] font-bold leading-tight text-white">
        {TILE_BY_ID[entry.kind].label} ×{count} logged
      </span>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-1.5">
        {(tagsFor(entry.kind) ?? []).map((t) => {
          const picked = entry.tag === t;
          const other = entry.tag !== undefined && !picked;
          return (
            <button
              key={t}
              aria-pressed={picked}
              onClick={() => onTag(t)}
              className={`rounded-xl text-[26px] font-extrabold ${
                picked ? `${style.picked} text-white ring-4 ring-white ring-inset` : style.idle
              } ${other ? 'opacity-60' : ''}`}
            >
              {t}
            </button>
          );
        })}
      </div>
      <div aria-hidden className="h-1 overflow-hidden rounded-sm bg-white/35">
        <div
          className="tag-countdown h-1 bg-white"
          style={{ animationDuration: `${TAG_MS}ms`, animationDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}
