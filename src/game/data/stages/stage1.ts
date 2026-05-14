export interface EnemySpawnData {
  distance: number;
  enemyType: 'walker' | 'flyer' | 'shooter';
  y?: number;
}

export interface StageData {
  id: string;
  name: string;
  baseScrollSpeed: number;
  enemySpawns: EnemySpawnData[];
}

// Procedural spawn generator: spec calls for stage data, but for endless mode
// we generate a long looping schedule deterministically per run.
const SPAWN_PATTERNS: ReadonlyArray<EnemySpawnData[]> = [
  [
    { distance: 300, enemyType: 'walker' },
    { distance: 600, enemyType: 'walker' },
    { distance: 900, enemyType: 'flyer' },
  ],
  [
    { distance: 200, enemyType: 'walker' },
    { distance: 350, enemyType: 'flyer', y: 220 },
    { distance: 550, enemyType: 'walker' },
    { distance: 750, enemyType: 'shooter' },
  ],
  [
    { distance: 200, enemyType: 'flyer', y: 200 },
    { distance: 300, enemyType: 'flyer', y: 300 },
    { distance: 500, enemyType: 'walker' },
    { distance: 700, enemyType: 'shooter' },
    { distance: 850, enemyType: 'walker' },
  ],
  [
    { distance: 300, enemyType: 'shooter' },
    { distance: 500, enemyType: 'walker' },
    { distance: 650, enemyType: 'walker' },
    { distance: 800, enemyType: 'flyer' },
  ],
];

const PATTERN_LENGTH = 1000;

export function generateEndlessSpawns(maxDistance: number): EnemySpawnData[] {
  const out: EnemySpawnData[] = [];
  const patternCount = Math.ceil(maxDistance / PATTERN_LENGTH);
  for (let i = 0; i < patternCount; i++) {
    const offset = i * PATTERN_LENGTH;
    const pattern = SPAWN_PATTERNS[i % SPAWN_PATTERNS.length];
    for (const s of pattern) {
      out.push({ ...s, distance: s.distance + offset });
    }
  }
  return out;
}

export const STAGE_1: StageData = {
  id: 'stage1',
  name: 'Sector 01',
  baseScrollSpeed: 220,
  enemySpawns: generateEndlessSpawns(40000),
};
