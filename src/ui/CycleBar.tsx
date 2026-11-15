// The 2-minute cycle bar. Passive: it drains, turns red at 0:00 and counts the overtime up.
// No sound, no prompt (BRIEF). The whole bar is a button that restarts the 2:00.

import { CYCLE_SECONDS, formatTime } from '../clock';

type Props = {
  remaining: number | null; // null after ROSC
  roscAgo: number | null;
  onRestart: () => void;
};

const base =
  'relative flex h-[108px] w-full shrink-0 flex-col items-center justify-center overflow-hidden rounded-[18px] tabular-nums short:h-[84px]';
const big = 'relative text-[76px] font-extrabold leading-none tracking-[-2px] short:text-[60px]';

export function CycleBar({ remaining, roscAgo, onRestart }: Props) {
  if (remaining === null) {
    return (
      <button
        aria-label="Cycle stopped at ROSC, tap to restart"
        onClick={onRestart}
        className={`${base} gap-0.5 border-2 border-dashed border-neutral-400 bg-neutral-200`}
      >
        <span className="text-[40px] font-extrabold leading-none tracking-wide text-neutral-800 short:text-[34px]">ROSC</span>
        {roscAgo !== null && <span className="text-[17px] font-semibold text-neutral-700">{formatTime(roscAgo)} ago</span>}
      </button>
    );
  }

  if (remaining <= 0) {
    return (
      <button aria-label="Two minute cycle overdue, tap to restart" onClick={onRestart} className={`${base} bg-red-600`}>
        <span className={`${big} text-white`}>{formatTime(remaining)}</span>
      </button>
    );
  }

  const pct = Math.min(100, (remaining / CYCLE_SECONDS) * 100);
  return (
    <button aria-label="Two minute cycle, tap to restart" onClick={onRestart} className={`${base} bg-emerald-100`}>
      {/* The width eases between 250 ms re-renders so the drain looks continuous. */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-emerald-500 transition-[width] duration-300 ease-linear"
        style={{ width: `${pct}%` }}
      />
      <span className={`${big} text-emerald-950`}>{formatTime(remaining)}</span>
    </button>
  );
}
