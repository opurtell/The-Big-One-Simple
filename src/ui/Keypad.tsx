// The one keypad for catch-up and resync (DESIGN #13). Controlled: the parent holds the value.

import { KEYS, press, type KeypadValue } from '../keypad';

type Props = { value: KeypadValue; onChange: (v: KeypadValue) => void; size?: 'sm' | 'lg' };

export function Keypad({ value, onChange, size = 'lg' }: Props) {
  const h = size === 'lg' ? 'h-16 text-[28px] short:h-14' : 'h-12 text-2xl short:h-10';
  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((k) => (
        <button
          key={k}
          aria-label={k === '⌫' ? 'Delete' : undefined}
          onClick={() => onChange(press(value, k, Date.now()))}
          className={`${h} rounded-[14px] border border-neutral-200 bg-white font-bold text-neutral-900 active:bg-neutral-200 ${
            k === 'Clear' ? '!text-xl' : ''
          }`}
        >
          {k}
        </button>
      ))}
    </div>
  );
}
