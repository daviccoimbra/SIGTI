import api from './api';

export type Setor = 'ADMIN' | 'GESTAO';

export type UserData = {
  id: string;
  username: string;
  nome: string;
  setor: Setor;
};

export type LoginResponse = {
  token: string;
  user: UserData;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export type RegisterData = {
  username: string;
  password: string;
  nome: string;
  setor: Setor;
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    return data;
  },

  register: async (userData: RegisterData): Promise<UserData> => {
    const { data } = await api.post<UserData>('/auth/register', userData);
    return data;
  },

  me: async (): Promise<UserData> => {
    const { data } = await api.get<UserData>('/auth/me');
    return data;
  },
};
