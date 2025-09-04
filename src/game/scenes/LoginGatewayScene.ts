import Phaser from 'phaser';
import { GameStateManager } from '../GameState';

export class LoginGatewayScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private loginButton!: Phaser.GameObjects.Rectangle;
  private jwt!: Phaser.GameObjects.Group;
  private gameState: GameStateManager;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private isNearLogin = false;
  private jwtCollected = false;
  private messageText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'LoginGatewayScene' });
    this.gameState = GameStateManager.getInstance();
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1f2e);

    // Title
    const title = this.add.text(width / 2, 50, 'Level 1: The Login Gateway', {
      fontSize: '32px',
      color: '#7c3aed',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Instructions
    const instructions = this.add.text(width / 2, 100, 'Navigate to the login portal and authenticate to receive your JWT key', {
      fontSize: '18px',
      color: '#e2e8f0',
      fontFamily: 'monospace'
    });
    instructions.setOrigin(0.5);

    // Create player (simple rectangle)
    this.player = this.add.rectangle(100, height / 2, 30, 30, 0x00ff00);
    this.physics.add.existing(this.player);

    // Create login button/portal
    this.loginButton = this.add.rectangle(width - 200, height / 2, 80, 80, 0x7c3aed);
    this.physics.add.existing(this.loginButton, true);

    const loginText = this.add.text(width - 200, height / 2 - 50, 'LOGIN\nPORTAL', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      align: 'center'
    });
    loginText.setOrigin(0.5);

    // Create JWT visualization (initially hidden)
    this.jwt = this.add.group();
    this.createJWTVisualization(width / 2, height / 2 + 150);

    // Message text
    this.messageText = this.add.text(width / 2, height - 150, 'Move with ARROW KEYS. Press SPACEBAR near the login portal to authenticate.', {
      fontSize: '16px',
      color: '#94a3b8',
      fontFamily: 'monospace',
      align: 'center'
    });
    this.messageText.setOrigin(0.5);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Collision detection
    this.physics.add.overlap(this.player, this.loginButton, () => {
      this.isNearLogin = true;
    });

    // Menu button
    const menuButton = this.add.rectangle(50, 50, 100, 40, 0x475569);
    menuButton.setInteractive();
    const menuText = this.add.text(50, 50, 'MENU', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    menuText.setOrigin(0.5);

    menuButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });

    // Next level button (initially hidden)
    const nextButton = this.add.rectangle(width - 100, height - 50, 120, 40, 0x10b981);
    nextButton.setInteractive();
    nextButton.setVisible(false);
    
    const nextText = this.add.text(width - 100, height - 50, 'NEXT LEVEL', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    nextText.setOrigin(0.5);
    nextText.setVisible(false);

    nextButton.on('pointerdown', () => {
      this.scene.start('ProtectedResourcesScene');
    });

    // Store reference for later use
    (this as any).nextButton = nextButton;
    (this as any).nextText = nextText;
  }

  update() {
    // Player movement
    const speed = 200;
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    if (this.cursors.left.isDown) {
      playerBody.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      playerBody.setVelocityX(speed);
    } else {
      playerBody.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      playerBody.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      playerBody.setVelocityY(speed);
    } else {
      playerBody.setVelocityY(0);
    }

    // Keep player in bounds
    this.player.x = Phaser.Math.Clamp(this.player.x, 15, this.cameras.main.width - 15);
    this.player.y = Phaser.Math.Clamp(this.player.y, 130, this.cameras.main.height - 200);

    // Check distance to login portal
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.loginButton.x, this.loginButton.y
    );

    this.isNearLogin = distance < 100;

    // Handle login
    if (this.isNearLogin && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.jwtCollected) {
      this.handleLogin();
    }

    // Update message
    if (this.isNearLogin && !this.jwtCollected) {
      this.messageText.setText('Press SPACEBAR to login and receive your JWT token!');
      this.messageText.setColor('#10b981');
    } else if (this.jwtCollected) {
      this.messageText.setText('JWT token received! You can now access protected resources.');
      this.messageText.setColor('#10b981');
    } else {
      this.messageText.setText('Move with ARROW KEYS. Get close to the login portal to authenticate.');
      this.messageText.setColor('#94a3b8');
    }
  }

  private handleLogin() {
    this.gameState.login('user');
    this.jwtCollected = true;
    
    // Show JWT visualization with animation
    this.jwt.setVisible(true);
    this.animateJWTAppearance();

    // Show next level button
    (this as any).nextButton.setVisible(true);
    (this as any).nextText.setVisible(true);

    // Mark level as completed
    this.gameState.completeLevel(1);

    // Visual feedback
    this.loginButton.setFillStyle(0x10b981);
  }

  private createJWTVisualization(x: number, y: number) {
    // JWT Header (Purple)
    const header = this.add.rectangle(x - 60, y, 50, 30, 0xc084fc);
    const headerText = this.add.text(x - 60, y, 'H', {
      fontSize: '16px',
      color: '#1a1f2e',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    headerText.setOrigin(0.5);

    // JWT Payload (Blue)
    const payload = this.add.rectangle(x, y, 50, 30, 0x60a5fa);
    const payloadText = this.add.text(x, y, 'P', {
      fontSize: '16px',
      color: '#1a1f2e',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    payloadText.setOrigin(0.5);

    // JWT Signature (Green)
    const signature = this.add.rectangle(x + 60, y, 50, 30, 0x4ade80);
    const signatureText = this.add.text(x + 60, y, 'S', {
      fontSize: '16px',
      color: '#1a1f2e',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    signatureText.setOrigin(0.5);

    // JWT Label
    const jwtLabel = this.add.text(x, y + 50, 'JWT Token (Header.Payload.Signature)', {
      fontSize: '14px',
      color: '#e2e8f0',
      fontFamily: 'monospace'
    });
    jwtLabel.setOrigin(0.5);

    this.jwt.addMultiple([header, headerText, payload, payloadText, signature, signatureText, jwtLabel]);
    this.jwt.setVisible(false);
  }

  private animateJWTAppearance() {
    const jwtChildren = this.jwt.getChildren();
    
    jwtChildren.forEach((child, index) => {
      const gameObject = child as Phaser.GameObjects.GameObject & { setScale: (scale: number) => void };
      gameObject.setScale(0);
      this.tweens.add({
        targets: child,
        scale: 1,
        duration: 500,
        delay: index * 100,
        ease: 'Back.easeOut'
      });
    });

    // Add glow effect
    jwtChildren.slice(0, 6).forEach((child) => {
      this.tweens.add({
        targets: child,
        alpha: 0.7,
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
    });
  }
}
