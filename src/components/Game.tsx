import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import GameConfig from '../game/GameConfig';
import LoginForm from './LoginForm';

const Game: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const phaserGameRef = useRef<HTMLDivElement>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);

  useEffect(() => {
    if (phaserGameRef.current && !gameRef.current) {
      const config = {
        ...GameConfig,
        parent: phaserGameRef.current
      };
      
      gameRef.current = new Phaser.Game(config);
      
      // Listen for login form events from Phaser
      window.addEventListener('showLoginForm', () => setShowLoginForm(true));
      window.addEventListener('hideLoginForm', () => setShowLoginForm(false));
    }

    return () => {
      window.removeEventListener('showLoginForm', () => setShowLoginForm(true));
      window.removeEventListener('hideLoginForm', () => setShowLoginForm(false));
      
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  const handleLoginSubmit = (username: string, password: string) => {
    // Emit login event to Phaser game
    window.dispatchEvent(new CustomEvent('loginSubmitted', { 
      detail: { username, password } 
    }));
    setShowLoginForm(false);
  };

  const handleLoginCancel = () => {
    window.dispatchEvent(new CustomEvent('loginCancelled'));
    setShowLoginForm(false);
  };

  return (
    <div className="game-container relative w-full h-full">
      <div 
        ref={phaserGameRef} 
        id="game-container"
        className="w-full h-full flex items-center justify-center"
      />
      <LoginForm 
        isVisible={showLoginForm}
        onSubmit={handleLoginSubmit}
        onCancel={handleLoginCancel}
      />
    </div>
  );
};

export default Game;