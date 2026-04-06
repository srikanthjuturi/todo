import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TodoForm } from '@/components/TodoForm';
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

describe('TodoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(todoService.create).not.toHaveBeenCalled();
  });

  it('shows validation error when title is whitespace only', async () => {
    const user = userEvent.setup();
    render(<TodoForm />, { wrapper: createTestWrapper() });

    await user.type(screen.getByRole('textbox', { name: /todo title/i }), '   ');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/must not be blank/i);
    expect(todoService.create).not.toHaveBeenCalled();
  });

  it('calls todoService.create with trimmed title on valid submit', async () => {
    const user = userEvent.setup();
    vi.mocked(todoService.create).mockResolvedValue(makeTodo({ title: 'Buy milk' }));
    render(<TodoForm />, { wrapper: createTestWrapper() });

    await user.type(screen.getByRole('textbox', { name: /todo title/i }), ' Buy milk ');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    await waitFor(() => {
      expect(todoService.create).toHaveBeenCalledWith({
        title: 'Buy milk',
        description: undefined,
      });
    });
  });

  it('clears form inputs after successful submission', async () => {
    const user = userEvent.setup();
    vi.mocked(todoService.create).mockResolvedValue(makeTodo());
    render(<TodoForm />, { wrapper: createTestWrapper() });

    const titleInput = screen.getByRole('textbox', { name: /todo title/i });
    await user.type(titleInput, 'Buy milk');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    await waitFor(() => expect(titleInput).toHaveValue(''));
  });
});
