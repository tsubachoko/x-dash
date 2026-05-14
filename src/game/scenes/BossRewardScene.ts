import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import type { PlayerStats } from '../PlayerStats';

interface RewardDef {
  key: string;
  label: string;
  desc: string;
  fixed?: boolean;
}

const REWARDS: RewardDef[] = [
  { key: 'pierce', label: 'チャージショット貫通', desc: 'チャージショットが敵を貫通する' },
  { key: 'bullet_size', label: '通常弾サイズ拡大', desc: '弾の当たり判定が大きくなる' },
  { key: 'dash_dr', label: 'ダッシュ中被ダメージ軽減', desc: 'ダッシュ中のダメージを1軽減' },
  { key: 'big_hp', label: 'HP大幅増加', desc: '最大HPが大きく上昇' },
  { key: 'big_charge', label: 'チャージ時間大幅短縮', desc: 'チャージ完了が大きく早まる' },
  { key: 'extra_slot', label: '通常弾上限+2', desc: '画面内に出せる弾数が増える' },
  { key: 'extra_jump', label: 'ジャンプ回数+1', desc: '空中で追加ジャンプ可能' },
  { key: 'invinc', label: '被弾時無敵時間延長', desc: '被弾後の無敵時間が伸びる' },
  { key: 'fast_fire', label: '連射速度大幅上昇', desc: '通常弾の発射間隔が大きく短縮' },
];

const SPECIAL_WEAPONS: RewardDef[] = [
  { key: 'pierce', label: '特殊武器: ピアサー', desc: 'チャージショットが貫通する強力な特殊武器', fixed: true },
];

export class BossRewardScene extends Phaser.Scene {
  stats!: PlayerStats;
  onPick!: (key: string) => void;
  choices: RewardDef[] = [];
  cursor = 0;
  optionTexts: Phaser.GameObjects.Text[] = [];
  cursorMark!: Phaser.GameObjects.Text;

  constructor() {
    super('BossReward');
  }

  init(data: { stats: PlayerStats; onPick: (key: string) => void }) {
    this.stats = data.stats;
    this.onPick = data.onPick;
  }

  create() {
    const special = SPECIAL_WEAPONS[Math.min(this.stats.bossesDefeated - 1, SPECIAL_WEAPONS.length - 1)] ?? SPECIAL_WEAPONS[0];
    const pool = REWARDS.filter((r) => r.key !== special.key);
    const picks = Phaser.Utils.Array.Shuffle([...pool]).slice(0, 2);
    this.choices = [special, ...picks];
    this.cursor = 0;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setOrigin(0, 0);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 640, 360, 0x110b1a, 1)
      .setStrokeStyle(3, 0xff3344);

    this.add.text(GAME_WIDTH / 2, 130, 'BOSS DEFEATED!', {
      fontFamily: 'monospace',
      fontSize: '34px',
      color: '#ff3344',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 170, '報酬を1つ選択', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#cfd8e8',
    }).setOrigin(0.5);

    this.optionTexts = this.choices.map((r, i) => {
      const marker = r.fixed ? '★ ' : '  ';
      return this.add.text(GAME_WIDTH / 2 - 270, 220 + i * 60,
        `[${i + 1}] ${marker}${r.label}\n      ${r.desc}`,
        {
          fontFamily: 'monospace',
          fontSize: '15px',
          color: '#ffffff',
          lineSpacing: 4,
        });
    });

    this.cursorMark = this.add.text(GAME_WIDTH / 2 - 295, 220, '▶', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ff3344',
    });
    this.refreshCursor();

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 110, '↑↓ で選択 / Enter or Space で決定 / 1〜3キーで直接選択', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#88aacc',
    }).setOrigin(0.5);

    this.input.keyboard!.on('keydown', this.onKey, this);
  }

  private refreshCursor() {
    this.cursorMark.setY(220 + this.cursor * 60);
    this.optionTexts.forEach((t, i) => {
      t.setColor(i === this.cursor ? '#ff3344' : '#ffffff');
    });
  }

  private onKey(e: KeyboardEvent) {
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      this.cursor = (this.cursor + 1) % this.choices.length;
      this.refreshCursor();
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      this.cursor = (this.cursor + this.choices.length - 1) % this.choices.length;
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
    const key = this.choices[i].key;
    this.input.keyboard?.off('keydown', this.onKey, this);
    this.scene.stop();
    this.onPick(key);
  }
}
