import { useState } from 'react';

import { useCreateTodo } from '@/hooks/useTodos';
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
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ marginBottom: '8px' }}>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          aria-label="Todo title"
          aria-invalid={!!titleError}
          aria-describedby={titleError ? 'title-error' : undefined}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
        {titleError && (
          <span id="title-error" role="alert" style={{ color: '#dc2626', fontSize: '0.875rem' }}>
            {titleError}
          </span>
        )}
      </div>
      <div style={{ marginBottom: '8px' }}>
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          aria-label="Todo description"
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          rows={2}
        />
      </div>
      {createTodo.isError && (
        <p role="alert" style={{ color: '#dc2626', fontSize: '0.875rem' }}>
          Failed to create todo. Please try again.
        </p>
      )}
      <button type="submit" disabled={createTodo.isPending}>
        {createTodo.isPending ? 'Adding…' : 'Add Todo'}
      </button>
    </form>
  );
};
