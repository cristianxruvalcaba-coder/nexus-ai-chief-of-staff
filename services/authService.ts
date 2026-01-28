// Google OAuth Authentication Service
import { User } from '../types';

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

class AuthService {
  private currentUser: User | null = null;
  private token: string | null = null;

  // Initialize from localStorage on app start
  constructor() {
    this.loadSession();
  }

  async login(provider: 'google' | 'github' | 'microsoft'): Promise<User> {
    if (provider === 'google') {
      // For Google OAuth, this will be handled by GoogleOAuthProvider in App.tsx
      // This method will be called after successful OAuth callback
      console.log('Google OAuth initiated via GoogleOAuthProvider');
      return Promise.reject(new Error('Use GoogleOAuthProvider login flow'));
    }

    // For other providers, implement similar OAuth flows
    console.log(`${provider} OAuth not yet implemented`);
    return Promise.reject(new Error(`${provider} OAuth not yet implemented`));
  }

  // Handle Google OAuth credential response
  async handleGoogleLogin(credentialResponse: GoogleCredentialResponse): Promise<User> {
    try {
      // Decode the JWT token from Google
      const credential = credentialResponse.credential;
      const payload = this.decodeJWT(credential);

      // Create user from Google profile
      const user: User = {
        id: payload.sub,
        email: payload.email,
        displayName: payload.name,
        avatarUrl: payload.picture,
        createdAt: new Date()
      };

      this.currentUser = user;
      this.token = credential;

      // Save session
      this.saveSession(user, credential);

      return user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  async logout() {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('nexus_session');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser;
  }

  getToken(): string | null {
    return this.token;
  }

  private saveSession(user: User, token: string): void {
    localStorage.setItem('nexus_session', JSON.stringify({
      user,
      token,
      timestamp: new Date().toISOString()
    }));
  }

  private loadSession(): void {
    const saved = localStorage.getItem('nexus_session');
    if (saved) {
      try {
        const { user, token } = JSON.parse(saved);
        this.currentUser = user;
        this.token = token;
      } catch (error) {
        console.error('Failed to load session:', error);
        localStorage.removeItem('nexus_session');
      }
    }
  }

  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JWT decode error:', error);
      throw new Error('Invalid JWT token');
    }
  }
}

export const authService = new AuthService();
