import Phaser from 'phaser';
import { GAME_BALANCE } from '../config';

export type BulletKind = 'normal' | 'charge';

export class PlayerBullet extends Phaser.Physics.Arcade.Sprite {
  kind: BulletKind = 'normal';
  damage = 1;
  pierce = false;
  hitTargets: WeakSet<object> = new WeakSet();

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'bullet_normal');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    this.setActive(false).setVisible(false);
  }

  fire(x: number, y: number, kind: BulletKind, damage: number, opts: { pierce?: boolean; sizeScale?: number }) {
    this.kind = kind;
    this.damage = damage;
    this.pierce = !!opts.pierce && kind === 'charge';
    this.hitTargets = new WeakSet();
    this.setActive(true).setVisible(true);
    this.setTexture(kind === 'charge' ? 'bullet_charge' : 'bullet_normal');
    this.setPosition(x, y);
    const speed = kind === 'charge' ? GAME_BALANCE.weapon.chargeBulletSpeed : GAME_BALANCE.weapon.bulletSpeed;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(speed, 0);
    const scale = opts.sizeScale ?? 1;
    this.setScale(scale);
    if (kind === 'charge') {
      body.setSize(20, 16);
    } else {
      body.setSize(10, 6);
    }
  }

  retire() {
    this.setActive(false).setVisible(false);
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.hitTargets = new WeakSet();
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.active && this.x > 1100) {
      this.retire();
    }
  }
}
