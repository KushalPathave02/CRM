import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import customerSlice from './slices/customerSlice';
import leadSlice from './slices/leadSlice';
import dashboardSlice from './slices/dashboardSlice';
import themeSlice from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    customers: customerSlice,
    leads: leadSlice,
    dashboard: dashboardSlice,
    theme: themeSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
