import api from './api';

export interface Photo {
  id: number;
  path: string;
  likes: number;
  type: 'generated' | 'original';
  createdAt: string;
  updatedAt: string;
  prompt: {
    id: number;
    title: string;
    prompt: string;
    category?: string;
  } | null;
}

export interface PhotosResponse {
  photos: Photo[];
  count: number;
  totalCount: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PhotoFilters {
  page?: number;
  limit?: number;
  type?: 'generated' | 'original' | 'all';
  category?: string;
}

export interface GeneratePhotoData {
  promptId: number;
  photo: File;
}

export interface GenerateRandomPhotoData {
  photo: File;
}

export const photoService = {
  // Get all photos with filters and pagination
  getAll: async (filters?: PhotoFilters): Promise<PhotosResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters?.category) params.append('category', filters.category);

    const url = `/photos${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // Generate photo from specific prompt
  generate: async (data: GeneratePhotoData): Promise<Photo> => {
    const formData = new FormData();
    formData.append('promptId', data.promptId.toString());
    formData.append('photo', data.photo);

    const response = await api.post('/photos/generate-from-prompt-id', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.photo;
  },

  // Generate photo from random prompt
  generateRandom: async (data: GenerateRandomPhotoData): Promise<Photo> => {
    const formData = new FormData();
    formData.append('photo', data.photo);

    const response = await api.post('/photos/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.photo;
  },

  // Like a photo
  like: async (id: number): Promise<Photo> => {
    const response = await api.post(`/photos/${id}/like`);
    return response.data;
  },
};