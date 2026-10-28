import { configureStore } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import authReducer from '@/features/auth/authSlice';
import groupReducer from '@/features/groups/groupSlice';
import { appListeners } from './listeners';
export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    groups: groupReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(appListeners.middleware)
      .concat(api.middleware),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
