import { create } from 'zustand';

export interface CampaignStats {
  id: string;
  name: string;
  account: string;
  recipients: number;
  sent: number;
  delivered: number;
  failed: number;
  bounced: number;
  progress: number;
  status: 'Sending' | 'Paused' | 'Scheduled' | 'Completed' | 'Draft' | 'Failed';
  date: string;
}

interface DashboardState {
  campaigns: CampaignStats[];
  deleteCampaign: (id: string) => void; // <-- Add this
  deleteMultipleCampaigns: (ids: string[]) => void; // <-- Add this
}

export const useDashboardStore = create<DashboardState>((set) => ({
  campaigns: [
    { id: '1', name: 'Summit 10.0 – VIP invites', account: 'events@qrcodeng.com', recipients: 1204, sent: 746, delivered: 740, failed: 4, bounced: 2, progress: 62, status: 'Sending', date: 'Today' },
    { id: '2', name: 'Gala night reminder', account: 'events@qrcodeng.com', recipients: 860, sent: 267, delivered: 260, failed: 5, bounced: 2, progress: 31, status: 'Paused', date: 'Today' },
    { id: '3', name: 'Wedding – Adeyemi', account: 'invitations@qrcodeng.com', recipients: 320, sent: 0, delivered: 0, failed: 0, bounced: 0, progress: 0, status: 'Scheduled', date: 'Fri 09:00' },
    { id: '4', name: 'Conference 2026', account: 'registration@qrcodeng.com', recipients: 2400, sent: 2400, delivered: 2380, failed: 12, bounced: 8, progress: 100, status: 'Completed', date: 'Yesterday' },
  ],
  
  // Add the delete functions
  deleteCampaign: (id) => set((state) => ({
    campaigns: state.campaigns.filter((c) => c.id !== id)
  })),
  
  deleteMultipleCampaigns: (ids) => set((state) => ({
    campaigns: state.campaigns.filter((c) => !ids.includes(c.id))
  })),
}));