import api from './api';

export const castVote = (optionId, value) =>
  api.post(`/options/${optionId}/vote`, { value });

export const removeVote = (optionId) =>
  api.delete(`/options/${optionId}/vote`);