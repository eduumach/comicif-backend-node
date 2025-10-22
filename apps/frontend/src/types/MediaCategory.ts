/**
 * Media category types for prompts
 */
export enum MediaCategory {
  ANIME = 'anime',
  MOVIES = 'movies',
  SERIES = 'series',
  GAMES = 'games',
  COMICS = 'comics',
  CARTOONS = 'cartoons',
  BOOKS = 'books',
  OTHER = 'other'
}

/**
 * Human-readable labels for media categories
 */
export const MediaCategoryLabels: Record<MediaCategory, string> = {
  [MediaCategory.ANIME]: 'Anime',
  [MediaCategory.MOVIES]: 'Filmes',
  [MediaCategory.SERIES]: 'Séries',
  [MediaCategory.GAMES]: 'Jogos',
  [MediaCategory.COMICS]: 'Quadrinhos',
  [MediaCategory.CARTOONS]: 'Desenhos Animados',
  [MediaCategory.BOOKS]: 'Livros',
  [MediaCategory.OTHER]: 'Outros'
};
