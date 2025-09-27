import api from './api';

export interface Prompt {
  id: number;
  title: string;
  prompt: string;
  person_count: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromptData {
  title: string;
  prompt: string;
  person_count: number;
}

export interface UpdatePromptData extends Partial<CreatePromptData> {}

export const promptService = {
  // Get all prompts
  getAll: async (): Promise<Prompt[]> => {
    const response = await api.get('/prompts');
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