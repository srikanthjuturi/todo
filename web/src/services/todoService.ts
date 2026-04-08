import type { ApiResponse, Todo, TodoCreate, TodoUpdate } from '@/types';

import { useApiService } from './apiService';

export const useTodoService = () => {
  const api = useApiService();

  return {
    getAll: async (): Promise<Todo[]> => {
      const result = await api.get<ApiResponse<Todo[]>>('/api/v1/todos');
      return result.data ?? [];
    },

    getById: async (id: number): Promise<Todo> => {
      const result = await api.get<ApiResponse<Todo>>(`/api/v1/todos/${id}`);
      return result.data!;
    },

    create: async (payload: TodoCreate): Promise<Todo> => {
      const result = await api.post<ApiResponse<Todo>>('/api/v1/todos', payload);
      return result.data!;
    },

    update: async (id: number, payload: TodoUpdate): Promise<Todo> => {
      const result = await api.put<ApiResponse<Todo>>(`/api/v1/todos/${id}`, payload);
      return result.data!;
    },

    remove: async (id: number): Promise<void> => {
      await api.delete(`/api/v1/todos/${id}`);
    },
  };
};
