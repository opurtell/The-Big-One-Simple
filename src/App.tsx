// Phase 1 placeholder: unstyled screens so the logic can be clicked through.
// Phase 2 replaces the case screen and Phase 3 the start, catch-up and log screens.

import { useState } from 'react';
import { cycleRemaining, elapsedAt, formatTime, tileStats, undoable, type Pattern } from './clock';
import { entryLabel, formatLog } from './log';
import { TILES, type TileId } from './tiles';
import { useCase } from './useCase';

type Screen = 'start' | 'catchup' | 'case' | 'log';
const PATTERNS: Pattern[] = ['evens', 'odds', 'half-evens', 'half-odds'];
const btn = 'border border-neutral-400 bg-white px-3 py-2 m-1';

export default function App() {
  const c = useCase();
  const [screen, setScreen] = useState<Screen>(c.current ? 'case' : 'start');
  const [secs, setSecs] = useState('');
  const [enteredAt, setEnteredAt] = useState(0);
  const [pattern, setPattern] = useState<Pattern | undefined>();
  const [priors, setPriors] = useState<Partial<Record<TileId, number>>>({});
  const [monitor, setMonitor] = useState('');

  const s = c.current;
  const view = screen === 'log' ? (s ?? c.last) : s;

  if (screen === 'start' || !view) {
    return (
      <main className="p-4">
        <h1 className="font-bold">The Big One: Simple</h1>
        <button className={btn} onClick={() => (c.startNow(), setScreen('case'))}>Start now</button>
        <button className={btn} onClick={() => setScreen('catchup')}>Catch up</button>
        {c.last && <button className={btn} onClick={() => setScreen('log')}>Last case</button>}
        {screen === 'catchup' && (
          <section className="mt-4">
            <label>
              Monitor seconds{' '}
              <input className="border" inputMode="numeric" value={secs}
                onChange={(e) => (setSecs(e.target.value), setEnteredAt(Date.now()))} />
            </label>
            <div>
              {PATTERNS.map((p) => (
                <button key={p} className={`${btn} ${pattern === p ? 'font-bold' : ''}`}
                  onClick={() => setPattern(pattern === p ? undefined : p)}>{p}</button>
              ))}
            </div>
            {TILES.filter((t) => t.inCatchup).map((t) => (
              <div key={t.id}>
                {t.label} {priors[t.id] ?? 0}
                <button className={btn} onClick={() => setPriors({ ...priors, [t.id]: Math.max(0, (priors[t.id] ?? 0) - 1) })}>−</button>
                <button className={btn} onClick={() => setPriors({ ...priors, [t.id]: (priors[t.id] ?? 0) + 1 })}>+</button>
              </div>
            ))}
            <button className={btn} onClick={() => {
              // The catch-up clock runs from the last keystroke, not from this tap (DESIGN #14).
              const typed = Number(secs) || 0;
              const extra = enteredAt ? (Date.now() - enteredAt) / 1000 : 0;
              c.startCatchup(typed + extra, pattern, priors);
              setScreen('case');
            }}>Start</button>
          </section>
        )}
      </main>
    );
  }

  if (screen === 'log') {
    const text = formatLog(view, c.now);
    return (
      <main className="p-4">
        {s && <button className={btn} onClick={() => setScreen('case')}>Back to case</button>}
        <button className={btn} onClick={() => navigator.clipboard?.writeText(text)}>Copy</button>
        {s && <button className={btn} onClick={() => (c.newCase(), setScreen('start'))}>New case</button>}
        {!s && <button className={btn} onClick={() => setScreen('start')}>Back</button>}
        <pre className="mt-4 whitespace-pre-wrap text-sm">{text}</pre>
      </main>
    );
  }

  const remaining = cycleRemaining(view, c.now);
  const next = undoable(view);
  const lastShock = [...view.entries].reverse().find((e) => e.kind === 'shock' && !e.prior);
  return (
    <main className="p-4">
      <div>Elapsed {formatTime(elapsedAt(view, c.now), true)}</div>
      <button className={btn} onClick={c.restartCycle}>
        Cycle {remaining === null ? 'ROSC' : formatTime(remaining)}
      </button>
      <div>
        {TILES.map((t) => {
          const { count, sinceLast } = tileStats(view, t.id, c.now);
          return (
            <button key={t.id} className={`${btn} ${t.bg} ${t.fg}`} onClick={() => c.tap(t.id)}>
              {t.label}{count > 0 && ` ×${count}`}{sinceLast !== null && ` · ${formatTime(sinceLast)} ago`}
            </button>
          );
        })}
      </div>
      {lastShock && (
        <div>
          Tag last shock:
          <button className={btn} onClick={() => c.tagShock(lastShock.id, 'VF')}>VF</button>
          <button className={btn} onClick={() => c.tagShock(lastShock.id, 'pVT')}>pVT</button>
        </div>
      )}
      <div>
        <input className="border" placeholder="monitor secs" inputMode="numeric" value={monitor}
          onChange={(e) => setMonitor(e.target.value)} />
        <button className={btn} onClick={() => (c.resync(Number(monitor) || 0), setMonitor(''))}>Resync</button>
      </div>
      <button className={btn} disabled={!next} onClick={c.undo}>
        {next ? `Undo ${entryLabel(next)}` : 'Undo'}
      </button>
      <button className={btn} onClick={() => setScreen('log')}>End case</button>
    </main>
  );
}
