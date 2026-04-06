import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useCreateTodo } from '@/hooks/useTodos';
import { cn } from '@/lib/utils';
import type { TodoCreate } from '@/types';

export const TodoForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');

  const createTodo = useCreateTodo();

  const validate = (): boolean => {
    if (!title.trim()) {
      setTitleError('Title must not be blank');
      return false;
    }
    if (title.length > 255) {
      setTitleError('Title must be 255 characters or fewer');
      return false;
    }
    setTitleError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: TodoCreate = {
      title: title.trim(),
      description: description.trim() || undefined,
    };

    createTodo.mutate(payload, {
      onSuccess: () => {
        setTitle('');
        setDescription('');
        setTitleError('');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div className="space-y-1">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          aria-label="Todo title"
          aria-invalid={!!titleError}
          aria-describedby={titleError ? 'title-error' : undefined}
          className={cn(
            'w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            titleError
              ? 'border-destructive focus:ring-destructive/40'
              : 'border-border'
          )}
        />
        {titleError && (
          <span id="title-error" role="alert" className="text-xs text-destructive">
            {titleError}
          </span>
        )}
      </div>

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={1000}
        aria-label="Todo description"
        rows={2}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 resize-none"
      />

      {createTodo.isError && (
        <p role="alert" className="text-xs text-destructive">
          Failed to create todo. Please try again.
        </p>
      )}

      <Button type="submit" disabled={createTodo.isPending} className="w-full" size="default">
        {createTodo.isPending ? 'Adding…' : 'Add Todo'}
      </Button>
    </form>
  );
};
