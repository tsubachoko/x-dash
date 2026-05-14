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
  private keys: {
    jumpA: Phaser.Input.Keyboard.Key;
    jumpB: Phaser.Input.Keyboard.Key;
    dashA: Phaser.Input.Keyboard.Key;
    dashB: Phaser.Input.Keyboard.Key;
    attack: Phaser.Input.Keyboard.Key;
    pause: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard!;
    this.keys = {
      jumpA: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      jumpB: kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      dashA: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      dashB: kb.addKey(Phaser.Input.Keyboard.KeyCodes.X),
      attack: kb.addKey(Phaser.Input.Keyboard.KeyCodes.C),
      pause: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
    };
  }

  read(): InputState {
    const JustDown = Phaser.Input.Keyboard.JustDown;
    const JustUp = Phaser.Input.Keyboard.JustUp;
    const jumpDown = this.keys.jumpA.isDown || this.keys.jumpB.isDown;
    const jumpPressed = JustDown(this.keys.jumpA) || JustDown(this.keys.jumpB);
    const jumpReleased = JustUp(this.keys.jumpA) || JustUp(this.keys.jumpB);
    const dashDown = this.keys.dashA.isDown || this.keys.dashB.isDown;
    const dashPressed = JustDown(this.keys.dashA) || JustDown(this.keys.dashB);
    const attackDown = this.keys.attack.isDown;
    const pausePressed = JustDown(this.keys.pause);
    return {
      jumpDown,
      jumpPressed,
      jumpReleased,
      dashDown,
      dashPressed,
      attackDown,
      pausePressed,
    };
  }
}
