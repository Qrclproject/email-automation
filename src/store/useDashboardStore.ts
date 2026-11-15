import { create } from 'zustand';
import { api } from '../services/api';

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
  fetchCampaigns: () => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  deleteMultipleCampaigns: (ids: string[]) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  campaigns: [],
  
  fetchCampaigns: async () => {
    try {
      const response = await api.get('/campaigns');
      // Map MongoDB Campaign model to frontend CampaignStats
      const mapped = response.data.map((c: any) => ({
        id: c._id,
        name: c.name,
        account: c.senderAccount,
        recipients: c.recipients?.length || 0,
        sent: c.sentCount || 0,
        delivered: c.deliveredCount || 0,
        failed: c.failedCount || 0,
        bounced: c.bouncedCount || 0,
        progress: c.progress || 0,
        status: c.status || 'Draft',
        date: new Date(c.createdAt).toLocaleDateString()
      }));
      set({ campaigns: mapped });
    } catch (error) {
      console.error('Failed to fetch campaigns', error);
    }
  },

  deleteCampaign: async (id) => {
    try {
      await api.delete(`/campaigns/${id}`);
      set((state) => ({ campaigns: state.campaigns.filter((c) => c.id !== id) }));
    } catch (error) {
      console.error('Failed to delete campaign', error);
    }
  },
  
  deleteMultipleCampaigns: async (ids) => {
    try {
      await Promise.all(ids.map(id => api.delete(`/campaigns/${id}`)));
      set((state) => ({ campaigns: state.campaigns.filter((c) => !ids.includes(c.id)) }));
    } catch (error) {
      console.error('Failed to delete campaigns', error);
    }
  },
}));
