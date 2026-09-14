import api from './api';

export const fetchAvailability = (boardId) =>
  api.get(`/boards/${boardId}/availability`);

export const setAvailability = (boardId, date, status) =>
  api.put(`/boards/${boardId}/availability`, { date, status });

export const clearAvailability = (boardId, date) =>
  api.delete(`/boards/${boardId}/availability/${date}`);
