import api from './api';

export const fetchLocations = (boardId) =>
  api.get(`/boards/${boardId}/locations`);

export const setMyLocation = (boardId, { lat, lng, label }) =>
  api.put(`/boards/${boardId}/location`, { lat, lng, label });

export const removeMyLocation = (boardId) =>
  api.delete(`/boards/${boardId}/location`);

export const searchPlaces = (query) =>
  api.get('/places/search', { params: { q: query } });
