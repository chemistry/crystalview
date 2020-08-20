import { createSlice } from '@reduxjs/toolkit';

const optionsSlice = createSlice({
  name: 'options',
  initialState: {
    backgroundColor: '#2b303b'
  },
  reducers: {
    setBackground(state, action) {
        state.backgroundColor = action.payload;
    }
  }
})

export const { setBackground } = optionsSlice.actions;

export const optionsReducer =  optionsSlice.reducer;
