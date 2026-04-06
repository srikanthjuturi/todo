import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useDeleteTodo, useUpdateTodo } from '@/hooks/useTodos';
import { cn } from '@/lib/utils';
import type { Todo } from '@/types';

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem = ({ todo }: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description ?? '');
  const [editError, setEditError] = useState('');

  const toggleTodo = useUpdateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const handleToggle = () => {
    toggleTodo.mutate({ id: todo.id, payload: { isCompleted: !todo.isCompleted } });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setEditError('Title must not be blank');
      return;
    }
    setEditError('');
    updateTodo.mutate(
      {
        id: todo.id,
        payload: {
          title: editTitle.trim(),
          description: editDescription.trim() || undefined,
        },
      },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleEditCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description ?? '');
    setEditError('');
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this todo?')) {
      deleteTodo.mutate(todo.id);
    }
  };

  if (isEditing) {
    return (
      <li className="surface p-4">
        <form onSubmit={handleEditSubmit} noValidate className="space-y-2">
          <div className="space-y-1">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              maxLength={255}
              aria-label="Edit title"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            />
            {editError && (
              <span role="alert" className="text-xs text-destructive block">
                {editError}
              </span>
            )}
          </div>
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            maxLength={1000}
            aria-label="Edit description"
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
          {updateTodo.isError && (
            <p role="alert" className="text-xs text-destructive">
              Failed to update. Please try again.
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={updateTodo.isPending}>
              {updateTodo.isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleEditCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li
      className={cn(
        'surface flex items-start gap-3 p-4 transition-opacity',
        deleteTodo.isPending && 'opacity-50'
      )}
    >
      <input
        type="checkbox"
        checked={todo.isCompleted}
        onChange={handleToggle}
        disabled={toggleTodo.isPending}
        aria-label={`Mark "${todo.title}" as ${todo.isCompleted ? 'incomplete' : 'complete'}`}
        className="mt-0.5 size-4 shrink-0 accent-primary cursor-pointer disabled:cursor-not-allowed"
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'break-words text-sm font-medium leading-snug',
            todo.isCompleted && 'line-through-muted'
          )}
        >
          {todo.title}
        </p>
        {todo.description && (
          <p className="mt-1 break-words text-xs text-muted-foreground">
            {todo.description}
          </p>
        )}
        {(toggleTodo.isError || updateTodo.isError || deleteTodo.isError) && (
          <p role="alert" className="mt-1 text-xs text-destructive">
            Action failed. Please try again.
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-1.5">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          aria-label={`Edit "${todo.title}"`}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          disabled={deleteTodo.isPending}
          aria-label={`Delete "${todo.title}"`}
        >
          {deleteTodo.isPending ? 'Deleting…' : 'Delete'}
        </Button>
      </div>
    </li>
  );
};
