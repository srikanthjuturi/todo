import type { Tag } from './tag';

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  categoryId: number | null;
  categoryName: string | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface TodoCreate {
  title: string;
  description?: string;
  categoryId?: number | null;
  tagIds?: number[];
}

export interface TodoUpdate {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  categoryId?: number | null;
  tagIds?: number[];
}

