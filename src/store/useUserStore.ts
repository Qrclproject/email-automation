import { create } from 'zustand';

export type UserRole = 'Super Administrator' | 'Administrator' | 'Campaign Manager' | 'Email Operator' | 'Designer' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

interface UserState {
  users: User[];
  addUser: (user: Omit<User, 'id' | 'status' | 'lastLogin'>) => void;
  toggleStatus: (id: string) => void;
  deleteUser: (id: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [
    { id: '1', name: 'Ada Obi', email: 'ada@qrcodeng.com', role: 'Super Administrator', status: 'Active', lastLogin: 'Just now' },
    { id: '2', name: 'Tunde K.', email: 'tunde@qrcodeng.com', role: 'Campaign Manager', status: 'Active', lastLogin: '2 hours ago' },
    { id: '3', name: 'Chioma N.', email: 'chioma@qrcodeng.com', role: 'Designer', status: 'Active', lastLogin: 'Yesterday' },
    { id: '4', name: 'Emeka O.', email: 'emeka@qrcodeng.com', role: 'Email Operator', status: 'Inactive', lastLogin: '3 days ago' },
  ],
  addUser: (user) => set((state) => ({
    users: [...state.users, { ...user, id: Date.now().toString(), status: 'Active', lastLogin: 'Never' }]
  })),
  toggleStatus: (id) => set((state) => ({
    users: state.users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u)
  })),
  deleteUser: (id) => set((state) => ({
    users: state.users.filter(u => u.id !== id)
  })),
}));