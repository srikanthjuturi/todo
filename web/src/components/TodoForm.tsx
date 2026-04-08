import { useState, useRef, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateTodo } from '@/hooks/useTodos';
import { useCategories } from '@/hooks/useCategories';
import { useTags, useCreateTag } from '@/hooks/useTags';
import { cn } from '@/lib/utils';
import { validateTodoTitle, validateTodoDescription } from '@/utils/validation';
import type { TodoCreate, Tag } from '@/types';
import { TagChip } from './TagChip';

export const TodoForm = () => {
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const tagContainerRef = useRef<HTMLDivElement>(null);

  const createTodo = useCreateTodo();
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();

  // Tags matched by input, excluding already-selected ones
  const suggestions = tags.filter(
    (t) =>
      !selectedTags.some((s) => s.id === t.id) &&
      t.name.toLowerCase().includes(tagInput.toLowerCase())
  );

  // Whether typed name is a brand-new tag (not in full list)
  const isNewTag =
    tagInput.trim().length > 0 &&
    !tags.some((t) => t.name.toLowerCase() === tagInput.trim().toLowerCase());

  const dropdownItems: Array<Tag | 'create'> = [
    ...suggestions,
    ...(isNewTag ? (['create'] as const) : []),
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tagContainerRef.current && !tagContainerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addTag = (tag: Tag) => {
    if (!selectedTags.some((t) => t.id === tag.id)) {
      setSelectedTags((prev) => [...prev, tag]);
    }
    setTagInput('');
    setDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const createAndAddTag = () => {
    const name = tagInput.trim();
    if (!name) return;
    createTag.mutate(
      { name },
      {
        onSuccess: (newTag) => {
          setSelectedTags((prev) => [...prev, newTag]);
          setTagInput('');
          setDropdownOpen(false);
          setHighlightedIndex(-1);
        },
      }
    );
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    setDropdownOpen(true);
    setHighlightedIndex(-1);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, dropdownItems.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Escape') {
      setDropdownOpen(false);
      setHighlightedIndex(-1);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!tagInput.trim()) return;
      if (highlightedIndex >= 0 && highlightedIndex < dropdownItems.length) {
        const item = dropdownItems[highlightedIndex];
        if (item === 'create') createAndAddTag();
        else addTag(item);
      } else if (dropdownItems.length === 1 && dropdownItems[0] !== 'create') {
        addTag(dropdownItems[0] as Tag);
      } else {
        createAndAddTag();
      }
    }
  };

  const removeTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

  const validate = (): boolean => {
    const titleResult = validateTodoTitle(title);
    const descResult = validateTodoDescription(description);
    setTitleError(titleResult.valid ? '' : titleResult.message);
    setDescriptionError(descResult.valid ? '' : descResult.message);
    return titleResult.valid && descResult.valid;
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
        setDescriptionError('');
        setTagInput('');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <label htmlFor="todo-title" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Title <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <input
          id="todo-title"
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError(''); }}
          maxLength={255}
          aria-required="true"
          aria-invalid={!!titleError}
          aria-describedby={titleError ? 'title-error' : undefined}
          className={cn(
            'w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            titleError ? 'border-destructive focus:ring-destructive/40' : 'border-border'
          )}
        />
        {titleError && (
          <span id="title-error" role="alert" className="flex items-center gap-1 text-xs text-destructive">
            <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-destructive text-center leading-[0.875rem] text-[10px] font-bold">!</span>
            {titleError}
          </span>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="todo-description" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Description <span className="text-xs normal-case tracking-normal font-normal text-muted-foreground/60">(optional)</span>
        </label>
        <textarea
          id="todo-description"
          placeholder="Add more details…"
          value={description}
          onChange={(e) => { setDescription(e.target.value); if (descriptionError) setDescriptionError(''); }}
          maxLength={1000}
          aria-invalid={!!descriptionError}
          aria-describedby={descriptionError ? 'desc-error' : undefined}
          rows={2}
          className={cn(
            'w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm shadow-sm',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            descriptionError ? 'border-destructive focus:ring-destructive/40' : 'border-border'
          )}
        />
        {descriptionError && (
          <span id="desc-error" role="alert" className="flex items-center gap-1 text-xs text-destructive">
            <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-destructive text-center leading-[0.875rem] text-[10px] font-bold">!</span>
            {descriptionError}
          </span>
        )}
      </div>

      {/* Category + Tags side by side */}
      <div className="flex gap-4 flex-col sm:flex-row">

        {/* Category */}
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Category
          </label>
          <Select
            value={categoryId === '' ? 'none' : String(categoryId)}
            onValueChange={(val) => setCategoryId(val === 'none' ? '' : Number(val))}
          >
            <SelectTrigger aria-label="Category">
              <SelectValue placeholder="No Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Category</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags with autocomplete */}
        <div className="flex-1 space-y-1.5">
        <label htmlFor="todo-tags" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Tags
        </label>

        <div ref={tagContainerRef} className="relative">
          <input
            id="todo-tags"
            type="text"
            placeholder={selectedTags.length === 0 ? 'Search or create tags…' : 'Add more tags…'}
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagInputKeyDown}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={dropdownOpen && dropdownItems.length > 0}
            aria-controls="tag-listbox"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />

            {/* Dropdown */}
            {dropdownOpen && dropdownItems.length > 0 && (
              <ul
                id="tag-listbox"
                role="listbox"
                className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg"
              >
                {dropdownItems.map((item, idx) =>
                  item === 'create' ? (
                    <li
                      key="create"
                      role="option"
                      aria-selected={highlightedIndex === idx}
                      onMouseDown={(e) => { e.preventDefault(); createAndAddTag(); }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors',
                        highlightedIndex === idx ? 'bg-muted' : 'hover:bg-muted'
                      )}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">+</span>
                      <span>Create <strong className="font-semibold">"{tagInput.trim()}"</strong></span>
                    </li>
                  ) : (
                    <li
                      key={item.id}
                      role="option"
                      aria-selected={highlightedIndex === idx}
                      onMouseDown={(e) => { e.preventDefault(); addTag(item); }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors',
                        highlightedIndex === idx ? 'bg-muted' : 'hover:bg-muted'
                      )}
                    >
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                        #{item.name}
                      </span>
                    </li>
                  )
                )}
              </ul>
            )}

            {/* Empty state when focused with input but no matches */}
            {dropdownOpen && tagInput.trim().length > 0 && dropdownItems.length === 0 && (
              <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover px-3 py-2.5 text-xs text-muted-foreground shadow-lg">
                Tag already added or no matches.
              </div>
            )}
        </div>
        </div>
      </div>

      {/* Selected tags row */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((t) => (
            <TagChip key={t.id} name={t.name} onClick={() => removeTag(t.id)} removable />
          ))}
        </div>
      )}

      {createTodo.isError && (
        <p role="alert" className="flex items-center gap-1 text-xs text-destructive">
          <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-destructive text-center leading-[0.875rem] text-[10px] font-bold">!</span>
          Failed to create todo. Please try again.
        </p>
      )}

      <Button type="submit" disabled={createTodo.isPending} className="w-full" size="default">
        {createTodo.isPending ? 'Adding…' : 'Add Todo'}
      </Button>
    </form>
  );
};
