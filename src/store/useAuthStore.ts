import { create } from 'zustand';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  setAuthState: (user: User | null, token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const savedUser = localStorage.getItem('qrcode_auth_user');
  const savedToken = localStorage.getItem('qrcode_auth_token');
  const initialUser = savedUser ? JSON.parse(savedUser) : null;

  return {
    user: initialUser,
    token: savedToken || null,
    isAuthenticated: !!initialUser,
    
    login: async (email, password) => {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      localStorage.setItem('qrcode_auth_user', JSON.stringify(user));
      localStorage.setItem('qrcode_auth_token', token);
      set({ user, token, isAuthenticated: true });
    },
    
    signup: async (name, email, password, role) => {
      const response = await api.post('/auth/signup', { name, email, password, role });
      const { user, token } = response.data;
      localStorage.setItem('qrcode_auth_user', JSON.stringify(user));
      localStorage.setItem('qrcode_auth_token', token);
      set({ user, token, isAuthenticated: true });
    },
    
    logout: () => {
      localStorage.removeItem('qrcode_auth_user');
      localStorage.removeItem('qrcode_auth_token');
      set({ user: null, token: null, isAuthenticated: false });
    },

    setAuthState: (user, token) => {
      if (user && token) {
        localStorage.setItem('qrcode_auth_user', JSON.stringify(user));
        localStorage.setItem('qrcode_auth_token', token);
        set({ user, token, isAuthenticated: true });
      } else {
        localStorage.removeItem('qrcode_auth_user');
        localStorage.removeItem('qrcode_auth_token');
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  };
});