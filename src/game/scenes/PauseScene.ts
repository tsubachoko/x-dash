import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import type { GameScene } from './GameScene';

const ITEMS = [
  { key: 'resume', label: 'ゲーム再開' },
  { key: 'retry', label: 'リトライ' },
  { key: 'title', label: 'タイトルへ戻る' },
];

export class PauseScene extends Phaser.Scene {
  cursor = 0;
  itemTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('Pause');
  }

  create() {
    this.cursor = 0;
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setOrigin(0, 0);

    this.add.text(GAME_WIDTH / 2, 140, 'PAUSED', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#8be2ff',
    }).setOrigin(0.5);

    this.itemTexts = ITEMS.map((it, i) =>
      this.add.text(GAME_WIDTH / 2, 240 + i * 50, it.label, {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#ffffff',
      }).setOrigin(0.5),
    );

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 100,
      '操作: Z/J ジャンプ  SHIFT/X/K ダッシュ  C/L/SPACE 攻撃/チャージ  ESC/P ポーズ', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#88aacc',
    }).setOrigin(0.5);

    this.input.keyboard!.on('keydown', this.onKey, this);
    this.refreshCursor();
  }

  private refreshCursor() {
    this.itemTexts.forEach((t, i) => {
      t.setColor(i === this.cursor ? '#ffe066' : '#ffffff');
      t.setText((i === this.cursor ? '▶ ' : '   ') + ITEMS[i].label);
    });
  }

  private onKey(e: KeyboardEvent) {
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      this.cursor = (this.cursor + 1) % ITEMS.length;
      this.refreshCursor();
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      this.cursor = (this.cursor + ITEMS.length - 1) % ITEMS.length;
      this.refreshCursor();
    } else if (e.code === 'Enter' || e.code === 'Space') {
      this.activate(this.cursor);
    } else if (e.code === 'Escape') {
      this.activate(0);
    }
  }

  private activate(i: number) {
    const key = ITEMS[i].key;
    this.input.keyboard?.off('keydown', this.onKey, this);
    const game = this.scene.get('Game') as GameScene;
    this.scene.stop();
    if (key === 'resume') {
      this.scene.resume('Game');
      game.resumeFromPause();
    } else if (key === 'retry') {
      this.scene.stop('Game');
      this.scene.start('Game');
    } else {
      this.scene.stop('Game');
      this.scene.start('Title');
    }
  }
}
