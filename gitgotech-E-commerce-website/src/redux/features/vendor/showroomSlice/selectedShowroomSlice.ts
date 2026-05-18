import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectedShowroom {
  id: string;
  name: string;
  logo: string;
}

interface SelectedShowroomState {
  selectedShowroom: SelectedShowroom | null;
}

const initialState: SelectedShowroomState = {
  selectedShowroom: null,
};

const selectedShowroomSlice = createSlice({
  name: 'selectedShowroom',
  initialState,
  reducers: {
    setSelectedShowroom(state, action: PayloadAction<SelectedShowroom>) {
      state.selectedShowroom = action.payload;
    },
    clearSelectedShowroom(state) {
      state.selectedShowroom = null;
    },
  },
});

export const { setSelectedShowroom, clearSelectedShowroom } = selectedShowroomSlice.actions;
export default selectedShowroomSlice.reducer;

// Selectors
export const selectShowroomId = (state: any) => state.selectedShowroom?.selectedShowroom?.id ?? null;
export const selectShowroom = (state: any) => state.selectedShowroom?.selectedShowroom ?? null;
