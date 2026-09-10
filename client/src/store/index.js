import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from './sessionSlice';
import boardReducer from './boardSlice';

const store = configureStore({
  reducer: {
    session: sessionReducer,
    board: boardReducer,
  },
});

export default store;
