import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TodoForm } from '@/components/TodoForm';
import { createTestWrapper, makeTodo } from '@/test/utils';

const mockTodoService = {
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

const mockCategoryService = {
  getAll: vi.fn().mockResolvedValue([]),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

const mockTagService = {
  getAll: vi.fn().mockResolvedValue([]),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

vi.mock('@/services/todoService', () => ({
  useTodoService: () => mockTodoService,
}));

vi.mock('@/services/categoryService', () => ({
  useCategoryService: () => mockCategoryService,
}));

vi.mock('@/services/tagService', () => ({
  useTagService: () => mockTagService,
}));

describe('TodoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCategoryService.getAll.mockResolvedValue([]);
    mockTagService.getAll.mockResolvedValue([]);
  });

  it('renders title input, description textarea, and submit button', () => {
    render(<TodoForm />, { wrapper: createTestWrapper() });

    expect(screen.getByRole('textbox', { name: /todo title/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
  });

  it('shows validation error and does not call service when title is empty', async () => {
    const user = userEvent.setup();
    render(<TodoForm />, { wrapper: createTestWrapper() });

    await user.click(screen.getByRole('button', { name: /add todo/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/must not be blank/i);
    expect(mockTodoService.create).not.toHaveBeenCalled();
  });

  it('shows validation error when title is whitespace only', async () => {
    const user = userEvent.setup();
    render(<TodoForm />, { wrapper: createTestWrapper() });

    await user.type(screen.getByRole('textbox', { name: /todo title/i }), '   ');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/must not be blank/i);
    expect(mockTodoService.create).not.toHaveBeenCalled();
  });

  it('calls todoService.create with trimmed title on valid submit', async () => {
    const user = userEvent.setup();
    mockTodoService.create.mockResolvedValue(makeTodo({ title: 'Buy milk' }));
    render(<TodoForm />, { wrapper: createTestWrapper() });

    await user.type(screen.getByRole('textbox', { name: /todo title/i }), ' Buy milk ');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    await waitFor(() => {
      expect(mockTodoService.create).toHaveBeenCalledWith({
        title: 'Buy milk',
        description: undefined,
        categoryId: undefined,
        tagIds: [],
      });
    });
  });

  it('clears form inputs after successful submission', async () => {
    const user = userEvent.setup();
    mockTodoService.create.mockResolvedValue(makeTodo());
    render(<TodoForm />, { wrapper: createTestWrapper() });

    const titleInput = screen.getByRole('textbox', { name: /todo title/i });
    await user.type(titleInput, 'Buy milk');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    await waitFor(() => expect(titleInput).toHaveValue(''));
  });

  it('category dropdown shows options from categories data', async () => {
    mockCategoryService.getAll.mockResolvedValue([
      { id: 1, name: 'Work', createdAt: '2024-01-01T12:00:00' },
      { id: 2, name: 'Personal', createdAt: '2024-01-01T12:00:00' },
    ]);
    render(<TodoForm />, { wrapper: createTestWrapper() });

    expect(await screen.findByRole('option', { name: 'Work' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Personal' })).toBeInTheDocument();
  });

  it('includes selected categoryId in create payload', async () => {
    const user = userEvent.setup();
    mockCategoryService.getAll.mockResolvedValue([
      { id: 1, name: 'Work', createdAt: '2024-01-01T12:00:00' },
    ]);
    mockTodoService.create.mockResolvedValue(makeTodo());
    render(<TodoForm />, { wrapper: createTestWrapper() });

    await user.type(screen.getByRole('textbox', { name: /todo title/i }), 'My task');
    await user.selectOptions(await screen.findByRole('combobox', { name: /category/i }), '1');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    await waitFor(() => {
      expect(mockTodoService.create).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 1 })
      );
    });
  });

  it('creates new tag on Enter and adds it to selected tags', async () => {
    const user = userEvent.setup();
    const newTag = { id: 99, name: 'urgent', createdAt: '2024-01-01T12:00:00' };
    mockTagService.create.mockResolvedValue(newTag);
    render(<TodoForm />, { wrapper: createTestWrapper() });

    const tagInput = screen.getByPlaceholderText(/add tags/i);
    await user.type(tagInput, 'urgent');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockTagService.create).toHaveBeenCalledWith({ name: 'urgent' });
    });
    expect(await screen.findByText('#urgent')).toBeInTheDocument();
  });
});
