import api from './api';

export const fetchComments = (optionId, { limit = 20, cursor } = {}) =>
  api.get(`/options/${optionId}/comments`, { params: { limit, cursor } });

// `parentId` makes it a reply to that comment. The server flattens a
// reply-to-a-reply onto the same root, so the client never has to resolve depth.
export const postComment = (optionId, body, { parentId } = {}) =>
  api.post(`/options/${optionId}/comments`, { body, ...(parentId ? { parentId } : {}) });

export const fetchReplies = (commentId, { limit = 20, cursor } = {}) =>
  api.get(`/comments/${commentId}/replies`, { params: { limit, cursor } });
