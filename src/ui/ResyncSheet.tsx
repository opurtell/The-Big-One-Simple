// Bottom sheet for matching the monitor's elapsed time (DESIGN #18). Only elapsed time
// moves; the cycle bar shifts with it, and the resync is logged and undoable.

import { useState } from 'react';
import { elapsedAt, formatTime, type CaseState } from '../clock';
import { EMPTY, digitsDisplay, digitsToSeconds, secondsNow, type KeypadValue } from '../keypad';
import { Keypad } from './Keypad';

type Props = { s: CaseState; now: number; onSet: (monitorElapsed: number) => void; onCancel: () => void };

export function ResyncSheet({ s, now, onSet, onCancel }: Props) {
  const [time, setTime] = useState<KeypadValue>(EMPTY);
  const app = elapsedAt(s, now);
  // Delta as it was when the last digit was typed; it doesn't drift while the sheet is open.
  const delta = time.digits ? Math.round(digitsToSeconds(time.digits) - (time.enteredAt - s.startTime + s.pausedTime) / 1000) : null;

  return (
    <div className="fixed inset-0 z-10 flex flex-col justify-end bg-neutral-900/55 tabular-nums" onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto flex w-full max-w-[600px] flex-col gap-3.5 rounded-t-3xl bg-neutral-100 px-4 pt-5 pb-[max(24px,env(safe-area-inset-bottom))] short:gap-2.5 short:pt-4"
      >
        <div className="flex items-baseline justify-between">
          <span className="text-[22px] font-bold">Monitor time</span>
          <span className="text-[17px] font-semibold text-neutral-600">App {formatTime(app, true)}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-2 short:py-1">
          <span className="text-[22px] font-bold text-emerald-700">
            {delta === null ? '' : `${delta < 0 ? '-' : '+'}${formatTime(Math.abs(delta))}`}
          </span>
          <span className={`text-[64px] font-extrabold leading-tight tracking-[-1px] short:text-[52px] ${time.digits ? '' : 'text-neutral-300'}`}>
            {digitsDisplay(time.digits)}
          </span>
        </div>
        <Keypad value={time} onChange={setTime} />
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onCancel} className="h-16 rounded-2xl border-2 border-neutral-300 bg-white text-[22px] font-bold text-neutral-800 short:h-14">
            Cancel
          </button>
          <button
            disabled={!time.digits}
            onClick={() => onSet(secondsNow(time, Date.now()))}
            className="h-16 rounded-2xl bg-emerald-600 text-[22px] font-bold text-white disabled:bg-neutral-300 short:h-14"
          >
            Set {time.digits && digitsDisplay(time.digits)}
          </button>
        </div>
      </div>
    </div>
  );
}
