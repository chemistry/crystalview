import { createSlice } from '@reduxjs/toolkit';

const optionsSlice = createSlice({
  name: 'options',
  initialState: {
    backgroundColor: '#2b303b'
  },
  reducers: {
    changeBackground(state, action) {
        state.backgroundColor = action.payload;
    }
  }
})

export const { changeBackground } = optionsSlice.actions;

export const optionsReducer =  optionsSlice.reducer;
