/** ゲーム画面の幅 (px) */
export const GAME_WIDTH = 960;
/** ゲーム画面の高さ (px) */
export const GAME_HEIGHT = 540;
/** 地面のY座標 (px)。プレイヤー・敵はこの高さに立つ。 */
export const GROUND_Y = 460;
/** プレイヤーの固定X座標 (px)。自動前進中も画面上では動かない。 */
export const PLAYER_X = 200;

export const GAME_BALANCE = {
  player: {
    /** プレイヤーの初期最大HP。ステータス強化で増加する。 */
    baseHp: 10,
    /** 通常移動時のスクロール基準速度 (px/s)。ステータス強化で増加する。 */
    baseMoveSpeed: 300,
    /** ダッシュ中のスクロール速度倍率。dashSpeed = baseMoveSpeed × この値。 */
    dashSpeedMultiplier: 1.8,
    /** ダッシュ継続時間 (ms)。ダッシュ距離ステータスで延長される。 */
    dashDurationMs: 600,
    /** ダッシュ開始からこの時間は、ダッシュキーを離してもダッシュ状態を維持する (ms)。 */
    dashMinHoldMs: 15,
    /** ダッシュ終了後、次のダッシュを出せるまでの後隙 (ms)。ダッシュジャンプ時は発生しない。 */
    dashRecoveryMs: 120,
    /** 被弾後の無敵時間 (ms)。この間は再被弾しない。 */
    damageInvincibleMs: 900,
    /** 被弾時の操作不能時間 (ms)。被弾モーション中の硬直。 */
    damageStunMs: 250,
    /** チャージショット完了までのフレーム数 (60fps想定)。チャージ速度ステータスで短縮される。 */
    chargeFrames: 60,
    /** ジャンプの初速 (px/s)。押している間この速度で上昇し続ける。ジャンプ速度ステータスで増加。 */
    jumpInitialVelocity: 460,
    /** ジャンプボタンを押し続けて上昇できる最大時間 (ms)。これを超えると重力に切り替わる。 */
    jumpHoldExtraMs: 200,
    /** 最大保持時間より前にジャンプボタンを離したときに上向き速度をカットする上限 (px/s)。タップ時のジャンプ高度を抑える。 */
    jumpCutVelocity: 300,
    /** 落下時の重力加速度 (px/s²)。ジャンプ離した後・最大保持時間経過後に効く。 */
    gravity: 1800,
    /** プレイヤー当たり判定の幅 (px)。 */
    hitboxWidth: 28,
    /** プレイヤー当たり判定の高さ (px)。 */
    hitboxHeight: 44,
    /** 空中で使える追加アクション数の初期値。現状は未使用 (ボス報酬の「ジャンプ回数+1」で増加する想定)。 */
    extraAirActions: 0,
    /** ボス戦中、ダッシュで前進するX軸速度 (px/s)。スクロールが止まる代わりにプレイヤー自身が動く。 */
    bossArenaForwardSpeed: 400,
    /** ボス戦中、ダッシュしていない時に PLAYER_X へ戻る速度 (px/s)。前進より遅めにすると緊張感が出る。 */
    bossArenaReturnSpeed: 200,
    /** ボス戦中、プレイヤーが PLAYER_X から前進できる最大距離 (px)。ボスへ近づきすぎないよう制限する。 */
    bossArenaMaxAdvance: 320,
    /** 通常時、ダッシュで前進する速度 (px/s)。スクロール加速と併用するため控えめ。 */
    runDashForwardSpeed: 200,
    /** 通常時、ダッシュを離した後に PLAYER_X へ戻る速度 (px/s)。 */
    runDashReturnSpeed: 300,
    /** 通常時、ダッシュで前方へ進める最大距離 (px)。プレイヤー1体弱分程度の「やや前進」演出。 */
    runDashMaxAdvance: 20,
  },

  weapon: {
    /** 画面内に同時に存在できる通常弾の上限数。これ以上は新規発射不可。 */
    bulletLimit: 3,
    /** 通常弾の基礎ダメージ。ダメージ量ステータスで上昇する。 */
    baseBulletDamage: 1,
    /** チャージショットのダメージ倍率。chargeShotDamage = bulletDamage × この値。 */
    chargeShotMultiplier: 5,
    /** 通常弾の飛翔速度 (px/s)。 */
    bulletSpeed: 720,
    /** チャージショットの飛翔速度 (px/s)。通常弾より速め。 */
    chargeBulletSpeed: 820,
    /** ダッシュ中に撃った通常弾のダメージ加算値。通常時より硬い敵に対して有効。 */
    dashBulletDamageBonus: 1,
    /** 通常弾の発射間隔 (ms)。連射速度ステータスで短縮される。 */
    bulletCooldownMs: 150,
  },

  enemy: {
    /** 地上歩行敵 (Walker) のHP。 */
    walkerHp: 2,
    /** 地上歩行敵の移動速度 (px/s)。スクロールとは別に左方向へ歩く分。 */
    walkerSpeed: 80,
    /** 地上歩行敵に接触したときプレイヤーが受けるダメージ。 */
    walkerTouchDamage: 1,
    /** 空中飛行敵 (Flyer) のHP。 */
    flyerHp: 2,
    /** 空中飛行敵に接触したときプレイヤーが受けるダメージ。 */
    flyerTouchDamage: 1,
    /** 射撃敵 (Shooter) のHP。やや高め。 */
    shooterHp: 3,
    /** 射撃敵に接触したときプレイヤーが受けるダメージ。 */
    shooterTouchDamage: 1,
    /** 射撃敵の敵弾がプレイヤーに当たったときのダメージ。 */
    shooterBulletDamage: 1,
    /** 射撃敵の発射間隔 (ms)。 */
    shooterFireIntervalMs: 1600,
    /** 敵弾の飛翔速度 (px/s)。 */
    enemyBulletSpeed: 280,
    /** 通常敵撃破時に回復アイテムをドロップする基礎確率 (0〜1)。ドロップ率ステータスで上昇。 */
    healDropChance: 0.18,
    /** 回復アイテム取得時の回復量 (固定値)。 */
    healAmount: 2,
    /** 地上歩行敵を倒した際の獲得経験値。 */
    walkerXp: 1,
    /** 空中飛行敵を倒した際の獲得経験値。 */
    flyerXp: 1,
    /** 射撃敵を倒した際の獲得経験値。やや多め。 */
    shooterXp: 2,
  },

  boss: {
    /** ボス出現の距離間隔 (m単位)。この距離ごとにボス戦が発生する。 */
    distanceInterval: 1000,
    /** ボスのHP。通常敵より大幅に高い。 */
    hp: 60,
    /** ボス接触時にプレイヤーが受けるダメージ。 */
    touchDamage: 2,
    /** ボスの弾がプレイヤーに当たったときのダメージ。 */
    bulletDamage: 1,
    /** ボス撃破時の獲得経験値。通常敵より大量。 */
    xp: 20,
    /** ボスの弾発射間隔 (ms)。 */
    fireIntervalMs: 1100,
  },

  levelScaling: {
    /** 最初のレベルアップに必要な経験値。 */
    xpToFirstLevel: 5,
    /** レベルアップごとに必要経験値が増加する量。 */
    xpGrowthPerLevel: 4,
    /** ダメージ量ステータス Lv+1 ごとの通常弾ダメージ上昇値 (チャージショットも倍率分上昇)。 */
    damagePerLevel: 1,
    /** 最大HPステータス Lv+1 ごとの最大HP上昇値。 */
    hpPerLevel: 2,
    /** 移動速度ステータス Lv+1 ごとのスクロール速度上昇値 (px/s)。 */
    moveSpeedPerLevel: 16,
    /** ジャンプ速度ステータス Lv+1 ごとのジャンプ初速上昇値 (px/s)。 */
    jumpVelocityPerLevel: 24,
    /** 最大ジャンプ高度ステータス Lv+1 ごとの上昇値。現状は PlayerStats.ts で 0.04 ハードコード扱いのため未使用。 */
    maxJumpHeightPerLevel: 14,
    /** ダッシュ距離ステータス Lv+1 ごとのダッシュ継続時間延長 (ms)。 */
    dashDurationPerLevelMs: 40,
    /** チャージ速度ステータス Lv+1 ごとのチャージ短縮フレーム数 (最低15フレームでクランプ)。 */
    chargeFrameReductionPerLevel: 4,
    /** 連射速度ステータス Lv+1 ごとの通常弾クールダウン短縮 (ms)。最低40msでクランプ。 */
    bulletCooldownReductionMs: 12,
    /** ドロップ確率ステータス Lv+1 ごとの回復ドロップ率上昇 (上限1.0)。 */
    dropChancePerLevel: 0.04,
  },

  scroll: {
    /** スクロール初期/基準速度 (px/s)。 */
    baseSpeed: 220,
    /** スクロール速度の下限 (px/s)。これより遅くはならない。 */
    minSpeed: 60,
    /** スクロール速度の上限 (px/s)。これより速くはならない。 */
    maxSpeed: 900,
  },
} as const;

export type StatKey =
  | 'damage'
  | 'chargeSpeed'
  | 'fireRate'
  | 'maxHp'
  | 'dropRate'
  | 'moveSpeed'
  | 'jumpSpeed'
  | 'maxJumpHeight'
  | 'dashDistance';

/** レベルアップ画面で表示する各ステータスのラベルと説明文。 */
export const STAT_DEFS: Record<StatKey, { label: string; desc: string }> = {
  damage: { label: 'ダメージ量', desc: '通常弾とチャージショットの威力が上昇' },
  chargeSpeed: { label: 'チャージ速度', desc: 'チャージ完了までの時間が短縮' },
  fireRate: { label: '連射速度', desc: '通常弾の発射間隔が短縮' },
  maxHp: { label: '最大HP', desc: '最大HPが上昇' },
  dropRate: { label: 'ドロップ確率', desc: '回復アイテムのドロップ率が上昇' },
  moveSpeed: { label: '移動速度', desc: '通常時とダッシュ時のスクロール速度が上昇' },
  jumpSpeed: { label: 'ジャンプ速度', desc: 'ジャンプ上昇時の初速が上昇' },
  maxJumpHeight: { label: '最大ジャンプ高度', desc: '到達可能なジャンプ高度が上昇' },
  dashDistance: { label: 'ダッシュ距離', desc: 'ダッシュ継続距離が上昇' },
};
