import { GAME_BALANCE, type StatKey } from './config';

export type StatLevels = Record<StatKey, number>;

const ZERO_STATS: StatLevels = {
  damage: 0,
  chargeSpeed: 0,
  fireRate: 0,
  maxHp: 0,
  dropRate: 0,
  moveSpeed: 0,
  jumpSpeed: 0,
  maxJumpHeight: 0,
  dashDistance: 0,
};

export interface ComputedStats {
  bulletDamage: number;
  chargeShotDamage: number;
  chargeFrames: number;
  bulletCooldownMs: number;
  maxHp: number;
  dropChance: number;
  moveSpeed: number;
  dashSpeed: number;
  jumpInitialVelocity: number;
  maxJumpHeightFactor: number;
  dashDurationMs: number;
}

export class PlayerStats {
  levels: StatLevels = { ...ZERO_STATS };
  hp: number;
  xp = 0;
  level = 1;
  xpToNext = GAME_BALANCE.levelScaling.xpToFirstLevel;
  bossesDefeated = 0;
  rewards: Set<string> = new Set();
  extraBulletSlots = 0;
  extraJumps = 0;
  airDash = false;
  chargeShotPierce = false;
  bulletSizeScale = 1;
  invincibilityBonusMs = 0;
  dashDamageReduction = 0;

  constructor() {
    this.hp = this.computed().maxHp;
  }

  computed(): ComputedStats {
    const p = GAME_BALANCE.player;
    const w = GAME_BALANCE.weapon;
    const s = GAME_BALANCE.levelScaling;
    const baseDamage = w.baseBulletDamage + this.levels.damage * s.damagePerLevel;
    return {
      bulletDamage: baseDamage,
      chargeShotDamage: baseDamage * w.chargeShotMultiplier,
      chargeFrames: Math.max(15, p.chargeFrames - this.levels.chargeSpeed * s.chargeFrameReductionPerLevel),
      bulletCooldownMs: Math.max(40, w.bulletCooldownMs - this.levels.fireRate * s.bulletCooldownReductionMs),
      maxHp: p.baseHp + this.levels.maxHp * s.hpPerLevel,
      dropChance: Math.min(1, GAME_BALANCE.enemy.healDropChance + this.levels.dropRate * s.dropChancePerLevel),
      moveSpeed: p.baseMoveSpeed + this.levels.moveSpeed * s.moveSpeedPerLevel,
      dashSpeed: (p.baseMoveSpeed + this.levels.moveSpeed * s.moveSpeedPerLevel) * p.dashSpeedMultiplier,
      jumpInitialVelocity: p.jumpInitialVelocity + this.levels.jumpSpeed * s.jumpVelocityPerLevel,
      maxJumpHeightFactor: 1 + this.levels.maxJumpHeight * 0.04,
      dashDurationMs: p.dashDurationMs + this.levels.dashDistance * s.dashDurationPerLevelMs,
    };
  }

  addXp(amount: number): { leveledUp: boolean; pending: number } {
    this.xp += amount;
    let pending = 0;
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level += 1;
      this.xpToNext += GAME_BALANCE.levelScaling.xpGrowthPerLevel;
      pending += 1;
    }
    return { leveledUp: pending > 0, pending };
  }

  applyStat(stat: StatKey): void {
    const prevMax = this.computed().maxHp;
    this.levels[stat] += 1;
    if (stat === 'maxHp') {
      const newMax = this.computed().maxHp;
      this.hp += newMax - prevMax;
    }
  }

  heal(amount: number): void {
    this.hp = Math.min(this.computed().maxHp, this.hp + amount);
  }

  damage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
  }

  isDead(): boolean {
    return this.hp <= 0;
  }
}
