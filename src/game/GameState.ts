export interface JWT {
  header: boolean;
  payload: boolean;
  signature: boolean;
  complete: boolean;
}

export interface GameState {
  isLoggedIn: boolean;
  jwt: JWT | null;
  userRole: 'guest' | 'user' | 'admin';
  currentLevel: number;
  completedLevels: number[];
}

export class GameStateManager {
  private static instance: GameStateManager;
  private state: GameState;

  private constructor() {
    this.state = {
      isLoggedIn: false,
      jwt: null,
      userRole: 'guest',
      currentLevel: 1,
      completedLevels: []
    };
  }

  static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  getState(): GameState {
    return { ...this.state };
  }

  login(role: 'user' | 'admin' = 'user'): void {
    this.state.isLoggedIn = true;
    this.state.userRole = role;
    this.state.jwt = {
      header: true,
      payload: true,
      signature: true,
      complete: true
    };
  }

  logout(): void {
    this.state.isLoggedIn = false;
    this.state.userRole = 'guest';
    this.state.jwt = null;
  }

  completeLevel(level: number): void {
    if (!this.state.completedLevels.includes(level)) {
      this.state.completedLevels.push(level);
    }
  }

  setCurrentLevel(level: number): void {
    this.state.currentLevel = level;
  }

  hasAccess(requiredRole: 'guest' | 'user' | 'admin'): boolean {
    const roleHierarchy = { guest: 0, user: 1, admin: 2 };
    return roleHierarchy[this.state.userRole] >= roleHierarchy[requiredRole];
  }

  hasJWT(): boolean {
    return this.state.jwt?.complete === true;
  }

  reset(): void {
    this.state = {
      isLoggedIn: false,
      jwt: null,
      userRole: 'guest',
      currentLevel: 1,
      completedLevels: []
    };
  }
}