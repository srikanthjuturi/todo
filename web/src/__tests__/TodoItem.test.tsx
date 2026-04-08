import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TodoItem } from '@/components/TodoItem';
import { createTestWrapper, makeTodo } from '@/test/utils';
import type { Todo } from '@/types';

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

const sampleTodo: Todo = makeTodo();

describe('TodoItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders todo title', () => {
    render(<TodoItem todo={sampleTodo} />, { wrapper: createTestWrapper() });

    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    const todoWithDesc = makeTodo({ description: 'Some details' });
    render(<TodoItem todo={todoWithDesc} />, { wrapper: createTestWrapper() });

    expect(screen.getByText('Some details')).toBeInTheDocument();
  });

  it('renders unchecked checkbox for incomplete todo', () => {
    render(<TodoItem todo={sampleTodo} />, { wrapper: createTestWrapper() });

    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('renders checked checkbox for completed todo', () => {
    const completedTodo = makeTodo({ isCompleted: true });
    render(<TodoItem todo={completedTodo} />, { wrapper: createTestWrapper() });

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls todoService.update with toggled isCompleted when checkbox clicked', async () => {
    const user = userEvent.setup();
    mockTodoService.update.mockResolvedValue(makeTodo({ isCompleted: true }));
    render(<TodoItem todo={sampleTodo} />, { wrapper: createTestWrapper() });

    await user.click(screen.getByRole('checkbox'));

    await waitFor(() => {
      expect(mockTodoService.update).toHaveBeenCalledWith(1, { isCompleted: true });
    });
  });

  it('shows edit form with Save and Cancel buttons when Edit is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={sampleTodo} />, { wrapper: createTestWrapper() });

    await user.click(screen.getByRole('button', { name: /edit "test task"/i }));

    expect(screen.getByRole('textbox', { name: /edit title/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('restores original title when Cancel is clicked in edit mode', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={sampleTodo} />, { wrapper: createTestWrapper() });

    await user.click(screen.getByRole('button', { name: /edit "test task"/i }));
    const editInput = screen.getByRole('textbox', { name: /edit title/i });
    await user.clear(editInput);
    await user.type(editInput, 'Changed text');
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.getByText('Test task')).toBeInTheDocument();
    expect(mockTodoService.update).not.toHaveBeenCalled();
  });

  it('shows validation error when edit form is submitted with blank title', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={sampleTodo} />, { wrapper: createTestWrapper() });

    await user.click(screen.getByRole('button', { name: /edit "test task"/i }));
    const editInput = screen.getByRole('textbox', { name: /edit title/i });
    await user.clear(editInput);
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/must not be blank/i);
    expect(mockTodoService.update).not.toHaveBeenCalled();
  });

  it('calls todoService.update with new title when edit form is saved', async () => {
    const user = userEvent.setup();
    mockTodoService.update.mockResolvedValue(makeTodo({ title: 'Updated task' }));
    render(<TodoItem todo={sampleTodo} />, { wrapper: createTestWrapper() });

    await user.click(screen.getByRole('button', { name: /edit "test task"/i }));
    const editInput = screen.getByRole('textbox', { name: /edit title/i });
    await user.clear(editInput);
    await user.type(editInput, 'Updated task');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockTodoService.update).toHaveBeenCalledWith(1, {
        title: 'Updated task',
        description: undefined,
      });
    });
  });

  it('calls todoService.remove when delete is confirmed', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockTodoService.remove.mockResolvedValue(undefined);
    render(<TodoItem todo={sampleTodo} />, { wrapper: createTestWrapper() });

    await user.click(screen.getByRole('button', { name: /delete "test task"/i }));

    await waitFor(() => {
      expect(mockTodoService.remove).toHaveBeenCalledWith(1);
    });
  });

  it('does not call todoService.remove when delete is cancelled in confirm dialog', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<TodoItem todo={sampleTodo} />, { wrapper: createTestWrapper() });

    await user.click(screen.getByRole('button', { name: /delete "test task"/i }));

    expect(mockTodoService.remove).not.toHaveBeenCalled();
  });
});
