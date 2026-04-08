import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Pencil, X, Check, Trash2, Tag as TagIcon, FolderOpen } from 'lucide-react';

import { validateCategoryName, validateTagName, type ValidationResult } from '@/utils/validation';

import { CategoryBadge } from '@/components/CategoryBadge';
import { TagChip } from '@/components/TagChip';
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
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/hooks/useCategories';
import { useCreateTag, useDeleteTag, useTags, useUpdateTag } from '@/hooks/useTags';
import type { Category, Tag } from '@/types';

/* ── tiny inline-edit row components ─────────────────────────────── */

interface EditRowProps {
  value: string;
  onSave: (name: string, setError: (msg: string) => void) => void;
  onCancel: () => void;
  isPending: boolean;
  maxLength: number;
  validator: (name: string) => ValidationResult;
}

const EditRow = ({ value, onSave, onCancel, isPending, maxLength, validator }: EditRowProps) => {
  const [val, setVal] = useState(value);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validator(val);
    if (!result.valid) { setError(result.message); return; }
    setError('');
    onSave(val, setError);
  };

  return (
    <div className="flex flex-1 flex-col gap-1">
      <form onSubmit={submit} className="flex flex-1 items-center gap-2">
        <Input
          autoFocus
          value={val}
          onChange={(e) => { setVal(e.target.value); if (error) setError(''); }}
          maxLength={maxLength}
          className={`h-8 text-sm ${error ? 'border-destructive' : ''}`}
          aria-label="Edit name"
          aria-invalid={!!error}
        />
        <Button type="submit" size="sm" disabled={isPending} className="h-8 shrink-0 px-2">
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} className="h-8 shrink-0 px-2">
          <X className="h-3.5 w-3.5" />
        </Button>
      </form>
      {error && (
        <p role="alert" className="flex items-center gap-1 text-xs text-destructive">
          <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-destructive text-center leading-[0.875rem] text-[10px] font-bold">!</span>
          {error}
        </p>
      )}
    </div>
  );
};

/* ── page ─────────────────────────────────────────────────────────── */

const ManagePage = () => {
  const navigate = useNavigate();

  const [newCategory, setNewCategory] = useState('');
  const [newCategoryError, setNewCategoryError] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newTagError, setNewTagError] = useState('');
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editingTagId, setEditingTagId] = useState<number | null>(null);

  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const { data: tags = [], isLoading: tagsLoading } = useTags();

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  /* ── category handlers ─────────────────────────────────────────── */

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateCategoryName(newCategory);
    if (!result.valid) { setNewCategoryError(result.message); return; }
    setNewCategoryError('');
    const name = newCategory.trim();
    createCategory.mutate({ name }, {
      onSuccess: (cat) => { setNewCategory(''); setNewCategoryError(''); toast.success(`Category "${cat.name}" created`); },
      onError: (err: unknown) => {
        const msg = String(err);
        if (msg.toLowerCase().includes('already') || msg.includes('409')) {
          setNewCategoryError(`"${name}" already exists`);
        } else {
          toast.error('Failed to create category');
        }
      },
    });
  };

  const handleSaveCategory = (cat: Category, name: string, setFieldError: (msg: string) => void) => {
    const result = validateCategoryName(name);
    if (!result.valid) { setFieldError(result.message); return; }
    updateCategory.mutate({ id: cat.id, name: name.trim() }, {
      onSuccess: (updated) => { setEditingCatId(null); toast.success(`Renamed to "${updated.name}"`); },
      onError: (err: unknown) => {
        const msg = String(err);
        if (msg.toLowerCase().includes('already') || msg.includes('409')) {
          setFieldError(`"${name.trim()}" already exists`);
        } else {
          toast.error('Failed to rename category');
        }
      },
    });
  };

  const handleDeleteCategory = (cat: Category) => {
    deleteCategory.mutate(cat.id, {
      onSuccess: () => toast.success(`Category "${cat.name}" deleted`),
      onError: () => toast.error(`Cannot delete "${cat.name}" — todos are still assigned to it`),
    });
  };

  /* ── tag handlers ──────────────────────────────────────────────── */

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateTagName(newTag);
    if (!result.valid) { setNewTagError(result.message); return; }
    setNewTagError('');
    const name = newTag.trim();
    createTag.mutate({ name }, {
      onSuccess: (tag) => { setNewTag(''); setNewTagError(''); toast.success(`Tag "${tag.name}" created`); },
      onError: (err: unknown) => {
        const msg = String(err);
        if (msg.toLowerCase().includes('already') || msg.includes('409')) {
          setNewTagError(`"${name}" already exists`);
        } else {
          toast.error('Failed to create tag');
        }
      },
    });
  };

  const handleSaveTag = (tag: Tag, name: string, setFieldError: (msg: string) => void) => {
    const result = validateTagName(name);
    if (!result.valid) { setFieldError(result.message); return; }
    updateTag.mutate({ id: tag.id, name: name.trim() }, {
      onSuccess: (updated) => { setEditingTagId(null); toast.success(`Renamed to "${updated.name}"`); },
      onError: (err: unknown) => {
        const msg = String(err);
        if (msg.toLowerCase().includes('already') || msg.includes('409')) {
          setFieldError(`"${name.trim()}" already exists`);
        } else {
          toast.error('Failed to rename tag');
        }
      },
    });
  };

  const handleDeleteTag = (tag: Tag) => {
    deleteTag.mutate(tag.id, {
      onSuccess: () => toast.success(`Tag "${tag.name}" deleted`),
      onError: () => toast.error(`Failed to delete tag "${tag.name}"`),
    });
  };

  /* ── render ────────────────────────────────────────────────────── */

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8">
      {/* Header */}
      <div className="mb-10 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/todos')}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Todos
        </button>
      </div>

      <h1 className="mb-2 text-4xl font-bold tracking-tight">Categories &amp; Tags</h1>
      <p className="mb-10 text-base text-muted-foreground">
        Organise your todos with categories (one per todo) and tags (many per todo).
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

        {/* ── Categories card ──────────────────────────────────────── */}
        <section className="surface flex flex-col gap-0 overflow-hidden p-0 shadow-md">
          {/* card header */}
          <div className="flex items-center gap-4 border-b border-border bg-muted/30 px-7 py-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <FolderOpen className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold leading-tight">Categories</h2>
              <p className="text-sm text-muted-foreground">One per todo — groups related tasks</p>
            </div>
            <span className="ml-auto flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2.5 text-sm font-semibold tabular-nums text-primary">
              {categories.length}
            </span>
          </div>

          {/* add form */}
          <div className="px-7 py-5">
            <form onSubmit={handleAddCategory} noValidate className="flex flex-col gap-1.5">
              <div className="flex gap-3">
                <Input
                  placeholder="New category name…"
                  value={newCategory}
                  onChange={(e) => { setNewCategory(e.target.value); if (newCategoryError) setNewCategoryError(''); }}
                  maxLength={100}
                  aria-label="New category name"
                  aria-invalid={!!newCategoryError}
                  aria-describedby={newCategoryError ? 'cat-name-error' : undefined}
                  className={`h-10 text-sm ${newCategoryError ? 'border-destructive focus-visible:ring-destructive/40' : ''}`}
                />
                <Button type="submit" disabled={createCategory.isPending} className="h-10 shrink-0 px-5">
                  {createCategory.isPending ? 'Adding…' : 'Add'}
                </Button>
              </div>
              {newCategoryError && (
                <p id="cat-name-error" role="alert" className="flex items-center gap-1.5 text-xs text-destructive">
                  <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-destructive text-center leading-[0.875rem] text-[10px] font-bold">!</span>
                  {newCategoryError}
                </p>
              )}
            </form>
          </div>

          <Separator />

          {/* list */}
          <div className="flex-1 px-7 py-5">
            {catsLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : categories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-12 text-center">
                <FolderOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">No categories yet.</p>
                <p className="mt-1 text-xs text-muted-foreground">Add one above to get started.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    {editingCatId === cat.id ? (
                      <EditRow
                        value={cat.name}
                        onSave={(name, setErr) => handleSaveCategory(cat, name, setErr)}
                        onCancel={() => setEditingCatId(null)}
                        isPending={updateCategory.isPending}
                        maxLength={100}
                        validator={validateCategoryName}
                      />
                    ) : (
                      <>
                        <CategoryBadge name={cat.name} />
                        <div className="ml-auto flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setEditingCatId(cat.id); setEditingTagId(null); }}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            aria-label={`Edit ${cat.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                aria-label={`Delete ${cat.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete "{cat.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This cannot be undone. Deletion will be blocked if any todos are still assigned to this category.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDeleteCategory(cat)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ── Tags card ─────────────────────────────────────────────── */}
        <section className="surface flex flex-col gap-0 overflow-hidden p-0 shadow-md">
          {/* card header */}
          <div className="flex items-center gap-4 border-b border-border bg-muted/30 px-7 py-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <TagIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold leading-tight">Tags</h2>
              <p className="text-sm text-muted-foreground">Many per todo — cross-cutting labels</p>
            </div>
            <span className="ml-auto flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2.5 text-sm font-semibold tabular-nums text-primary">
              {tags.length}
            </span>
          </div>

          {/* add form */}
          <div className="px-7 py-5">
            <form onSubmit={handleAddTag} noValidate className="flex flex-col gap-1.5">
              <div className="flex gap-3">
                <Input
                  placeholder="New tag name…"
                  value={newTag}
                  onChange={(e) => { setNewTag(e.target.value); if (newTagError) setNewTagError(''); }}
                  maxLength={50}
                  aria-label="New tag name"
                  aria-invalid={!!newTagError}
                  aria-describedby={newTagError ? 'tag-name-error' : undefined}
                  className={`h-10 text-sm ${newTagError ? 'border-destructive focus-visible:ring-destructive/40' : ''}`}
                />
                <Button type="submit" disabled={createTag.isPending} className="h-10 shrink-0 px-5">
                  {createTag.isPending ? 'Adding…' : 'Add'}
                </Button>
              </div>
              {newTagError && (
                <p id="tag-name-error" role="alert" className="flex items-center gap-1.5 text-xs text-destructive">
                  <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-destructive text-center leading-[0.875rem] text-[10px] font-bold">!</span>
                  {newTagError}
                </p>
              )}
            </form>
          </div>

          <Separator />

          {/* list */}
          <div className="flex-1 px-7 py-5">
            {tagsLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : tags.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-12 text-center">
                <TagIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">No tags yet.</p>
                <p className="mt-1 text-xs text-muted-foreground">Add one above to get started.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {tags.map((tag) => (
                  <li
                    key={tag.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    {editingTagId === tag.id ? (
                      <EditRow
                        value={tag.name}
                        onSave={(name, setErr) => handleSaveTag(tag, name, setErr)}
                        onCancel={() => setEditingTagId(null)}
                        isPending={updateTag.isPending}
                        maxLength={50}
                        validator={validateTagName}
                      />
                    ) : (
                      <>
                        <TagChip name={tag.name} />
                        <div className="ml-auto flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setEditingTagId(tag.id); setEditingCatId(null); }}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            aria-label={`Edit ${tag.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                aria-label={`Delete ${tag.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete "#{tag.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This cannot be undone. The tag will be removed from all todos that currently use it.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDeleteTag(tag)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

      </div>
    </main>
  );
};

export default ManagePage;

