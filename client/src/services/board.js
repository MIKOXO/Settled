import api from './api';

export const createBoard = (data) =>
  api.post('/boards', data);

export const joinBoard = (inviteToken, data) =>
  api.post(`/boards/${inviteToken}/join`, data);

export const fetchBoard = (boardId) =>
  api.get(`/boards/${boardId}`);

export const getMe = () =>
  api.get('/participants/me');

export const recoverRequest = (email) =>
  api.post('/participants/recover-request', { email });

export const recover = (token) =>
  api.post('/participants/recover', { token });
