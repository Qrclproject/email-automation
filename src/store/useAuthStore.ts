import { create } from 'zustand';

interface User {
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  signup: (name: string, email: string, role: string) => void;
  logout: () => void;
  setAuthState: (user: User | null, token: string | null) => void; 
}

export const useAuthStore = create<AuthState>((set) => {
  const savedUser = localStorage.getItem('qrcode_auth_user');
  const initialUser = savedUser ? JSON.parse(savedUser) : null;

  return {
    user: initialUser,
    token: initialUser ? 'mock_token_123' : null,
    isAuthenticated: !!initialUser,
    
    login: (email) => {
      const user = { name: 'Ada Obi', email, role: 'Super Administrator' };
      localStorage.setItem('qrcode_auth_user', JSON.stringify(user));
      set({ user, token: 'mock_token_123', isAuthenticated: true });
    },
    
    signup: (name, email, role) => {
      const user = { name, email, role };
      localStorage.setItem('qrcode_auth_user', JSON.stringify(user));
      set({ user, token: 'mock_token_123', isAuthenticated: true });
    },
    
    logout: () => {
      localStorage.removeItem('qrcode_auth_user');
      set({ user: null, token: null, isAuthenticated: false });
    },

    setAuthState: (user, token) => {
      if (user && token) {
        localStorage.setItem('qrcode_auth_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      } else {
        localStorage.removeItem('qrcode_auth_user');
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  };
});