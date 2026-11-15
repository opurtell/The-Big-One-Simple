// Microwave-style time entry (DESIGN #13): digits fill from the right, so 7, 3, 0 → 07:30.
// Max 6 digits (h:mm:ss). Pure, so it's tested without the UI.

export const MAX_DIGITS = 6;

export type KeypadValue = { digits: string; enteredAt: number };
export const EMPTY: KeypadValue = { digits: '', enteredAt: 0 };

export const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', '⌫'] as const;
export type Key = (typeof KEYS)[number];

/** Applies one key. `enteredAt` is the time of the last key, which is when the typed time was true. */
export function press(v: KeypadValue, key: Key, now: number): KeypadValue {
  if (key === 'Clear') return EMPTY;
  if (key === '⌫') return v.digits.length > 1 ? { digits: v.digits.slice(0, -1), enteredAt: now } : EMPTY;
  if (v.digits.length >= MAX_DIGITS || (key === '0' && !v.digits)) return v; // leading zero adds nothing
  return { digits: v.digits + key, enteredAt: now };
}

const split = (digits: string) => {
  const p = digits.padStart(MAX_DIGITS, '0');
  return [Number(p.slice(0, 2)), Number(p.slice(2, 4)), Number(p.slice(4, 6))];
};

/** Seconds typed. Like a microwave, 90 in the seconds place means 90 s. */
export function digitsToSeconds(digits: string): number {
  const [h, m, s] = split(digits);
  return h * 3600 + m * 60 + s;
}

/** What was typed, as typed: `07:30`, or `1:23:45` once hours are entered. */
export function digitsDisplay(digits: string): string {
  const [h, m, s] = split(digits);
  const two = (n: number) => String(n).padStart(2, '0');
  return digits.length > 4 ? `${h}:${two(m)}:${two(s)}` : `${two(m)}:${two(s)}`;
}

/** The monitor's time now: what was typed plus the seconds since the last key (DESIGN #14). */
export function secondsNow(v: KeypadValue, now: number): number {
  if (!v.digits) return 0;
  return digitsToSeconds(v.digits) + Math.max(0, now - v.enteredAt) / 1000;
}
