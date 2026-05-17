import Phaser from 'phaser';
import { GAME_BALANCE, GROUND_Y, PLAYER_X } from '../config';
import type { InputState } from '../systems/InputSystem';
import type { PlayerStats } from '../PlayerStats';

export type PlayerState = {
  jumping: boolean;
  falling: boolean;
  dashing: boolean;
  charging: boolean;
  chargeReady: boolean;
  damaged: boolean;
  dead: boolean;
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  stats: PlayerStats;
  state2: PlayerState = {
    jumping: false,
    falling: false,
    dashing: false,
    charging: false,
    chargeReady: false,
    damaged: false,
    dead: false,
  };
  jumpHoldUntil = 0;
  jumpHoldActive = false;
  dashStartedAt = 0;
  dashEndsAt = 0;
  dashRecoveryUntil = 0;
  dashConsumedJumpCarry = false;
  /** ダッシュ開始時に空中だったか。trueなら高度固定の「エアダッシュ」になる。 */
  dashStartedInAir = false;
  /** ダッシュ終了後、空中にいる間は横方向だけダッシュ状態を維持するためのフラグ。着地でクリア。 */
  airDashCarry = false;
  airActionsUsed = 0;
  chargeProgress = 0;
  attackCooldownUntil = 0;
  invincibleUntil = 0;
  stunUntil = 0;
  damageFlashUntil = 0;
  facing: 1 | -1 = 1;
  lastBulletAt = 0;
  bulletCount = 0;

  constructor(scene: Phaser.Scene, stats: PlayerStats) {
    super(scene, PLAYER_X, GROUND_Y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.stats = stats;
    this.setOrigin(0.5, 1);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(GAME_BALANCE.player.hitboxWidth, GAME_BALANCE.player.hitboxHeight);
    body.setOffset((this.width - GAME_BALANCE.player.hitboxWidth) / 2, this.height - GAME_BALANCE.player.hitboxHeight);
    body.setGravityY(GAME_BALANCE.player.gravity);
    body.setCollideWorldBounds(false);
    body.setVelocityX(0);
    body.setAllowGravity(true);
    this.setDepth(10);
  }

  isGrounded(): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return body.blocked.down || body.touching.down || this.y >= GROUND_Y;
  }

  update(time: number, _delta: number, input: InputState, canMove: boolean) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.state2.dead) {
      this.setTexture('player_hurt');
      return;
    }

    const stunned = time < this.stunUntil;

    // Charge progresses only while the attack key is NOT held.
    // While held the player auto-fires; tryFire consumes/resets the charge
    // after each shot, so we just freeze the progression here. If the key was
    // pressed on a frame where charge was already full, the existing value
    // survives long enough for tryFire to fire a charge shot.
    if (!stunned && !input.attackDown) {
      this.chargeProgress += 1;
    }
    const chargeFrames = this.stats.computed().chargeFrames;
    this.state2.charging = this.chargeProgress > 0 && this.chargeProgress < chargeFrames;
    this.state2.chargeReady = this.chargeProgress >= chargeFrames;

    // Dash handling
    if (this.state2.dashing) {
      const dashOver = !input.dashDown || time > this.dashEndsAt;
      if (dashOver) {
        this.endDash(time);
      }
    } else if (!stunned && canMove && input.dashPressed && time >= this.dashRecoveryUntil) {
      this.startDash(time);
    }

    // Air dash: lock altitude while a dash that started in mid-air is active.
    // Cancels any in-progress jump hold so the player stops rising instantly.
    if (this.state2.dashing && this.dashStartedInAir) {
      body.setAllowGravity(false);
      body.setVelocityY(0);
      this.jumpHoldActive = false;
    } else {
      body.setAllowGravity(true);
    }

    // Jump handling (ground)
    if (!stunned && canMove && input.jumpPressed) {
      if (this.isGrounded()) {
        this.doJump(time);
      } else if (this.airActionsUsed < this.stats.extraJumps) {
        this.doJump(time);
        this.airActionsUsed += 1;
      }
    }
    if (this.jumpHoldActive) {
      if (time > this.jumpHoldUntil) {
        // Held full duration — let inertia + gravity carry the rest.
        this.jumpHoldActive = false;
      } else if (!input.jumpDown) {
        // Released early — cap upward velocity so a tap doesn't coast as high.
        this.jumpHoldActive = false;
        const cut = -GAME_BALANCE.player.jumpCutVelocity;
        if (body.velocity.y < cut) {
          body.setVelocityY(cut);
        }
      } else {
        // Override velocity each frame so the player ascends at a constant
        // speed for as long as the button is held. Height = hold time × speed.
        const c = this.stats.computed();
        body.setVelocityY(-c.jumpInitialVelocity * c.maxJumpHeightFactor);
      }
    }

    // Determine state flags
    this.state2.jumping = body.velocity.y < -10;
    this.state2.falling = body.velocity.y > 10 && !this.isGrounded();

    // Ground snap: only zero downward velocity, never overwrite an
    // upward jump impulse triggered earlier in this same frame.
    if (this.y >= GROUND_Y && body.velocity.y >= 0) {
      this.y = GROUND_Y;
      body.setVelocityY(0);
      this.airActionsUsed = 0;
      this.airDashCarry = false;
    }

    // Damage flash
    if (time < this.damageFlashUntil) {
      this.setTexture('player_hurt');
      this.setAlpha((Math.floor(time / 60) % 2) === 0 ? 1 : 0.5);
    } else {
      this.setTexture('player');
      if (time < this.invincibleUntil) {
        this.setAlpha((Math.floor(time / 80) % 2) === 0 ? 1 : 0.4);
      } else {
        this.setAlpha(1);
      }
    }

    this.state2.damaged = stunned;
  }

  private doJump(time: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const c = this.stats.computed();
    body.setVelocityY(-c.jumpInitialVelocity * c.maxJumpHeightFactor);
    this.jumpHoldActive = true;
    this.jumpHoldUntil = time + GAME_BALANCE.player.jumpHoldExtraMs;
    // If we jumped during dash, no dash recovery.
    if (this.state2.dashing) {
      this.dashConsumedJumpCarry = true;
    }
  }

  private startDash(time: number) {
    this.state2.dashing = true;
    this.dashStartedAt = time;
    this.dashEndsAt = time + this.stats.computed().dashDurationMs;
    this.dashConsumedJumpCarry = false;
    this.dashStartedInAir = !this.isGrounded();
  }

  private endDash(time: number) {
    this.state2.dashing = false;
    if (!this.dashConsumedJumpCarry) {
      this.dashRecoveryUntil = time + GAME_BALANCE.player.dashRecoveryMs;
    } else {
      this.dashRecoveryUntil = 0;
    }
    // If we end the dash while airborne (air-dash or dash-jump),
    // keep the dash-speed posture until the player lands.
    if (!this.isGrounded()) {
      this.airDashCarry = true;
    }
  }

  consumeChargeShot() {
    this.chargeProgress = 0;
    this.state2.chargeReady = false;
    this.state2.charging = false;
  }

  resetCharge() {
    this.chargeProgress = 0;
    this.state2.chargeReady = false;
    this.state2.charging = false;
  }

  takeDamage(amount: number, time: number): boolean {
    if (time < this.invincibleUntil || this.state2.dead) return false;
    let actual = amount;
    if (this.state2.dashing) {
      actual = Math.max(0, amount - this.stats.dashDamageReduction);
    }
    this.stats.damage(actual);
    this.stunUntil = time + GAME_BALANCE.player.damageStunMs;
    this.invincibleUntil = time + GAME_BALANCE.player.damageInvincibleMs + this.stats.invincibilityBonusMs;
    this.damageFlashUntil = time + GAME_BALANCE.player.damageStunMs;
    if (this.stats.isDead()) {
      this.state2.dead = true;
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, -300);
      body.setGravityY(GAME_BALANCE.player.gravity);
    }
    return true;
  }
}
