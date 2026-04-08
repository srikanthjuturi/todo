import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTagService } from '@/services/tagService';
import type { TagCreate, TagUpdate } from '@/types';

export const useTags = () => {
  const service = useTagService();
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => service.getAll(),
  });
};

export const useTag = (id: number) => {
  const service = useTagService();
  return useQuery({
    queryKey: ['tags', id],
    queryFn: () => service.getById(id),
    enabled: !!id,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  const service = useTagService();
  return useMutation({
    mutationFn: (data: TagCreate) => service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  const service = useTagService();
  return useMutation({
    mutationFn: (data: TagUpdate & { id: number }) => service.update(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tags', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  const service = useTagService();
  return useMutation({
    mutationFn: (id: number) => service.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
