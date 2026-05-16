import Phaser from 'phaser';

export interface InputState {
  jumpDown: boolean;
  jumpPressed: boolean;
  jumpReleased: boolean;
  dashDown: boolean;
  dashPressed: boolean;
  attackDown: boolean;
  pausePressed: boolean;
}

export class InputSystem {
  private jumpKeys: Phaser.Input.Keyboard.Key[];
  private dashKeys: Phaser.Input.Keyboard.Key[];
  private attackKeys: Phaser.Input.Keyboard.Key[];
  private pauseKeys: Phaser.Input.Keyboard.Key[];

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard!;
    const KC = Phaser.Input.Keyboard.KeyCodes;
    this.jumpKeys = [
      kb.addKey(KC.Z),
      kb.addKey(KC.J),
    ];
    this.dashKeys = [
      kb.addKey(KC.SHIFT),
      kb.addKey(KC.X),
      kb.addKey(KC.K),
    ];
    this.attackKeys = [
      kb.addKey(KC.C),
      kb.addKey(KC.L),
      kb.addKey(KC.SPACE),
    ];
    this.pauseKeys = [
      kb.addKey(KC.ESC),
      kb.addKey(KC.P),
    ];
  }

  read(): InputState {
    const JustDown = Phaser.Input.Keyboard.JustDown;
    const JustUp = Phaser.Input.Keyboard.JustUp;
    const anyDown = (keys: Phaser.Input.Keyboard.Key[]) => keys.some(k => k.isDown);
    const anyJustDown = (keys: Phaser.Input.Keyboard.Key[]) => keys.some(k => JustDown(k));
    const anyJustUp = (keys: Phaser.Input.Keyboard.Key[]) => keys.some(k => JustUp(k));
    return {
      jumpDown: anyDown(this.jumpKeys),
      jumpPressed: anyJustDown(this.jumpKeys),
      jumpReleased: anyJustUp(this.jumpKeys),
      dashDown: anyDown(this.dashKeys),
      dashPressed: anyJustDown(this.dashKeys),
      attackDown: anyDown(this.attackKeys),
      pausePressed: anyJustDown(this.pauseKeys),
    };
  }
}
