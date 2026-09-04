import { createSlice } from '@reduxjs/toolkit';

const sessionSlice = createSlice({
  name: 'session',
  initialState: null,
  reducers: {
    setSession: (_state, action) => action.payload,
    clearSession: () => null,
  },
});

export const { setSession, clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;
