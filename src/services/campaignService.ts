import { api } from './api';
import type { Campaign } from '../types';

export const getCampaigns = async (): Promise<Campaign[]> => {
  const response = await api.get<Campaign[]>('/campaigns');
  return response.data;
};

export const getCampaignById = async (id: string): Promise<Campaign> => {
  const response = await api.get<Campaign>(`/campaigns/${id}`);
  return response.data;
};

export const createCampaign = async (data: Partial<Campaign>): Promise<Campaign> => {
  const response = await api.post<Campaign>('/campaigns', data);
  return response.data;
};

export const updateCampaign = async (id: string, data: Partial<Campaign>): Promise<Campaign> => {
  const response = await api.put<Campaign>(`/campaigns/${id}`, data);
  return response.data;
};

export const deleteCampaign = async (id: string): Promise<void> => {
  await api.delete(`/campaigns/${id}`);
};