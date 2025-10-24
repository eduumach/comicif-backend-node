import api from './api';
import type {
  RouletteCategory,
  RouletteResult
} from '@/types/roulette';
import type { Prompt } from '@/types/prompt';
import type { MediaCategory } from '@/types/MediaCategory';

export const rouletteService = {
  // Spin the category roulette
  spin: async (): Promise<RouletteResult> => {
    const response = await api.post('/roulette/spin');
    return response.data;
  },

  // Get current result
  getCurrentResult: async (): Promise<RouletteResult | null> => {
    try {
      const response = await api.get('/roulette/current');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Get available categories (only categories with prompts)
  getCategories: async (): Promise<RouletteCategory[]> => {
    const response = await api.get('/roulette/categories');
    return response.data;
  },

  // Get all prompts for the prompt roulette
  getPrompts: async (): Promise<Prompt[]> => {
    const response = await api.get('/roulette/prompts');
    return response.data;
  },

  // Spin the prompt roulette
  spinPrompts: async (): Promise<Prompt> => {
    const response = await api.post('/roulette/spin-prompts');
    return response.data;
  },

  // Draw a random prompt from a category
  drawPrompt: async (category: MediaCategory): Promise<Prompt> => {
    const response = await api.post('/roulette/draw-prompt', { category });
    return response.data;
  },

  // Draw a completely random prompt (from all categories)
  drawRandomPrompt: async (): Promise<Prompt> => {
    const response = await api.post('/roulette/draw-random-prompt');
    return response.data;
  },
};
