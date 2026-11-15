// Plain-text log for pasting into the ePCR (DESIGN.md §4).

import { elapsedAt, extraCounts, formatTime, isCatchup, type CaseState, type Entry } from './clock';
import { EXTRA_NAMES } from './extras';
import { TILE_BY_ID, tagsFor, type TileId } from './tiles';

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
    case 'extra':
      return e.item ?? 'Other';
    default: {
      const label = TILE_BY_ID[e.kind].label;
      return e.tag ? `${label} (${e.tag})` : label;
    }
  }
}

/**
 * Log elapsed time. A resync can put early entries before the monitor's zero (the app was
 * started before the monitor was on); those read `-00:10`, not the cycle bar's `+` overtime.
 */
export const logElapsed = (sec: number) => (sec < 0 ? `-${formatTime(-sec, true)}` : formatTime(sec, true));

export const hhmm = (ms: number) => clockTime(ms).slice(0, 5);

/** Per-tile totals in clinical order, e.g. `Shock ×3 (VF 2, pVT 1)` or `IV/IO ×2 (IO 1)`. Shared by the screen and the text. */
export function totals(s: CaseState): { id: TileId; text: string }[] {
  const out: { id: TileId; text: string }[] = [];
  for (const id of LOG_ORDER) {
    let count = 0;
    const tagged = new Map<string, number>();
    for (const e of s.entries) {
      if (e.kind !== id) continue;
      count += e.prior ?? 1;
      if (e.tag) tagged.set(e.tag, (tagged.get(e.tag) ?? 0) + 1);
    }
    if (!count) continue;
    const tagText = (tagsFor(id) ?? [])
      .filter((t) => tagged.get(t))
      .map((t) => `${t} ${tagged.get(t)}`)
      .join(', ');
    out.push({ id, text: `${TILE_BY_ID[id].label} ×${count}${tagText ? ` (${tagText})` : ''}` });
  }
  return out;
}

/** "More" list totals in list order, e.g. `Calcium ×1`. They follow the tile totals. */
export function extraTotals(s: CaseState): string[] {
  const counts = extraCounts(s);
  // Names no longer on the list (a case saved by another version) still show, at the end.
  const names = [...EXTRA_NAMES, ...[...counts.keys()].filter((n) => !EXTRA_NAMES.includes(n))];
  return names.filter((n) => counts.get(n)).map((n) => `${n} ×${counts.get(n)}`);
}

/** Log rows: "before app" counts first, then every entry in order. `elapsed`/`clock` are null for priors. */
export function logRows(s: CaseState): { key: string; elapsed: string | null; clock: string | null; item: string }[] {
  const rows: ReturnType<typeof logRows> = [];
  const priors = s.entries.filter((e) => e.prior);
  for (const id of LOG_ORDER) {
    const count = priors.filter((e) => e.kind === id).reduce((n, e) => n + (e.prior ?? 0), 0);
    if (count) rows.push({ key: `prior-${id}`, elapsed: null, clock: null, item: `${TILE_BY_ID[id].label} ×${count}` });
  }
  for (const e of s.entries) {
    if (!e.prior) rows.push({ key: e.id, elapsed: logElapsed(e.elapsed), clock: clockTime(e.at), item: entryLabel(e, s) });
  }
  return rows;
}

export function formatLog(s: CaseState, now = Date.now()): string {
  const lines = [
    `The Big One: Simple, ${dateDMY(s.startClockTime)}`,
    `Start ${clockTime(s.startClockTime)} · Duration ${formatTime(elapsedAt(s, now), true)}`,
  ];
  const t = [...totals(s).map((x) => x.text), ...extraTotals(s)];
  if (t.length) lines.push(t.join(' · '));
  lines.push('');
  for (const r of logRows(s)) {
    lines.push(r.elapsed === null ? `before app · ${r.item}` : `${r.elapsed}  ${r.clock}  ${r.item}`);
  }
  return lines.join('\n');
}
