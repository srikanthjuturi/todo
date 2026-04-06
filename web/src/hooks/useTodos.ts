import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { todoService } from '@/services/todoService';
import type { TodoCreate, TodoUpdate } from '@/types';

export const useTodos = () =>
  useQuery({
    queryKey: ['todos'],
    queryFn: todoService.getAll,
  });

export const useCreateTodo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TodoCreate) => todoService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
};

export const useUpdateTodo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TodoUpdate }) =>
      todoService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
};

export const useDeleteTodo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => todoService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
};
