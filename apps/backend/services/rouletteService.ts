import { Repository } from 'typeorm';
import { RouletteResult } from '../entities/RouletteResult';
import { Prompt } from '../entities/Prompt';
import { databaseService } from './databaseService';
import { MediaCategory, MediaCategoryLabels } from '../types/MediaCategory';

export class RouletteService {
  private static instance: RouletteService;
  private resultRepository: Repository<RouletteResult>;
  private promptRepository: Repository<Prompt>;

  private constructor() {
    const dataSource = databaseService.getDataSource();
    this.resultRepository = dataSource.getRepository(RouletteResult);
    this.promptRepository = dataSource.getRepository(Prompt);
  }

  public static getInstance(): RouletteService {
    if (!RouletteService.instance) {
      RouletteService.instance = new RouletteService();
    }
    return RouletteService.instance;
  }

  /**
   * Obtém todas as categorias que TÊM prompts cadastrados
   */
  public async getAvailableCategories(): Promise<Array<{ category: MediaCategory; label: string }>> {
    // Buscar todas as categorias únicas dos prompts cadastrados
    const prompts = await this.promptRepository
      .createQueryBuilder('prompt')
      .select('DISTINCT prompt.category', 'category')
      .where('prompt.category IS NOT NULL')
      .getRawMany();

    // Mapear para o formato esperado
    return prompts.map(p => ({
      category: p.category as MediaCategory,
      label: MediaCategoryLabels[p.category as MediaCategory]
    }));
  }

  /**
   * Obtém todos os prompts para a roleta
   */
  public async getAllPrompts(): Promise<Prompt[]> {
    return this.promptRepository.find({
      order: { title: 'ASC' }
    });
  }

  /**
   * Gira a roleta de categorias e seleciona uma categoria aleatória
   */
  public async spin(): Promise<RouletteResult> {
    const categories = await this.getAvailableCategories();

    if (categories.length === 0) {
      throw new Error('Nenhuma categoria com prompts disponível');
    }

    // Seleciona uma categoria aleatória
    const randomIndex = Math.floor(Math.random() * categories.length);
    const selected = categories[randomIndex];

    // Desativa resultados anteriores
    await this.resultRepository.update({ isActive: true }, { isActive: false });

    // Cria e salva o novo resultado
    const result = this.resultRepository.create({
      selectedCategory: selected.category,
      categoryLabel: selected.label,
      isActive: true
    });

    return this.resultRepository.save(result);
  }

  /**
   * Gira a roleta de prompts e seleciona um prompt aleatório
   */
  public async spinPrompts(): Promise<Prompt> {
    const prompts = await this.getAllPrompts();

    if (prompts.length === 0) {
      throw new Error('Nenhum prompt disponível na roleta');
    }

    // Seleciona um prompt aleatório
    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
  }

  /**
   * Obtém o resultado atual ativo da roleta
   */
  public async getCurrentResult(): Promise<RouletteResult | null> {
    return this.resultRepository.findOne({
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Sorteia um prompt aleatório de uma categoria específica
   */
  public async drawPromptFromCategory(category: MediaCategory): Promise<Prompt> {
    const prompts = await this.promptRepository.find({
      where: { category }
    });

    if (prompts.length === 0) {
      throw new Error(`Nenhum prompt encontrado para a categoria ${category}`);
    }

    // Seleciona um prompt aleatório
    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
  }

  /**
   * Sorteia um prompt aleatório de todas as categorias
   */
  public async drawRandomPrompt(): Promise<Prompt> {
    const prompts = await this.promptRepository.find();

    if (prompts.length === 0) {
      throw new Error('Nenhum prompt encontrado no banco de dados');
    }

    // Seleciona um prompt aleatório
    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
  }
}

export const rouletteService = RouletteService.getInstance();
