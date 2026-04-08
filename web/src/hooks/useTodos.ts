import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useTodoService } from '@/services/todoService';
import type { TodoCreate, TodoUpdate } from '@/types';

export const useTodos = () => {
  const service = useTodoService();
  return useQuery({
    queryKey: ['todos'],
    queryFn: () => service.getAll(),
  });
};

export const useCreateTodo = () => {
  const qc = useQueryClient();
  const service = useTodoService();
  return useMutation({
    mutationFn: (payload: TodoCreate) => service.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
};

export const useUpdateTodo = () => {
  const qc = useQueryClient();
  const service = useTodoService();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TodoUpdate }) =>
      service.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
};

export const useDeleteTodo = () => {
  const qc = useQueryClient();
  const service = useTodoService();
  return useMutation({
    mutationFn: (id: number) => service.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
};

