import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';

import { api } from '../services/api';
import authReducer from '../features/auth/authSlice';
import householdReducer from '../features/household/householdSlice';

const sessionListener = createListenerMiddleware();
sessionListener.startListening({
  predicate: (action) =>
    action.type === 'auth/logout' || action.type === 'auth/setCredentials',
  effect: (_action, listener) => {
    listener.dispatch(api.util.resetApiState());
    listener.dispatch({ type: 'household/clearSelectedHousehold' });
  },
});

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    household: householdReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(sessionListener.middleware)
      .concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
