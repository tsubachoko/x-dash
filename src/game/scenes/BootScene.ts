import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.makePlayerTexture();
    this.makeEnemyTextures();
    this.makeBulletTextures();
    this.makeMiscTextures();
  }

  create() {
    // Capture all keys we use anywhere in the game so the browser
    // doesn't process them (page scroll, back-nav, browser shortcuts).
    // addCapture is scoped to the keyboard plugin, which is shared
    // across scenes, so doing this once at boot covers every scene.
    const KC = Phaser.Input.Keyboard.KeyCodes;
    this.input.keyboard?.addCapture([
      KC.SPACE, KC.Z, KC.X, KC.C, KC.SHIFT, KC.ESC,
      KC.J, KC.K, KC.L, KC.P,
      KC.UP, KC.DOWN, KC.LEFT, KC.RIGHT,
      KC.W, KC.A, KC.S, KC.D,
      KC.ENTER,
      KC.ONE, KC.TWO, KC.THREE,
    ]);
    this.scene.start('Title');
  }

  private makePlayerTexture() {
    const g = this.add.graphics();
    // body
    g.fillStyle(0x8be2ff, 1);
    g.fillRect(2, 6, 28, 36);
    // head
    g.fillStyle(0xffffff, 1);
    g.fillRect(6, 0, 20, 12);
    // visor
    g.fillStyle(0x1f6feb, 1);
    g.fillRect(8, 4, 16, 4);
    // legs
    g.fillStyle(0x3a4256, 1);
    g.fillRect(4, 38, 10, 6);
    g.fillRect(18, 38, 10, 6);
    // chest light
    g.fillStyle(0xffe066, 1);
    g.fillRect(14, 18, 4, 4);
    g.generateTexture('player', 32, 44);
    g.destroy();

    const g2 = this.add.graphics();
    g2.fillStyle(0xff8e8e, 1);
    g2.fillRect(2, 6, 28, 36);
    g2.fillStyle(0xffffff, 1);
    g2.fillRect(6, 0, 20, 12);
    g2.fillStyle(0xaa3030, 1);
    g2.fillRect(8, 4, 16, 4);
    g2.fillStyle(0x3a4256, 1);
    g2.fillRect(4, 38, 10, 6);
    g2.fillRect(18, 38, 10, 6);
    g2.generateTexture('player_hurt', 32, 44);
    g2.destroy();
  }

  private makeEnemyTextures() {
    const walker = this.add.graphics();
    walker.fillStyle(0xff5577, 1);
    walker.fillRect(0, 6, 32, 26);
    walker.fillStyle(0x2a0a14, 1);
    walker.fillRect(20, 12, 6, 6);
    walker.fillStyle(0x441122, 1);
    walker.fillRect(2, 28, 8, 4);
    walker.fillRect(22, 28, 8, 4);
    walker.generateTexture('enemy_walker', 32, 32);
    walker.destroy();

    const flyer = this.add.graphics();
    flyer.fillStyle(0xffaa44, 1);
    flyer.fillCircle(16, 14, 14);
    flyer.fillStyle(0x2a0a0a, 1);
    flyer.fillCircle(22, 12, 3);
    flyer.fillStyle(0xddffff, 1);
    flyer.fillRect(0, 14, 32, 2);
    flyer.generateTexture('enemy_flyer', 32, 28);
    flyer.destroy();

    const shooter = this.add.graphics();
    shooter.fillStyle(0x9a59ff, 1);
    shooter.fillRect(2, 4, 30, 28);
    shooter.fillStyle(0x1a0033, 1);
    shooter.fillRect(8, 12, 14, 8);
    shooter.fillStyle(0xff66ff, 1);
    shooter.fillRect(0, 14, 8, 4);
    shooter.generateTexture('enemy_shooter', 32, 32);
    shooter.destroy();

    const boss = this.add.graphics();
    boss.fillStyle(0x222a3a, 1);
    boss.fillRect(0, 0, 120, 100);
    boss.fillStyle(0xff3344, 1);
    boss.fillRect(20, 20, 80, 12);
    boss.fillStyle(0xffe066, 1);
    boss.fillRect(8, 60, 20, 8);
    boss.fillRect(92, 60, 20, 8);
    boss.fillStyle(0x6699ff, 1);
    boss.fillRect(40, 50, 40, 8);
    boss.generateTexture('boss', 120, 100);
    boss.destroy();
  }

  private makeBulletTextures() {
    const b = this.add.graphics();
    b.fillStyle(0x88ffee, 1);
    b.fillCircle(6, 4, 4);
    b.fillStyle(0xffffff, 1);
    b.fillCircle(7, 3, 2);
    b.generateTexture('bullet_normal', 12, 8);
    b.destroy();

    const c = this.add.graphics();
    c.fillStyle(0xffaa00, 1);
    c.fillCircle(12, 10, 10);
    c.fillStyle(0xffffaa, 1);
    c.fillCircle(14, 8, 5);
    c.generateTexture('bullet_charge', 24, 20);
    c.destroy();

    const eb = this.add.graphics();
    eb.fillStyle(0xff66cc, 1);
    eb.fillCircle(5, 5, 5);
    eb.fillStyle(0xffffff, 1);
    eb.fillCircle(6, 4, 2);
    eb.generateTexture('bullet_enemy', 10, 10);
    eb.destroy();
  }

  private makeMiscTextures() {
    const heal = this.add.graphics();
    heal.fillStyle(0x66ff88, 1);
    heal.fillRect(2, 8, 20, 8);
    heal.fillRect(8, 2, 8, 20);
    heal.fillStyle(0xffffff, 1);
    heal.fillRect(4, 10, 16, 4);
    heal.fillRect(10, 4, 4, 16);
    heal.generateTexture('item_heal', 24, 24);
    heal.destroy();

    const ground = this.add.graphics();
    ground.fillStyle(0x2a2f3a, 1);
    ground.fillRect(0, 0, 64, 16);
    ground.fillStyle(0x3a4250, 1);
    ground.fillRect(0, 0, 64, 4);
    ground.fillStyle(0x1a1d24, 1);
    ground.fillRect(0, 12, 64, 4);
    ground.generateTexture('ground_tile', 64, 16);
    ground.destroy();

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a2034, 0x1a2034, 0x0c0f1a, 0x0c0f1a, 1);
    bg.fillRect(0, 0, 64, 64);
    bg.fillStyle(0x2a3a55, 0.5);
    bg.fillRect(8, 20, 12, 30);
    bg.fillRect(30, 14, 16, 36);
    bg.fillRect(50, 24, 10, 26);
    bg.generateTexture('bg_far', 64, 64);
    bg.destroy();

    const bg2 = this.add.graphics();
    bg2.fillStyle(0x1f2a44, 0.7);
    bg2.fillRect(0, 0, 128, 64);
    bg2.fillStyle(0x394e7a, 1);
    bg2.fillRect(10, 30, 30, 30);
    bg2.fillRect(60, 24, 40, 36);
    bg2.fillStyle(0xffe066, 0.6);
    bg2.fillRect(20, 38, 4, 4);
    bg2.fillRect(70, 32, 4, 4);
    bg2.fillRect(80, 44, 4, 4);
    bg2.generateTexture('bg_mid', 128, 64);
    bg2.destroy();
  }
}
