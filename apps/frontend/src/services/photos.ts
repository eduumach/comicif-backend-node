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
  } | null;
}

export interface PhotosResponse {
  photos: Photo[];
  count: number;
}

export interface GeneratePhotoData {
  promptId: number;
  photo: File;
}

export interface GenerateRandomPhotoData {
  photo: File;
}

export const photoService = {
  // Get all photos
  getAll: async (): Promise<PhotosResponse> => {
    const response = await api.get('/photos');
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