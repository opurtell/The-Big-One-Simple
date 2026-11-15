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
    // ROSC: time since ROSC becomes the main timer, same size as the countdown. A tap is
    // still a re-arrest (restarts the 2:00, DESIGN #5), as Shock and Disarm are.
    return (
      <button
        aria-label="Time since ROSC, tap to restart the cycle"
        onClick={onRestart}
        className={`${base} border-2 border-emerald-700 bg-emerald-600`}
      >
        <span className="absolute top-2 left-3.5 text-[17px] font-bold tracking-wide text-emerald-50 short:top-1.5">ROSC</span>
        <span className={`${big} text-white`}>{formatTime(roscAgo ?? 0)}</span>
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
