import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { TodoForm } from '@/components/TodoForm';
import { TodoItem } from '@/components/TodoItem';
import { useTodos } from '@/hooks/useTodos';

const TodosPage = () => {
  const { data: todos, isLoading, isError } = useTodos();

  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>My Todos</h1>

      <section aria-label="Create todo" style={{ marginBottom: '32px' }}>
        <TodoForm />
      </section>

      <section aria-label="Todo list">
        {isLoading && <LoadingSkeleton />}

        {isError && (
          <p role="alert" style={{ color: '#dc2626' }}>
            Failed to load todos. Please refresh the page.
          </p>
        )}

        {!isLoading && !isError && todos && todos.length === 0 && <EmptyState />}

        {!isLoading && !isError && todos && todos.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
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
