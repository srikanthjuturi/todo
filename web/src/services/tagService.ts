import type { ApiResponse, Tag, TagCreate, TagUpdate } from '@/types';

import { useApiService } from './apiService';

export const useTagService = () => {
  const api = useApiService();

  return {
    getAll: async (): Promise<Tag[]> => {
      const result = await api.get<ApiResponse<Tag[]>>('/api/v1/tags');
      return result.data ?? [];
    },

    getById: async (id: number): Promise<Tag> => {
      const result = await api.get<ApiResponse<Tag>>(`/api/v1/tags/${id}`);
      return result.data!;
    },

    create: async (tag: TagCreate): Promise<Tag> => {
      const result = await api.post<ApiResponse<Tag>>('/api/v1/tags', tag);
      return result.data!;
    },

    update: async ({ id, ...tag }: TagUpdate & { id: number }): Promise<Tag> => {
      const result = await api.put<ApiResponse<Tag>>(`/api/v1/tags/${id}`, tag);
      return result.data!;
    },

    remove: async (id: number): Promise<void> => {
      await api.delete(`/api/v1/tags/${id}`);
    },
  };
};
