// Summary → the log (DESIGN #4, #19-21). A running case can go straight back with no gap;
// it's only closed when New case is tapped. Last case opens here read-only.

import { useEffect, useState } from 'react';
import { elapsedAt, formatTime, type CaseState } from '../clock';
import { clockTime, dateDMY, formatLog, logRows, totals } from '../log';
import { TILE_BY_ID } from '../tiles';

type Props = { s: CaseState; now: number; running: boolean; onBack: () => void; onNewCase: () => void };

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // No async clipboard (e.g. plain http on the local network): fall back to a hidden textarea.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

export function LogScreen({ s, now, running, onBack, onNewCase }: Props) {
  const [copied, setCopied] = useState<'yes' | 'failed' | null>(null);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(null), 2000);
    return () => clearTimeout(id);
  }, [copied]);
  const big = 'h-16 rounded-2xl text-[22px] font-bold short:h-14';

  return (
    <main className="mx-auto flex h-dvh max-w-[600px] flex-col gap-3 px-4 pt-[max(16px,calc(env(safe-area-inset-top)+24px))] pb-[max(16px,env(safe-area-inset-bottom))] tabular-nums">
      <button onClick={onBack} className={`${big} shrink-0 bg-neutral-900 text-white`}>
        {running ? 'Back to case' : 'Back'}
      </button>

      <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-2xl bg-white p-4 select-text">
        <div className="flex flex-col gap-0.5">
          <span className="text-lg font-bold">{dateDMY(s.startClockTime)}</span>
          <span className="text-[15px] text-neutral-600">
            Start {clockTime(s.startClockTime)} · Duration {formatTime(elapsedAt(s, now), true)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {totals(s).map(({ id, text }) => {
            const t = TILE_BY_ID[id];
            return (
              <span key={id} className={`rounded-full px-2.5 py-1 text-sm font-bold ${t.bg === 'bg-white' ? 'bg-neutral-100' : t.bg} ${t.fg}`}>
                {text}
              </span>
            );
          })}
        </div>
        <ol className="border-t border-neutral-200">
          {logRows(s).map((r) => (
            <li key={r.key} className="grid grid-cols-[76px_80px_minmax(0,1fr)] gap-2 border-b border-neutral-100 py-[7px] text-base">
              <span className="font-bold">{r.elapsed ?? 'before'}</span>
              <span className="text-neutral-600">{r.clock ?? 'app'}</span>
              <span className="font-semibold">{r.item}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className={`grid shrink-0 gap-3 ${running ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <button
          onClick={async () => setCopied((await copyText(formatLog(s, Date.now()))) ? 'yes' : 'failed')}
          className={`${big} bg-emerald-600 text-white active:bg-emerald-700`}
        >
          {copied === 'yes' ? 'Copied' : copied === 'failed' ? 'Copy failed' : 'Copy'}
        </button>
        {running && (
          <button onClick={onNewCase} className={`${big} border-2 border-neutral-300 bg-white text-neutral-900`}>
            New case
          </button>
        )}
      </div>
    </main>
  );
}
