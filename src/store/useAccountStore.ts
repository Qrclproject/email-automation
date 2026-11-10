import { create } from 'zustand';

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
  addAccount: (email: string, displayName: string) => void;
  removeAccount: (id: string) => void;
  reconnectAccount: (id: string) => void;
  togglePermission: (id: string, permission: 'send' | 'readInbox') => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [
    {
      id: '1',
      email: 'events@qrcodeng.com',
      displayName: 'QRCODENG Events',
      status: 'connected',
      sentToday: 350,
      dailyLimit: 500,
      permissions: { send: true, readInbox: true },
    },
    {
      id: '2',
      email: 'registration@qrcodeng.com',
      displayName: 'QRCODENG Registration',
      status: 'connected',
      sentToday: 200,
      dailyLimit: 500,
      permissions: { send: true, readInbox: false },
    },
    {
      id: '3',
      email: 'invitations@qrcodeng.com',
      displayName: 'QRCODENG Invites',
      status: 'reconnect-needed',
      sentToday: 0,
      dailyLimit: 500,
      permissions: { send: true, readInbox: false },
    },
  ],
  
  addAccount: (email, displayName) => set((state) => ({
    accounts: [
      ...state.accounts,
      {
        id: Date.now().toString(),
        email,
        displayName,
        status: 'connected',
        sentToday: 0,
        dailyLimit: 500,
        permissions: { send: true, readInbox: false },
      },
    ],
  })),

  removeAccount: (id) => set((state) => ({
    accounts: state.accounts.filter((acc) => acc.id !== id),
  })),

  reconnectAccount: (id) => set((state) => ({
    accounts: state.accounts.map((acc) => 
      acc.id === id ? { ...acc, status: 'connected' } : acc
    ),
  })),

  togglePermission: (id, permission) => set((state) => ({
    accounts: state.accounts.map((acc) => 
      acc.id === id 
        ? { ...acc, permissions: { ...acc.permissions, [permission]: !acc.permissions[permission] } } 
        : acc
    ),
  })),
}));