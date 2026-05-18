
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import selectedShowroomReducer from '../features/vendor/showroomSlice/selectedShowroomSlice';

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    selectedShowroom: selectedShowroomReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export default store;