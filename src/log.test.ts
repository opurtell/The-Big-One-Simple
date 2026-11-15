import { describe, expect, it } from 'vitest';
import { endCase, resync, restartCycle, startCase, tagShock, tap, type CaseState } from './clock';
import { formatLog } from './log';
import type { TileId } from './tiles';

// Start clock 14:32:10, catch-up at 07:30 → app started 14:39:40 (DESIGN.md §4 sample).
const T0 = new Date(2026, 10, 15, 14, 32, 10).getTime();
const at = (elapsed: number) => T0 + elapsed * 1000;

function sample(): CaseState {
  let s = startCase(at(450), 450, undefined, { shock: 1, adrenaline: 1 });
  const t = (id: TileId, e: number) => (s = tap(s, id, at(e)));
  t('ivio', 485);
  t('shock', 571);
  s = tagShock(s, s.entries.at(-1)!.id, 'VF');
  t('adrenaline', 600);
  t('shock', 700);
  s = tagShock(s, s.entries.at(-1)!.id, 'pVT');
  t('amiodarone', 760);
  t('disarm', 820);
  t('lma', 900);
  t('rosc', 1200);
  return endCase(s, at(1455));
}

describe('formatLog', () => {
  it('matches the DESIGN.md sample format', () => {
    expect(formatLog(sample())).toBe(
      [
        'The Big One: Simple, 15/11/2026',
        'Start 14:32:10 · Duration 24:15',
        'Shock ×3 (VF 1, pVT 1) · Adrenaline ×2 · Amiodarone ×1 · Disarm ×1 · IV/IO ×1 · LMA ×1 · ROSC ×1',
        '',
        'before app · Shock ×1',
        'before app · Adrenaline ×1',
        '07:30  14:39:40  Start (catch-up)',
        '08:05  14:40:15  IV/IO',
        '09:31  14:41:41  Shock (VF)',
        '10:00  14:42:10  Adrenaline',
        '11:40  14:43:50  Shock (pVT)',
        '12:40  14:44:50  Amiodarone',
        '13:40  14:45:50  Disarm',
        '15:00  14:47:10  LMA',
        '20:00  14:52:10  ROSC',
      ].join('\n'),
    );
  });

  it('names a plain start, cycle restarts and resyncs', () => {
    let s = startCase(T0);
    s = restartCycle(s, at(100));
    s = resync(s, 112, at(110));
    s = resync(s, 105, at(120));
    const lines = formatLog(s, at(130)).split('\n');
    expect(lines.slice(-4)).toEqual([
      '00:00  14:32:10  Start',
      '01:40  14:33:50  Cycle restart',
      '01:52  14:34:00  Resync +0:02',
      '01:45  14:34:10  Resync -0:17',
    ]);
  });
});
