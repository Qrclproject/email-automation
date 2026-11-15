import { create } from 'zustand';
import { api } from '../services/api';

export interface EmailAccount {
  id: string;
  email: string;
  displayName: string;
  status: 'connected' | 'reconnect-needed';
  sentToday: number;
  dailyLimit: number;
  permissions: {
    send: boolean;
    readInbox: boolean;
  };
}

interface AccountState {
  accounts: EmailAccount[];
  loading: boolean;
  fetchAccounts: () => Promise<void>;
  addAccount: (email: string, displayName: string) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
  togglePermission: (id: string, permission: 'send' | 'readInbox') => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  loading: false,
  
  fetchAccounts: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/accounts');
      // Map MongoDB _id to frontend id
      const mappedAccounts = response.data.map((acc: any) => ({
        id: acc._id,
        email: acc.email,
        displayName: acc.displayName,
        status: acc.status,
        sentToday: acc.sentToday,
        dailyLimit: acc.dailyLimit,
        permissions: acc.permissions
      }));
      set({ accounts: mappedAccounts, loading: false });
    } catch (error) {
      console.error('Failed to fetch accounts', error);
      set({ loading: false });
    }
  },

  addAccount: async (email, displayName) => {
    // For now, manual addition just adds it as a mock connected account in the DB (OAuth is the real way)
    const newAccount = {
      email,
      displayName,
      refreshToken: 'mock_token_from_manual_add',
      status: 'connected',
      sentToday: 0,
      dailyLimit: 500,
      permissions: { send: true, readInbox: false }
    };
    await api.post('/accounts/manual', newAccount); // Requires adding this route to backend later, or just use OAuth
    get().fetchAccounts();
  },

  removeAccount: async (id) => {
    await api.delete(`/accounts/${id}`);
    get().fetchAccounts();
  },

  togglePermission: async (id, permission) => {
    const account = get().accounts.find(a => a.id === id);
    if (!account) return;
    
    const updatedPermissions = { 
      ...account.permissions, 
      [permission]: !account.permissions[permission] 
    };
    
    await api.put(`/accounts/${id}`, { permissions: updatedPermissions });
    get().fetchAccounts();
  },
}));