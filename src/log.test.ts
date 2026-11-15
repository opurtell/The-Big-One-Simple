import { describe, expect, it } from 'vitest';
import { endCase, resync, restartCycle, startCase, tagEntry, tap, type CaseState } from './clock';
import { formatLog } from './log';
import type { TileId } from './tiles';

// Start clock 14:32:10, catch-up at 07:30 → app started 14:39:40 (DESIGN.md §4 sample).
const T0 = new Date(2026, 10, 15, 14, 32, 10).getTime();
const at = (elapsed: number) => T0 + elapsed * 1000;

function sample(): CaseState {
  let s = startCase(at(450), 450, undefined, { shock: 1, adrenaline: 1 });
  const t = (id: TileId, e: number) => (s = tap(s, id, at(e)));
  t('ivio', 485);
  s = tagEntry(s, s.entries.at(-1)!.id, 'IO');
  t('shock', 571);
  s = tagEntry(s, s.entries.at(-1)!.id, 'VF');
  t('adrenaline', 600);
  t('shock', 700);
  s = tagEntry(s, s.entries.at(-1)!.id, 'pVT');
  t('amiodarone', 760);
  t('disarm', 820);
  t('lma', 900);
  s = tagEntry(s, s.entries.at(-1)!.id, 'ETT');
  t('rosc', 1200);
  return endCase(s, at(1455));
}

describe('formatLog', () => {
  it('matches the DESIGN.md sample format', () => {
    expect(formatLog(sample())).toBe(
      [
        'The Big One: Simple, 15/11/2026',
        'Start 14:32:10 · Duration 24:15',
        'Shock ×3 (VF 1, pVT 1) · Adrenaline ×2 · Amiodarone ×1 · Disarm ×1 · IV/IO ×1 (IO 1) · Airway ×1 (ETT 1) · ROSC ×1',
        '',
        'before app · Shock ×1',
        'before app · Adrenaline ×1',
        '07:30  14:39:40  Start (catch-up)',
        '08:05  14:40:15  IV/IO (IO)',
        '09:31  14:41:41  Shock (VF)',
        '10:00  14:42:10  Adrenaline',
        '11:40  14:43:50  Shock (pVT)',
        '12:40  14:44:50  Amiodarone',
        '13:40  14:45:50  Disarm',
        '15:00  14:47:10  Airway (ETT)',
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
    // Each resync re-bases everything before it; clock times never move. The net -0:15
    // puts Start before the monitor's zero, and the header start moves to monitor zero.
    expect(lines[1]).toBe('Start 14:32:25 · Duration 01:55');
    expect(lines.slice(-4)).toEqual([
      '-00:15  14:32:10  Start',
      '01:25  14:33:50  Cycle restart',
      '01:35  14:34:00  Resync +0:02',
      '01:45  14:34:10  Resync -0:17',
    ]);
  });

  it('a resync re-bases earlier lines but leaves before-app lines and clock times alone', () => {
    let s = startCase(at(450), 450, undefined, { shock: 2 });
    s = tap(s, 'adrenaline', at(500));
    s = resync(s, 530, at(520)); // monitor 10 s ahead
    s = tap(s, 'shock', at(560));
    const text = formatLog(s, at(600));
    expect(text).toContain('Start 14:32:00 ·');
    expect(text.split('\n').slice(-5)).toEqual([
      'before app · Shock ×2',
      '07:40  14:39:40  Start (catch-up)',
      '08:30  14:40:30  Adrenaline',
      '08:50  14:40:50  Resync +0:10',
      '09:30  14:41:30  Shock',
    ]);
  });
});
