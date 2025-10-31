import httpClient from './httpClient';

export interface UploadResponse {
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export const uploadAvatar = async (payload: { dataUrl: string; filename: string }): Promise<UploadResponse> => {
  const response = await httpClient.post<UploadResponse>('/api/uploads/avatars', {
    file: payload.dataUrl,
    filename: payload.filename,
  });
  return response.data;
};

export const uploadMaterial = async (payload: { dataUrl: string; filename: string }): Promise<UploadResponse> => {
  const response = await httpClient.post<UploadResponse>('/api/uploads/materials', {
    file: payload.dataUrl,
    filename: payload.filename,
  });
  return response.data;
};

export default {
  uploadAvatar,
  uploadMaterial,
};
