import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import TodosPage from '@/pages/TodosPage';
import { createTestWrapper, makeTodo } from '@/test/utils';

const mockTodoService = {
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

vi.mock('@/services/todoService', () => ({
  useTodoService: () => mockTodoService,
}));

vi.mock('@/services/categoryService', () => ({
  useCategoryService: () => ({
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  }),
}));

vi.mock('@/services/tagService', () => ({
  useTagService: () => ({
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  }),
}));

describe('TodosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page heading', () => {
    mockTodoService.getAll.mockReturnValue(new Promise(() => {}));
    render(<TodosPage />, { wrapper: createTestWrapper() });

    expect(screen.getByRole('heading', { name: /my todos/i })).toBeInTheDocument();
  });

  it('shows loading skeleton while todos are being fetched', () => {
    mockTodoService.getAll.mockReturnValue(new Promise(() => {}));
    render(<TodosPage />, { wrapper: createTestWrapper() });

    expect(screen.getByRole('list', { name: /loading todos/i })).toBeInTheDocument();
  });

  it('shows error alert when fetch fails', async () => {
    mockTodoService.getAll.mockRejectedValue(new Error('Network error'));
    render(<TodosPage />, { wrapper: createTestWrapper() });

    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to load/i);
  });

  it('shows empty state when there are no todos', async () => {
    mockTodoService.getAll.mockResolvedValue([]);
    render(<TodosPage />, { wrapper: createTestWrapper() });

    expect(await screen.findByText(/no todos yet/i)).toBeInTheDocument();
  });

  it('renders all todo items when todos are returned', async () => {
    mockTodoService.getAll.mockResolvedValue([
      makeTodo({ id: 1, title: 'First task' }),
      makeTodo({ id: 2, title: 'Second task' }),
    ]);
    render(<TodosPage />, { wrapper: createTestWrapper() });

    expect(await screen.findByText('First task')).toBeInTheDocument();
    expect(screen.getByText('Second task')).toBeInTheDocument();
  });

  it('filters todos by tag when a tag chip is clicked', async () => {
    const user = userEvent.setup();
    mockTodoService.getAll.mockResolvedValue([
      makeTodo({
        id: 1,
        title: 'First task',
        tags: [{ id: 1, name: 'urgent', createdAt: '2024-01-01T12:00:00' }],
      }),
      makeTodo({ id: 2, title: 'Second task', tags: [] }),
    ]);
    render(<TodosPage />, { wrapper: createTestWrapper() });

    expect(await screen.findByText('First task')).toBeInTheDocument();
    expect(screen.getByText('Second task')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '#urgent' }));

    expect(screen.getByText('First task')).toBeInTheDocument();
    expect(screen.queryByText('Second task')).not.toBeInTheDocument();
  });

  it('restores full list when same tag chip is clicked again', async () => {
    const user = userEvent.setup();
    mockTodoService.getAll.mockResolvedValue([
      makeTodo({
        id: 1,
        title: 'First task',
        tags: [{ id: 1, name: 'urgent', createdAt: '2024-01-01T12:00:00' }],
      }),
      makeTodo({ id: 2, title: 'Second task', tags: [] }),
    ]);
    render(<TodosPage />, { wrapper: createTestWrapper() });

    await screen.findByText('First task');
    await user.click(screen.getByRole('button', { name: '#urgent' }));
    expect(screen.queryByText('Second task')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '#urgent' }));
    expect(screen.getByText('Second task')).toBeInTheDocument();
  });
});
