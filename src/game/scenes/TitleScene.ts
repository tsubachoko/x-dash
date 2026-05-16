import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x0a0d18);

    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg_far')
      .setOrigin(0, 0)
      .setAlpha(0.6);

    this.add.text(GAME_WIDTH / 2, 140, 'X-DASH', {
      fontFamily: 'monospace',
      fontSize: '88px',
      color: '#8be2ff',
      stroke: '#1f2a44',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 210, 'MECHANICAL RUN ACTION', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffe066',
    }).setOrigin(0.5);

    const controls = [
      'Z / J         ジャンプ (長押しで高く)',
      'SHIFT / X / K ダッシュ (押し続けで継続)',
      'C / L / SPACE 攻撃 / チャージショット',
      'ESC / P       ポーズ',
    ];
    this.add.text(GAME_WIDTH / 2, 320, controls.join('\n'), {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#cfd8e8',
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5);

    const start = this.add.text(GAME_WIDTH / 2, 460, '[ENTER] START', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: start,
      alpha: 0.4,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('Game'));
    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('Game'));
    this.input.once('pointerdown', () => this.scene.start('Game'));
  }
}
