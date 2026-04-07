import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useCreateTodo } from '@/hooks/useTodos';
import { useCategories } from '@/hooks/useCategories';
import { useTags, useCreateTag } from '@/hooks/useTags';
import { cn } from '@/lib/utils';
import type { TodoCreate, Tag } from '@/types';
import { TagChip } from './TagChip';

export const TodoForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [titleError, setTitleError] = useState('');

  const createTodo = useCreateTodo();
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTagName = tagInput.trim();
      if (!newTagName) return;

      const existingTag = tags.find((t) => t.name.toLowerCase() === newTagName.toLowerCase());
      if (existingTag) {
        if (!selectedTags.some((t) => t.id === existingTag.id)) {
          setSelectedTags([...selectedTags, existingTag]);
        }
        setTagInput('');
      } else {
        createTag.mutate(
          { name: newTagName },
          {
            onSuccess: (newTag) => {
              setSelectedTags([...selectedTags, newTag]);
              setTagInput('');
            },
          }
        );
      }
    }
  };

  const removeTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

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
      categoryId: categoryId === '' ? undefined : Number(categoryId),
      tagIds: selectedTags.map((t) => t.id),
    };

    createTodo.mutate(payload, {
      onSuccess: () => {
        setTitle('');
        setDescription('');
        setCategoryId('');
        setSelectedTags([]);
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

      <div className="flex gap-3 flex-col sm:flex-row">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
          aria-label="Category"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        >
          <option value="">No Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        
        <div className="flex-1 relative">
          <div className="flex flex-wrap gap-1 mb-1">
            {selectedTags.map((t) => (
              <TagChip key={t.id} name={t.name} onClick={() => removeTag(t.id)} />
            ))}
          </div>
          <input
            type="text"
            placeholder="Add tags (press Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>
      </div>

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
