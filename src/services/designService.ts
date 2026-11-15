import { api } from './api';

export const getDesigns = async () => {
  const response = await api.get('/designs');
  return response; 
};

export const getDesignById = async (id: string) => {
  const response = await api.get(`/designs/${id}`);
  return response;
};

export const createDesign = async (formData: FormData) => {
  const response = await api.post('/designs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response;
};

export const updateDesign = async (id: string, data: any) => {
  const response = await api.put(`/designs/${id}`, data);
  return response;
};

export const deleteDesign = async (id: string) => {
  const response = await api.delete(`/designs/${id}`);
  return response;
};