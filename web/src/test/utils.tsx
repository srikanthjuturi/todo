import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

export function createTestWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

export const makeTodo = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  title: 'Test task',
  description: null as string | null,
  isCompleted: false,
  createdAt: '2024-01-01T12:00:00',
  updatedAt: '2024-01-01T12:00:00',
  ...overrides,
});
