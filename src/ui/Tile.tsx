// One big tile: the label, then `×n · m:ss ago` once used (DESIGN #11). Flashes on tap.

import { useState } from 'react';
import { formatTime } from '../clock';
import type { Tile as TileDef } from '../tiles';

type Props = {
  tile: TileDef;
  count: number;
  sinceLast: number | null;
  onTap: () => void;
  wide?: boolean;
};

export function Tile({ tile, count, sinceLast, onTap, wide }: Props) {
  // A fresh key replays the CSS flash on every tap; iOS can't vibrate, so this is the cue.
  const [flash, setFlash] = useState(0);
  return (
    <button
      onClick={() => {
        setFlash((n) => n + 1);
        onTap();
      }}
      className={`relative flex min-h-0 flex-col items-center justify-center overflow-hidden rounded-[18px] border-2 p-2 ${
        wide ? 'h-[88px] shrink-0 gap-1 short:h-[72px]' : 'gap-1.5'
      } ${tile.bg} ${tile.fg} ${tile.border}`}
    >
      <span className={`font-extrabold leading-none ${wide ? 'text-[30px] tracking-wide' : 'text-[28px] short:text-[26px]'}`}>
        {tile.label}
      </span>
      {count > 0 && (
        <span className={`font-semibold leading-none tabular-nums ${wide ? 'text-[17px]' : 'text-lg short:text-base'}`}>
          ×{count}
          {sinceLast !== null && ` · ${formatTime(sinceLast)} ago`}
        </span>
      )}
      {flash > 0 && <span key={flash} aria-hidden className="tile-flash pointer-events-none absolute inset-0" />}
    </button>
  );
}
