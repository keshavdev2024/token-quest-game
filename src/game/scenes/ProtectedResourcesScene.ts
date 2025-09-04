import Phaser from 'phaser';
import { GameStateManager } from '../GameState';

export class ProtectedResourcesScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private doors!: Phaser.GameObjects.Group;
  private gameState: GameStateManager;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private messageText!: Phaser.GameObjects.Text;
  private nearDoor: string | null = null;

  constructor() {
    super({ key: 'ProtectedResourcesScene' });
    this.gameState = GameStateManager.getInstance();
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1f2e);

    // Title
    const title = this.add.text(width / 2, 50, 'Level 2: The Hall of Protected Resources', {
      fontSize: '32px',
      color: '#7c3aed',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Instructions
    const instructions = this.add.text(width / 2, 100, 'Use your JWT token to access different resource levels', {
      fontSize: '18px',
      color: '#e2e8f0',
      fontFamily: 'monospace'
    });
    instructions.setOrigin(0.5);

    // Create player
    this.player = this.add.rectangle(100, height / 2, 30, 30, 0x00ff00);
    this.physics.add.existing(this.player);

    // Create doors group
    this.doors = this.add.group();

    // Create different access level doors
    this.createDoor(300, height / 2 - 100, 'Public', 'guest', 0x10b981);
    this.createDoor(500, height / 2 - 100, 'User Only', 'user', 0xf59e0b);
    this.createDoor(700, height / 2 - 100, 'Admin Only', 'admin', 0xef4444);

    // Show JWT status
    this.createJWTStatus(width - 200, 200);

    // Message text
    this.messageText = this.add.text(width / 2, height - 150, 'Move with ARROW KEYS. Press SPACEBAR near doors to test access.', {
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

    // Next level button
    const nextButton = this.add.rectangle(width - 100, height - 50, 120, 40, 0x10b981);
    nextButton.setInteractive();
    
    const nextText = this.add.text(width - 100, height - 50, 'NEXT LEVEL', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    nextText.setOrigin(0.5);

    nextButton.on('pointerdown', () => {
      this.scene.start('LogoutPortalScene');
    });

    // Role switcher buttons
    this.createRoleSwitcher(width / 2, height - 100);
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

    // Check for door proximity
    this.checkDoorProximity();

    // Handle door interaction
    if (this.nearDoor && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.attemptDoorAccess(this.nearDoor);
    }
  }

  private createDoor(x: number, y: number, label: string, requiredRole: 'guest' | 'user' | 'admin', color: number) {
    const door = this.add.rectangle(x, y, 60, 100, color);
    const keyhole = this.add.circle(x, y, 8, 0x000000);
    
    const doorLabel = this.add.text(x, y + 70, label, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      align: 'center'
    });
    doorLabel.setOrigin(0.5);

    const roleLabel = this.add.text(x, y + 85, `Role: ${requiredRole}`, {
      fontSize: '10px',
      color: '#94a3b8',
      fontFamily: 'monospace',
      align: 'center'
    });
    roleLabel.setOrigin(0.5);

    this.physics.add.existing(door, true);

    // Store door data
    (door as any).doorId = label;
    (door as any).requiredRole = requiredRole;
    (door as any).doorColor = color;
    (door as any).keyhole = keyhole;

    this.doors.add(door);
  }

  private checkDoorProximity() {
    this.nearDoor = null;
    let closestDistance = Infinity;

    this.doors.children.entries.forEach((door) => {
      const doorObj = door as Phaser.GameObjects.Rectangle;
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        doorObj.x, doorObj.y
      );

      if (distance < 80 && distance < closestDistance) {
        this.nearDoor = (doorObj as any).doorId;
        closestDistance = distance;
      }
    });

    // Update message based on proximity
    if (this.nearDoor) {
      const door = this.doors.children.entries.find(d => (d as any).doorId === this.nearDoor) as any;
      const hasAccess = this.gameState.hasAccess(door.requiredRole) && this.gameState.hasJWT();
      
      if (hasAccess) {
        this.messageText.setText(`Press SPACEBAR to access ${this.nearDoor}`);
        this.messageText.setColor('#10b981');
      } else if (!this.gameState.hasJWT()) {
        this.messageText.setText('JWT token required! Complete Level 1 first.');
        this.messageText.setColor('#ef4444');
      } else {
        this.messageText.setText(`Access denied! Requires ${door.requiredRole} role.`);
        this.messageText.setColor('#ef4444');
      }
    } else {
      this.messageText.setText('Move near doors to test access. Use role buttons to change your role.');
      this.messageText.setColor('#94a3b8');
    }
  }

  private attemptDoorAccess(doorId: string) {
    const door = this.doors.children.entries.find(d => (d as any).doorId === doorId) as any;
    
    if (!door) return;

    const hasAccess = this.gameState.hasAccess(door.requiredRole) && this.gameState.hasJWT();

    if (hasAccess) {
      // Success animation
      this.tweens.add({
        targets: door,
        x: door.x + 30,
        duration: 500,
        yoyo: true,
        ease: 'Power2'
      });

      // Success feedback
      this.createAccessFeedback(door.x, door.y - 50, 'ACCESS GRANTED', 0x10b981);
      
      // Mark level as completed if not already
      this.gameState.completeLevel(2);
    } else {
      // Failure animation
      this.tweens.add({
        targets: door,
        x: door.x - 5,
        duration: 100,
        yoyo: true,
        repeat: 3
      });

      // Error feedback
      let message = 'ACCESS DENIED';
      if (!this.gameState.hasJWT()) {
        message += '\nNO JWT TOKEN';
      } else {
        message += `\nREQUIRES ${door.requiredRole.toUpperCase()} ROLE`;
      }
      
      this.createAccessFeedback(door.x, door.y - 50, message, 0xef4444);
    }
  }

  private createAccessFeedback(x: number, y: number, text: string, color: number) {
    const feedback = this.add.text(x, y, text, {
      fontSize: '14px',
      color: `#${color.toString(16)}`,
      fontFamily: 'monospace',
      fontStyle: 'bold',
      align: 'center'
    });
    feedback.setOrigin(0.5);

    this.tweens.add({
      targets: feedback,
      y: y - 30,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        feedback.destroy();
      }
    });
  }

  private createJWTStatus(x: number, y: number) {
    const state = this.gameState.getState();
    
    const statusBg = this.add.rectangle(x, y, 180, 120, 0x1f2937);
    
    const statusTitle = this.add.text(x, y - 40, 'JWT Status', {
      fontSize: '16px',
      color: '#7c3aed',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    statusTitle.setOrigin(0.5);

    const hasJWT = state.jwt?.complete === true;
    const jwtStatus = this.add.text(x, y - 15, hasJWT ? '✓ Token Present' : '✗ No Token', {
      fontSize: '12px',
      color: hasJWT ? '#10b981' : '#ef4444',
      fontFamily: 'monospace'
    });
    jwtStatus.setOrigin(0.5);

    const roleText = this.add.text(x, y + 5, `Role: ${state.userRole.toUpperCase()}`, {
      fontSize: '12px',
      color: '#e2e8f0',
      fontFamily: 'monospace'
    });
    roleText.setOrigin(0.5);

    const loginStatus = this.add.text(x, y + 25, state.isLoggedIn ? '✓ Authenticated' : '✗ Not Authenticated', {
      fontSize: '12px',
      color: state.isLoggedIn ? '#10b981' : '#ef4444',
      fontFamily: 'monospace'
    });
    loginStatus.setOrigin(0.5);
  }

  private createRoleSwitcher(x: number, y: number) {
    const guestBtn = this.add.rectangle(x - 80, y, 70, 30, 0x6b7280);
    const userBtn = this.add.rectangle(x, y, 70, 30, 0xf59e0b);
    const adminBtn = this.add.rectangle(x + 80, y, 70, 30, 0xef4444);

    [guestBtn, userBtn, adminBtn].forEach(btn => btn.setInteractive());

    this.add.text(x - 80, y, 'GUEST', { fontSize: '12px', color: '#ffffff', fontFamily: 'monospace' }).setOrigin(0.5);
    this.add.text(x, y, 'USER', { fontSize: '12px', color: '#ffffff', fontFamily: 'monospace' }).setOrigin(0.5);
    this.add.text(x + 80, y, 'ADMIN', { fontSize: '12px', color: '#ffffff', fontFamily: 'monospace' }).setOrigin(0.5);

    const roleLabel = this.add.text(x, y - 25, 'Switch Role (for testing):', {
      fontSize: '12px',
      color: '#94a3b8',
      fontFamily: 'monospace'
    });
    roleLabel.setOrigin(0.5);

    guestBtn.on('pointerdown', () => {
      this.gameState.logout();
      this.scene.restart();
    });

    userBtn.on('pointerdown', () => {
      this.gameState.login('user');
      this.scene.restart();
    });

    adminBtn.on('pointerdown', () => {
      this.gameState.login('admin');
      this.scene.restart();
    });
  }
}
