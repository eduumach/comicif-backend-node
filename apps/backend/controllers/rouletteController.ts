import { Request, Response } from 'express';
import { rouletteService } from '../services/rouletteService';
import { MediaCategory } from '../types/MediaCategory';

/**
 * Gira a roleta e retorna o resultado
 */
export const spinRoulette = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await rouletteService.spin();
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao girar a roleta';
    res.status(500).json({ error: message });
  }
};

/**
 * Obtém o resultado atual da roleta
 */
export const getCurrentResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await rouletteService.getCurrentResult();

    if (!result) {
      res.status(404).json({ message: 'Nenhum resultado ativo encontrado' });
      return;
    }

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao obter resultado';
    res.status(500).json({ error: message });
  }
};

/**
 * Lista todas as categorias que têm prompts cadastrados
 */
export const listCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await rouletteService.getAvailableCategories();
    res.json(categories);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao listar categorias';
    res.status(500).json({ error: message });
  }
};

/**
 * Lista todos os prompts disponíveis
 */
export const listPrompts = async (req: Request, res: Response): Promise<void> => {
  try {
    const prompts = await rouletteService.getAllPrompts();
    res.json(prompts);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao listar prompts';
    res.status(500).json({ error: message });
  }
};

/**
 * Gira a roleta de prompts e retorna um prompt aleatório
 */
export const spinPrompts = async (req: Request, res: Response): Promise<void> => {
  try {
    const prompt = await rouletteService.spinPrompts();
    res.json(prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao girar roleta de prompts';
    res.status(500).json({ error: message });
  }
};

/**
 * Sorteia um prompt aleatório de uma categoria
 */
export const drawPrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.body;

    if (!category || !Object.values(MediaCategory).includes(category)) {
      res.status(400).json({ error: 'Categoria inválida ou não fornecida' });
      return;
    }

    const prompt = await rouletteService.drawPromptFromCategory(category);
    res.json(prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao sortear prompt';
    res.status(500).json({ error: message });
  }
};

/**
 * Sorteia um prompt completamente aleatório (de todas as categorias)
 */
export const drawRandomPrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const prompt = await rouletteService.drawRandomPrompt();
    res.json(prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao sortear prompt';
    res.status(500).json({ error: message });
  }
};
