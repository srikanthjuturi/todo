import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import TodosPage from '@/pages/TodosPage';
import { todoService } from '@/services/todoService';
import { createTestWrapper, makeTodo } from '@/test/utils';

vi.mock('@/services/todoService', () => ({
  todoService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('TodosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page heading', () => {
    vi.mocked(todoService.getAll).mockReturnValue(new Promise(() => {}));
    render(<TodosPage />, { wrapper: createTestWrapper() });

    expect(screen.getByRole('heading', { name: /my todos/i })).toBeInTheDocument();
  });

  it('shows loading skeleton while todos are being fetched', () => {
    vi.mocked(todoService.getAll).mockReturnValue(new Promise(() => {}));
    render(<TodosPage />, { wrapper: createTestWrapper() });

    expect(screen.getByRole('list', { name: /loading todos/i })).toBeInTheDocument();
  });

  it('shows error alert when fetch fails', async () => {
    vi.mocked(todoService.getAll).mockRejectedValue(new Error('Network error'));
    render(<TodosPage />, { wrapper: createTestWrapper() });

    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to load/i);
  });

  it('shows empty state when there are no todos', async () => {
    vi.mocked(todoService.getAll).mockResolvedValue([]);
    render(<TodosPage />, { wrapper: createTestWrapper() });

    expect(await screen.findByText(/no todos yet/i)).toBeInTheDocument();
  });

  it('renders all todo items when todos are returned', async () => {
    vi.mocked(todoService.getAll).mockResolvedValue([
      makeTodo({ id: 1, title: 'First task' }),
      makeTodo({ id: 2, title: 'Second task' }),
    ]);
    render(<TodosPage />, { wrapper: createTestWrapper() });

    expect(await screen.findByText('First task')).toBeInTheDocument();
    expect(screen.getByText('Second task')).toBeInTheDocument();
  });
});
