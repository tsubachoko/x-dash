import type { EnemyKind } from '../objects/Enemy';

export interface EnemyTypeDef {
  kind: EnemyKind;
  defaultY: number;
}

export const ENEMY_TYPES: Record<string, EnemyTypeDef> = {
  walker: { kind: 'walker', defaultY: 440 },
  flyer: { kind: 'flyer', defaultY: 260 },
  shooter: { kind: 'shooter', defaultY: 360 },
};
