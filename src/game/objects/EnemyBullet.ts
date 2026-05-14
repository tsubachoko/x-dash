import Phaser from 'phaser';

export class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
  damage = 1;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'bullet_enemy');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    this.setActive(false).setVisible(false);
  }

  fire(x: number, y: number, vx: number, vy: number, damage: number) {
    this.damage = damage;
    this.setActive(true).setVisible(true);
    this.setPosition(x, y);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(vx, vy);
    body.setSize(8, 8);
  }

  retire() {
    this.setActive(false).setVisible(false);
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.active && (this.x < -40 || this.x > 1100 || this.y < -40 || this.y > 700)) {
      this.retire();
    }
  }
}
