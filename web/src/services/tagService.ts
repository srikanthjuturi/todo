import { api } from './api';
import type { Tag, TagCreate, TagUpdate } from '@/types';

export const tagService = {
  getAll: async (): Promise<Tag[]> => {
    const { data } = await api.get<Tag[]>('/tags');
    return data;
  },

  getById: async (id: number): Promise<Tag> => {
    const { data } = await api.get<Tag>(`/tags/${id}`);
    return data;
  },

  create: async (tag: TagCreate): Promise<Tag> => {
    const { data } = await api.post<Tag>('/tags', tag);
    return data;
  },

  update: async ({ id, ...tag }: TagUpdate & { id: number }): Promise<Tag> => {
    const { data } = await api.put<Tag>(`/tags/${id}`, tag);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/tags/${id}`);
  },
};
