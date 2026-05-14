import { GameCanvas } from './components/GameCanvas';
import './App.css';

export default function App() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>X-DASH</h1>
        <p className="tagline">MECHANICAL RUN ACTION — Endless side-scrolling shoot &amp; dash</p>
      </header>

      <main className="game-wrapper">
        <GameCanvas />
      </main>

      <section className="about">
        <h2>About</h2>
        <p>
          X-DASH は、ブラウザで動く2D横スクロールのランアクションです。
          自動で前進するキャラクターを操作し、ジャンプ・ダッシュ・通常攻撃・チャージショットで
          敵を倒しながらどこまで遠くへ進めるかを競います。
        </p>
        <h3>操作</h3>
        <ul>
          <li><b>SPACE / Z</b> — ジャンプ (押している時間で高さが変化)</li>
          <li><b>SHIFT / X</b> — ダッシュ (押し続けで継続)</li>
          <li><b>C</b> — 攻撃 (押しっぱなしで自動連射 / 離している間にチャージが進行し、完了時に押すとチャージショット)</li>
          <li><b>ESC</b> — ポーズ</li>
        </ul>
        <h3>遊び方</h3>
        <ol>
          <li>敵を倒して経験値を集めるとレベルアップし、強化を1つ選べます。</li>
          <li>一定距離ごとに登場するボスを倒すと、3択の特別な強化が得られます。</li>
          <li>HPが0になるとゲームオーバー。到達距離と撃破ボス数が記録されます。</li>
        </ol>
      </section>

      <footer className="page-footer">
        <span>素材はすべて開発時の仮素材です。世界観、キャラクター、名称はオリジナル。</span>
      </footer>
    </div>
  );
}
