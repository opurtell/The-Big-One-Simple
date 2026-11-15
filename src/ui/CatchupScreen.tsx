// Catch up (DESIGN #14-16): the monitor's time, an optional rhythm-check pattern, and what
// has already been given. The clock runs from the last digit typed, not from Start.

import { useState } from 'react';
import { formatTime, type Pattern } from '../clock';
import { EMPTY, digitsDisplay, secondsNow, type KeypadValue } from '../keypad';
import { TILES, type TileId } from '../tiles';
import { Keypad } from './Keypad';

type Props = {
  now: number;
  onBack: () => void;
  onStart: (elapsed: number, pattern: Pattern | undefined, priors: Partial<Record<TileId, number>>) => void;
};

const PATTERNS: { id: Pattern; label: string }[] = [
  { id: 'evens', label: 'Evens' },
  { id: 'odds', label: 'Odds' },
  { id: 'half-evens', label: 'Half evens' },
  { id: 'half-odds', label: 'Half odds' },
];
const STEPPERS = TILES.filter((t) => t.inCatchup);
const step = 'h-9 w-11 rounded-[10px] bg-white/80 text-[22px] font-bold active:bg-white';

export function CatchupScreen({ now, onBack, onStart }: Props) {
  const [time, setTime] = useState<KeypadValue>(EMPTY);
  const [pattern, setPattern] = useState<Pattern | undefined>();
  const [priors, setPriors] = useState<Partial<Record<TileId, number>>>({});
  const bump = (id: TileId, d: number) => setPriors((p) => ({ ...p, [id]: Math.max(0, (p[id] ?? 0) + d) }));
  // The button shows the monitor's time as it is now, so it ticks once the digits are in.
  const startLabel = time.digits ? formatTime(secondsNow(time, now), true) : '00:00';

  return (
    <main className="mx-auto flex h-dvh max-w-[600px] flex-col gap-3 overflow-y-auto px-4 pt-[max(16px,calc(env(safe-area-inset-top)+24px))] pb-[max(16px,env(safe-area-inset-bottom))] tabular-nums short:gap-2 short:pt-[max(12px,calc(env(safe-area-inset-top)+24px))] short:pb-[max(12px,env(safe-area-inset-bottom))]">
      <header className="flex h-11 shrink-0 items-center justify-between short:h-10">
        <button onClick={onBack} className="h-11 w-[72px] rounded-xl short:h-10 bg-neutral-200 text-[17px] font-semibold text-neutral-700">
          Back
        </button>
        <h1 className="text-[22px] font-bold">Catch up</h1>
        <span className="w-[72px]" />
      </header>

      <div className="flex shrink-0 items-center justify-between rounded-2xl bg-white px-4 py-2 short:py-1">
        <span className="text-[17px] font-semibold text-neutral-600">Monitor time</span>
        <span className={`text-[56px] font-extrabold leading-tight tracking-[-1px] short:text-[44px] ${time.digits ? '' : 'text-neutral-300'}`}>
          {digitsDisplay(time.digits)}
        </span>
      </div>

      <Keypad value={time} onChange={setTime} size="sm" />

      <section className="flex shrink-0 flex-col gap-1.5">
        <span className="text-[13px] font-bold uppercase tracking-[0.5px] text-neutral-600">Rhythm checks (optional)</span>
        <div className="grid grid-cols-4 gap-1.5">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              aria-pressed={pattern === p.id}
              onClick={() => setPattern(pattern === p.id ? undefined : p.id)}
              className={`h-11 rounded-xl border-2 text-[15px] short:h-10 leading-tight ${
                pattern === p.id ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-800' : 'border-neutral-200 bg-white font-semibold text-neutral-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid shrink-0 grid-cols-2 gap-2">
        {STEPPERS.map((t) => (
          <div key={t.id} className={`flex h-[72px] flex-col justify-between rounded-[14px] border px-2 py-1.5 short:h-[60px] short:py-1 ${t.bg} ${t.fg} ${t.border}`}>
            <span className="text-center text-base font-bold">{t.label}</span>
            <div className="flex items-center justify-between">
              <button aria-label={`${t.label} minus`} className={step} onClick={() => bump(t.id, -1)}>−</button>
              <span className="text-[22px] font-extrabold">{priors[t.id] ?? 0}</span>
              <button aria-label={`${t.label} plus`} className={step} onClick={() => bump(t.id, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onStart(secondsNow(time, Date.now()), pattern, priors)}
        className="min-h-12 shrink-0 grow rounded-2xl bg-emerald-600 text-[26px] font-extrabold text-white active:bg-emerald-700"
      >
        Start at {startLabel}
      </button>
    </main>
  );
}
