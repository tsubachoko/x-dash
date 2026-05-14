import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './config';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { ResultScene } from './scenes/ResultScene';
import { LevelUpScene } from './scenes/LevelUpScene';
import { BossRewardScene } from './scenes/BossRewardScene';
import { PauseScene } from './scenes/PauseScene';

export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#06080f',
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [
      BootScene,
      TitleScene,
      GameScene,
      ResultScene,
      LevelUpScene,
      BossRewardScene,
      PauseScene,
    ],
  });
}
