import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, STAT_DEFS, type StatKey } from '../config';
import type { PlayerStats } from '../PlayerStats';

const ALL_STATS: StatKey[] = [
  'damage', 'chargeSpeed', 'fireRate', 'maxHp', 'dropRate',
  'moveSpeed', 'jumpSpeed', 'maxJumpHeight', 'dashDistance',
];

export class LevelUpScene extends Phaser.Scene {
  stats!: PlayerStats;
  onPick!: (key: string) => void;
  options: StatKey[] = [];
  cursor = 0;
  optionTexts: Phaser.GameObjects.Text[] = [];
  cursorMark!: Phaser.GameObjects.Text;

  constructor() {
    super('LevelUp');
  }

  init(data: { stats: PlayerStats; onPick: (key: string) => void }) {
    this.stats = data.stats;
    this.onPick = data.onPick;
  }

  create() {
    this.cursor = 0;
    this.options = Phaser.Utils.Array.Shuffle([...ALL_STATS]).slice(0, 3);

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
      .setOrigin(0, 0);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 560, 360, 0x101828, 1)
      .setStrokeStyle(3, 0x8be2ff);

    this.add.text(GAME_WIDTH / 2, 130, 'LEVEL UP!', {
      fontFamily: 'monospace',
      fontSize: '36px',
      color: '#ffe066',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 170, `Lv.${this.stats.level} 強化するステータスを選択`, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#cfd8e8',
    }).setOrigin(0.5);

    this.optionTexts = this.options.map((key, i) => {
      const def = STAT_DEFS[key];
      const current = this.stats.levels[key];
      const t = this.add.text(GAME_WIDTH / 2 - 220, 220 + i * 60,
        `[${i + 1}] ${def.label}  (Lv.${current} → Lv.${current + 1})\n     ${def.desc}`,
        {
          fontFamily: 'monospace',
          fontSize: '15px',
          color: '#ffffff',
          lineSpacing: 4,
        });
      return t;
    });

    this.cursorMark = this.add.text(GAME_WIDTH / 2 - 245, 220, '▶', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffe066',
    });

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 110, '↑↓ で選択 / Enter or Space で決定 / 1〜3キーで直接選択', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#88aacc',
    }).setOrigin(0.5);

    this.input.keyboard!.on('keydown', this.onKey, this);
    this.refreshCursor();
  }

  private refreshCursor() {
    this.cursorMark.setY(220 + this.cursor * 60);
    this.optionTexts.forEach((t, i) => {
      t.setColor(i === this.cursor ? '#ffe066' : '#ffffff');
    });
  }

  private onKey(e: KeyboardEvent) {
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      this.cursor = (this.cursor + 1) % this.options.length;
      this.refreshCursor();
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      this.cursor = (this.cursor + this.options.length - 1) % this.options.length;
      this.refreshCursor();
    } else if (e.code === 'Enter' || e.code === 'Space') {
      this.pick(this.cursor);
    } else if (e.code === 'Digit1') {
      this.pick(0);
    } else if (e.code === 'Digit2') {
      this.pick(1);
    } else if (e.code === 'Digit3') {
      this.pick(2);
    }
  }

  private pick(i: number) {
    const key = this.options[i];
    this.input.keyboard?.off('keydown', this.onKey, this);
    this.scene.stop();
    this.onPick(key);
  }
}
