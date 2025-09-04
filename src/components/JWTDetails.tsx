import React, { useEffect, useState } from 'react';
import { GameStateManager } from '../game/GameState';

const JWTDetails: React.FC = () => {
  const [gameState, setGameState] = useState(GameStateManager.getInstance().getState());

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(GameStateManager.getInstance().getState());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (!gameState.isLoggedIn || !gameState.jwt) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 z-10 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 min-w-64">
      <div className="text-sm font-mono">
        <h3 className="text-primary font-bold mb-2">JWT Token Details</h3>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-jwt-header"></div>
            <span className="text-jwt-header">Header</span>
            <span className={gameState.jwt.header ? "text-success" : "text-muted-foreground"}>
              {gameState.jwt.header ? "✓" : "✗"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-jwt-payload"></div>
            <span className="text-jwt-payload">Payload</span>
            <span className={gameState.jwt.payload ? "text-success" : "text-muted-foreground"}>
              {gameState.jwt.payload ? "✓" : "✗"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-jwt-signature"></div>
            <span className="text-jwt-signature">Signature</span>
            <span className={gameState.jwt.signature ? "text-success" : "text-muted-foreground"}>
              {gameState.jwt.signature ? "✓" : "✗"}
            </span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex justify-between text-xs">
            <span>Status:</span>
            <span className={gameState.jwt.complete ? "text-success" : "text-error"}>
              {gameState.jwt.complete ? "Valid" : "Incomplete"}
            </span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>Role:</span>
            <span className="text-accent">{gameState.userRole}</span>
          </div>
        </div>

        {gameState.jwt.complete && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground">
              Sample JWT:
            </div>
            <div className="text-xs font-mono mt-1 break-all">
              <span className="text-jwt-header">eyJ0eXAi</span>
              <span className="text-foreground">.</span>
              <span className="text-jwt-payload">eyJzdWIi</span>
              <span className="text-foreground">.</span>
              <span className="text-jwt-signature">SflKxwRJ</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JWTDetails;