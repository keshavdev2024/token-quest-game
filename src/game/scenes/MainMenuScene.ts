import Phaser from 'phaser';
import { GameStateManager } from '../GameState';

export class MainMenuScene extends Phaser.Scene {
  private gameState: GameStateManager;

  constructor() {
    super({ key: 'MainMenuScene' });
    this.gameState = GameStateManager.getInstance();
  }

  preload() {
    // Create simple geometric shapes for the game
    this.load.image('background', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1f2e);

    // Title
    const title = this.add.text(width / 2, height / 3, 'JWT Authentication Adventure', {
      fontSize: '48px',
      color: '#7c3aed',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, height / 3 + 80, 'Learn authentication through interactive gameplay', {
      fontSize: '24px',
      color: '#e2e8f0',
      fontFamily: 'monospace'
    });
    subtitle.setOrigin(0.5);

    // Start Button
    const startButton = this.add.rectangle(width / 2, height / 2 + 50, 300, 60, 0x7c3aed);
    startButton.setInteractive();
    
    const startText = this.add.text(width / 2, height / 2 + 50, 'Start Adventure', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    startText.setOrigin(0.5);

    // Level Select Buttons
    const level1Button = this.createLevelButton(width / 2 - 150, height / 2 + 150, 'Level 1\nLogin Gateway', 1);
    const level2Button = this.createLevelButton(width / 2, height / 2 + 150, 'Level 2\nProtected Resources', 2);
    const level3Button = this.createLevelButton(width / 2 + 150, height / 2 + 150, 'Level 3\nLogout Portal', 3);

    // Button interactions
    startButton.on('pointerdown', () => {
      this.scene.start('LoginGatewayScene');
    });

    startButton.on('pointerover', () => {
      startButton.setFillStyle(0x8b5cf6);
    });

    startButton.on('pointerout', () => {
      startButton.setFillStyle(0x7c3aed);
    });

    // Instructions
    const instructions = this.add.text(width / 2, height - 100, 
      'Use ARROW KEYS to move • SPACEBAR to interact • Learn JWT authentication step by step', {
      fontSize: '16px',
      color: '#94a3b8',
      fontFamily: 'monospace',
      align: 'center'
    });
    instructions.setOrigin(0.5);
  }

  private createLevelButton(x: number, y: number, text: string, level: number): Phaser.GameObjects.Rectangle {
    const button = this.add.rectangle(x, y, 140, 80, 0x334155);
    button.setInteractive();

    const buttonText = this.add.text(x, y, text, {
      fontSize: '14px',
      color: '#e2e8f0',
      fontFamily: 'monospace',
      align: 'center'
    });
    buttonText.setOrigin(0.5);

    button.on('pointerdown', () => {
      this.gameState.setCurrentLevel(level);
      switch (level) {
        case 1:
          this.scene.start('LoginGatewayScene');
          break;
        case 2:
          this.scene.start('ProtectedResourcesScene');
          break;
        case 3:
          this.scene.start('LogoutPortalScene');
          break;
      }
    });

    button.on('pointerover', () => {
      button.setFillStyle(0x475569);
    });

    button.on('pointerout', () => {
      button.setFillStyle(0x334155);
    });

    return button;
  }
}