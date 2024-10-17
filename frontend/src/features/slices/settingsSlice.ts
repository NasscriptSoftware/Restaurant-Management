import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  showImage: boolean;
}

const initialState: SettingsState = {
  showImage: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setShowImage: (state, action: PayloadAction<boolean>) => {
      state.showImage = action.payload;
    },
  },
});

export const { setShowImage } = settingsSlice.actions;
export default settingsSlice.reducer;
