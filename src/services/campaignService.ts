import { api } from './api';
import { Campaign } from '../types';

export const campaignService = {
  getCampaigns: async (): Promise<Campaign[]> => {
    const response = await api.get<Campaign[]>('/campaigns');
    return response.data;
  },

  getCampaignById: async (id: string): Promise<Campaign> => {
    const response = await api.get<Campaign>(`/campaigns/${id}`);
    return response.data;
  },

  createCampaign: async (data: Partial<Campaign>): Promise<Campaign> => {
    const response = await api.post<Campaign>('/campaigns', data);
    return response.data;
  },

  pauseCampaign: async (id: string): Promise<void> => {
    await api.post(`/campaigns/${id}/pause`);
  },

  resumeCampaign: async (id: string): Promise<void> => {
    await api.post(`/campaigns/${id}/resume`);
  }
};