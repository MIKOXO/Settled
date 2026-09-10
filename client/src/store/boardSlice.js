import { createSlice } from '@reduxjs/toolkit';

const boardSlice = createSlice({
  name: 'board',
  initialState: {
    board: null,
    options: [],
    comments: {},
    status: 'idle',
  },
  reducers: {
    setBoard: (state, action) => {
      state.board = action.payload;
    },
    setOptions: (state, action) => {
      state.options = action.payload;
    },
    addOption: (state, action) => {
      state.options.unshift(action.payload);
    },
    applyVoteUpdate: (state, action) => {
      const {
        optionId,
        likesCount,
        dislikesCount,
        score,
        leadingOptionIds,
        vote,
      } = action.payload;
      const option = state.options.find((o) => o.id === optionId);
      if (!option) return;

      if (likesCount !== undefined) option.likesCount = likesCount;
      if (dislikesCount !== undefined) option.dislikesCount = dislikesCount;
      if (score !== undefined) option.score = score;
      if (vote !== undefined) option.vote = vote;
      if (Array.isArray(leadingOptionIds)) {
        const leadingSet = new Set(leadingOptionIds);
        for (const opt of state.options) {
          opt.isLeading = leadingSet.has(opt.id);
        }
      }
    },
    setComments: (state, action) => {
      const {
        optionId,
        items,
        hasMore,
        status = 'succeeded',
        nextCursor,
      } = action.payload;
      state.comments[optionId] = {
        items,
        hasMore,
        status,
        nextCursor: nextCursor ?? null,
      };
    },
    appendComments: (state, action) => {
      const { optionId, items, hasMore, nextCursor } = action.payload;
      const thread = state.comments[optionId] ?? {
        items: [],
        hasMore: false,
        status: 'idle',
        nextCursor: null,
      };
      thread.items.push(...items);
      thread.hasMore = hasMore;
      thread.nextCursor = nextCursor ?? null;
      thread.status = 'succeeded';
      state.comments[optionId] = thread;
    },
    addComment: (state, action) => {
      const { optionId, comment, commentCount } = action.payload;
      const thread = state.comments[optionId];

      if (thread) {
        const exists = thread.items.some((item) => item.id === comment.id);
        if (!exists) thread.items.unshift(comment);
      } else {
        state.comments[optionId] = {
          items: [comment],
          hasMore: false,
          status: 'idle',
          nextCursor: null,
        };
      }

      const option = state.options.find((o) => o.id === optionId);
      if (option) {
        option.commentCount =
          commentCount !== undefined ? commentCount : option.commentCount + 1;
      }
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    resetBoard: () => ({
      board: null,
      options: [],
      comments: {},
      status: 'idle',
    }),
  },
});

export const {
  setBoard,
  setOptions,
  addOption,
  applyVoteUpdate,
  setComments,
  appendComments,
  addComment,
  setStatus,
  resetBoard,
} = boardSlice.actions;
export default boardSlice.reducer;
