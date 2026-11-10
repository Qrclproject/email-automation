import { useState, useEffect, useCallback } from 'react';
import { 
  getCampaigns as fetchCampaignsApi, 
  createCampaign as createCampaignApi,
  updateCampaign as updateCampaignApi,
  deleteCampaign as deleteCampaignApi
} from '../services/campaignService';
import type { Campaign } from '../types';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCampaignsApi();
      setCampaigns(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const createCampaign = async (data: Partial<Campaign>) => {
    try {
      const newCampaign = await createCampaignApi(data);
      setCampaigns(prev => [newCampaign, ...prev]);
      return newCampaign;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create campaign');
      throw err;
    }
  };

  const updateCampaign = async (id: string, data: Partial<Campaign>) => {
    try {
      const updated = await updateCampaignApi(id, data);
      setCampaigns(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update campaign');
      throw err;
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      await deleteCampaignApi(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete campaign');
      throw err;
    }
  };

  return {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign
  };
};