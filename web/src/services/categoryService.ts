import { api } from './api';
import type { Category, CategoryCreate, CategoryUpdate } from '@/types';

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  getById: async (id: number): Promise<Category> => {
    const { data } = await api.get<Category>(`/categories/${id}`);
    return data;
  },

  create: async (category: CategoryCreate): Promise<Category> => {
    const { data } = await api.post<Category>('/categories', category);
    return data;
  },

  update: async ({ id, ...category }: CategoryUpdate & { id: number }): Promise<Category> => {
    const { data } = await api.put<Category>(`/categories/${id}`, category);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
