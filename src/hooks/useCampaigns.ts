import { useQuery } from '@tanstack/react-query';
import { campaignService } from '../services/campaignService';

export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: campaignService.getCampaigns,
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
  });
};