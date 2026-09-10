import api from './api';

export const fetchOptions = (boardId) =>
  api.get(`/boards/${boardId}/options`);

export const createOption = (boardId, data) =>
  api.post(`/boards/${boardId}/options`, data);

export const uploadOptionPhoto = (optionId, file) => {
  const formData = new FormData();
  formData.append('photo', file);
  return api.post(`/options/${optionId}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
