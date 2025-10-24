import { MediaCategory } from './MediaCategory';

export interface RouletteCategory {
  category: MediaCategory;
  label: string;
}

export interface RouletteResult {
  id: number;
  selectedCategory: MediaCategory;
  categoryLabel: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
