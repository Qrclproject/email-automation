import { create } from 'zustand';

interface User {
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  signup: (name: string, email: string, role: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Check local storage on initial load
  const savedUser = localStorage.getItem('qrcode_auth_user');
  const initialUser = savedUser ? JSON.parse(savedUser) : null;

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    
    login: (email) => {
      // Mock login logic
      const user = { name: 'Ada Obi', email, role: 'Super Administrator' };
      localStorage.setItem('qrcode_auth_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    },
    
    signup: (name, email, role) => {
      const user = { name, email, role };
      localStorage.setItem('qrcode_auth_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    },
    
    logout: () => {
      localStorage.removeItem('qrcode_auth_user');
      set({ user: null, isAuthenticated: false });
    },
  };
});