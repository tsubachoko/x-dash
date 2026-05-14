import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

interface ResultData {
  distance: number;
  bossesDefeated: number;
  level: number;
}

const ITEMS = [
  { key: 'retry', label: 'リトライ' },
  { key: 'title', label: 'タイトルへ戻る' },
];

export class ResultScene extends Phaser.Scene {
  data2!: ResultData;
  cursor = 0;
  itemTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('Result');
  }

  init(data: ResultData) {
    this.data2 = data;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x06080f);
    this.cursor = 0;

    this.add.text(GAME_WIDTH / 2, 110, 'GAME OVER', {
      fontFamily: 'monospace',
      fontSize: '64px',
      color: '#ff5577',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 220, `到達距離  ${this.data2.distance} m`, {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#8be2ff',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 260, `撃破ボス  ${this.data2.bossesDefeated}`, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffe066',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 290, `最終Lv.  ${this.data2.level}`, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#cfd8e8',
    }).setOrigin(0.5);

    this.itemTexts = ITEMS.map((it, i) =>
      this.add.text(GAME_WIDTH / 2, 390 + i * 44, it.label, {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#ffffff',
      }).setOrigin(0.5),
    );

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
    }
  }

  private activate(i: number) {
    this.input.keyboard?.off('keydown', this.onKey, this);
    const key = ITEMS[i].key;
    if (key === 'retry') {
      this.scene.start('Game');
    } else {
      this.scene.start('Title');
    }
    void GAME_HEIGHT;
  }
}
