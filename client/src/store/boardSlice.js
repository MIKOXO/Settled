import { createSlice } from '@reduxjs/toolkit';

const boardSlice = createSlice({
  name: 'board',
  initialState: {
    board: null,
    options: [],
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
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    resetBoard: () => ({
      board: null,
      options: [],
      status: 'idle',
    }),
  },
});

export const {
  setBoard,
  setOptions,
  addOption,
  applyVoteUpdate,
  setStatus,
  resetBoard,
} = boardSlice.actions;
export default boardSlice.reducer;
