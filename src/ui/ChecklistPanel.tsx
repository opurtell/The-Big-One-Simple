// SPDX-License-Identifier: Apache-2.0
// ROSC / PHEA checklist (ported from upstream `ROSCSelection`, `PHEASelection`, `CheckItem`,
// `SectionGroup`). It takes the place of the tiles, so the ROSC timer stays in view above it.
// Tap a row to tick it; ticks are kept for the case but never logged.

import { CHECKLISTS, itemLabel, type ChecklistId } from '../checklists';

type Props = { list: ChecklistId; ticked: string[]; onToggle: (label: string) => void; onClose: () => void };

// Upstream colours: ROSC = orange, PHEA = purple, Post-intubation header = dark purple.
const THEME = {
  rosc: { head: 'bg-orange-50 text-orange-800 border-orange-200', on: 'bg-orange-50 text-orange-900', box: 'bg-orange-500 border-orange-500', frame: 'border-orange-400' },
  phea: { head: 'bg-purple-50 text-purple-800 border-purple-200', on: 'bg-purple-50 text-purple-900', box: 'bg-purple-500 border-purple-500', frame: 'border-purple-400' },
};

export function ChecklistPanel({ list, ticked, onToggle, onClose }: Props) {
  const { title, sections } = CHECKLISTS[list];
  const c = THEME[list];
  return (
    <section aria-label={title} className="flex min-h-0 flex-1 flex-col gap-2.5">
      <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-[18px] border-4 bg-white ${c.frame}`}>
        {sections.map((sec) => (
          <div key={sec.title}>
            <h2
              className={`sticky top-0 z-10 border-b px-4 py-2.5 text-center text-[16px] font-bold tracking-wide uppercase ${
                sec.dark ? 'border-purple-900 bg-purple-800 text-white' : c.head
              }`}
            >
              {sec.title}
            </h2>
            <ul className="space-y-0.5 p-1">
              {sec.items.map((item) => {
                const label = itemLabel(item);
                const on = ticked.includes(label);
                return (
                  <li key={label}>
                    <button
                      role="checkbox"
                      aria-checked={on}
                      onClick={() => onToggle(label)}
                      className={`flex min-h-12 w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left ${on ? c.on : 'text-neutral-700'}`}
                    >
                      <span
                        aria-hidden
                        className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2 text-[15px] font-black text-white ${
                          on ? c.box : 'border-neutral-300 bg-white'
                        }`}
                      >
                        {on && '✓'}
                      </span>
                      <span className="flex-1">
                        <span className="text-[17px] font-medium">{label}</span>
                        {typeof item !== 'string' && (
                          <ul className="mt-1.5 space-y-1">
                            {item.sub.map((x) => (
                              <li key={x} className="text-[16px]">• {x}</li>
                            ))}
                          </ul>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="h-14 shrink-0 rounded-[14px] bg-neutral-800 text-[19px] font-bold text-white short:h-12">
        Close {title}
      </button>
    </section>
  );
}
