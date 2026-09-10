import api from './api';

export const fetchComments = (optionId, { limit = 20, cursor } = {}) =>
  api.get(`/options/${optionId}/comments`, { params: { limit, cursor } });

export const postComment = (optionId, body) =>
  api.post(`/options/${optionId}/comments`, { body });