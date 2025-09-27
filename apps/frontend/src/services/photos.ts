import api from './api';

export interface Photo {
  id: number;
  path: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
  prompt: {
    id: number;
    title: string;
    prompt: string;
  };
}

export interface PhotosResponse {
  photos: Photo[];
  count: number;
}

export interface GeneratePhotoData {
  promptId: number;
}

export const photoService = {
  // Get all photos
  getAll: async (): Promise<PhotosResponse> => {
    const response = await api.get('/photos');
    return response.data;
  },

  // Generate photo from prompt
  generate: async (data: GeneratePhotoData): Promise<Photo> => {
    const response = await api.post('/photos/generate', data);
    return response.data;
  },

  // Like a photo
  like: async (id: number): Promise<Photo> => {
    const response = await api.post(`/photos/${id}/like`);
    return response.data;
  },
};