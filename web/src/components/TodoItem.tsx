import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import { useCreateTag, useTags } from '@/hooks/useTags';
import { useDeleteTodo, useUpdateTodo } from '@/hooks/useTodos';
import { cn } from '@/lib/utils';
import { validateTodoDescription, validateTodoTitle } from '@/utils/validation';
import type { Tag, Todo } from '@/types';
import { CategoryBadge } from './CategoryBadge';
import { TagChip } from './TagChip';

interface TodoItemProps {
  todo: Todo;
  onTagClick?: (tagId: number) => void;
  activeTagId?: number | null;
}

export const TodoItem = ({ todo, onTagClick, activeTagId }: TodoItemProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editTitleError, setEditTitleError] = useState('');
  const [editDescription, setEditDescription] = useState(todo.description ?? '');
  const [editDescriptionError, setEditDescriptionError] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<number | ''>(todo.categoryId ?? '');
  const [editTags, setEditTags] = useState<Tag[]>(todo.tags);
  const [tagInput, setTagInput] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const tagContainerRef = useRef<HTMLDivElement>(null);

  const toggleTodo = useUpdateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const { data: categories = [] } = useCategories();
  const { data: allTags = [] } = useTags();
  const createTag = useCreateTag();

  // Reset form when dialog opens
  useEffect(() => {
    if (editOpen) {
      setEditTitle(todo.title);
      setEditTitleError('');
      setEditDescription(todo.description ?? '');
      setEditDescriptionError('');
      setEditCategoryId(todo.categoryId ?? '');
      setEditTags(todo.tags);
      setTagInput('');
      setDropdownOpen(false);
    }
  }, [editOpen, todo]);

  // Close tag dropdown on outside click
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

  const suggestions = allTags.filter(
    (t) => !editTags.some((s) => s.id === t.id) && t.name.toLowerCase().includes(tagInput.toLowerCase())
  );
  const isNewTag =
    tagInput.trim().length > 0 &&
    !allTags.some((t) => t.name.toLowerCase() === tagInput.trim().toLowerCase());
  const dropdownItems: Array<Tag | 'create'> = [...suggestions, ...(isNewTag ? (['create'] as const) : [])];

  const addTag = (tag: Tag) => {
    if (!editTags.some((t) => t.id === tag.id)) setEditTags((prev) => [...prev, tag]);
    setTagInput('');
    setDropdownOpen(false);
    setHighlightedIndex(-1);
  };
  const createAndAddTag = () => {
    const name = tagInput.trim();
    if (!name) return;
    createTag.mutate({ name }, {
      onSuccess: (newTag) => {
        setEditTags((prev) => [...prev, newTag]);
        setTagInput('');
        setDropdownOpen(false);
        setHighlightedIndex(-1);
      },
    });
  };
  const removeEditTag = (tagId: number) => setEditTags((prev) => prev.filter((t) => t.id !== tagId));

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    setDropdownOpen(true);
    setHighlightedIndex(-1);
  };
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex((i) => Math.min(i + 1, dropdownItems.length - 1)); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex((i) => Math.max(i - 1, 0)); return; }
    if (e.key === 'Escape') { setDropdownOpen(false); setHighlightedIndex(-1); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!tagInput.trim()) return;
      if (highlightedIndex >= 0 && highlightedIndex < dropdownItems.length) {
        const item = dropdownItems[highlightedIndex];
        if (item === 'create') createAndAddTag(); else addTag(item);
      } else if (dropdownItems.length === 1 && dropdownItems[0] !== 'create') {
        addTag(dropdownItems[0] as Tag);
      } else {
        createAndAddTag();
      }
    }
  };

  const handleToggle = () => {
    const completing = !todo.isCompleted;
    toggleTodo.mutate(
      { id: todo.id, payload: { isCompleted: completing } },
      { onSuccess: () => toast.success(completing ? 'Todo marked as complete!' : 'Todo marked as incomplete!') }
    );
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const titleResult = validateTodoTitle(editTitle);
    const descResult = validateTodoDescription(editDescription);
    setEditTitleError(titleResult.valid ? '' : titleResult.message);
    setEditDescriptionError(descResult.valid ? '' : descResult.message);
    if (!titleResult.valid || !descResult.valid) return;

    updateTodo.mutate(
      {
        id: todo.id,
        payload: {
          title: editTitle.trim(),
          description: editDescription.trim() || undefined,
          categoryId: editCategoryId === '' ? null : Number(editCategoryId),
          tagIds: editTags.map((t) => t.id),
        },
      },
      { onSuccess: () => { setEditOpen(false); toast.success('Todo updated successfully!'); } }
    );
  };

  const handleDelete = () => {
    deleteTodo.mutate(todo.id);
  };

  return (
    <li
      className={cn(
        'surface flex items-start gap-3 p-4 transition-all duration-200',
        todo.isCompleted && 'bg-muted/50 border-border opacity-60',
        deleteTodo.isPending && 'opacity-50'
      )}
    >
      <input
        type="checkbox"
        checked={todo.isCompleted}
        onChange={handleToggle}
        disabled={toggleTodo.isPending}
        aria-label={`Mark "${todo.title}" as ${todo.isCompleted ? 'incomplete' : 'complete'}`}
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              'break-words text-sm font-medium leading-snug',
              todo.isCompleted && 'line-through-muted'
            )}
          >
            {todo.title}
          </p>
          {todo.isCompleted && (
            <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
              Done
            </span>
          )}
        </div>
        {todo.description && (
          <p className="mt-1 break-words text-xs text-muted-foreground">
            {todo.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-2 items-center">
          {todo.categoryName && <CategoryBadge name={todo.categoryName} />}
          {todo.tags && todo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {todo.tags.map((tag) => (
                <TagChip
                  key={tag.id}
                  name={tag.name}
                  selected={activeTagId === tag.id}
                  onClick={onTagClick ? () => onTagClick(tag.id) : undefined}
                />
              ))}
            </div>
          )}
        </div>
        {(toggleTodo.isError || updateTodo.isError || deleteTodo.isError) && (
          <p role="alert" className="mt-1 text-xs text-destructive">
            Action failed. Please try again.
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-1.5">
        <Dialog open={editOpen} onOpenChange={todo.isCompleted ? undefined : setEditOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" disabled={todo.isCompleted} aria-label={`Edit "${todo.title}"`}>
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Todo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} noValidate className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label htmlFor="edit-title" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Title <span className="text-destructive" aria-hidden="true">*</span>
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => { setEditTitle(e.target.value); if (editTitleError) setEditTitleError(''); }}
                  maxLength={255}
                  aria-required="true"
                  aria-invalid={!!editTitleError}
                  className={cn(
                    'w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                    editTitleError ? 'border-destructive focus:ring-destructive/40' : 'border-border'
                  )}
                />
                {editTitleError && (
                  <span role="alert" className="flex items-center gap-1 text-xs text-destructive">
                    <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-destructive text-center leading-[0.875rem] text-[10px] font-bold">!</span>
                    {editTitleError}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label htmlFor="edit-description" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Description <span className="text-xs normal-case tracking-normal font-normal text-muted-foreground/60">(optional)</span>
                </label>
                <textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => { setEditDescription(e.target.value); if (editDescriptionError) setEditDescriptionError(''); }}
                  maxLength={1000}
                  rows={2}
                  aria-invalid={!!editDescriptionError}
                  className={cn(
                    'w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                    editDescriptionError ? 'border-destructive focus:ring-destructive/40' : 'border-border'
                  )}
                />
                {editDescriptionError && (
                  <span role="alert" className="flex items-center gap-1 text-xs text-destructive">
                    <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-destructive text-center leading-[0.875rem] text-[10px] font-bold">!</span>
                    {editDescriptionError}
                  </span>
                )}
              </div>

              {/* Category + Tags */}
              <div className="flex gap-4 flex-col sm:flex-row">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Category</label>
                  <Select
                    value={editCategoryId === '' ? 'none' : String(editCategoryId)}
                    onValueChange={(val) => setEditCategoryId(val === 'none' ? '' : Number(val))}
                  >
                    <SelectTrigger aria-label="Category">
                      <SelectValue placeholder="No Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-1.5">
                  <label htmlFor="edit-tags" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tags</label>
                  <div ref={tagContainerRef} className="relative">
                    <input
                      id="edit-tags"
                      type="text"
                      placeholder="Search or create tags…"
                      value={tagInput}
                      onChange={handleTagInputChange}
                      onKeyDown={handleTagInputKeyDown}
                      autoComplete="off"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                    />
                    {dropdownOpen && dropdownItems.length > 0 && (
                      <ul role="listbox" className="absolute z-50 mt-1 w-full max-h-40 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
                        {dropdownItems.map((item, idx) =>
                          item === 'create' ? (
                            <li key="create" role="option" onMouseDown={(e) => { e.preventDefault(); createAndAddTag(); }} onMouseEnter={() => setHighlightedIndex(idx)}
                              className={cn('flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors', highlightedIndex === idx ? 'bg-muted' : 'hover:bg-muted')}>
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">+</span>
                              <span>Create <strong className="font-semibold">"{tagInput.trim()}"</strong></span>
                            </li>
                          ) : (
                            <li key={item.id} role="option" onMouseDown={(e) => { e.preventDefault(); addTag(item); }} onMouseEnter={() => setHighlightedIndex(idx)}
                              className={cn('flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors', highlightedIndex === idx ? 'bg-muted' : 'hover:bg-muted')}>
                              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">#{item.name}</span>
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected tags */}
              {editTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {editTags.map((t) => (
                    <TagChip key={t.id} name={t.name} onClick={() => removeEditTag(t.id)} removable />
                  ))}
                </div>
              )}

              {updateTodo.isError && (
                <p role="alert" className="flex items-center gap-1 text-xs text-destructive">
                  <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-destructive text-center leading-[0.875rem] text-[10px] font-bold">!</span>
                  Failed to update. Please try again.
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={updateTodo.isPending}>
                  {updateTodo.isPending ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="destructive"
              disabled={deleteTodo.isPending || todo.isCompleted}
              aria-label={`Delete "${todo.title}"`}
            >
              {deleteTodo.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete todo?</AlertDialogTitle>
              <AlertDialogDescription>
                <strong className="font-medium text-foreground">"{todo.title}"</strong> will be permanently deleted. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
};
