// Plain-text log for pasting into the ePCR (DESIGN.md §4).

import { elapsedAt, formatTime, isCatchup, type CaseState, type Entry } from './clock';
import { TILE_BY_ID, type TileId } from './tiles';

// Totals and "before app" lines read in clinical order, not grid order.
const LOG_ORDER: TileId[] = ['shock', 'adrenaline', 'amiodarone', 'disarm', 'ivio', 'lma', 'rosc'];

const two = (n: number) => String(n).padStart(2, '0');
export const clockTime = (ms: number) => {
  const d = new Date(ms);
  return `${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`;
};
export const dateDMY = (ms: number) => {
  const d = new Date(ms);
  return `${two(d.getDate())}/${two(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export function entryLabel(e: Entry, s?: CaseState): string {
  switch (e.kind) {
    case 'start':
      return s && isCatchup(s) ? 'Start (catch-up)' : 'Start';
    case 'cycle':
      return 'Cycle restart';
    case 'resync':
      return `Resync ${(e.delta ?? 0) < 0 ? '-' : '+'}${formatTime(Math.abs(e.delta ?? 0))}`;
    default: {
      const label = TILE_BY_ID[e.kind].label;
      return e.rhythm ? `${label} (${e.rhythm})` : label;
    }
  }
}

function totals(s: CaseState): string {
  const parts: string[] = [];
  for (const id of LOG_ORDER) {
    let count = 0;
    const tags = { VF: 0, pVT: 0 };
    for (const e of s.entries) {
      if (e.kind !== id) continue;
      count += e.prior ?? 1;
      if (e.rhythm) tags[e.rhythm] += 1;
    }
    if (!count) continue;
    const tagText = [tags.VF && `VF ${tags.VF}`, tags.pVT && `pVT ${tags.pVT}`].filter(Boolean).join(', ');
    parts.push(`${TILE_BY_ID[id].label} ×${count}${tagText ? ` (${tagText})` : ''}`);
  }
  return parts.join(' · ');
}

export function formatLog(s: CaseState, now = Date.now()): string {
  const lines = [
    `The Big One: Simple, ${dateDMY(s.startClockTime)}`,
    `Start ${clockTime(s.startClockTime)} · Duration ${formatTime(elapsedAt(s, now), true)}`,
  ];
  const t = totals(s);
  if (t) lines.push(t);
  lines.push('');
  const priors = s.entries.filter((e) => e.prior);
  for (const id of LOG_ORDER) {
    const count = priors.filter((e) => e.kind === id).reduce((n, e) => n + (e.prior ?? 0), 0);
    if (count) lines.push(`before app · ${TILE_BY_ID[id].label} ×${count}`);
  }
  for (const e of s.entries) {
    if (e.prior) continue;
    lines.push(`${formatTime(e.elapsed, true)}  ${clockTime(e.at)}  ${entryLabel(e, s)}`);
  }
  return lines.join('\n');
}
