// SPDX-License-Identifier: Apache-2.0
// Post-ROSC checklists, ported word for word from upstream App.tsx (`ROSCSelection` and
// `PHEASelection`, ~L4618-4710). Adult wording only: Simple has no paediatric mode (BRIEF).
// Ticks are memory aids, not log entries: upstream never logs them either, so they don't
// appear in the copied log and Undo doesn't touch them.

import type { CaseState } from './clock';

export type ChecklistId = 'rosc' | 'phea';
export type CheckItem = string | { label: string; sub: string[] };
export type Section = { title: string; items: CheckItem[]; dark?: boolean };

export const CHECKLISTS: Record<ChecklistId, { title: string; sections: Section[] }> = {
  rosc: {
    title: 'ROSC checklist',
    sections: [
      { title: 'Team leader', items: ['Confirm roles', 'Monitor ECG for rhythm changes', 'Review reversibles'] },
      {
        title: 'Airway',
        items: [
          'Response — consider sedation',
          'Confirm airway secured',
          'Confirm spontaneous ventilations',
          'Maintain SpO₂ 94–98%',
          'Maintain EtCO₂ 35–40mmHg',
          'Ventilate at 8–10/min (once every 6–8 seconds)',
        ],
      },
      {
        title: 'Gofer',
        items: [
          'Confirm radial pulse',
          'Set BP to automatic cycling',
          'Attach SpO₂',
          '12-lead ECG',
          'Temp (actively correct if <32°C or >39°C)',
          'BGL',
          'Prepare extrication',
        ],
      },
      {
        title: 'Drugs & access',
        items: [
          'Confirm bilateral IV/IO access',
          'Maintain SBP ≥100mmHg',
          'Prepare sedation medications if required',
          'Prepare adrenaline infusion if required',
        ],
      },
    ],
  },
  phea: {
    title: 'PHEA checklist',
    sections: [
      {
        title: 'Initial team brief',
        items: [
          'Adequate hands and skills mix?',
          {
            label: 'Optimise patient position',
            sub: [
              'Consider relocating patient now to optimal location',
              'Apply C-spine immobilisation if required',
              'If remaining on scene and resources allow, prepare extrication concurrently',
            ],
          },
          {
            label: 'Assign roles',
            sub: ['Team leader', 'Airway primary', 'Airway assistant', 'Drugs & access primary', 'Drugs & access assistant', 'Gofer'],
          },
        ],
      },
      { title: 'Scene optimisation', items: ['Optimise environment', 'Optimise equipment placement'] },
      { title: 'Monitoring', items: ['ECG', 'BP — cycling', 'SpO₂', 'EtCO₂'] },
      {
        title: 'Drugs & access',
        items: ['IV/IO access ×2 if possible', 'IV fluids', 'Ketamine drawn up', 'Suxamethonium drawn up', 'Post PHEA sedation medication(s) drawn up'],
      },
      {
        title: 'Airway',
        items: [
          'Sufficient oxygen available?', 'Pre-oxygenation applied?', 'Suction', 'OPA/NPA', 'LMA', 'BVM', 'Airtraq', 'ETT',
          'Syringe', 'Securing method', 'Laryngoscope checked', 'FONA scalpel', 'External laryngeal manipulation discussed',
          'Fallback plan discussed',
        ],
      },
      {
        title: 'Post-intubation',
        dark: true,
        items: [
          { label: 'Confirm ETT placement', sub: ['EtCO₂', 'Visualise cords', 'Auscultation', 'Misting', 'Chest rise'] },
          'Colleague confirms placement',
          'Secure tube — Thomas block / tube tie',
          'Reassessment — ABCs and VSS',
          'Sedation plan discussed',
          'Deterioration plan discussed',
          'Extrication and transport plan discussed',
        ],
      },
    ],
  },
};

export const itemLabel = (i: CheckItem) => (typeof i === 'string' ? i : i.label);

export const checked = (s: CaseState, list: ChecklistId): string[] => s.checks?.[list] ?? [];

/** Ticks or unticks one item (upstream `toggleChecklistItem`). */
export function toggleCheck(s: CaseState, list: ChecklistId, label: string): CaseState {
  const cur = checked(s, list);
  const next = cur.includes(label) ? cur.filter((l) => l !== label) : [...cur, label];
  return { ...s, checks: { rosc: checked(s, 'rosc'), phea: checked(s, 'phea'), [list]: next } };
}
