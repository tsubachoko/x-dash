import Phaser from 'phaser';
import { GAME_BALANCE, GAME_HEIGHT, GAME_WIDTH, GROUND_Y, PLAYER_X } from '../config';
import { Player } from '../objects/Player';
import { Enemy } from '../objects/Enemy';
import { PlayerBullet } from '../objects/PlayerBullet';
import { EnemyBullet } from '../objects/EnemyBullet';
import { HealItem } from '../objects/HealItem';
import { Boss } from '../objects/Boss';
import { InputSystem } from '../systems/InputSystem';
import { ScrollSystem } from '../systems/ScrollSystem';
import { PlayerStats } from '../PlayerStats';
import { STAGE_1, type EnemySpawnData } from '../data/stages/stage1';
import { ENEMY_TYPES } from '../data/enemies';
import { eventBus } from '../EventBus';

const BULLET_POOL = 16;
const ENEMY_POOL = 24;
const ENEMY_BULLET_POOL = 32;
const HEAL_POOL = 12;

export class GameScene extends Phaser.Scene {
  player!: Player;
  stats!: PlayerStats;
  input2!: InputSystem;
  scrollSystem!: ScrollSystem;

  playerBullets!: Phaser.GameObjects.Group;
  enemies!: Phaser.GameObjects.Group;
  enemyBullets!: Phaser.GameObjects.Group;
  healItems!: Phaser.GameObjects.Group;

  hudHpText!: Phaser.GameObjects.Text;
  hudDistanceText!: Phaser.GameObjects.Text;
  hudLevelText!: Phaser.GameObjects.Text;
  hudChargeBar!: Phaser.GameObjects.Graphics;
  hudHpBar!: Phaser.GameObjects.Graphics;
  hudXpBar!: Phaser.GameObjects.Graphics;
  hudDashBar!: Phaser.GameObjects.Graphics;
  bossHpBar?: Phaser.GameObjects.Graphics;

  spawnIndex = 0;
  spawns: EnemySpawnData[] = [];
  nextBossDistance = GAME_BALANCE.boss.distanceInterval;
  boss?: Boss;
  bossActive = false;
  bossPendingReward = false;
  paused = false;
  pendingLevelUps = 0;

  constructor() {
    super('Game');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x06080f);
    this.stats = new PlayerStats();
    this.spawns = STAGE_1.enemySpawns;
    this.spawnIndex = 0;
    this.nextBossDistance = GAME_BALANCE.boss.distanceInterval;
    this.boss = undefined;
    this.bossActive = false;
    this.bossPendingReward = false;
    this.paused = false;
    this.pendingLevelUps = 0;

    this.scrollSystem = new ScrollSystem(this, GROUND_Y);
    this.scrollSystem.setBaseSpeed(this.stats.computed().moveSpeed);

    this.input2 = new InputSystem(this);
    this.player = new Player(this, this.stats);

    this.playerBullets = this.add.group({
      classType: PlayerBullet,
      maxSize: BULLET_POOL,
      runChildUpdate: true,
    });
    for (let i = 0; i < BULLET_POOL; i++) {
      const b = new PlayerBullet(this);
      this.playerBullets.add(b);
    }

    this.enemies = this.add.group({
      classType: Enemy,
      maxSize: ENEMY_POOL,
      runChildUpdate: true,
    });
    for (let i = 0; i < ENEMY_POOL; i++) {
      this.enemies.add(new Enemy(this));
    }

    this.enemyBullets = this.add.group({
      classType: EnemyBullet,
      maxSize: ENEMY_BULLET_POOL,
      runChildUpdate: true,
    });
    for (let i = 0; i < ENEMY_BULLET_POOL; i++) {
      this.enemyBullets.add(new EnemyBullet(this));
    }

    this.healItems = this.add.group({
      classType: HealItem,
      maxSize: HEAL_POOL,
    });
    for (let i = 0; i < HEAL_POOL; i++) {
      this.healItems.add(new HealItem(this));
    }

    this.physics.add.overlap(this.player, this.enemies, (_p, enemy) => {
      const e = enemy as Enemy;
      if (!e.active) return;
      this.onPlayerHitBy(e.touchDamage);
    });
    this.physics.add.overlap(this.player, this.enemyBullets, (_p, b) => {
      const eb = b as EnemyBullet;
      if (!eb.active) return;
      const hit = this.onPlayerHitBy(eb.damage);
      if (hit) eb.retire();
    });
    this.physics.add.overlap(this.playerBullets, this.enemies, (b, enemy) => {
      const pb = b as PlayerBullet;
      const e = enemy as Enemy;
      if (!pb.active || !e.active) return;
      if (pb.hitTargets.has(e)) return;
      const dying = e.hit(pb.damage, this.time.now);
      if (pb.pierce) {
        pb.hitTargets.add(e);
      } else {
        pb.retire();
      }
      if (dying) {
        this.onEnemyKilled(e);
      }
    });

    this.buildHud();
    this.events.on('shutdown', this.cleanup, this);
    eventBus.emit('game:started');
  }

  private buildHud() {
    this.hudHpBar = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.hudHpText = this.add.text(20, 16, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setScrollFactor(0).setDepth(101);
    this.hudXpBar = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.hudLevelText = this.add.text(20, 60, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffe066',
    }).setScrollFactor(0).setDepth(101);
    this.hudDistanceText = this.add.text(GAME_WIDTH - 20, 16, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#8be2ff',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);
    this.hudChargeBar = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.hudDashBar = this.add.graphics().setScrollFactor(0).setDepth(100);
  }

  private updateHud() {
    const c = this.stats.computed();
    this.hudHpBar.clear();
    this.hudHpBar.fillStyle(0x222b3a, 1).fillRect(20, 32, 220, 12);
    const hpRatio = Phaser.Math.Clamp(this.stats.hp / c.maxHp, 0, 1);
    this.hudHpBar.fillStyle(0xff5577, 1).fillRect(20, 32, 220 * hpRatio, 12);
    this.hudHpBar.lineStyle(2, 0xffffff, 0.4).strokeRect(20, 32, 220, 12);
    this.hudHpText.setText(`HP ${Math.ceil(this.stats.hp)} / ${c.maxHp}`);

    this.hudXpBar.clear();
    this.hudXpBar.fillStyle(0x222b3a, 1).fillRect(20, 76, 220, 6);
    const xpRatio = Phaser.Math.Clamp(this.stats.xp / this.stats.xpToNext, 0, 1);
    this.hudXpBar.fillStyle(0xffe066, 1).fillRect(20, 76, 220 * xpRatio, 6);
    this.hudLevelText.setText(`Lv.${this.stats.level}   EXP ${this.stats.xp}/${this.stats.xpToNext}`);

    this.hudDistanceText.setText(`${Math.floor(this.scrollSystem.meters)} m`);

    // Charge bar above player
    this.hudChargeBar.clear();
    const chargeFrames = c.chargeFrames;
    const ratio = Phaser.Math.Clamp(this.player.chargeProgress / chargeFrames, 0, 1);
    if (ratio < 1 && !this.player.state2.dead) {
      this.hudChargeBar.fillStyle(0x101820, 0.8).fillRect(this.player.x - 22, this.player.y - 64, 44, 4);
      this.hudChargeBar.fillStyle(0x88ffee, 1).fillRect(this.player.x - 22, this.player.y - 64, 44 * ratio, 4);
    } else if (!this.player.state2.dead) {
      const pulse = 0.7 + 0.3 * Math.sin(this.time.now / 80);
      this.hudChargeBar.fillStyle(0xffe066, pulse).fillRect(this.player.x - 26, this.player.y - 66, 52, 6);
    }

    // Dash bar
    this.hudDashBar.clear();
    if (this.player.state2.dashing) {
      const remain = Phaser.Math.Clamp((this.player.dashEndsAt - this.time.now) / c.dashDurationMs, 0, 1);
      this.hudDashBar.fillStyle(0x222b3a, 1).fillRect(GAME_WIDTH - 240, 50, 220, 6);
      this.hudDashBar.fillStyle(0x8be2ff, 1).fillRect(GAME_WIDTH - 240, 50, 220 * remain, 6);
    } else if (this.time.now < this.player.dashRecoveryUntil) {
      const remain = 1 - Phaser.Math.Clamp((this.player.dashRecoveryUntil - this.time.now) / GAME_BALANCE.player.dashRecoveryMs, 0, 1);
      this.hudDashBar.fillStyle(0x222b3a, 1).fillRect(GAME_WIDTH - 240, 50, 220, 4);
      this.hudDashBar.fillStyle(0x556677, 1).fillRect(GAME_WIDTH - 240, 50, 220 * remain, 4);
    }

    if (this.boss && this.bossActive) {
      if (!this.bossHpBar) this.bossHpBar = this.add.graphics().setScrollFactor(0).setDepth(101);
      this.bossHpBar.clear();
      this.bossHpBar.fillStyle(0x000000, 0.6).fillRect(GAME_WIDTH / 2 - 200, GAME_HEIGHT - 40, 400, 16);
      const r = Phaser.Math.Clamp(this.boss.hp / this.boss.maxHp, 0, 1);
      this.bossHpBar.fillStyle(0xff3344, 1).fillRect(GAME_WIDTH / 2 - 200, GAME_HEIGHT - 40, 400 * r, 16);
      this.bossHpBar.lineStyle(2, 0xffffff, 0.7).strokeRect(GAME_WIDTH / 2 - 200, GAME_HEIGHT - 40, 400, 16);
    } else if (this.bossHpBar) {
      this.bossHpBar.clear();
    }
  }

  update(time: number, delta: number) {
    if (this.paused) return;
    const inputState = this.input2.read();
    if (inputState.pausePressed && !this.player.state2.dead) {
      this.openPause();
      return;
    }

    const canMove = !this.player.state2.dead;
    this.player.update(time, delta, inputState, canMove);
    this.updatePlayerForwardOffset();

    // Scroll multiplier from dash
    if (this.player.state2.dead) {
      this.scrollSystem.setMultiplier(0.2);
    } else if (this.bossActive) {
      this.scrollSystem.setMultiplier(0);
    } else {
      this.scrollSystem.setBaseSpeed(this.stats.computed().moveSpeed);
      this.scrollSystem.setMultiplier(this.player.state2.dashing ? GAME_BALANCE.player.dashSpeedMultiplier : 1);
    }
    this.scrollSystem.update(delta);

    // Spawn enemies based on distance
    while (this.spawnIndex < this.spawns.length && this.spawns[this.spawnIndex].distance <= this.scrollSystem.distance) {
      const s = this.spawns[this.spawnIndex];
      if (!this.bossActive) this.spawnEnemy(s, time);
      this.spawnIndex++;
    }

    // Boss trigger (m基準)
    if (!this.bossActive && !this.bossPendingReward && this.scrollSystem.meters >= this.nextBossDistance) {
      this.startBoss();
    }

    // Move enemies/bullets/items with scroll
    this.scrollEntities(delta);

    // Boss update + fire
    if (this.bossActive && this.boss) {
      if (time >= this.boss.nextFireAt) {
        this.fireBossPattern(time);
        this.boss.nextFireAt = time + GAME_BALANCE.boss.fireIntervalMs;
      }
      if (this.boss.defeated) {
        this.onBossDefeated();
      }
    }

    // Shooter enemy fire
    for (const obj of this.enemies.getChildren()) {
      const e = obj as Enemy;
      if (e.active && e.kind === 'shooter' && time >= e.nextFireAt) {
        this.fireShooterBullet(e);
        e.nextFireAt = time + e.fireIntervalMs;
      }
    }

    // Heal item collection (auto-pickup, any distance)
    for (const obj of this.healItems.getChildren()) {
      const h = obj as HealItem;
      if (!h.active) continue;
      this.stats.heal(h.amount);
      h.retire();
    }

    // Player attack: auto-fire while held; charge progresses while released.
    if (inputState.attackDown && !this.player.state2.dead) {
      this.tryFire(time);
    }

    // Player death handling
    if (this.player.state2.dead && this.player.y > GAME_HEIGHT + 80) {
      this.gameOver();
    }

    this.updateHud();
  }

  private spawnEnemy(s: EnemySpawnData, time: number) {
    const def = ENEMY_TYPES[s.enemyType];
    const e = this.enemies.getFirstDead(false) as Enemy | null;
    if (!e) return;
    const y = s.y ?? def.defaultY;
    e.spawn(def.kind, GAME_WIDTH + 60, y, time);
  }

  private updatePlayerForwardOffset() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (this.player.state2.dead) {
      if (this.player.x !== PLAYER_X) this.player.x = PLAYER_X;
      body.setVelocityX(0);
      return;
    }
    const p = GAME_BALANCE.player;
    const isBoss = this.bossActive;
    const maxAdvance = isBoss ? p.bossArenaMaxAdvance : p.runDashMaxAdvance;
    const forwardSpeed = isBoss ? p.bossArenaForwardSpeed : p.runDashForwardSpeed;
    const returnSpeed = isBoss ? p.bossArenaReturnSpeed : p.runDashReturnSpeed;
    const maxX = PLAYER_X + maxAdvance;

    if (this.player.state2.dashing) {
      body.setVelocityX(forwardSpeed);
    } else if (this.player.x > PLAYER_X) {
      body.setVelocityX(-returnSpeed);
    } else {
      body.setVelocityX(0);
    }
    // Clamp.
    if (this.player.x < PLAYER_X) {
      this.player.x = PLAYER_X;
      if (body.velocity.x < 0) body.setVelocityX(0);
    } else if (this.player.x > maxX) {
      this.player.x = maxX;
      if (body.velocity.x > 0) body.setVelocityX(0);
    }
  }

  private scrollEntities(delta: number) {
    const dx = -this.scrollSystem.speed * (delta / 1000);
    for (const obj of this.enemies.getChildren()) {
      const e = obj as Enemy;
      if (!e.active) continue;
      e.x += dx;
    }
    for (const obj of this.healItems.getChildren()) {
      const h = obj as HealItem;
      if (!h.active) continue;
      h.x += dx;
      if (h.x < -40) h.retire();
    }
    if (this.boss && this.bossActive) {
      this.boss.x = GAME_WIDTH - 140;
    }
  }

  private tryFire(time: number) {
    if (time < this.player.attackCooldownUntil) return;
    const charged = this.player.state2.chargeReady;
    const bullet = this.playerBullets.getFirstDead(false) as PlayerBullet | null;
    if (!bullet) return;
    if (!charged) {
      const limit = GAME_BALANCE.weapon.bulletLimit + this.stats.extraBulletSlots;
      const liveCount = this.countActiveNormalBullets();
      if (liveCount >= limit) return;
    }
    const damage = charged
      ? this.stats.computed().chargeShotDamage
      : this.stats.computed().bulletDamage + (this.player.state2.dashing ? GAME_BALANCE.weapon.dashBulletDamageBonus : 0);
    bullet.fire(this.player.x + 18, this.player.y - 24, charged ? 'charge' : 'normal', damage, {
      pierce: this.stats.chargeShotPierce,
      sizeScale: this.stats.bulletSizeScale,
    });
    this.player.attackCooldownUntil = time + this.stats.computed().bulletCooldownMs;
    if (charged) {
      this.player.consumeChargeShot();
    } else {
      this.player.resetCharge();
    }
  }

  private countActiveNormalBullets(): number {
    let n = 0;
    for (const obj of this.playerBullets.getChildren()) {
      const b = obj as PlayerBullet;
      if (b.active && b.kind === 'normal') n++;
    }
    return n;
  }

  private onPlayerHitBy(damage: number): boolean {
    const time = this.time.now;
    const hit = this.player.takeDamage(damage, time);
    if (hit) {
      this.cameras.main.shake(120, 0.005);
      eventBus.emit('player:hit', { hp: this.stats.hp });
    }
    return hit;
  }

  private onEnemyKilled(e: Enemy) {
    const dropChance = this.stats.computed().dropChance;
    if (Math.random() < dropChance) {
      const item = this.healItems.getFirstDead(false) as HealItem | null;
      item?.spawn(e.x, e.y, this.time.now);
    }
    const { leveledUp, pending } = this.stats.addXp(e.xpReward);
    e.retire();
    if (leveledUp) this.queueLevelUp(pending);
    eventBus.emit('enemy:killed', { xp: this.stats.xp, level: this.stats.level });
  }

  private fireShooterBullet(e: Enemy) {
    const b = this.enemyBullets.getFirstDead(false) as EnemyBullet | null;
    if (!b) return;
    const dx = this.player.x - e.x;
    const dy = this.player.y - 22 - e.y;
    const len = Math.hypot(dx, dy) || 1;
    const sp = GAME_BALANCE.enemy.enemyBulletSpeed;
    b.fire(e.x - 14, e.y, (dx / len) * sp, (dy / len) * sp, e.bulletDamage);
  }

  private startBoss() {
    this.bossActive = true;
    this.boss = new Boss(this, GAME_WIDTH - 140, 220);
    this.boss.nextFireAt = this.time.now + 800;
    this.physics.add.overlap(this.player, this.boss, () => this.onPlayerHitBy(this.boss!.touchDamage));
    this.physics.add.overlap(this.playerBullets, this.boss, (b) => {
      const pb = b as PlayerBullet;
      if (!pb.active || !this.boss || this.boss.defeated) return;
      const dying = this.boss.hit(pb.damage, this.time.now);
      if (!pb.pierce) pb.retire();
      if (dying) this.onBossDefeated();
    });
    // Clear lesser enemies that intrude
    for (const obj of this.enemies.getChildren()) {
      const e = obj as Enemy;
      if (e.active) e.retire();
    }
    eventBus.emit('boss:start');
  }

  private fireBossPattern(time: number) {
    if (!this.boss) return;
    const angles = [-0.2, 0, 0.2];
    for (const a of angles) {
      const b = this.enemyBullets.getFirstDead(false) as EnemyBullet | null;
      if (!b) continue;
      const sp = GAME_BALANCE.enemy.enemyBulletSpeed;
      const dx = -1;
      const dy = a * 1.5;
      const len = Math.hypot(dx, dy);
      b.fire(this.boss.x - 50, this.boss.y, (dx / len) * sp, (dy / len) * sp, this.boss.bulletDamage);
    }
    void time;
  }

  private onBossDefeated() {
    if (!this.boss) return;
    const xpReward = this.boss.xpReward;
    this.boss.destroy();
    this.boss = undefined;
    this.bossActive = false;
    this.bossPendingReward = true;
    const { leveledUp, pending } = this.stats.addXp(xpReward);
    if (leveledUp) this.queueLevelUp(pending);
    this.stats.bossesDefeated += 1;
    this.nextBossDistance += GAME_BALANCE.boss.distanceInterval;
    // Pause and show boss reward
    this.scene.pause();
    this.scene.launch('BossReward', { stats: this.stats, onPick: (key: string) => this.applyBossReward(key) });
    eventBus.emit('boss:defeated');
  }

  private applyBossReward(key: string) {
    this.bossPendingReward = false;
    this.stats.rewards.add(key);
    switch (key) {
      case 'pierce':
        this.stats.chargeShotPierce = true;
        break;
      case 'bullet_size':
        this.stats.bulletSizeScale *= 1.5;
        break;
      case 'dash_dr':
        this.stats.dashDamageReduction += 1;
        break;
      case 'big_hp':
        this.stats.levels.maxHp += 5;
        this.stats.hp = this.stats.computed().maxHp;
        break;
      case 'big_charge':
        this.stats.levels.chargeSpeed += 5;
        break;
      case 'extra_slot':
        this.stats.extraBulletSlots += 2;
        break;
      case 'extra_jump':
        this.stats.extraJumps += 1;
        break;
      case 'invinc':
        this.stats.invincibilityBonusMs += 300;
        break;
      case 'fast_fire':
        this.stats.levels.fireRate += 4;
        break;
      case 'air_dash':
        this.stats.airDash = true;
        break;
    }
    this.scene.resume();
  }

  private queueLevelUp(count: number) {
    this.pendingLevelUps += count;
    if (this.scene.isActive('LevelUp')) return;
    this.scene.pause();
    this.scene.launch('LevelUp', {
      stats: this.stats,
      onPick: (statKey: string) => this.applyLevelUp(statKey),
    });
  }

  private applyLevelUp(statKey: string) {
    this.stats.applyStat(statKey as never);
    this.pendingLevelUps -= 1;
    if (this.pendingLevelUps > 0) {
      this.scene.launch('LevelUp', {
        stats: this.stats,
        onPick: (k: string) => this.applyLevelUp(k),
      });
    } else {
      this.scene.resume();
    }
  }

  private openPause() {
    this.paused = true;
    this.scene.pause();
    this.scene.launch('Pause');
  }

  resumeFromPause() {
    this.paused = false;
  }

  private gameOver() {
    const meters = Math.floor(this.scrollSystem.meters);
    eventBus.emit('game:over', {
      distance: meters,
      bossesDefeated: this.stats.bossesDefeated,
      level: this.stats.level,
    });
    this.scene.start('Result', {
      distance: meters,
      bossesDefeated: this.stats.bossesDefeated,
      level: this.stats.level,
    });
  }

  private cleanup() {
    this.events.off('shutdown', this.cleanup, this);
  }
}
