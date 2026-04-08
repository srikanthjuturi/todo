import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { LoadingProvider } from '../contexts/LoadingContext';

export function createTestWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <LoadingProvider>{children}</LoadingProvider>
    </QueryClientProvider>
  );
}

export const makeTodo = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  title: 'Test task',
  description: null as string | null,
  isCompleted: false,
  categoryId: null as number | null,
  categoryName: null as string | null,
  tags: [] as { id: number; name: string; createdAt: string }[],
  createdAt: '2024-01-01T12:00:00',
  updatedAt: '2024-01-01T12:00:00',
  ...overrides,
});

export const makeCategory = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  name: 'Work',
  createdAt: '2024-01-01T12:00:00',
  ...overrides,
});

export const makeTag = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  name: 'urgent',
  createdAt: '2024-01-01T12:00:00',
  ...overrides,
});
