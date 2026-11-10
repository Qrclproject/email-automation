import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const { login: setAuthState, logout: clearAuthState } = useAuthStore();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string, password: string }) => authService.login(email, password),
    onSuccess: (data) => {
      setAuthState(data.user, data.token);
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Login failed:', error);
    }
  });

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error(e);
    } finally {
      clearAuthState();
      navigate('/login');
    }
  };

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout
  };
};