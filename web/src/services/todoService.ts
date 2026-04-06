import type { ApiResponse, Todo, TodoCreate, TodoUpdate } from '@/types';

import api from './api';

export const todoService = {
  async getAll(): Promise<Todo[]> {
    const response = await api.get<ApiResponse<Todo[]>>('/api/v1/todos');
    return response.data.data ?? [];
  },

  async getById(id: number): Promise<Todo> {
    const response = await api.get<ApiResponse<Todo>>(`/api/v1/todos/${id}`);
    return response.data.data!;
  },

  async create(payload: TodoCreate): Promise<Todo> {
    const response = await api.post<ApiResponse<Todo>>('/api/v1/todos', payload);
    return response.data.data!;
  },

  async update(id: number, payload: TodoUpdate): Promise<Todo> {
    const response = await api.put<ApiResponse<Todo>>(`/api/v1/todos/${id}`, payload);
    return response.data.data!;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/v1/todos/${id}`);
  },
};
