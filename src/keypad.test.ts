import { describe, expect, it } from 'vitest';
import { EMPTY, digitsDisplay, digitsToSeconds, press, secondsNow, type Key } from './keypad';

const type = (keys: Key[], t = 0) => keys.reduce((v, k, i) => press(v, k, t + i), EMPTY);

describe('keypad', () => {
  it('fills from the right like a microwave', () => {
    const v = type(['7', '3', '0']);
    expect(v.digits).toBe('730');
    expect(digitsDisplay(v.digits)).toBe('07:30');
    expect(digitsToSeconds(v.digits)).toBe(450);
  });

  it('shows hours once a fifth digit is typed and caps at 6 digits', () => {
    const v = type(['1', '2', '3', '4', '5', '6', '7']);
    expect(v.digits).toBe('123456');
    expect(digitsDisplay('12345')).toBe('1:23:45');
    expect(digitsToSeconds('12345')).toBe(3600 + 23 * 60 + 45);
  });

  it('backspace and clear', () => {
    expect(type(['7', '3', '⌫']).digits).toBe('7');
    expect(type(['7', '⌫'])).toEqual(EMPTY);
    expect(type(['7', '3', 'Clear'])).toEqual(EMPTY);
    expect(type(['0', '0']).digits).toBe('');
  });

  it('counts from the last digit typed, not from Start (DESIGN #14)', () => {
    const v = type(['7', '3', '0'], 1000); // last digit at t = 1002
    expect(secondsNow(v, 1002 + 20_000)).toBe(470);
    expect(secondsNow(EMPTY, 99_999)).toBe(0);
  });
});
