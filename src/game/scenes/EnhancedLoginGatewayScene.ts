import Phaser from 'phaser';
import { GameStateManager } from '../GameState';

export class EnhancedLoginGatewayScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private loginButton!: Phaser.GameObjects.Rectangle;
  private jwt!: Phaser.GameObjects.Group;
  private gameState: GameStateManager;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private isNearLogin = false;
  private authenticationStarted = false;
  private messageText!: Phaser.GameObjects.Text;
  private dataTransmissionGroup!: Phaser.GameObjects.Group;
  private jwtConstructionGroup!: Phaser.GameObjects.Group;
  private currentStep = 0; // 0: approach, 1: form, 2: transmission, 3: jwt construction, 4: complete

  constructor() {
    super({ key: 'EnhancedLoginGatewayScene' });
    this.gameState = GameStateManager.getInstance();
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background with grid pattern
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1f2e);
    this.createGridBackground();

    // Title
    const title = this.add.text(width / 2, 40, 'Level 1: Authentication Gateway', {
      fontSize: '24px',
      color: '#7c3aed',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Instructions
    const instructions = this.add.text(width / 2, 70, 'Approach the login portal to begin authentication', {
      fontSize: '14px',
      color: '#e2e8f0',
      fontFamily: 'monospace'
    });
    instructions.setOrigin(0.5);

    // Create player
    this.player = this.add.rectangle(50, height / 2, 25, 25, 0x00ff00);
    this.physics.add.existing(this.player);

    // Create login portal with animation
    this.createLoginPortal(width - 150, height / 2);

    // Create groups for animations
    this.dataTransmissionGroup = this.add.group();
    this.jwtConstructionGroup = this.add.group();
    this.jwt = this.add.group();

    // Message text
    this.messageText = this.add.text(width / 2, height - 50, 'Use ARROW KEYS to move. Approach the login portal to authenticate.', {
      fontSize: '12px',
      color: '#94a3b8',
      fontFamily: 'monospace',
      align: 'center'
    });
    this.messageText.setOrigin(0.5);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Navigation buttons
    this.createNavigationButtons();

    // Listen for login events from React component
    window.addEventListener('loginSubmitted', this.handleLoginSubmitted.bind(this));
    window.addEventListener('loginCancelled', this.handleLoginCancelled.bind(this));

    // Keep player in bounds
    this.physics.world.setBounds(0, 100, width, height - 150);
    (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
  }

  update() {
    // Player movement
    const speed = 150;
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

    // Check distance to login portal
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.loginButton.x, this.loginButton.y
    );

    this.isNearLogin = distance < 80;

    // Handle authentication flow
    if (this.isNearLogin && Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.currentStep === 0) {
      this.startAuthentication();
    }

    // Update message based on current step
    this.updateMessage();
  }

  private createGridBackground() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x2a2f3e, 0.5);
    
    for (let x = 0; x < this.cameras.main.width; x += 40) {
      graphics.lineBetween(x, 0, x, this.cameras.main.height);
    }
    
    for (let y = 0; y < this.cameras.main.height; y += 40) {
      graphics.lineBetween(0, y, this.cameras.main.width, y);
    }
  }

  private createLoginPortal(x: number, y: number) {
    this.loginButton = this.add.rectangle(x, y, 60, 60, 0x7c3aed);
    this.physics.add.existing(this.loginButton, true);

    const loginText = this.add.text(x, y - 40, 'LOGIN\nPORTAL', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      align: 'center'
    });
    loginText.setOrigin(0.5);

    // Add pulsing animation
    this.tweens.add({
      targets: this.loginButton,
      alpha: 0.7,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createNavigationButtons() {
    const { width, height } = this.cameras.main;

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

    // Next level button (initially hidden)
    const nextButton = this.add.rectangle(width - 60, height - 30, 100, 30, 0x10b981);
    nextButton.setInteractive();
    nextButton.setVisible(false);
    
    const nextText = this.add.text(width - 60, height - 30, 'NEXT LEVEL', {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    nextText.setOrigin(0.5);
    nextText.setVisible(false);

    nextButton.on('pointerdown', () => {
      this.scene.start('ProtectedResourcesScene');
    });

    // Store reference
    (this as any).nextButton = nextButton;
    (this as any).nextText = nextText;
  }

  private startAuthentication() {
    this.currentStep = 1;
    this.authenticationStarted = true;
    
    // Show login form
    window.dispatchEvent(new Event('showLoginForm'));
  }

  private handleLoginSubmitted(event: any) {
    const { username, password } = event.detail;
    this.currentStep = 2;
    
    // Start data transmission animation
    this.showDataTransmission(username, password);
  }

  private handleLoginCancelled() {
    this.currentStep = 0;
    this.authenticationStarted = false;
  }

  private showDataTransmission(username: string, password: string) {
    const { width, height } = this.cameras.main;
    
    // Clear previous animations
    this.dataTransmissionGroup.clear(true, true);

    // Create client and server representations
    const client = this.add.rectangle(100, height / 2 + 100, 80, 50, 0x3b82f6);
    const clientText = this.add.text(100, height / 2 + 100, 'CLIENT', {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    clientText.setOrigin(0.5);

    const server = this.add.rectangle(width - 100, height / 2 + 100, 80, 50, 0xef4444);
    const serverText = this.add.text(width - 100, height / 2 + 100, 'SERVER', {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    serverText.setOrigin(0.5);

    this.dataTransmissionGroup.addMultiple([client, clientText, server, serverText]);

    // Animate data packet
    const dataPacket = this.add.rectangle(100, height / 2 + 100, 30, 20, 0xfbbf24);
    const dataText = this.add.text(100, height / 2 + 60, `${username}:${password}`, {
      fontSize: '8px',
      color: '#fbbf24',
      fontFamily: 'monospace'
    });
    dataText.setOrigin(0.5);

    this.dataTransmissionGroup.addMultiple([dataPacket, dataText]);

    // Animate packet movement
    this.tweens.add({
      targets: [dataPacket, dataText],
      x: width - 100,
      duration: 2000,
      ease: 'Power2.easeInOut',
      onComplete: () => {
        this.showJWTConstruction();
      }
    });
  }

  private showJWTConstruction() {
    this.currentStep = 3;
    const { width, height } = this.cameras.main;

    // Clear transmission animation
    this.dataTransmissionGroup.clear(true, true);

    // Show JWT construction step by step
    const jwtY = height / 2 + 50;
    
    // Step 1: Header
    setTimeout(() => {
      const header = this.add.rectangle(width / 2 - 60, jwtY, 40, 25, 0xc084fc);
      const headerText = this.add.text(width / 2 - 60, jwtY, 'H', {
        fontSize: '12px',
        color: '#1a1f2e',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      });
      headerText.setOrigin(0.5);

      const headerLabel = this.add.text(width / 2 - 60, jwtY + 35, 'Header\n(Algorithm)', {
        fontSize: '8px',
        color: '#c084fc',
        fontFamily: 'monospace',
        align: 'center'
      });
      headerLabel.setOrigin(0.5);

      this.jwtConstructionGroup.addMultiple([header, headerText, headerLabel]);
      
      // Update game state properly
      const currentState = this.gameState.getState();
      if (currentState.jwt) {
        currentState.jwt.header = true;
      }

      // Animate appearance
      header.setScale(0);
      headerText.setScale(0);
      this.tweens.add({
        targets: [header, headerText],
        scale: 1,
        duration: 500,
        ease: 'Back.easeOut'
      });
    }, 500);

    // Step 2: Payload
    setTimeout(() => {
      const payload = this.add.rectangle(width / 2, jwtY, 40, 25, 0x60a5fa);
      const payloadText = this.add.text(width / 2, jwtY, 'P', {
        fontSize: '12px',
        color: '#1a1f2e',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      });
      payloadText.setOrigin(0.5);

      const payloadLabel = this.add.text(width / 2, jwtY + 35, 'Payload\n(Claims)', {
        fontSize: '8px',
        color: '#60a5fa',
        fontFamily: 'monospace',
        align: 'center'
      });
      payloadLabel.setOrigin(0.5);

      this.jwtConstructionGroup.addMultiple([payload, payloadText, payloadLabel]);
      
      // Update game state properly
      const currentState = this.gameState.getState();
      if (currentState.jwt) {
        currentState.jwt.payload = true;
      }

      payload.setScale(0);
      payloadText.setScale(0);
      this.tweens.add({
        targets: [payload, payloadText],
        scale: 1,
        duration: 500,
        ease: 'Back.easeOut'
      });
    }, 1500);

    // Step 3: Signature
    setTimeout(() => {
      const signature = this.add.rectangle(width / 2 + 60, jwtY, 40, 25, 0x4ade80);
      const signatureText = this.add.text(width / 2 + 60, jwtY, 'S', {
        fontSize: '12px',
        color: '#1a1f2e',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      });
      signatureText.setOrigin(0.5);

      const signatureLabel = this.add.text(width / 2 + 60, jwtY + 35, 'Signature\n(Verification)', {
        fontSize: '8px',
        color: '#4ade80',
        fontFamily: 'monospace',
        align: 'center'
      });
      signatureLabel.setOrigin(0.5);

      this.jwtConstructionGroup.addMultiple([signature, signatureText, signatureLabel]);
      
      signature.setScale(0);
      signatureText.setScale(0);
      this.tweens.add({
        targets: [signature, signatureText],
        scale: 1,
        duration: 500,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.completeAuthentication();
        }
      });
    }, 2500);
  }

  private completeAuthentication() {
    this.currentStep = 4;
    
    // Update game state
    this.gameState.login('user');
    this.gameState.completeLevel(1);

    // Visual feedback
    this.loginButton.setFillStyle(0x10b981);

    // Show next level button
    (this as any).nextButton.setVisible(true);
    (this as any).nextText.setVisible(true);

    // Add success glow effect to JWT parts
    this.jwtConstructionGroup.getChildren().forEach((child) => {
      if (child instanceof Phaser.GameObjects.Rectangle) {
        this.tweens.add({
          targets: child,
          alpha: 0.8,
          duration: 1000,
          yoyo: true,
          repeat: -1
        });
      }
    });
  }

  private updateMessage() {
    switch (this.currentStep) {
      case 0:
        if (this.isNearLogin) {
          this.messageText.setText('Press SPACEBAR to begin authentication process');
          this.messageText.setColor('#10b981');
        } else {
          this.messageText.setText('Use ARROW KEYS to move. Approach the login portal to authenticate.');
          this.messageText.setColor('#94a3b8');
        }
        break;
      case 1:
        this.messageText.setText('Enter your credentials in the login form');
        this.messageText.setColor('#7c3aed');
        break;
      case 2:
        this.messageText.setText('Transmitting credentials to server...');
        this.messageText.setColor('#fbbf24');
        break;
      case 3:
        this.messageText.setText('Server constructing JWT token...');
        this.messageText.setColor('#60a5fa');
        break;
      case 4:
        this.messageText.setText('Authentication successful! JWT token received. Check top-right corner for details.');
        this.messageText.setColor('#10b981');
        break;
    }
  }

  shutdown() {
    window.removeEventListener('loginSubmitted', this.handleLoginSubmitted.bind(this));
    window.removeEventListener('loginCancelled', this.handleLoginCancelled.bind(this));
  }
}
