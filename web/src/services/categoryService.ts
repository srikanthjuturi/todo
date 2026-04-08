import type { ApiResponse, Category, CategoryCreate, CategoryUpdate } from '@/types';

import { useApiService } from './apiService';

export const useCategoryService = () => {
  const api = useApiService();

  return {
    getAll: async (): Promise<Category[]> => {
      const result = await api.get<ApiResponse<Category[]>>('/api/v1/categories');
      return result.data ?? [];
    },

    getById: async (id: number): Promise<Category> => {
      const result = await api.get<ApiResponse<Category>>(`/api/v1/categories/${id}`);
      return result.data!;
    },

    create: async (category: CategoryCreate): Promise<Category> => {
      const result = await api.post<ApiResponse<Category>>('/api/v1/categories', category);
      return result.data!;
    },

    update: async ({ id, ...category }: CategoryUpdate & { id: number }): Promise<Category> => {
      const result = await api.put<ApiResponse<Category>>(`/api/v1/categories/${id}`, category);
      return result.data!;
    },

    remove: async (id: number): Promise<void> => {
      await api.delete(`/api/v1/categories/${id}`);
    },
  };
};
