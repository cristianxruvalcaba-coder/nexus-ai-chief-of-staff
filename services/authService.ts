
// Removed AuthIdentity from import as it is not exported by types.ts
import { User } from '../types';

class AuthService {
  private currentUser: User | null = null;
  private token: string | null = null;

  async login(provider: 'google' | 'github' | 'microsoft'): Promise<User> {
    // Simulate OAuth Redirect & Callback
    console.log(`Initiating ${provider} OAuth...`);
    
    // Mock user returned from provider
    const mockUser: User = {
      id: `u_${Math.random().toString(36).substr(2, 9)}`,
      email: `user@example.com`,
      displayName: `Nexus User (${provider})`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
      createdAt: new Date()
    };

    this.currentUser = mockUser;
    this.token = this.generateMockJWT(mockUser.id);
    
    localStorage.setItem('nexus_session', JSON.stringify({
      user: mockUser,
      token: this.token
    }));

    return mockUser;
  }

  async logout() {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('nexus_session');
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const saved = localStorage.getItem('nexus_session');
      if (saved) {
        const { user, token } = JSON.parse(saved);
        this.currentUser = user;
        this.token = token;
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private generateMockJWT(userId: string): string {
    // In a real app, this happens on the server.
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 mins
    }));
    return `${header}.${payload}.signature_mock`;
  }
}

export const authService = new AuthService();
