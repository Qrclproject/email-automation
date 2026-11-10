import { api } from './api';
import type { AuthResponse, User } from '../types';

export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', { email, password });
  return response.data;
};

export const signupApi = async (name: string, email: string, password: string, role: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/signup', { name, email, password, role });
  return response.data;
};

export const getProfileApi = async (): Promise<User> => {
  const response = await api.get<User>('/auth/profile');
  return response.data;
};