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
    <div className="flex min-h-screen">
      {/* Left — fixed sidebar with form, vertically centered */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-[560px] lg:flex-col lg:items-center lg:justify-center lg:px-10 lg:py-10 border-r border-border bg-card/80 backdrop-blur-sm">
        <div className="absolute top-5 right-5">
          <button
            type="button"
            onClick={() => navigate('/manage')}
            className="cursor-pointer rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted transition-colors"
          >
            Manage Categories &amp; Tags
          </button>
        </div>
        <div className="w-full">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">My Todos</h1>
          <p className="mb-4 text-sm text-muted-foreground">Capture what needs to be done.</p>
          <div className="surface p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              New Task
            </h2>
            <TodoForm />
          </div>
        </div>
      </aside>

      {/* Right — scrollable task list, offset by left sidebar width */}
      <main className="w-full lg:pl-[560px]">
        {/* Mobile: show form inline */}
        <div className="lg:hidden border-b border-border bg-card/80 px-4 py-6">
          <h1 className="mb-4 text-2xl font-bold tracking-tight">My Todos</h1>
          <div className="surface p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              New Task
            </h2>
            <TodoForm />
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <div className="mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Tasks
              {activeTagId && (
                <button
                  type="button"
                  onClick={() => setActiveTagId(null)}
                  className="ml-3 text-xs font-normal normal-case text-muted-foreground underline hover:text-foreground"
                >
                  Clear filter
                </button>
              )}
            </h2>
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
        </div>
      </main>
    </div>
  );
};

export default TodosPage;
