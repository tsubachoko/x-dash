import { useEffect, useRef } from 'react';
import type Phaser from 'phaser';
import { createGame } from '../game/createGame';

export function GameCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const game = createGame(hostRef.current);
    gameRef.current = game;
    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div className="game-host" ref={hostRef} />;
}
