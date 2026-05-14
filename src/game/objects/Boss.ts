import Phaser from 'phaser';
import { GAME_BALANCE } from '../config';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  hp = GAME_BALANCE.boss.hp;
  maxHp = GAME_BALANCE.boss.hp;
  touchDamage = GAME_BALANCE.boss.touchDamage;
  bulletDamage = GAME_BALANCE.boss.bulletDamage;
  xpReward = GAME_BALANCE.boss.xp;
  nextFireAt = 0;
  baseY = 200;
  phase = 0;
  flashUntil = 0;
  defeated = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'boss');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(100, 80);
    this.baseY = y;
    this.setDepth(8);
  }

  hit(damage: number, time: number): boolean {
    if (this.defeated) return false;
    this.hp -= damage;
    this.flashUntil = time + 80;
    this.setTint(0xffffff);
    if (this.hp <= 0) {
      this.defeated = true;
      return true;
    }
    return false;
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    if (time > this.flashUntil) this.clearTint();
    const t = time / 1000;
    this.y = this.baseY + Math.sin(t * 1.5) * 60;
  }
}
