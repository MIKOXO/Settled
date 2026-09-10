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

export const { setBoard, setOptions, addOption, setStatus, resetBoard } =
  boardSlice.actions;
export default boardSlice.reducer;
