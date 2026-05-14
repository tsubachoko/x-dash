import Phaser from 'phaser';
import { GAME_BALANCE } from '../config';

export class HealItem extends Phaser.GameObjects.Sprite {
  amount = GAME_BALANCE.enemy.healAmount;
  bornAt = 0;
  collected = false;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'item_heal');
    scene.add.existing(this);
    this.setActive(false).setVisible(false);
  }

  spawn(x: number, y: number, time: number) {
    this.setActive(true).setVisible(true);
    this.setPosition(x, y);
    this.bornAt = time;
    this.collected = false;
    this.setAlpha(1);
  }

  retire() {
    this.setActive(false).setVisible(false);
    this.collected = true;
  }
}
