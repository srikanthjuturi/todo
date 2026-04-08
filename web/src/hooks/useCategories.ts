import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCategoryService } from '@/services/categoryService';
import type { CategoryCreate, CategoryUpdate } from '@/types';

export const useCategories = () => {
  const service = useCategoryService();
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => service.getAll(),
  });
};

export const useCategory = (id: number) => {
  const service = useCategoryService();
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => service.getById(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const service = useCategoryService();
  return useMutation({
    mutationFn: (data: CategoryCreate) => service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const service = useCategoryService();
  return useMutation({
    mutationFn: (data: CategoryUpdate & { id: number }) => service.update(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const service = useCategoryService();
  return useMutation({
    mutationFn: (id: number) => service.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
