import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { loginApi, signupApi } from '../services/authService';
import type { AuthResponse } from '../types';

export const useAuth = () => {
  const { user, token, isAuthenticated, logout, setAuthState } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // Explicitly type the response as AuthResponse
      const data: AuthResponse = await loginApi(email, password);
      setAuthState(data.user, data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: string) => {
    setLoading(true);
    setError(null);
    try {
      const data: AuthResponse = await signupApi(name, email, password, role);
      setAuthState(data.user, data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    signup,
    logout
  };
};