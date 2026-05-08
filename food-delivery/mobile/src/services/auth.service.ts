import { api } from './api.service';
import type { AuthTokens, User } from '../types';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const tokens = await api.post<AuthTokens>('/auth/login', payload);
    await api.saveTokens(tokens);
    return tokens;
  },

  async register(payload: RegisterPayload): Promise<AuthTokens> {
    const tokens = await api.post<AuthTokens>('/auth/register', payload);
    await api.saveTokens(tokens);
    return tokens;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      await api.clearTokens();
    }
  },

  async getMe(): Promise<User> {
    return api.get<User>('/users/me');
  },
};
