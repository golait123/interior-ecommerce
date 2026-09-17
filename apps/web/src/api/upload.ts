import { api } from './client';

export const uploadApi = {
  uploadImages: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.urls;
  },
};
