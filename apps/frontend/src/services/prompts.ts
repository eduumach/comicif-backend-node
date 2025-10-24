import api from './api';
import { MediaCategory } from '@/types/MediaCategory';
import type { Prompt, CreatePromptData, UpdatePromptData } from '@/types/prompt';

export type { Prompt, CreatePromptData, UpdatePromptData };

export const promptService = {
  // Get all prompts (optionally filtered by category)
  getAll: async (category?: MediaCategory | null): Promise<Prompt[]> => {
    const params = category ? { category } : {};
    const response = await api.get('/prompts', { params });
    return response.data;
  },

  // Get prompt by ID
  getById: async (id: number): Promise<Prompt> => {
    const response = await api.get(`/prompts/${id}`);
    return response.data;
  },

  // Create new prompt
  create: async (data: CreatePromptData): Promise<Prompt> => {
    const response = await api.post('/prompts', data);
    return response.data;
  },

  // Update prompt
  update: async (id: number, data: UpdatePromptData): Promise<Prompt> => {
    const response = await api.put(`/prompts/${id}`, data);
    return response.data;
  },

  // Delete prompt
  delete: async (id: number): Promise<void> => {
    await api.delete(`/prompts/${id}`);
  },
};