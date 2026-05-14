import Phaser from 'phaser';
import { GAME_BALANCE, GROUND_Y } from '../config';

export type EnemyKind = 'walker' | 'flyer' | 'shooter';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  kind: EnemyKind = 'walker';
  hp = 1;
  maxHp = 1;
  touchDamage = 1;
  xpReward = 1;
  remainsOnScreen = false;
  spawnedAt = 0;
  nextFireAt = 0;
  fireIntervalMs = 0;
  bulletDamage = 0;
  hopNextAt = 0;
  baseY = 0;
  amplitude = 0;
  phase = 0;
  flashUntil = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'enemy_walker');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    this.setActive(false).setVisible(false);
  }

  spawn(kind: EnemyKind, x: number, y: number, time: number) {
    this.kind = kind;
    this.setActive(true).setVisible(true);
    this.setPosition(x, y);
    this.spawnedAt = time;
    this.flashUntil = 0;
    this.remainsOnScreen = kind === 'flyer' || kind === 'shooter';
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);

    const e = GAME_BALANCE.enemy;
    switch (kind) {
      case 'walker':
        this.setTexture('enemy_walker');
        this.maxHp = this.hp = e.walkerHp;
        this.touchDamage = e.walkerTouchDamage;
        this.xpReward = e.walkerXp;
        body.setSize(28, 28);
        this.baseY = y;
        this.hopNextAt = time + 600;
        break;
      case 'flyer':
        this.setTexture('enemy_flyer');
        this.maxHp = this.hp = e.flyerHp;
        this.touchDamage = e.flyerTouchDamage;
        this.xpReward = e.flyerXp;
        body.setSize(28, 24);
        this.baseY = y;
        this.amplitude = 40 + Math.random() * 30;
        this.phase = Math.random() * Math.PI * 2;
        break;
      case 'shooter':
        this.setTexture('enemy_shooter');
        this.maxHp = this.hp = e.shooterHp;
        this.touchDamage = e.shooterTouchDamage;
        this.bulletDamage = e.shooterBulletDamage;
        this.xpReward = e.shooterXp;
        this.fireIntervalMs = e.shooterFireIntervalMs;
        this.nextFireAt = time + 800;
        body.setSize(28, 28);
        this.baseY = y;
        break;
    }
  }

  retire() {
    this.setActive(false).setVisible(false);
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }

  hit(damage: number, time: number): boolean {
    if (!this.active) return false;
    this.hp -= damage;
    this.flashUntil = time + 100;
    this.setTint(0xffffff);
    if (this.hp <= 0) {
      return true;
    }
    return false;
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    if (time > this.flashUntil) {
      this.clearTint();
    }
    if (this.kind === 'walker') {
      if (time > this.hopNextAt && this.y >= GROUND_Y - 20) {
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(true);
        body.setVelocityY(-260);
        this.hopNextAt = time + 900 + Math.random() * 400;
      }
      if (this.y >= GROUND_Y - 20) {
        this.y = GROUND_Y - 20;
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setVelocityY(0);
        body.setAllowGravity(false);
      }
    } else if (this.kind === 'flyer') {
      const t = (time - this.spawnedAt) / 1000;
      this.y = this.baseY + Math.sin(t * 3 + this.phase) * this.amplitude;
    }
    if (this.x < -60) {
      this.retire();
    }
  }
}
