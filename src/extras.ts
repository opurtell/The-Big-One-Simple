// SPDX-License-Identifier: Apache-2.0
// The "More" list (DESIGN #6d): Matt's full medication and treatment list, as names only.
// Ported from upstream App.tsx `MEDICATIONS` (L73) and the Airway / Other Tx sections (~L5741).
// No doses (BRIEF: a log, not decision support). Items a tile already logs are left out:
// adrenaline push, amiodarone, LMA, ETT, IV access, IO access.

export type Extra = { label: string; name: string }; // label on the button, name in the log
export type ExtraGroupId = 'meds' | 'airway' | 'other';
export type ExtraGroup = { id: ExtraGroupId; title: string; items: Extra[] };

const same = (names: string[]): Extra[] => names.map((n) => ({ label: n, name: n }));

export const EXTRAS: ExtraGroup[] = [
  {
    id: 'meds',
    title: 'Meds',
    items: [
      { label: 'Adr infusion', name: 'Adrenaline infusion' },
      ...same(['Atropine', 'Calcium', 'Glucose 10%', 'Heparin', 'Ketamine', 'Ketamine infusion']),
      { label: 'Keppra', name: 'Levetiracetam (Keppra)' },
      ...same(['Lignocaine', 'Magnesium', 'Midazolam']),
      { label: 'Morph/midaz inf', name: 'Morph/midaz infusion' },
      'Naloxone',
      { label: 'Saline', name: 'Normal saline' },
      'Ondansetron',
      'Oxygen',
      { label: 'Sodium bicarb', name: 'Sodium bicarbonate' },
      { label: 'Sux', name: 'Suxamethonium' },
    ].map((x) => (typeof x === 'string' ? { label: x, name: x } : x)),
  },
  { id: 'airway', title: 'Airway', items: same(['FONA', 'IGT', 'NPA', 'OPA', 'Suction']) },
  {
    id: 'other',
    title: 'Other',
    items: [...same(['Corpuls', 'Extrication', 'Pacing']), { label: 'Reassurance', name: 'Reassurance provided' }],
  },
];

/** Every loggable name, in list order (used to order the totals line). */
export const EXTRA_NAMES: string[] = EXTRAS.flatMap((g) => g.items.map((i) => i.name));
