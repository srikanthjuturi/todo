import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { TodoForm } from '@/components/TodoForm';
import { TodoItem } from '@/components/TodoItem';
import { useTodos } from '@/hooks/useTodos';

const TodosPage = () => {
  const { data: todos, isLoading, isError } = useTodos();

  return (
    <main className="page-container">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">My Todos</h1>

      <section aria-label="Create todo" className="surface mb-6 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          New Task
        </h2>
        <TodoForm />
      </section>

      <section aria-label="Todo list">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Tasks
        </h2>

        {isLoading && <LoadingSkeleton />}

        {isError && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Failed to load todos. Please refresh the page.
          </p>
        )}

        {!isLoading && !isError && todos && todos.length === 0 && <EmptyState />}

        {!isLoading && !isError && todos && todos.length > 0 && (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default TodosPage;
