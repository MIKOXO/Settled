import api from './api';

export const fetchParticipants = (boardId) =>
  api.get(`/boards/${boardId}/participants`);
