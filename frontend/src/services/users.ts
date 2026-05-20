import api from './api';
import type { UserT } from '../types';

export const getUsers = async (params?: { nome?: string; departamento?: string; cargo?: string }) => {
  const response = await api.get<UserT[]>('/users', { params });
  return response.data;
};

export const updateUser = async (id: string, data: Partial<UserT>) => {
  const response = await api.put<UserT>(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

