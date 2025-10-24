import { MediaCategory } from '@/types/MediaCategory';

export interface Prompt {
  id: number;
  title: string;
  prompt: string;
  person_count: number;
  category: MediaCategory | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromptData {
  title: string;
  prompt: string;
  person_count: number;
  category?: MediaCategory | null;
}

export interface UpdatePromptData extends Partial<CreatePromptData> {}
