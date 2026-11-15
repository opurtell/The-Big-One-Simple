// The one screen used mid-arrest (DESIGN.md §2). Everything here is derived from the
// case and `now`; no time is counted in the UI.

import {
  cycleRemaining, elapsedAt, formatTime, pendingShockTag, tileStats, undoable,
  type CaseState, type Rhythm,
} from '../clock';
import { entryLabel, hhmm } from '../log';
import { TILES, type TileId } from '../tiles';
import { CycleBar } from './CycleBar';
import { ShockTag } from './ShockTag';
import { Tile } from './Tile';

type Props = {
  s: CaseState;
  now: number;
  onTap: (id: TileId) => void;
  onTagShock: (entryId: string, rhythm: Rhythm) => void;
  onRestartCycle: () => void;
  onUndo: () => void;
  onResync: () => void;
  onEnd: () => void;
};

const GRID = TILES.filter((t) => t.id !== 'rosc');
const ROSC = TILES.find((t) => t.id === 'rosc')!;

export function CaseScreen({ s, now, onTap, onTagShock, onRestartCycle, onUndo, onResync, onEnd }: Props) {
  const next = undoable(s);
  const shock = pendingShockTag(s, now);
  const rosc = tileStats(s, 'rosc', now);

  return (
    <main className="mx-auto flex h-dvh max-w-[600px] flex-col gap-2.5 overflow-hidden px-3 pt-[max(8px,calc(env(safe-area-inset-top)+24px))] pb-[max(12px,env(safe-area-inset-bottom))] tabular-nums">
      <header className="flex h-[52px] shrink-0 items-center justify-between short:h-11">
        <span className="text-[17px] font-semibold text-neutral-500">{hhmm(now)}</span>
        <button
          aria-label="Elapsed time, tap to resync"
          onClick={onResync}
          className="text-[48px] font-extrabold leading-none tracking-[-1px] text-neutral-900 short:text-[42px]"
        >
          {formatTime(elapsedAt(s, now), true)}
        </button>
      </header>

      <CycleBar remaining={cycleRemaining(s, now)} roscAgo={rosc.sinceLast} onRestart={onRestartCycle} />

      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-3 gap-2.5">
        {GRID.map((t) => {
          const { count, sinceLast } = tileStats(s, t.id, now);
          if (t.id === 'shock' && shock) {
            return <ShockTag key={shock.id} shock={shock} count={count} onTag={(r) => onTagShock(shock.id, r)} />;
          }
          return <Tile key={t.id} tile={t} count={count} sinceLast={sinceLast} onTap={() => onTap(t.id)} />;
        })}
      </div>

      <Tile tile={ROSC} count={rosc.count} sinceLast={rosc.sinceLast} onTap={() => onTap('rosc')} wide />

      <div className="grid shrink-0 grid-cols-2 gap-2.5">
        <button
          onClick={onUndo}
          disabled={!next}
          className="h-14 truncate rounded-[14px] border-2 border-neutral-300 bg-white px-1 text-[16px] font-bold text-neutral-800 min-[400px]:text-[19px] disabled:text-neutral-300 short:h-12"
        >
          {next ? `Undo ${entryLabel(next)}` : 'Undo'}
        </button>
        <button onClick={onEnd} className="h-14 rounded-[14px] bg-neutral-800 text-[16px] font-bold text-white short:h-12 min-[400px]:text-[19px]">
          End case
        </button>
      </div>
    </main>
  );
}
