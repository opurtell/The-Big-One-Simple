// The seven tiles, in grid order (DESIGN.md §2). Change the grid here, not in the logic.
// Colours follow Matt's upstream App.tsx so the two apps look familiar.

export type TileId = 'shock' | 'disarm' | 'adrenaline' | 'amiodarone' | 'ivio' | 'lma' | 'rosc';

export type Tile = {
  id: TileId;
  label: string;
  bg: string;
  fg: string;
  border: string;
  resetsCycle: boolean; // the tap is the rhythm check, so the 2-min bar restarts
  stopsCycle: boolean;
  inCatchup: boolean; // offered as a "before app" stepper on the catch-up screen
};

export const TILES: Tile[] = [
  { id: 'shock', label: 'Shock', bg: 'bg-red-100', fg: 'text-red-700', border: 'border-red-200', resetsCycle: true, stopsCycle: false, inCatchup: true },
  { id: 'disarm', label: 'Disarm', bg: 'bg-white', fg: 'text-blue-600', border: 'border-blue-200', resetsCycle: true, stopsCycle: false, inCatchup: true },
  { id: 'adrenaline', label: 'Adrenaline', bg: 'bg-[#daf3e5]', fg: 'text-emerald-900', border: 'border-emerald-200', resetsCycle: false, stopsCycle: false, inCatchup: true },
  { id: 'amiodarone', label: 'Amiodarone', bg: 'bg-purple-100', fg: 'text-purple-900', border: 'border-purple-200', resetsCycle: false, stopsCycle: false, inCatchup: true },
  { id: 'ivio', label: 'IV/IO', bg: 'bg-blue-50', fg: 'text-blue-900', border: 'border-blue-200', resetsCycle: false, stopsCycle: false, inCatchup: true },
  { id: 'lma', label: 'Airway', bg: 'bg-blue-50', fg: 'text-blue-900', border: 'border-blue-200', resetsCycle: false, stopsCycle: false, inCatchup: true },
  { id: 'rosc', label: 'ROSC', bg: 'bg-emerald-600', fg: 'text-white', border: 'border-emerald-700', resetsCycle: false, stopsCycle: true, inCatchup: false },
];

export const TILE_BY_ID = Object.fromEntries(TILES.map((t) => [t.id, t])) as Record<TileId, Tile>;

// Tiles that offer an optional 5 s tag after a tap (DESIGN #6a, #6b, #6c), e.g. "Shock (VF)".
export const TILE_TAGS = {
  shock: ['VF', 'pVT'],
  ivio: ['IV', 'IO'],
  lma: ['LMA', 'ETT'], // tile reads "Airway"; id kept so saved cases still load
} as const satisfies Partial<Record<TileId, readonly [string, string]>>;

export type Tag = (typeof TILE_TAGS)[keyof typeof TILE_TAGS][number];

export const tagsFor = (id: TileId): readonly Tag[] | undefined =>
  (TILE_TAGS as Partial<Record<TileId, readonly Tag[]>>)[id];

export const isTileId = (k: string): k is TileId => k in TILE_BY_ID;
