// Before the case: Start now (big), Catch up, and Last case if one is kept (DESIGN #22).

import { elapsedAt, formatTime, type CaseState } from '../clock';
import { dateDMY, hhmm } from '../log';

type Props = { now: number; last: CaseState | null; onStart: () => void; onCatchup: () => void; onLast: () => void };

export function StartScreen({ now, last, onStart, onCatchup, onLast }: Props) {
  return (
    <main className="mx-auto flex h-dvh max-w-[600px] flex-col gap-4 px-4 pt-[max(24px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))] tabular-nums">
      <header className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold">The Big One: Simple</h1>
        <span className="text-base text-neutral-600">{hhmm(now)}</span>
      </header>
      <button onClick={onStart} className="flex-1 rounded-3xl bg-emerald-600 text-5xl font-extrabold tracking-[-0.5px] text-white active:bg-emerald-700">
        Start now
      </button>
      <button onClick={onCatchup} className="h-[120px] shrink-0 rounded-[20px] border-2 border-neutral-300 bg-white text-[32px] font-bold active:bg-neutral-100 short:h-24">
        Catch up
      </button>
      {last && (
        <button onClick={onLast} className="flex h-16 shrink-0 items-center justify-between rounded-2xl bg-neutral-200 px-5 text-lg font-semibold text-neutral-700">
          <span>Last case</span>
          <span>
            {dateDMY(last.startClockTime)} · {formatTime(elapsedAt(last, now), true)}
          </span>
        </button>
      )}
    </main>
  );
}
