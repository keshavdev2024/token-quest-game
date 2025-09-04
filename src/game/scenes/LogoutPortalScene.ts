import Phaser from 'phaser';
import { GameStateManager } from '../GameState';

export class LogoutPortalScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private logoutPortal!: Phaser.GameObjects.Rectangle;
  private jwt!: Phaser.GameObjects.Group;
  private gameState: GameStateManager;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private isNearPortal = false;
  private hasLoggedOut = false;
  private messageText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'LogoutPortalScene' });
    this.gameState = GameStateManager.getInstance();
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1f2e);

    // Title
    const title = this.add.text(width / 2, 50, 'Level 3: The Logout Portal', {
      fontSize: '32px',
      color: '#7c3aed',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Instructions
    const instructions = this.add.text(width / 2, 100, 'End your session by destroying the JWT token at the logout portal', {
      fontSize: '18px',
      color: '#e2e8f0',
      fontFamily: 'monospace'
    });
    instructions.setOrigin(0.5);

    // Create player
    this.player = this.add.rectangle(100, height / 2, 30, 30, 0x00ff00);
    this.physics.add.existing(this.player);

    // Create logout portal
    this.logoutPortal = this.add.rectangle(width - 200, height / 2, 100, 100, 0xef4444);
    this.physics.add.existing(this.logoutPortal, true);

    // Add portal effects
    const portalGlow = this.add.circle(width - 200, height / 2, 60, 0xef4444, 0.3);
    
    this.tweens.add({
      targets: portalGlow,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0.1,
      duration: 2000,
      yoyo: true,
      repeat: -1
    });

    const portalText = this.add.text(width - 200, height / 2 - 70, 'LOGOUT\nPORTAL', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      align: 'center',
      fontStyle: 'bold'
    });
    portalText.setOrigin(0.5);

    // Create JWT visualization (if user has one)
    this.jwt = this.add.group();
    if (this.gameState.hasJWT()) {
      this.createJWTVisualization(width / 2, height / 2 + 150);
    }

    // Show session info
    this.createSessionInfo(200, 200);

    // Message text
    this.messageText = this.add.text(width / 2, height - 150, 'Move with ARROW KEYS. Approach the logout portal to end your session.', {
      fontSize: '16px',
      color: '#94a3b8',
      fontFamily: 'monospace',
      align: 'center'
    });
    this.messageText.setOrigin(0.5);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

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

    // Restart button (initially hidden)
    const restartButton = this.add.rectangle(width - 100, height - 50, 120, 40, 0x7c3aed);
    restartButton.setInteractive();
    restartButton.setVisible(false);
    
    const restartText = this.add.text(width - 100, height - 50, 'RESTART', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    restartText.setOrigin(0.5);
    restartText.setVisible(false);

    restartButton.on('pointerdown', () => {
      this.gameState.reset();
      this.scene.start('MainMenuScene');
    });

    // Store reference for later use
    (this as any).restartButton = restartButton;
    (this as any).restartText = restartText;
  }

  update() {
    if (this.hasLoggedOut) return;

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

    // Check distance to logout portal
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.logoutPortal.x, this.logoutPortal.y
    );

    this.isNearPortal = distance < 120;

    // Handle logout
    if (this.isNearPortal && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.handleLogout();
    }

    // Update message
    if (this.isNearPortal && !this.hasLoggedOut) {
      if (this.gameState.hasJWT()) {
        this.messageText.setText('Press SPACEBAR to logout and destroy your JWT token!');
        this.messageText.setColor('#ef4444');
      } else {
        this.messageText.setText('No active session to logout from.');
        this.messageText.setColor('#94a3b8');
      }
    } else if (!this.hasLoggedOut) {
      this.messageText.setText('Move close to the logout portal to end your session.');
      this.messageText.setColor('#94a3b8');
    }
  }

  private handleLogout() {
    if (!this.gameState.hasJWT()) return;

    this.hasLoggedOut = true;
    this.gameState.logout();

    // Animate JWT destruction
    this.animateJWTDestruction();

    // Portal success animation
    this.tweens.add({
      targets: this.logoutPortal,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 200,
      yoyo: true,
      repeat: 2
    });

    // Show success message
    this.messageText.setText('Session ended successfully! JWT token destroyed.');
    this.messageText.setColor('#10b981');

    // Mark level as completed
    this.gameState.completeLevel(3);

    // Show restart button
    (this as any).restartButton.setVisible(true);
    (this as any).restartText.setVisible(true);

    // Create completion celebration
    this.createCompletionEffect();
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
    const jwtLabel = this.add.text(x, y + 50, 'Active JWT Token', {
      fontSize: '14px',
      color: '#e2e8f0',
      fontFamily: 'monospace'
    });
    jwtLabel.setOrigin(0.5);

    this.jwt.addMultiple([header, headerText, payload, payloadText, signature, signatureText, jwtLabel]);

    // Add pulsing glow effect
    this.tweens.add({
      targets: [header, payload, signature],
      alpha: 0.7,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  private animateJWTDestruction() {
    const jwtChildren = this.jwt.getChildren();
    
    // Destruction animation
    jwtChildren.forEach((child, index) => {
      const gameObject = child as Phaser.GameObjects.GameObject & { x: number; y: number; destroy: () => void };
      // Shake effect
      this.tweens.add({
        targets: child,
        x: gameObject.x + Phaser.Math.Between(-10, 10),
        y: gameObject.y + Phaser.Math.Between(-10, 10),
        duration: 100,
        repeat: 5,
        yoyo: true,
        onComplete: () => {
          // Fade out and scale down
          this.tweens.add({
            targets: child,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            duration: 500,
            delay: index * 100,
            onComplete: () => {
              gameObject.destroy();
            }
          });
        }
      });
    });

    // Add destruction particles effect
    this.createDestructionParticles(this.cameras.main.width / 2, this.cameras.main.height / 2 + 150);
  }

  private createDestructionParticles(x: number, y: number) {
    const colors = [0xc084fc, 0x60a5fa, 0x4ade80];
    
    for (let i = 0; i < 20; i++) {
      const particle = this.add.rectangle(
        x + Phaser.Math.Between(-50, 50),
        y + Phaser.Math.Between(-20, 20),
        Phaser.Math.Between(3, 8),
        Phaser.Math.Between(3, 8),
        colors[i % colors.length]
      );

      this.tweens.add({
        targets: particle,
        x: x + Phaser.Math.Between(-200, 200),
        y: y + Phaser.Math.Between(-100, 100),
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: Phaser.Math.Between(500, 1500),
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  private createSessionInfo(x: number, y: number) {
    const state = this.gameState.getState();
    
    const infoBg = this.add.rectangle(x, y, 200, 140, 0x1f2937);
    
    const infoTitle = this.add.text(x, y - 50, 'Session Info', {
      fontSize: '16px',
      color: '#7c3aed',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    infoTitle.setOrigin(0.5);

    const loginStatus = this.add.text(x, y - 25, state.isLoggedIn ? '✓ Authenticated' : '✗ Not Authenticated', {
      fontSize: '12px',
      color: state.isLoggedIn ? '#10b981' : '#ef4444',
      fontFamily: 'monospace'
    });
    loginStatus.setOrigin(0.5);

    const jwtStatus = this.add.text(x, y - 5, state.jwt ? '✓ JWT Present' : '✗ No JWT', {
      fontSize: '12px',
      color: state.jwt ? '#10b981' : '#ef4444',
      fontFamily: 'monospace'
    });
    jwtStatus.setOrigin(0.5);

    const roleText = this.add.text(x, y + 15, `Role: ${state.userRole.toUpperCase()}`, {
      fontSize: '12px',
      color: '#e2e8f0',
      fontFamily: 'monospace'
    });
    roleText.setOrigin(0.5);

    const completedText = this.add.text(x, y + 35, `Completed: ${state.completedLevels.length}/3`, {
      fontSize: '12px',
      color: '#e2e8f0',
      fontFamily: 'monospace'
    });
    completedText.setOrigin(0.5);
  }

  private createCompletionEffect() {
    const { width, height } = this.cameras.main;
    
    // Celebration text
    const celebrationText = this.add.text(width / 2, height / 2 - 100, 'CONGRATULATIONS!\nYou completed the JWT Authentication Adventure!', {
      fontSize: '24px',
      color: '#10b981',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      align: 'center'
    });
    celebrationText.setOrigin(0.5);
    celebrationText.setAlpha(0);

    this.tweens.add({
      targets: celebrationText,
      alpha: 1,
      duration: 1000,
      delay: 1000
    });

    // Firework particles
    for (let i = 0; i < 50; i++) {
      const particle = this.add.circle(
        width / 2,
        height / 2,
        Phaser.Math.Between(2, 6),
        [0x7c3aed, 0x10b981, 0xf59e0b][i % 3]
      );

      this.tweens.add({
        targets: particle,
        x: width / 2 + Phaser.Math.Between(-300, 300),
        y: height / 2 + Phaser.Math.Between(-200, 200),
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: Phaser.Math.Between(500, 1500),
        delay: 500 + i * 20,
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }
}
