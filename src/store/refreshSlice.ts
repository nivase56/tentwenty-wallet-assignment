import { createSlice } from "@reduxjs/toolkit";

interface UiState {
  refreshFlag: boolean;
}

const initialUiState: UiState = {
  refreshFlag: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState: initialUiState,
  reducers: {
    triggerRefresh: (state) => {
      state.refreshFlag = !state.refreshFlag; // toggle boolean
    },
  },
});

export const { triggerRefresh } = uiSlice.actions;
export default uiSlice.reducer;
