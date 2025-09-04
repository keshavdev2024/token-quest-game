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
    const title = this.add.text(width / 2, 50, 'JWT Authentication Adventure', {
      fontSize: '28px',
      color: '#7c3aed',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, 90, 'Learn authentication through interactive gameplay', {
      fontSize: '14px',
      color: '#e2e8f0',
      fontFamily: 'monospace'
    });
    subtitle.setOrigin(0.5);

    // Menu button
    const menuButton = this.add.rectangle(40, 30, 70, 30, 0x475569);
    menuButton.setInteractive();
    const menuText = this.add.text(40, 30, 'MENU', {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    menuText.setOrigin(0.5);

    menuButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });

    // Level selector buttons
    const level1Button = this.add.rectangle(width / 2 - 100, 200, 80, 60, 0x7c3aed);
    level1Button.setInteractive();
    const level1Text = this.add.text(width / 2 - 100, 200, 'LEVEL 1\nLogin', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      align: 'center'
    });
    level1Text.setOrigin(0.5);

    level1Button.on('pointerdown', () => {
      this.scene.start('EnhancedLoginGatewayScene');
    });

    const level2Button = this.add.rectangle(width / 2, 200, 80, 60, 0x059669);
    level2Button.setInteractive();
    const level2Text = this.add.text(width / 2, 200, 'LEVEL 2\nResources', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      align: 'center'
    });
    level2Text.setOrigin(0.5);

    level2Button.on('pointerdown', () => {
      this.scene.start('ProtectedResourcesScene');
    });

    const level3Button = this.add.rectangle(width / 2 + 100, 200, 80, 60, 0xdc2626);
    level3Button.setInteractive();
    const level3Text = this.add.text(width / 2 + 100, 200, 'LEVEL 3\nLogout', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      align: 'center'
    });
    level3Text.setOrigin(0.5);

    level3Button.on('pointerdown', () => {
      this.scene.start('LogoutPortalScene');
    });

    // Instructions
    const instructions = this.add.text(width / 2, 300, 'Learn JWT Authentication Through Interactive Gameplay', {
      fontSize: '16px',
      color: '#e2e8f0',
      fontFamily: 'monospace'
    });
    instructions.setOrigin(0.5);

    const description = this.add.text(width / 2, 350, 
      'Navigate through each level to understand:\n' +
      '• Authentication process and JWT creation\n' +
      '• Protected resource access with tokens\n' +
      '• Session termination and security\n\n' +
      'Use ARROW KEYS to move, SPACEBAR to interact', {
      fontSize: '12px',
      color: '#94a3b8',
      fontFamily: 'monospace',
      align: 'center'
    });
    description.setOrigin(0.5);

    // Check completed levels and update button colors
    const gameState = this.gameState.getState();
    if (gameState.completedLevels.includes(1)) {
      level1Button.setFillStyle(0x10b981);
    }
    if (gameState.completedLevels.includes(2)) {
      level2Button.setFillStyle(0x10b981);
    }
    if (gameState.completedLevels.includes(3)) {
      level3Button.setFillStyle(0x10b981);
    }

    // Add hover effects
    [level1Button, level2Button, level3Button].forEach(button => {
      const originalColor = button.fillColor;
      button.on('pointerover', () => {
        if (!gameState.completedLevels.includes(gameState.currentLevel)) {
          button.setFillStyle(button.fillColor + 0x222222);
        }
      });
      button.on('pointerout', () => {
        button.setFillStyle(originalColor);
      });
    });
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
          this.scene.start('EnhancedLoginGatewayScene');
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