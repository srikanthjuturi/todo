import { useState } from 'react';

import { useDeleteTodo, useUpdateTodo } from '@/hooks/useTodos';
import type { Todo } from '@/types';

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem = ({ todo }: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description ?? '');
  const [editError, setEditError] = useState('');

  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const handleToggle = () => {
    updateTodo.mutate({ id: todo.id, payload: { isCompleted: !todo.isCompleted } });
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
      <li style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '8px' }}>
        <form onSubmit={handleEditSubmit} noValidate>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            maxLength={255}
            aria-label="Edit title"
            style={{ width: '100%', padding: '6px', boxSizing: 'border-box', marginBottom: '4px' }}
          />
          {editError && (
            <span role="alert" style={{ color: '#dc2626', fontSize: '0.875rem', display: 'block' }}>
              {editError}
            </span>
          )}
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            maxLength={1000}
            aria-label="Edit description"
            rows={2}
            style={{ width: '100%', padding: '6px', boxSizing: 'border-box', marginBottom: '8px' }}
          />
          {updateTodo.isError && (
            <p role="alert" style={{ color: '#dc2626', fontSize: '0.875rem' }}>
              Failed to update. Please try again.
            </p>
          )}
          <button type="submit" disabled={updateTodo.isPending} style={{ marginRight: '8px' }}>
            {updateTodo.isPending ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={handleEditCancel}>
            Cancel
          </button>
        </form>
      </li>
    );
  }

  return (
    <li
      style={{
        padding: '12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        opacity: deleteTodo.isPending ? 0.5 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={todo.isCompleted}
        onChange={handleToggle}
        disabled={updateTodo.isPending}
        aria-label={`Mark "${todo.title}" as ${todo.isCompleted ? 'incomplete' : 'complete'}`}
        style={{ marginTop: '3px', flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontWeight: 500,
            textDecoration: todo.isCompleted ? 'line-through' : 'none',
            color: todo.isCompleted ? '#9ca3af' : 'inherit',
            wordBreak: 'break-word',
          }}
        >
          {todo.title}
        </p>
        {todo.description && (
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#6b7280', wordBreak: 'break-word' }}>
            {todo.description}
          </p>
        )}
        {(updateTodo.isError || deleteTodo.isError) && (
          <p role="alert" style={{ color: '#dc2626', fontSize: '0.75rem', margin: '4px 0 0' }}>
            Action failed. Please try again.
          </p>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={() => setIsEditing(true)}
          aria-label={`Edit "${todo.title}"`}
          style={{ fontSize: '0.875rem' }}
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleteTodo.isPending}
          aria-label={`Delete "${todo.title}"`}
          style={{ fontSize: '0.875rem', color: '#dc2626' }}
        >
          {deleteTodo.isPending ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </li>
  );
};
