import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { TodoForm } from '@/components/TodoForm';
import { TodoItem } from '@/components/TodoItem';
import { useTodos } from '@/hooks/useTodos';

const TodosPage = () => {
  const navigate = useNavigate();
  const { data: todos, isLoading, isError } = useTodos();
  const [activeTagId, setActiveTagId] = useState<number | null>(null);

  const handleTagClick = (tagId: number) => {
    setActiveTagId((prev) => (prev === tagId ? null : tagId));
  };

  const filteredTodos = activeTagId
    ? (todos ?? []).filter((t) => t.tags.some((tag) => tag.id === activeTagId))
    : (todos ?? []);

  return (
    <main className="page-container">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Todos</h1>
        <button
          type="button"
          onClick={() => navigate('/manage')}
          className="cursor-pointer rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted transition-colors"
        >
          Manage Categories &amp; Tags
        </button>
      </div>

      <section aria-label="Create todo" className="surface mb-6 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          New Task
        </h2>
        <TodoForm />
      </section>

      <section aria-label="Todo list">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Tasks
          </h2>
          {activeTagId && (
            <button
              type="button"
              onClick={() => setActiveTagId(null)}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              Clear tag filter
            </button>
          )}
        </div>

        {isLoading && <LoadingSkeleton />}

        {isError && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Failed to load todos. Please refresh the page.
          </p>
        )}

        {!isLoading && !isError && filteredTodos.length === 0 && <EmptyState />}

        {!isLoading && !isError && filteredTodos.length > 0 && (
          <ul className="space-y-2">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onTagClick={handleTagClick}
                activeTagId={activeTagId}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default TodosPage;
