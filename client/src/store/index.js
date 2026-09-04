import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from './sessionSlice';

const store = configureStore({
  reducer: {
    session: sessionReducer,
  },
});

export default store;
