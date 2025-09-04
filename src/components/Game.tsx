import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import GameConfig from '../game/GameConfig';

const Game: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const phaserGameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phaserGameRef.current && !gameRef.current) {
      const config = {
        ...GameConfig,
        parent: phaserGameRef.current
      };
      
      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="game-container">
      <div 
        ref={phaserGameRef} 
        id="game-container"
        className="w-full h-full flex items-center justify-center"
      />
    </div>
  );
};

export default Game;