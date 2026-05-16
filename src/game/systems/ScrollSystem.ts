import Phaser from 'phaser';
import { GAME_BALANCE, GAME_HEIGHT, GAME_WIDTH } from '../config';

export class ScrollSystem {
  scene: Phaser.Scene;
  bgFar: Phaser.GameObjects.TileSprite;
  bgMid: Phaser.GameObjects.TileSprite;
  ground: Phaser.GameObjects.TileSprite;
  speed: number = GAME_BALANCE.scroll.baseSpeed;
  baseSpeed: number = GAME_BALANCE.scroll.baseSpeed;
  multiplier = 1;
  distance = 0;

  constructor(scene: Phaser.Scene, groundY: number) {
    this.scene = scene;
    this.bgFar = scene.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg_far')
      .setOrigin(0, 0)
      .setScrollFactor(0);
    this.bgMid = scene.add
      .tileSprite(0, GAME_HEIGHT - 220, GAME_WIDTH, 64, 'bg_mid')
      .setOrigin(0, 0)
      .setScrollFactor(0);
    this.ground = scene.add
      .tileSprite(0, groundY, GAME_WIDTH, 16, 'ground_tile')
      .setOrigin(0, 0)
      .setScrollFactor(0);
  }

  /** 進行距離をメートル表示に換算した値。1m = 10内部距離単位。 */
  get meters(): number {
    return this.distance / 10;
  }

  setBaseSpeed(speed: number) {
    this.baseSpeed = speed;
  }

  setMultiplier(m: number) {
    this.multiplier = m;
  }

  pause() {
    this.multiplier = 0;
  }

  resume() {
    this.multiplier = 1;
  }

  update(delta: number) {
    const dt = delta / 1000;
    this.speed = Phaser.Math.Clamp(
      this.baseSpeed * this.multiplier,
      GAME_BALANCE.scroll.minSpeed,
      GAME_BALANCE.scroll.maxSpeed,
    );
    const dx = this.speed * dt;
    this.distance += dx;
    this.bgFar.tilePositionX += dx * 0.25;
    this.bgMid.tilePositionX += dx * 0.55;
    this.ground.tilePositionX += dx;
  }
}
