import Phaser from 'phaser';
import { LoginGatewayScene } from './scenes/LoginGatewayScene';
import { ProtectedResourcesScene } from './scenes/ProtectedResourcesScene';
import { LogoutPortalScene } from './scenes/LogoutPortalScene';
import { MainMenuScene } from './scenes/MainMenuScene';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  parent: 'game-container',
  backgroundColor: '#1a1f2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [
    MainMenuScene,
    LoginGatewayScene,
    ProtectedResourcesScene,
    LogoutPortalScene
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1200,
    height: 800
  },
  render: {
    pixelArt: true,
    antialias: false
  }
};

export default GameConfig;